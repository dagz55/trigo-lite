"use client";

import * as React from 'react';
import { useState, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface TriderRatingFormProps {
  rideId: string;
  triderId: string;
  onRatingSubmitted: () => void;
}

export function TriderRatingForm({ rideId, triderId, onRatingSubmitted }: TriderRatingFormProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleStarClick = useCallback((starValue: number) => {
    setRating(starValue);
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // In a real application, you would send this data to your backend/database
    console.log("Submitting rating:", { rideId, triderId, rating, comment });

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    setSubmitted(true);
    onRatingSubmitted(); // Notify parent component that rating was submitted
  }, [rideId, triderId, rating, comment, onRatingSubmitted]);

  if (submitted) {
    return (
      <div className="text-center p-6">
        <h3 className="text-xl font-semibold text-primary mb-2">Thank You!</h3>
        <p className="text-muted-foreground">Your feedback has been submitted.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-6">
      <div className="space-y-2">
        <Label htmlFor="rating" className="text-lg font-semibold text-foreground">Rate Your Trider</Label>
        <div className="flex space-x-1">
          {[1, 2, 3, 4, 5].map((starValue) => (
            <Star
              key={starValue}
              className={cn(
                "h-8 w-8 cursor-pointer transition-colors duration-200",
                rating >= starValue ? "text-yellow-400 fill-current" : "text-muted-foreground/50"
              )}
              onClick={() => handleStarClick(starValue)}
            />
          ))}
        </div>
        {rating === 0 && (
          <p className="text-sm text-red-500">Please select a star rating.</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="comment" className="text-lg font-semibold text-foreground">Additional Comments (Optional)</Label>
        <Textarea
          id="comment"
          placeholder="Share your experience..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          className="resize-none"
        />
      </div>

      <Button type="submit" className="w-full" disabled={rating === 0 || isSubmitting}>
        {isSubmitting ? "Submitting..." : "Submit Rating"}
      </Button>
    </form>
  );
}