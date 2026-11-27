import { useState } from "react";
import { MdDownload } from "react-icons/md";
import { toast } from "react-hot-toast";
import api from "../utils/api";

export default function HospitalExportButton({ section, label = "Export ZIP" }) {
  const [loading, setLoading] = useState(false);

  const download = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/exports/${section}`, { responseType: "blob" });
      const url = URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = url;
      link.download = `hospital-${section}-export.zip`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      toast.success("Export downloaded");
    } catch (error) {
      let message = error.response?.data?.message || "Could not export data";
      if (error.response?.data instanceof Blob) {
        try {
          const result = JSON.parse(await error.response.data.text());
          message = result.message || message;
        } catch { /* Keep the fallback message. */ }
      }
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={download}
      disabled={loading}
      className="inline-flex items-center gap-2 rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 font-semibold text-teal-800 transition-colors hover:bg-teal-100 disabled:cursor-wait disabled:opacity-60"
    >
      <MdDownload className="text-xl" />
      {loading ? "Preparing..." : label}
    </button>
  );
}
