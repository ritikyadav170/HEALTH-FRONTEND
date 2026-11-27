import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import api from "../../utils/api";
import AddressAutocomplete from "../../components/AddressAutocomplete";
import QualificationSelector from "../../components/QualificationSelector";
import DayScheduleSection from "../../components/DayScheduleSection";
import { COUNTRY_OPTIONS } from "../../utils/phoneValidation";
import { createEmptyDaySchedules, daySchedulesToSelectDays } from "../../utils/vendorFormHelpers";

const ASSET_BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:5000";
const assetUrl = value => {
  if (!value) return "";
  if (/^(https?:\/\/|blob:|data:)/i.test(value)) return value;
  const normalizedPath = String(value).replace(/\\/g, "/").replace(/^\/+/, "");
  const publicPath = normalizedPath.startsWith("public/") ? normalizedPath : `public/${normalizedPath}`;
  return `${ASSET_BASE_URL.replace(/\/$/, "")}/${publicPath}`;
};

export default function AddDoctor({ isEditing = false }) {
  const navigate = useNavigate();
  const { id: doctorId } = useParams();
  const [loading, setLoading] = useState(false);
  const [categoriesList, setCategoriesList] = useState([]);
  const [qualificationTree, setQualificationTree] = useState([]);
  const [gendersList, setGendersList] = useState([]);
  const [symptomsList, setSymptomsList] = useState([]);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");
  const [daySchedules, setDaySchedules] = useState(createEmptyDaySchedules());
  const [hospitalInfo, setHospitalInfo] = useState(null);

  const [formData, setFormData] = useState({
    Name: "",
    email: "",
    mobile: "",
    dob: "",
    gender: "male",
    qualification: [],
    registrationYear: "",
    yearOfExp: "",
    licOrRegNumber: "",
    inClinicFee: "",
    videoConsultFee: "",
    address: "",
    clinicAddress: "",
    state: "",
    district: "",
    pincode: "",
    countryCode: "+91",
    country: "India",
    countryIso: "IN",
    city: "",
    lat: "",
    long: "",
    isEmergency: false,
    inClinicAvailable: false,
    videoConsultAvailable: false,
    categories: [],
    symptoms: [],
    certificate: null,
    aadhaarImage: null,
    passportImage: null,
    profileImage: null,
  });

  const [previews, setPreviews] = useState({ certificate: null, aadhaarImage: null, passportImage: null, profileImage: null });

  useEffect(() => {
    // Fetch common data
    const fetchCommonData = async () => {
      try {
      const [catRes, qualRes, genRes, symRes] = await Promise.all([
          api.get("/common/categories"),
          api.get("/common/qualifications/tree"),
          api.get("/common/genders"),
          api.get("/common/symptoms")
        ]);
        if (catRes.data.success) setCategoriesList(catRes.data.data);
        if (qualRes.data.success) setQualificationTree(qualRes.data.data);
        if (genRes.data.success) setGendersList(genRes.data.data);
        if (symRes?.data?.success) setSymptomsList(symRes.data.data);
        if (isEditing && doctorId) {
          const doctorRes = await api.get(`/doctors/${doctorId}`);
          const doctor = doctorRes.data?.data?.vendor || doctorRes.data?.data;
          if (!doctor) throw new Error("Doctor not found");
          const toId = item => String(item?._id || item || "");
          const selectedCountry = COUNTRY_OPTIONS.find(item => item.name.replace(/\s*\([^)]*\)/g, "").toLowerCase() === String(doctor.country || "").toLowerCase())
            || COUNTRY_OPTIONS.find(item => item.code === doctor.countryCode);
          setFormData(prev => ({
            ...prev,
            Name: doctor.Name || "", email: doctor.email || "", mobile: doctor.mobile || "",
            dob: doctor.dob ? new Date(doctor.dob).toISOString().slice(0, 10) : "", gender: doctor.gender || "male",
            qualification: (() => {
              if (Array.isArray(doctor.qualification)) return doctor.qualification;
              if (typeof doctor.qualification === "string") {
                try {
                  const parsed = JSON.parse(doctor.qualification);
                  if (Array.isArray(parsed)) return parsed;
                } catch {}
                return [doctor.qualification];
              }
              return (doctor.degrees || []).map(item => item.name || item.degree || item.title).filter(Boolean);
            })(),
            registrationYear: doctor.registrationYear || "", yearOfExp: doctor.yearOfExp || "",
            licOrRegNumber: doctor.licOrRegNumber || "", inClinicFee: doctor.inClinicFee || "", videoConsultFee: doctor.videoConsultFee || "",
            address: doctor.address || "", clinicAddress: doctor.clinicAddress || "", state: doctor.state || "", district: doctor.district || "",
            city: doctor.city || "", pincode: doctor.pincode || "", lat: doctor.lat || "", long: doctor.long || "",
            countryCode: selectedCountry?.code || doctor.countryCode || "+91", country: selectedCountry?.name.split(" (")[0] || doctor.country || "India", countryIso: selectedCountry?.iso2 || "IN",
            isEmergency: Boolean(doctor.isEmergency), inClinicAvailable: Boolean(doctor.inClinicAvailable ?? doctor.inClinicAvaialble), videoConsultAvailable: Boolean(doctor.videoConsultAvailable),
            categories: (doctor.categories?.length ? doctor.categories : [doctor.category]).filter(Boolean).map(toId),
            symptoms: (doctor.symptoms || []).map(toId), certificate: null, aadhaarImage: null, passportImage: null, profileImage: null,
          }));
          const schedules = createEmptyDaySchedules();
          (doctor.selectDays || []).forEach(day => {
            if (schedules[day.day]) schedules[day.day] = { ...schedules[day.day], ...day, enabled: Boolean(day.available) };
          });
          setDaySchedules(schedules);
          setPreviews({ certificate: doctor.certificate || null, aadhaarImage: doctor.aadhaarImage || null, passportImage: doctor.passportImage || null, profileImage: doctor.profileImage || null });
        }
      } catch (err) {
        console.error("Failed to fetch common dropdowns", err);
      }

      const hInfo = localStorage.getItem("hospital_info");
      if (hInfo) {
        try {
          setHospitalInfo(JSON.parse(hInfo));
        } catch(e){}
      }
    };
    fetchCommonData();
  }, [isEditing, doctorId]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => {
        const updated = { ...prev, [name]: value };
        if (name === "registrationYear" && value) updated.yearOfExp = String(Math.max(0, new Date().getFullYear() - Number(value)));
        return updated;
      });
    }
  };

  const handleMultiSelect = (name, value) => {
    setFormData(prev => {
      const array = prev[name];
      const isSelecting = !array.includes(value);
      
      let newArray = isSelecting ? [...array, value] : array.filter(i => i !== value);
      let newSymptoms = [...prev.symptoms];

      // Auto-select symptoms when a category is selected
      if (name === "categories" && isSelecting) {
        const category = categoriesList.find(c => c._id === value);
        if (category && Array.isArray(category.symptoms)) {
          category.symptoms.forEach(symId => {
            if (!newSymptoms.includes(symId)) {
              newSymptoms.push(symId);
            }
          });
        }
      }

      // Optional: Auto-remove symptoms when a category is unchecked
      if (name === "categories" && !isSelecting) {
        const category = categoriesList.find(c => c._id === value);
        if (category && Array.isArray(category.symptoms)) {
          // Check if any OTHER selected category still needs this symptom
          const otherSelectedCats = categoriesList.filter(c => newArray.includes(c._id));
          const stillNeededSymptoms = new Set();
          otherSelectedCats.forEach(c => {
            if (Array.isArray(c.symptoms)) {
              c.symptoms.forEach(s => stillNeededSymptoms.add(s));
            }
          });

          // Remove the symptom if no other selected category needs it
          newSymptoms = newSymptoms.filter(symId => {
            if (category.symptoms.includes(symId) && !stillNeededSymptoms.has(symId)) {
              return false; // Remove it
            }
            return true; // Keep it
          });
        }
      }

      return { 
        ...prev, 
        [name]: newArray,
        ...(name === "categories" && { symptoms: newSymptoms })
      };
    });
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      setFormData(prev => ({ ...prev, [name]: files[0] }));
      setPreviews(prev => ({ ...prev, [name]: URL.createObjectURL(files[0]) }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.qualification.length) {
      toast.error("Please add at least one qualification.");
      document.getElementById("doctor-qualification")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setLoading(true);

    const submitData = new FormData();
    const selectDays = daySchedulesToSelectDays(daySchedules);
    submitData.append("selectDays", JSON.stringify(selectDays));

    // Append standard fields
    Object.keys(formData).forEach(key => {
      if (key === "categories" || key === "qualification" || key === "symptoms") {
        submitData.append(key, JSON.stringify(formData[key]));
      } else if (["certificate", "aadhaarImage", "passportImage", "profileImage"].includes(key)) {
        if (formData[key]) submitData.append(key, formData[key]);
      } else {
        submitData.append(key, formData[key]);
      }
    });

    try {
      const res = isEditing
        ? await api.put(`/doctors/${doctorId}`, submitData)
        : await api.post("/doctors", submitData);
      if (res.data.success) {
        toast.success(res.data.message || (isEditing ? "Doctor updated successfully" : "Specialist added successfully"));
        navigate("/doctors");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || (isEditing ? "Failed to update doctor" : "Failed to add specialist"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{isEditing ? "Edit Doctor" : "Add a Specialist"}</h1>
        <p className="text-slate-500 mt-2 font-medium">{isEditing ? "Update the doctor's professional and clinic details." : "Add comprehensive details for your hospital's new doctor."}</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-6 md:p-10">
        <form onSubmit={handleSubmit} className="space-y-6 md:space-y-10">
          
          {/* Personal Information */}
          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-6 border-b border-slate-100 pb-2">Personal Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-2">Hospital Affiliation</label>
                <div className="w-full px-4 py-3 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-800 font-bold cursor-not-allowed flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="truncate">{hospitalInfo ? hospitalInfo.name : "Loading..."}</span>
                  </div>
                  <span className="text-xs bg-indigo-100 text-indigo-700 py-1 px-2 rounded-lg shrink-0">Auto-selected</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">This doctor will be exclusively onboarded under your hospital context.</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Full Name <span className="text-red-500">*</span></label>
                <input required name="Name" type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all" placeholder="Dr. John Doe" value={formData.Name} onChange={handleInputChange} />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Email Address <span className="text-red-500">*</span></label>
                <input required name="email" type="email" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all" placeholder="doctor@hospital.com" value={formData.email} onChange={handleInputChange} />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Mobile Number <span className="text-red-500">*</span></label>
                <div className="flex relative">
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                      className="h-full px-3 py-3 bg-slate-50 border border-slate-200 border-r-0 rounded-l-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-slate-700 font-medium flex items-center gap-1 min-w-[90px] justify-between"
                    >
                      <span>{formData.countryIso} ({formData.countryCode})</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                    
                    {showCountryDropdown && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setShowCountryDropdown(false)}></div>
                        <div className="absolute top-full left-0 mt-1 w-80 max-h-80 overflow-y-auto bg-white border border-slate-200 shadow-xl rounded-xl z-20 py-1">
                          <input
                            autoFocus
                            type="search"
                            value={countrySearch}
                            onChange={event => setCountrySearch(event.target.value)}
                            onClick={event => event.stopPropagation()}
                            placeholder="Search country or dial code..."
                            className="sticky top-0 w-full px-3 py-2 border-b border-slate-100 outline-none text-sm bg-white"
                          />
                          {COUNTRY_OPTIONS.filter(country => `${country.name} ${country.iso2} +${country.dialCode}`.toLowerCase().includes(countrySearch.toLowerCase())).map((c) => (
                            <button
                              key={`${c.iso2}-${c.dialCode}`}
                              type="button"
                              className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                              onClick={() => {
                                setFormData(prev => ({ ...prev, countryCode: c.code, country: c.name.split(" (")[0], countryIso: c.iso2 }));
                                setCountrySearch("");
                                setShowCountryDropdown(false);
                              }}
                            >
                              {c.name.split(" (")[0]} ({c.iso2}) · {c.code}
                            </button>
                          ))}
                          {COUNTRY_OPTIONS.every(country => !`${country.name} ${country.iso2} +${country.dialCode}`.toLowerCase().includes(countrySearch.toLowerCase())) && (
                            <p className="px-3 py-3 text-sm text-slate-500">No country found. Try its name or calling code.</p>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                  <input required name="mobile" type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-r-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all" placeholder="98765 43210" value={formData.mobile} onChange={handleInputChange} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Date of Birth <span className="text-red-500">*</span></label>
                <input required name="dob" type="date" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all" value={formData.dob} onChange={handleInputChange} />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Gender <span className="text-red-500">*</span></label>
                <select required name="gender" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all" value={formData.gender} onChange={handleInputChange}>
                  <option value="male">Male</option><option value="female">Female</option><option value="other">Other</option>
                  {gendersList.filter(g => !["male","female","other"].includes(g.name.toLowerCase())).map(g => <option key={g._id} value={g.name.toLowerCase()}>{g.name}</option>)}
                </select>
              </div>
            </div>
          </section>

          {/* Professional Details */}
          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-6 border-b border-slate-100 pb-2">Professional Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-3">Categories / Departments <span className="text-red-500">*</span></label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 max-h-48 overflow-y-auto">
                  {categoriesList.map(cat => (
                    <label key={cat._id} className="flex items-center space-x-2 cursor-pointer">
                      <input type="checkbox" checked={formData.categories.includes(cat._id)} onChange={() => handleMultiSelect("categories", cat._id)} className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500" />
                      <span className="text-sm text-slate-700 font-medium">{cat.name}</span>
                    </label>
                  ))}
                  {categoriesList.length === 0 && <span className="text-sm text-slate-500">No categories found.</span>}
                </div>
              </div>

              <div className="md:col-span-2">
                <div id="doctor-qualification" className={`rounded-xl p-4 transition-colors ${formData.qualification.length ? "border border-slate-200 bg-white" : "border-2 border-amber-400 bg-amber-50/70 ring-2 ring-amber-100"}`}>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Qualification <span className="text-red-500">*</span></label>
                  <p className={`text-xs mb-3 ${formData.qualification.length ? "text-slate-500" : "font-semibold text-amber-800"}`}>
                    {formData.qualification.length ? "Add or select at least one qualification." : "Required: please add the doctor's qualification before submitting."}
                  </p>
                <QualificationSelector 
                  treeNodes={qualificationTree}
                  selectedQualifications={formData.qualification}
                  onChange={(val) => setFormData(prev => ({ ...prev, qualification: val }))}
                />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-3">Symptoms / Treatments (Multiple)</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 max-h-48 overflow-y-auto">
                  {symptomsList.map(sym => (
                    <label key={sym._id} className="flex items-center space-x-2 cursor-pointer">
                      <input type="checkbox" checked={formData.symptoms.includes(sym._id)} onChange={() => handleMultiSelect("symptoms", sym._id)} className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500" />
                      <span className="text-sm text-slate-700 font-medium">{sym.name}</span>
                    </label>
                  ))}
                  {symptomsList.length === 0 && <span className="text-sm text-slate-500">No symptoms found.</span>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">License / Reg. Number <span className="text-red-500">*</span></label>
                <input required name="licOrRegNumber" type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all" placeholder="MED-123456" value={formData.licOrRegNumber} onChange={handleInputChange} />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Registration Year</label>
                <input name="registrationYear" type="number" placeholder="e.g. 2015" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all" value={formData.registrationYear} onChange={handleInputChange} />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Years of Experience</label>
                <input name="yearOfExp" type="number" placeholder="e.g. 10" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all" value={formData.yearOfExp} onChange={handleInputChange} />
              </div>
            </div>
          </section>

          {/* Location & Availability */}
          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-6 border-b border-slate-100 pb-2">Location & Availability</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-2">Personal/ Residential Address</label>
                <AddressAutocomplete
                  value={formData.address}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  placeholder="Search personal/residential address..."
                  onChange={(e) => handleInputChange({ target: { name: 'address', value: e.target.value }})}
                  onPlaceSelected={(place) => {
                    const components = place.address_components || [];
                    const component = (...types) => components.find(c => types.some(type => c.types.includes(type)));
                    const state = component("administrative_area_level_1")?.long_name || "";
                    const district = component("administrative_area_level_2", "sublocality_level_1")?.long_name || "";
                    const city = component("locality", "postal_town")?.long_name || "";
                    const countryComponent = component("country");
                    const postalCode = component("postal_code")?.long_name || "";
                    const postalCodeSuffix = component("postal_code_suffix")?.long_name || "";
                    const pincode = postalCode && postalCodeSuffix ? `${postalCode}-${postalCodeSuffix}` : postalCode;
                    setFormData(prev => ({
                      ...prev,
                      address: place.formatted_address || place.name || prev.address,
                      state,
                      district,
                      city,
                      pincode,
                      country: countryComponent?.long_name || "",
                      countryIso: countryComponent?.short_name || "",
                      lat: place.geometry?.location?.lat?.().toString() || "",
                      long: place.geometry?.location?.lng?.().toString() || "",
                    }));
                  }}
                />
                <p className="text-xs text-slate-500 mt-1">Select a suggested address to fill the location details automatically.</p>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Pincode</label>
                <input name="pincode" type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all" value={formData.pincode} onChange={handleInputChange} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">State</label>
                  <input name="state" type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all" value={formData.state} onChange={handleInputChange} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">District</label>
                  <input name="district" type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all" value={formData.district} onChange={handleInputChange} />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-6 mb-6 p-4 bg-indigo-50/50 rounded-xl border border-indigo-100">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input type="checkbox" name="isEmergency" checked={formData.isEmergency} onChange={handleInputChange} className="w-5 h-5 text-indigo-600 rounded border-indigo-300 focus:ring-indigo-500" />
                <span className="text-sm font-bold text-indigo-900">Emergency Available</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input type="checkbox" name="inClinicAvailable" checked={formData.inClinicAvailable} onChange={handleInputChange} className="w-5 h-5 text-indigo-600 rounded border-indigo-300 focus:ring-indigo-500" />
                <span className="text-sm font-bold text-indigo-900">In-Clinic Consults</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input type="checkbox" name="videoConsultAvailable" checked={formData.videoConsultAvailable} onChange={handleInputChange} className="w-5 h-5 text-indigo-600 rounded border-indigo-300 focus:ring-indigo-500" />
                <span className="text-sm font-bold text-indigo-900">Video Consults</span>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {formData.inClinicAvailable && (
                <>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">In-Clinic Fee (₹)</label>
                    <input name="inClinicFee" type="number" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all" placeholder="500" value={formData.inClinicFee} onChange={handleInputChange} />
                  </div>
                </>
              )}
              {formData.videoConsultAvailable && (
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Video Fee (₹)</label>
                  <input name="videoConsultFee" type="number" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all" placeholder="300" value={formData.videoConsultFee} onChange={handleInputChange} />
                </div>
              )}
            </div>
          </section>

          {/* Schedule Section */}
          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-6 border-b border-slate-100 pb-2">Weekly Schedule (Optional)</h2>
            <DayScheduleSection daySchedules={daySchedules} onChange={setDaySchedules} />
          </section>

          {/* Documents */}
          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-6 border-b border-slate-100 pb-2">Documents & Verification</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 border border-slate-200 rounded-xl bg-slate-50">
                <div className="h-16 w-16 rounded-full overflow-hidden bg-slate-200 flex-shrink-0 border-2 border-white shadow-sm">
                  {previews.profileImage ? <img src={assetUrl(previews.profileImage)} className="w-full h-full object-cover" alt="Profile" /> : <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold text-xs">Photo</div>}
                </div>
                <div className="w-full overflow-hidden">
                  <label className="block text-sm font-bold text-slate-700 mb-1">Profile Photo</label>
                  <input type="file" name="profileImage" accept="image/*" onChange={handleFileChange} className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer" />
                </div>
              </div>
              {[{ name: "aadhaarImage", label: "Aadhaar" }, { name: "passportImage", label: "Passport" }].map(({ name, label }) => (
                <div key={name} className="p-4 border border-slate-200 rounded-xl bg-slate-50">
                  <label className="block text-sm font-bold text-slate-700 mb-2">{label}</label>
                  {previews[name] && <a href={assetUrl(previews[name])} target="_blank" rel="noreferrer" className="block text-sm text-indigo-600 mb-2">View current {label}</a>}
                  {!previews[name] && <p className="text-xs text-slate-500 mb-2">No {label} uploaded</p>}
                  <input type="file" name={name} accept="image/*,application/pdf" onChange={handleFileChange} className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer" />
                </div>
              ))}

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 border border-slate-200 rounded-xl bg-slate-50">
                <div className="h-16 w-16 rounded-lg overflow-hidden bg-slate-200 flex-shrink-0 border-2 border-white shadow-sm flex items-center justify-center">
                  {previews.certificate ? <a href={assetUrl(previews.certificate)} target="_blank" rel="noreferrer" className="text-indigo-600 font-bold text-xs">View current file</a> : <span className="text-slate-400 font-bold text-xs">Cert</span>}
                </div>
                <div className="w-full overflow-hidden">
                  <label className="block text-sm font-bold text-slate-700 mb-1">Registration Certificate</label>
                  <input type="file" name="certificate" accept="image/*,application/pdf" onChange={handleFileChange} className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer" />
                </div>
              </div>
            </div>
          </section>

          <div className="pt-8 border-t border-slate-100 flex justify-end gap-4">
            <button type="button" onClick={() => navigate("/doctors")} className="px-6 py-3 border border-slate-300 rounded-xl text-slate-700 font-bold hover:bg-slate-50 hover:text-slate-900 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="px-8 py-3 bg-indigo-600 rounded-xl text-white font-bold hover:bg-indigo-700 transition-all duration-200 shadow-md shadow-indigo-200 disabled:bg-indigo-400">
              {loading ? (isEditing ? "Saving..." : "Adding...") : (isEditing ? "Save Changes" : "Add Specialist")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
