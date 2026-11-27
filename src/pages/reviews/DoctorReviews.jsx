import React, { useEffect, useState } from "react";
import { MdStar, MdRateReview } from "react-icons/md";
import api from "../../utils/api";

export default function DoctorReviews() {
  const [data, setData] = useState({ reviews: [], averageRating: 0, totalReviews: 0, pagination: {} });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    api.get("/reviews", { params: { page, limit: 20 } })
      .then((response) => { if (active) setData(response.data.data); })
      .catch((requestError) => { if (active) setError(requestError.response?.data?.message || "Could not load reviews."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [page]);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">Patient feedback</p>
        <h1 className="mt-1 text-3xl font-extrabold text-slate-900">Doctor reviews</h1>
        <p className="mt-2 text-sm text-slate-500">Reviews submitted by patients for appointments with your hospital’s doctors.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Average rating</p>
          <p className="mt-2 flex items-center gap-2 text-3xl font-bold text-slate-900"><MdStar className="text-amber-400" />{Number(data.averageRating || 0).toFixed(1)} <span className="text-sm font-medium text-slate-400">/ 5</span></p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Total reviews</p>
          <p className="mt-2 flex items-center gap-2 text-3xl font-bold text-slate-900"><MdRateReview className="text-indigo-500" />{data.totalReviews}</p>
        </div>
      </div>

      {loading ? <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500">Loading reviews…</div>
        : error ? <div role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-rose-700">{error}</div>
          : data.reviews.length === 0 ? <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500">No doctor reviews have been submitted yet.</div>
            : <div className="space-y-4">{data.reviews.map((review) => (
              <article key={review._id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h2 className="font-bold text-slate-900">{review.vendor?.Name || "Doctor"}</h2>
                    <p className="mt-1 text-sm text-slate-500">Patient: {review.user?.name || "Patient"}</p>
                    <p className="mt-1 text-xs text-slate-400">
                      {review.appointment?.appointmentDate ? new Date(review.appointment.appointmentDate).toLocaleDateString() : "Appointment date unavailable"}
                      {review.appointment?.timeSlot ? ` · ${review.appointment.timeSlot}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-amber-500" aria-label={`${review.rating} out of 5 stars`}>
                    {Array.from({ length: 5 }, (_, index) => <MdStar key={index} className={index < review.rating ? "text-amber-400" : "text-slate-200"} />)}
                    <span className="ml-1 text-sm font-semibold text-slate-700">{review.rating}/5</span>
                  </div>
                </div>
                <p className="mt-4 whitespace-pre-wrap break-words text-sm leading-6 text-slate-700">{review.review}</p>
              </article>
            ))}</div>}

      {data.pagination?.totalPages > 1 && <div className="flex items-center justify-between rounded-xl bg-white px-4 py-3">
        <span className="text-sm text-slate-500">Page {page} of {data.pagination.totalPages}</span>
        <div className="flex gap-2">
          <button disabled={page <= 1 || loading} onClick={() => setPage((current) => current - 1)} className="rounded-lg border px-4 py-2 text-sm font-semibold disabled:opacity-40">Previous</button>
          <button disabled={page >= data.pagination.totalPages || loading} onClick={() => setPage((current) => current + 1)} className="rounded-lg border px-4 py-2 text-sm font-semibold disabled:opacity-40">Next</button>
        </div>
      </div>}
    </div>
  );
}
