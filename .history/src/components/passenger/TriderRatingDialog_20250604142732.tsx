"use client";

import * as React from "react";
import { Star, MessageSquareText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface TriderRatingDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  triderName?: string;
  onSubmit: (rating: number, comment?: string) => void;
  onSkip: () => void;
}

export function TriderRatingDialog({
  isOpen,
  onOpenChange,
  triderName = "your Trider",
  onSubmit,
  onSkip,
}: TriderRatingDialogProps) {
  const [rating, setRating] = React.useState(0);
  const [hoverRating, setHoverRating] = React.useState(0);
  const [comment, setComment] = React.useState("");

  const handleStarClick = (starValue: number) => {
    setRating(starValue);
  };

  const handleStarHover = (starValue: number) => {
    setHoverRating(starValue);
  };

  const handleMouseLeave = () => {
    setHoverRating(0);
  };

  const handleSubmit = () => {
    onSubmit(rating, comment);
    resetState();
  };

  const handleSkip = () => {
    onSkip();
    resetState();
  };

  const resetState = () => {
    setRating(0);
    setHoverRating(0);
    setComment("");
  }

  React.useEffect(() => {
    // Reset state if dialog is closed externally
    if (!isOpen) {
      resetState();
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-white text-black">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Rate {triderName}
          </DialogTitle>
          <DialogDescription className="text-center text-gray-600">
            Your feedback helps us improve our service.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-6">
          <div className="flex justify-center space-x-2" onMouseLeave={handleMouseLeave}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={36}
                className={`cursor-pointer transition-colors duration-150 ${
                  (hoverRating || rating) >= star
                    ? "text-yellow-400 fill-yellow-400"
                    : "text-gray-300"
                }`}
                onClick={() => handleStarClick(star)}
                onMouseEnter={() => handleStarHover(star)}
              />
            ))}
          </div>
          <div className="space-y-2">
            <Label htmlFor="comment" className="text-gray-700 font-medium flex items-center">
              <MessageSquareText size={16} className="mr-2 text-gray-500" />
              Optional Comment & Suggestions
            </Label>
            <Textarea
              id="comment"
              placeholder={`Any comments for ${triderName}? (e.g., "Very friendly!", "Took a great route.")`}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="min-h-[100px] bg-gray-50 border-gray-300 focus:border-purple-500 focus:ring-purple-500"
            />
          </div>
        </div>
        <DialogFooter className="sm:justify-between space-y-2 sm:space-y-0 sm:space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleSkip}
            className="w-full sm:w-auto border-gray-300 text-gray-700 hover:bg-gray-100"
          >
            Skip
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={rating === 0}
            className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white"
            style={{backgroundColor: 'var(--passenger-accent-color)'}}
          >
            Submit Rating
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}