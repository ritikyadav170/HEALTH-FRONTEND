import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../utils/api";
import { toast } from "react-hot-toast";

const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:5000';

const getFileUrl = (path) => {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  const normalizedPath = String(path).replace(/\\/g, "/").replace(/^\/+/, "");
  const publicPath = normalizedPath.startsWith("public/") ? normalizedPath : `public/${normalizedPath}`;
  return `${BASE_URL.replace(/\/$/, "")}/${publicPath}`;
};
const isPdfUrl = (url) => url?.toLowerCase().endsWith(".pdf");
const formatGender = (gender) => {
  const value = String(gender || "").trim();
  return value ? value.charAt(0).toUpperCase() + value.slice(1).toLowerCase() : "N/A";
};

const getDegreeLabel = (degree) => {
  if (typeof degree === "string") return degree;
  return degree?.name || degree?.degree || degree?.title || degree?.qualification || "";
};

const formatQualification = (qualification) => {
  if (!qualification) return "—";
  if (typeof qualification === "string") {
    try {
      const parsed = JSON.parse(qualification);
      if (Array.isArray(parsed)) {
        return parsed.filter(Boolean).join(", ") || "—";
      }
    } catch {}
  }
  if (Array.isArray(qualification)) {
    return qualification.filter(Boolean).join(", ") || "—";
  }
  return String(qualification);
};

const formatDegrees = (vendor) => {
  if (Array.isArray(vendor?.degrees) && vendor.degrees.length) {
    const labels = vendor.degrees.map(getDegreeLabel).filter(Boolean);
    if (labels.length) return labels.join(", ");
  }
  const qual = vendor?.degree || vendor?.degreeName || vendor?.qualification;
  if (!qual) return "N/A";
  if (typeof qual === "string") {
    try {
      const parsed = JSON.parse(qual);
      if (Array.isArray(parsed)) {
        return parsed.filter(Boolean).join(", ") || "N/A";
      }
    } catch {}
  }
  if (Array.isArray(qual)) {
    return qual.filter(Boolean).join(", ") || "N/A";
  }
  return String(qual) || "N/A";
};

const formatCategories = (vendor, categoriesList = []) => {
  const getCatName = (item) => {
    if (!item) return "";
    if (typeof item === "object" && item.name) return item.name;
    const str = String(item).trim();
    const found = categoriesList.find((c) => String(c._id) === str || c.name === str);
    if (found?.name) return found.name;
    // Don't show raw 24 hex char Mongo ObjectIds if unresolved
    if (/^[0-9a-fA-F]{24}$/.test(str)) return "";
    return str;
  };

  if (Array.isArray(vendor?.categories) && vendor.categories.length > 0) {
    const names = vendor.categories.map(getCatName).filter(Boolean);
    if (names.length) return names.join(", ");
  }

  if (vendor?.category) {
    const primaryName = getCatName(vendor.category);
    if (primaryName) return primaryName;
  }

  return "N/A";
};

const formatDepartments = (vendor) => {
  let dept = vendor?.department;
  if (!dept || (Array.isArray(dept) && dept.length === 0)) return "N/A";
  if (typeof dept === "string") {
    try {
      const parsed = JSON.parse(dept);
      if (Array.isArray(parsed)) dept = parsed;
    } catch {}
  }
  if (Array.isArray(dept)) {
    const cleaned = dept.map((d) => (typeof d === "object" ? d?.name || d?._id : d)).filter(Boolean);
    return cleaned.length ? cleaned.join(", ") : "N/A";
  }
  return String(dept) || "N/A";
};

const formatDoctorDob = (dob) => {
  if (!dob) return "N/A";
  const raw = String(dob || "").trim();
  const normalized = raw.replace(/-/g, "/");
  let parsed = new Date(normalized);
  if (isNaN(parsed.getTime())) {
    parsed = new Date(raw);
  }
  if (isNaN(parsed.getTime())) {
    return raw;
  }
  const longMonth = parsed.toLocaleString("default", { month: "long" });
  return `${parsed.getFullYear()}/${String(parsed.getMonth() + 1).padStart(2, "0")}/${String(parsed.getDate()).padStart(2, "0")} (${longMonth}/${String(parsed.getDate()).padStart(2, "0")}/${parsed.getFullYear()})`;
};

const ViewDoctor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vendor, setVendor] = useState(null);
  const [stats, setStats] = useState(null);
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [certificateOpen, setCertificateOpen] = useState(false);
  const [categoriesList, setCategoriesList] = useState([]);
  
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [blockUpdating, setBlockUpdating] = useState(false);

  const handleStatusToggle = async (currentStatus) => {
    try {
      setStatusUpdating(true);
      const res = await api.put(`/doctors/${id}/status`, { status: !currentStatus });
      if (res.data?.success) {
        toast.success(`Doctor ${!currentStatus ? "activated" : "deactivated"}!`);
        setVendor((prev) => ({ ...prev, status: !currentStatus }));
      } else {
        toast.error(res.data?.message || "Failed to update status.");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Failed to update status.");
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleBlockToggle = async (currentBlockStatus) => {
    try {
      setBlockUpdating(true);
      const res = await api.put(`/doctors/${id}/status`, { isBlocked: !currentBlockStatus });
      if (res.data?.success) {
        toast.success(!currentBlockStatus ? "Doctor blocked successfully!" : "Doctor unblocked successfully!");
        setVendor((prev) => ({ ...prev, isBlocked: !currentBlockStatus }));
      } else {
        toast.error(res.data?.message || "Failed to update block status");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Error updating block status");
    } finally {
      setBlockUpdating(false);
    }
  };

  const getAppointmentPatientName = (app) => app.patient?.name || app.user?.name || app.userId?.name || "N/A";
  const getAppointmentDate = (app) => {
    const dateValue = app.appointmentDate || app.date;
    if (!dateValue) return "N/A";
    const parsed = new Date(dateValue);
    return isNaN(parsed.getTime()) ? String(dateValue) : parsed.toLocaleDateString();
  };
  const getAppointmentTime = (app) => app.timeSlot || app.time || "N/A";
  const getAppointmentFee = (app) => {
    const fee = app.appointmentFee ?? app.totalAmount ?? app.fee ?? 0;
    return Number(fee) || 0;
  };

  useEffect(() => {
    const fetchVendor = async () => {
      setLoading(true);
      setError(null);
      try {
        const [docRes, catRes] = await Promise.all([
          api.get(`/doctors/${id}`),
          api.get("/common/categories").catch(() => ({ data: { success: false, data: [] } })),
        ]);
        const data = docRes.data?.data;
        if (docRes.data?.success && data) {
          setVendor(data.vendor || data);
          setStats(data.appointmentStats || null);
          setRecentAppointments(data.recentAppointments || []);
          setUpcomingAppointments(data.upcomingAppointmentsNext2Days || []);
        } else {
          setError(docRes.data?.message || "Vendor not found");
        }
        if (catRes.data?.success && Array.isArray(catRes.data?.data)) {
          setCategoriesList(catRes.data.data);
        }
      } catch (err) {
        setError(err.response?.data?.message || err.message || "Error fetching vendor");
      } finally {
        setLoading(false);
      }
    };
    fetchVendor();
  }, [id]);


  if (loading) return <div className="text-center p-10 font-bold text-gray-500">Loading details...</div>;
  if (error) return <div className="text-red-500 p-4">{error}</div>;
  if (!vendor) return null;

  return (
    <div className="w-full bg-white shadow-2xl rounded-2xl p-8 mt-8 relative">
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <button
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition font-medium text-sm shadow-sm"
          onClick={() => navigate(`/doctors/edit/${id}`)}
        >
          Edit Doctor
        </button>
        <button
          className="bg-slate-600 text-white px-4 py-2 rounded-lg hover:bg-slate-700 transition font-medium text-sm shadow-sm"
          onClick={() => navigate(-1)}
        >
          Back
        </button>
      </div>
      <div className="flex flex-col md:flex-row gap-8">
        {/* Left Profile Card */}
        <div className="md:w-1/3 flex flex-col items-center bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 shadow-lg">
          <img
            src={
              vendor.profileImage
                ? `${BASE_URL}/${vendor.profileImage.replace(/\\/g, "/")}`
                : "/assets/placeholder.png"
            }
            alt={vendor.Name}
            className="h-36 w-36 object-cover rounded-full border-4 border-blue-400 shadow-xl mb-4"
          />
          <h2 className="text-2xl font-bold text-blue-900 mb-1">
            {vendor.Name}
          </h2>
          <div className="text-sm text-gray-600 mb-2">
            {vendor.type?.toUpperCase()}
          </div>
          <div className="flex flex-col gap-2 w-full mt-2">
            <InfoCard label="Gender" value={formatGender(vendor.gender)} color="pink" />
            <InfoCard label="DOB" value={formatDoctorDob(vendor.dob)} color="yellow" />
            <InfoCard
              label="Qualification"
              value={formatQualification(vendor.qualification)}
              color="blue"
            />
            <InfoCard
              label="Degrees"
              value={formatDegrees(vendor)}
              color="indigo"
            />
            <InfoCard
              label="Experience"
              value={(vendor.yearOfExp || 0) + " years"}
              color="green"
            />
            <InfoCard
              label="License/Reg. No."
              value={vendor.licOrRegNumber}
              color="purple"
            />
            {vendor.countryRegistration && (
              <InfoCard
                label="Reg. Country"
                value={vendor.countryRegistration}
                color="indigo"
              />
            )}
            {vendor.licenseAuthority && (
              <InfoCard
                label="License Authority"
                value={vendor.licenseAuthority}
                color="blue"
              />
            )}
            {vendor.specialization && (
              <InfoCard
                label="Specialization"
                value={vendor.specialization}
                color="green"
              />
            )}
            <InfoCard
              label="Wallet"
              value={`₹ ${vendor.wallet_balance ?? 0}`}
              color="yellow"
            />
            <InfoCard
              label="Status"
              value={vendor.status ? "Active" : "Inactive"}
              color={vendor.status ? "green" : "red"}
              action={
                <button
                  onClick={() => handleStatusToggle(vendor.status)}
                  disabled={statusUpdating}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${vendor.status ? "bg-emerald-500" : "bg-slate-300"} ${statusUpdating ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${vendor.status ? "translate-x-6" : "translate-x-1"}`} />
                </button>
              }
            />
            <InfoCard
              label="Blocked"
              value={vendor.isBlocked ? "Yes" : "No"}
              color={vendor.isBlocked ? "red" : "green"}
              action={
                <button
                  onClick={() => handleBlockToggle(vendor.isBlocked)}
                  disabled={blockUpdating}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${vendor.isBlocked ? "bg-red-500" : "bg-slate-300"} ${blockUpdating ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${vendor.isBlocked ? "translate-x-6" : "translate-x-1"}`} />
                </button>
              }
            />
          </div>
          {vendor.certificate && (
            <div className="mt-6 w-full flex flex-col items-center">
              <h3 className="text-md font-semibold text-gray-700 mb-2">
                Certificate
              </h3>
              <div className="w-full">
                {isPdfUrl(vendor.certificate) ? (
                  <a
                    href={getFileUrl(vendor.certificate)}
                    target="_blank"
                    rel="noreferrer"
                    className="block rounded-lg border bg-white p-4 text-center font-semibold text-blue-600 shadow"
                  >
                    Open PDF Certificate
                  </a>
                ) : (
                  <img
                    src={getFileUrl(vendor.certificate)}
                    alt="Certificate"
                    className="mx-auto max-h-40 rounded-lg border shadow"
                  />
                )}
                <button
                  type="button"
                  onClick={() => setCertificateOpen(true)}
                  className="mt-3 w-full rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  View Full Screen
                </button>
              </div>
            </div>
          )}
        </div>
        {/* Right Details Card */}
        <div className="md:w-2/3 flex flex-col gap-6">
          <div className="bg-gray-50 rounded-xl p-6 shadow text-left">
            <h3 className="text-xl font-semibold text-blue-700 mb-4">
              Contact & Address
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="text-gray-700">
                <span className="font-medium">Mobile:</span>{" "}
                {vendor.countryCode} {vendor.mobile}
              </div>
              <div className="text-gray-700">
                <span className="font-medium">Personal Address:</span> {vendor.address || "N/A"}
              </div>
              <div className="text-gray-700 md:col-span-2">
                <span className="font-medium">Location Address:</span> {vendor.clinicAddress || "N/A"}
              </div>
              <div className="text-gray-700">
                <span className="font-medium">Country:</span> {vendor.country || "N/A"}
              </div>
              <div className="text-gray-700">
                <span className="font-medium">City:</span> {vendor.city || "N/A"}
              </div>
              <div className="text-gray-700">
                <span className="font-medium">State:</span> {vendor.state || "N/A"}
              </div>
              <div className="text-gray-700">
                <span className="font-medium">District:</span> {vendor.district || "N/A"}
              </div>
              <div className="text-gray-700">
                <span className="font-medium">Pincode:</span> {vendor.pincode || "N/A"}
              </div>
              <div className="text-gray-700">
                <span className="font-medium">Latitude:</span> {vendor.lat || "N/A"}
              </div>
              <div className="text-gray-700">
                <span className="font-medium">Longitude:</span> {vendor.long || "N/A"}
              </div>
            </div>
          </div>
          <div className="bg-gray-50 rounded-xl p-6 shadow text-left">
            <h3 className="text-xl font-semibold text-blue-700 mb-4">Identity Documents</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[{ label: "Aadhaar", path: vendor.aadhaarImage }, { label: "Passport", path: vendor.passportImage }].map(({ label, path }) => (
                <div key={label} className="rounded-lg border bg-white p-4">
                  <h4 className="font-semibold text-gray-700 mb-3">{label}</h4>
                  {path ? (
                    <a href={getFileUrl(path)} target="_blank" rel="noreferrer" className="text-blue-600 font-medium">
                      {!isPdfUrl(path) && <img src={getFileUrl(path)} alt={label} className="mb-3 h-36 w-full object-contain rounded-lg" />}
                      View {label}
                    </a>
                  ) : <p className="text-gray-500">Not uploaded</p>}
                </div>
              ))}
            </div>
          </div>
          <div className="bg-gray-50 rounded-xl p-6 shadow text-left">
            <h3 className="text-xl font-semibold text-blue-700 mb-4">
              Clinic & Consultation
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="text-gray-700">
                <span className="font-medium">In-Clinic Available:</span>{" "}
                {vendor.inClinicAvailable || vendor.inClinicAvaialble ? "Yes" : "No"}
              </div>
              <div className="text-gray-700">
                <span className="font-medium">Video Consult Available:</span>{" "}
                {vendor.videoConsultAvailable ? "Yes" : "No"}
              </div>
              <div className="text-gray-700">
                <span className="font-medium">In-Clinic Fee:</span> ₹{" "}
                {vendor.inClinicFee}
              </div>
              <div className="text-gray-700">
                <span className="font-medium">Video Consult Fee:</span> ₹{" "}
                {vendor.videoConsultFee}
              </div>
              <div className="text-gray-700">
                <span className="font-medium">Opening Time:</span>{" "}
                {vendor.openingTime}
              </div>
              <div className="text-gray-700">
                <span className="font-medium">Closing Time:</span>{" "}
                {vendor.closingTime}
              </div>
              <div className="text-gray-700">
                <span className="font-medium">Emergency:</span>{" "}
                {vendor.isEmergency ? "Yes" : "No"}
              </div>
              <div className="text-gray-700">
                <span className="font-medium">Agreement Accepted:</span>{" "}
                {vendor.agreementAccepted === "true" ? "Yes" : "No"}
              </div>
            </div>
          </div>
          <div className="bg-gray-50 rounded-xl p-6 shadow text-left">
            <h3 className="text-xl font-semibold text-blue-700 mb-4">
              Professional Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="text-gray-700">
                <span className="font-medium">Category:</span>{" "}
                {formatCategories(vendor, categoriesList)}
              </div>
              <div className="text-gray-700">
                <span className="font-medium">Departments:</span>{" "}
                {formatDepartments(vendor)}
              </div>
              <div className="text-gray-700 md:col-span-2">
                <span className="font-medium">Degrees:</span>{" "}
                {formatDegrees(vendor) !== "N/A" ? formatDegrees(vendor) : "—"}
              </div>
              <div className="text-gray-700">
                <span className="font-medium">Symptoms:</span>{" "}
                {Array.isArray(vendor.symptoms) &&
                vendor.symptoms.length > 0 ? (
                  <ul className="list-disc ml-5">
                    {vendor.symptoms.map((symptom) => (
                      <li key={symptom._id}>{symptom.name}</li>
                    ))}
                  </ul>
                ) : (
                  "N/A"
                )}
              </div>
            </div>
          </div>
          <div className="bg-gray-50 rounded-xl p-6 shadow text-left">
            <h3 className="text-xl font-semibold text-blue-700 mb-4">
              Professional Registration Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="text-gray-700">
                <span className="font-medium">Registration Country:</span>{" "}
                {vendor.countryRegistration || "N/A"}
              </div>
              <div className="text-gray-700">
                <span className="font-medium">License Authority:</span>{" "}
                {vendor.licenseAuthority || "N/A"}
              </div>
              <div className="text-gray-700 md:col-span-2">
                <span className="font-medium">Specialization:</span>{" "}
                {vendor.specialization || "N/A"}
              </div>
            </div>
          </div>
          <div className="mt-4 w-full text-center">
            <span className="text-gray-500">Created At:</span>
            <span className="ml-2 font-medium text-gray-700">
              {vendor.createdAt ? new Date(vendor.createdAt).toLocaleString() : "N/A"}
            </span>
          </div>
        </div>
      </div>

      {certificateOpen && vendor.certificate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <button
            type="button"
            onClick={() => setCertificateOpen(false)}
            className="absolute right-4 top-4 rounded-lg bg-white px-4 py-2 font-semibold text-gray-800 shadow"
          >
            Close
          </button>
          {isPdfUrl(vendor.certificate) ? (
            <iframe
              src={getFileUrl(vendor.certificate)}
              title="Certificate"
              className="h-[90vh] w-full max-w-5xl rounded-lg bg-white"
            />
          ) : (
            <img
              src={getFileUrl(vendor.certificate)}
              alt="Certificate full view"
              className="max-h-[90vh] max-w-full rounded-lg object-contain"
            />
          )}
        </div>
      )}

      {/* Stats Section */}
      {stats && (
        <div className="mt-10">
          <h3 className="text-2xl font-bold text-blue-900 mb-6 text-left">
            Appointment Statistics
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            <StatCard label="Pending" value={stats.Pending} color="yellow" />
            <StatCard label="Confirmed" value={stats.Confirmed} color="blue" />
            <StatCard label="Ongoing" value={stats.Ongoing} color="indigo" />
            <StatCard label="Completed" value={stats.Completed} color="green" />
            <StatCard label="Cancelled" value={stats.Cancelled} color="red" />
            <StatCard label="No Show" value={stats.NoShow} color="gray" />
            <StatCard label="Next 48h" value={stats.upcomingIn48Hours} color="purple" />
            <StatCard label="Future" value={stats.scheduledFuture} color="blue" />
          </div>
        </div>
      )}

      {/* Upcoming Appointments */}
      <div className="mt-10">
        <h3 className="text-2xl font-bold text-blue-900 mb-4 text-left">
          Upcoming Appointments (Next 2 Days)
        </h3>
        <div className="overflow-x-auto bg-white rounded-xl shadow border border-gray-100">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {upcomingAppointments.length > 0 ? (
                upcomingAppointments.map((app) => (
                  <tr key={app._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{getAppointmentPatientName(app)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{getAppointmentDate(app)} {getAppointmentTime(app)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{app.status || "N/A"}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{app.type || app.consultationType || "N/A"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-center text-gray-500">No upcoming appointments</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Appointments */}
      <div className="mt-10">
        <h3 className="text-2xl font-bold text-blue-900 mb-4 text-left">
          Recent Appointments
        </h3>
        <div className="overflow-x-auto bg-white rounded-xl shadow border border-gray-100">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fee</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentAppointments.length > 0 ? (
                recentAppointments.map((app) => (
                  <tr key={app._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{getAppointmentPatientName(app)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{getAppointmentDate(app)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{app.status || "N/A"}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹ {getAppointmentFee(app)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-center text-gray-500">No recent appointments</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // Subcomponents
  function StatCard({ label, value, color }) {
    const colors = {
      yellow: "bg-yellow-100 text-yellow-800",
      blue: "bg-blue-100 text-blue-800",
      indigo: "bg-indigo-100 text-indigo-800",
      green: "bg-green-100 text-green-800",
      red: "bg-red-100 text-red-800",
      gray: "bg-gray-100 text-gray-800",
      purple: "bg-purple-100 text-purple-800",
    };
    return (
      <div className={`p-4 rounded-xl shadow-sm text-center ${colors[color] || colors.blue}`}>
        <div className="text-2xl font-bold">{value || 0}</div>
        <div className="text-[10px] uppercase tracking-wider font-semibold opacity-80">{label}</div>
      </div>
    );
  }

  // InfoCard subcomponent for clean info display
  function InfoCard({ label, value, color, action }) {
    const colorMap = {
      indigo: "bg-indigo-50 text-indigo-700",
      pink: "bg-pink-50 text-pink-700",
      yellow: "bg-yellow-50 text-yellow-700",
      blue: "bg-blue-50 text-blue-700",
      green: "bg-green-50 text-green-700",
      purple: "bg-purple-50 text-purple-700",
      red: "bg-red-50 text-red-700",
    };
    return (
      <div
        className={`rounded-lg px-4 py-2 shadow ${action ? 'flex justify-between items-center' : 'text-center'} ${
          colorMap[color] || "bg-gray-50 text-gray-700"
        }`}
      >
        <div className={action ? "text-left" : ""}>
          <span className="block text-xs text-gray-500">{label}</span>
          <span className="font-semibold">{value}</span>
        </div>
        {action && <div>{action}</div>}
      </div>
    );
  }
};

export default ViewDoctor;

