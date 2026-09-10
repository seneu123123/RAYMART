import React, { useState } from "react";
import { MessageSquare, Star, CheckCircle2, EyeOff, ShieldCheck, ThumbsUp } from "lucide-react";
import { CustomerReview } from "../../../types";
import { StorageService } from "../../../services/storage";

export const ReviewsModule: React.FC = () => {
  const [reviews, setReviews] = useState<CustomerReview[]>(StorageService.getReviews());

  const handleUpdateStatus = (id: string, status: CustomerReview["status"]) => {
    StorageService.updateReviewStatus(id, status);
    setReviews(StorageService.getReviews());
  };

  const avgRating = (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl text-[#F4F1EA] font-bold">
            Guest Feedback & CSAT Moderation
          </h2>
          <p className="text-xs text-[#7C8B96]">
            Audited post-expedition evaluations, guide performance ratings, and marine sanctuary feedback
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 text-xs font-semibold flex items-center gap-1">
            <Star className="w-3.5 h-3.5 fill-current" /> {avgRating} / 5.0 CSAT Index
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reviews.map((rev) => (
          <div
            key={rev.id}
            className="bg-[#0B1014] border border-white/10 rounded-2xl p-6 space-y-4 shadow-lg flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold text-[#F4F1EA] text-sm">{rev.guestName}</h4>
                  <p className="text-[11px] text-[#7C8B96]">{rev.packageTitle} • {rev.createdAt}</p>
                </div>
                <div className="flex items-center gap-1 text-amber-300">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${i < rev.rating ? "fill-current" : "text-white/20"}`}
                    />
                  ))}
                </div>
              </div>

              <p className="text-xs text-[#D1CCC0] italic leading-relaxed">
                &ldquo;{rev.comment}&rdquo;
              </p>

              {rev.guideMentioned && (
                <div className="text-[11px] text-[#7C8B96]">
                  Assigned Guide Commendation: <span className="text-[#F26A4F] font-medium">{rev.guideMentioned}</span>
                </div>
              )}
            </div>

            {/* Moderation Controls */}
            <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs">
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                rev.status === "Published"
                  ? "bg-emerald-500/10 text-emerald-400"
                  : "bg-amber-500/10 text-amber-400"
              }`}>
                {rev.status}
              </span>

              <div className="flex gap-1.5">
                {rev.status !== "Published" && (
                  <button
                    onClick={() => handleUpdateStatus(rev.id, "Published")}
                    className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors cursor-pointer text-[11px]"
                  >
                    Approve
                  </button>
                )}
                {rev.status !== "Hidden" && (
                  <button
                    onClick={() => handleUpdateStatus(rev.id, "Hidden")}
                    className="px-2.5 py-1 rounded-lg bg-white/5 text-[#7C8B96] hover:text-white transition-colors cursor-pointer text-[11px]"
                  >
                    Hide
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
