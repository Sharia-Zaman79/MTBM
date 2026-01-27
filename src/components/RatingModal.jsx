import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { repairAlertsApi } from "@/lib/repairAlertsApi";
import { Star, Loader2, X } from "lucide-react";

export function RatingModal({ alertId, technicianName, onClose, onRated }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    if (rating === 0) {
      setError("Please select a rating");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await repairAlertsApi.rateTechnician(alertId, rating, comment.trim() || null);
      onRated?.(rating);
      onClose();
    } catch (err) {
      console.error("Error submitting rating:", err);
      setError(err.message || "Failed to submit rating");
    } finally {
      setSubmitting(false);
    }
  };

  const ratingLabels = ["", "Poor", "Fair", "Good", "Very Good", "Excellent"];

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-6 w-full max-w-md mx-4 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">Rate Technician</h2>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            className="h-8 w-8 text-zinc-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Technician Name */}
        <p className="text-zinc-400 mb-6">
          How was your experience with <span className="text-white font-medium">{technicianName}</span>?
        </p>

        {/* Star Rating */}
        <div className="flex flex-col items-center mb-6">
          <div className="flex gap-2 mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="focus:outline-none transition-transform hover:scale-110"
              >
                <Star
                  className={`w-10 h-10 ${
                    star <= (hoverRating || rating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-zinc-600"
                  }`}
                />
              </button>
            ))}
          </div>
          <p className="text-sm text-zinc-400 h-5">
            {ratingLabels[hoverRating || rating] || "Select a rating"}
          </p>
        </div>

        {/* Comment */}
        <div className="mb-6">
          <label className="block text-sm text-zinc-400 mb-2">
            Additional feedback (optional)
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience..."
            className="w-full h-24 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            maxLength={500}
          />
          <p className="text-xs text-zinc-500 text-right mt-1">
            {comment.length}/500
          </p>
        </div>

        {/* Error */}
        {error && (
          <p className="text-red-400 text-sm mb-4 text-center">{error}</p>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 border-zinc-700 text-zinc-300 hover:bg-zinc-800"
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={rating === 0 || submitting}
            className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black font-medium"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Star className="w-4 h-4 mr-2" />
                Submit Rating
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

// Display rating stars (read-only)
export function RatingDisplay({ rating, size = "sm" }) {
  if (!rating) return null;

  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${sizeClasses[size]} ${
            star <= rating
              ? "fill-yellow-400 text-yellow-400"
              : "text-zinc-600"
          }`}
        />
      ))}
      <span className="text-xs text-zinc-400 ml-1">({rating})</span>
    </div>
  );
}

export default RatingModal;
