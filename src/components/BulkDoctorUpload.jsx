import React, { useState } from "react";
import { MdCloudUpload, MdDownload, MdClose } from "react-icons/md";
import { toast } from "react-hot-toast";
import api from "../utils/api";

const TEMPLATE_COLUMNS = [
  "name", "mobile", "email", "gender", "dob", "qualification", "licOrRegNumber",
  "category", "symptoms", "image", "country", "countryCode", "address", "clinicAddress",
  "state", "district", "city", "pincode", "yearOfExp", "registrationYear", "inClinicAvailable",
  "videoConsultAvailable", "inClinicFee", "videoConsultFee", "openingTime", "closingTime",
  "sessionTime", "breakTime",
];

export default function BulkDoctorUpload({ onSuccess }) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const hospital = JSON.parse(localStorage.getItem("hospital_info") || "{}");

  const downloadTemplate = (format = "csv") => {
    const link = document.createElement("a");
    if (format === "zip") {
      link.href = "/doctors_import_xyz_v2 (1).zip";
      link.download = "doctors_import_xyz_v2 (1).zip";
    } else {
      link.href = "/doctors_bulk_import.csv";
      link.download = "doctors_bulk_import.csv";
    }
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const close = () => {
    if (loading) return;
    setOpen(false);
    setFile(null);
    setUploadResult(null);
  };

  const upload = async () => {
    if (!file) return toast.error("Please select a CSV, Excel, or ZIP file");
    const formData = new FormData();
    formData.append("file", file);
    setUploadResult(null);
    try {
      setLoading(true);
      const response = await api.post("/doctors/bulk-upload", formData);
      const details = response.data.data || {};
      const failed = details.errors?.length || 0;
      if (details.createdCount > 0) {
        onSuccess?.();
      }
      if (failed > 0) {
        setUploadResult(details);
        toast.error(
          details.createdCount > 0
            ? `Imported ${details.createdCount} doctors. ${failed} rows failed.`
            : `${failed} rows could not be imported`
        );
      } else {
        toast.success(response.data.message || "Doctors imported successfully");
        close();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Bulk upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 border border-indigo-200 bg-indigo-50 text-indigo-700 px-5 py-3 rounded-xl font-bold hover:bg-indigo-100 transition-colors"
      >
        <MdCloudUpload className="text-xl" /> Bulk Upload
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/40 p-2 sm:p-4">
          <div className="flex max-h-[calc(100dvh-1rem)] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl sm:max-h-[calc(100dvh-2rem)]">
            <div className="flex shrink-0 items-start justify-between border-b border-slate-100 p-4 sm:p-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">Hospital bulk onboarding</p>
                <h2 className="mt-1 text-2xl font-extrabold text-slate-900">Import doctors</h2>
                <p className="mt-1 text-sm text-slate-500">All uploaded doctors will be linked to <strong>{hospital.name || "your hospital"}</strong>.</p>
              </div>
              <button type="button" onClick={close} className="text-slate-400 hover:text-slate-700" aria-label="Close">
                <MdClose className="text-2xl" />
              </button>
            </div>
            <div className="min-h-0 space-y-5 overflow-y-auto p-4 sm:p-6">
              <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-4 text-sm text-indigo-900">
                <p className="font-bold">Hospital lock enabled</p>
                <p className="mt-1">The hospital is selected from your login account. It cannot be changed through the file.</p>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-slate-700">
                <h4 className="font-semibold text-slate-800 mb-2">How to prepare the file</h4>
                <ul className="list-disc pl-5 space-y-1 text-xs">
                  <li>Download the sample CSV and fill the rows.</li>
                  <li>Multi-value columns (qualification, symptoms) → use <strong>comma separated values</strong>.</li>
                  <li>
                    For images: put image files inside a folder named <strong>images</strong>, then zip everything together:
                    <pre className="bg-white p-2 rounded-md mt-1 border border-slate-200 font-mono text-[10px]">
{`my_import.zip
 ├── data.csv   (or .xlsx)
 └── images/
      ├── doctor1.jpg
      └── doctor2.png`}
                    </pre>
                  </li>
                  <li>In the <strong>image</strong> column write only the filename(s) (e.g. <code>doctor1.jpg</code>).</li>
                  <li>New values for Country, Category, or Symptoms will be <strong>created automatically</strong> if they don't exist.</li>
                </ul>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={() => downloadTemplate("csv")}
                  className="flex items-center gap-2 text-sm font-bold text-indigo-700 hover:text-indigo-900"
                >
                  <MdDownload className="text-lg" /> Download sample CSV format
                </button>
                <span className="text-slate-300">|</span>
                <button
                  type="button"
                  onClick={() => downloadTemplate("zip")}
                  className="flex items-center gap-2 text-sm font-bold text-emerald-700 hover:text-emerald-900"
                >
                  <MdDownload className="text-lg" /> Download sample ZIP (with images)
                </button>
              </div>
              <label className="block cursor-pointer rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-8 text-center hover:border-indigo-400 hover:bg-indigo-50/40">
                <MdCloudUpload className="mx-auto text-4xl text-indigo-500" />
                <span className="mt-2 block font-bold text-slate-700">{file ? file.name : "Choose CSV, XLSX, XLS, or ZIP"}</span>
                <span className="mt-1 block text-xs text-slate-500">ZIP may contain the data file and doctor images</span>
                <input type="file" className="hidden" accept=".csv,.xlsx,.xls,.zip" onChange={(event) => setFile(event.target.files?.[0] || null)} />
              </label>

              {uploadResult?.errors?.length > 0 && (
                <div className="rounded-xl border border-rose-200 bg-rose-50/90 p-4">
                  <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-rose-200">
                    <div className="flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-600 text-white text-[11px] font-bold">!</span>
                      <p className="font-bold text-rose-900 text-sm">
                        {uploadResult.errors.length} {uploadResult.errors.length === 1 ? "row" : "rows"} could not be imported
                      </p>
                    </div>
                    {uploadResult.createdCount > 0 && (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                        {uploadResult.createdCount} imported successfully
                      </span>
                    )}
                  </div>
                  <div className="max-h-48 space-y-2 overflow-y-auto pr-1">
                    {uploadResult.errors.map((err, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2.5 rounded-lg border border-rose-200 bg-white p-2.5 text-xs shadow-sm"
                      >
                        <span className="shrink-0 rounded bg-rose-100 px-2 py-0.5 font-bold text-rose-800">
                          Row {err.row}
                        </span>
                        {err.mobile && err.mobile !== "N/A" && (
                          <span className="shrink-0 rounded bg-slate-100 px-2 py-0.5 font-mono text-slate-700">
                            {err.mobile}
                          </span>
                        )}
                        <span className="flex-1 font-medium text-rose-900 leading-relaxed">
                          {err.error}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex justify-end gap-3">
                <button type="button" onClick={close} className="rounded-xl border border-slate-200 px-5 py-3 font-bold text-slate-600">Cancel</button>
                <button type="button" onClick={upload} disabled={loading} className="rounded-xl bg-indigo-600 px-5 py-3 font-bold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60">
                  {loading ? "Uploading..." : "Upload doctors"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
