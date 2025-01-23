import { useTranslate } from "@refinedev/core";
import { Star, Upload, Info, X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

interface ReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: {
    id: string;
    name: string;
    image: string;
  };
  orderId: string;
}

interface MediaFile {
  type: 'image' | 'video';
  file: File;
  preview: string;
}

export function ReviewDialog({
  open,
  onOpenChange,
  item,
  orderId
}: ReviewDialogProps) {
  const t = useTranslate();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [review, setReview] = useState("");
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const maxFiles = 5;
  const pointsToEarn = 50;

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const remainingSlots = maxFiles - mediaFiles.length;
    const newFiles = Array.from(files).slice(0, remainingSlots);

    newFiles.forEach(file => {
      const type = file.type.startsWith('image/') ? 'image' : 'video';
      const preview = URL.createObjectURL(file);
      setMediaFiles(prev => [...prev, { type, file, preview }]);
    });
  };

  const removeFile = (index: number) => {
    setMediaFiles(prev => {
      const newFiles = [...prev];
      URL.revokeObjectURL(newFiles[index].preview);
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const handleSubmit = async () => {
    if (rating === 0) return;
    
    setIsSubmitting(true);
    try {
      // Add your review submission logic here
      console.log({
        orderId,
        itemId: item.id,
        rating,
        review,
        mediaFiles
      });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onOpenChange(false);
    } catch (error) {
      console.error('Error submitting review:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85%] p-0 border-0 bg-background rounded-t-[14px]">
        <SheetHeader className="px-4 py-3 border-b sticky top-0 bg-background/80 backdrop-blur-xl z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <SheetTitle className="text-lg font-semibold">
              {t("Write a Review")}
            </SheetTitle>
          </motion.div>
        </SheetHeader>

        <div className="overflow-y-auto h-full">
          <div className="p-4 space-y-6">
            {/* Product Info */}
            <motion.div 
              className="flex gap-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
            >
              <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                <img 
                  src={item.image} 
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium line-clamp-2">
                  {item.name}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {t("Order")} #{orderId}
                </p>
              </div>
            </motion.div>

            {/* Points Info */}
            <motion.div 
              className="bg-[#F8F8F8] rounded-lg p-4 flex items-center gap-3"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.4 }}
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Star className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h4 className="text-sm font-medium">
                  {t("Earn {{points}} points", { points: pointsToEarn })}
                </h4>
                <p className="text-xs text-muted-foreground">
                  {t("Complete your review to earn points")}
                </p>
              </div>
            </motion.div>

            {/* Rating */}
            <motion.div 
              className="space-y-2" 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              transition={{ delay: 0.4 }}
            >
              <label className="text-sm font-medium">
                {t("Rating")}
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <motion.button
                    key={star}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + star * 0.1 }}
                    onClick={() => setRating(star)}
                    layout
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className={cn(
                      "p-1 rounded-full transition-colors",
                      (hoveredRating || rating) >= star
                        ? "text-yellow-400"
                        : "text-gray-300"
                    )}
                  >
                    <Star className="w-8 h-8 fill-current" />
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* Review Text */}
            <motion.div 
              className="space-y-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <label className="text-sm font-medium">
                {t("Your Review")}
              </label>
              <Textarea
                value={review}
                onChange={(e) => setReview(e.target.value)}
                placeholder={t("Share your experience with this product...")}
                className="min-h-[120px] bg-[#F8F8F8] border-[#E5E5E5] focus:border-primary focus:ring-0 resize-none"
              />
            </motion.div>

            {/* Media Upload */}
            <motion.div 
              className="space-y-3" 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              transition={{ delay: 0.9 }}
            >
              <label className="text-sm font-medium">
                {t("Add Photos/Videos")}
              </label>
              <div className="grid grid-cols-5 gap-2">
                {mediaFiles.map((file, index) => (
                  <div key={index} className="relative aspect-square">
                    {file.type === 'image' ? (
                      <motion.img
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.3 }}
                        src={file.preview}
                        alt="Preview"
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <video
                        src={file.preview}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    )}
                    <button
                      onClick={() => removeFile(index)}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-black/50 rounded-full flex items-center justify-center"
                    >
                      <X className="w-3 h-3 text-white" />
                    </button>
                  </div>
                ))}
                {mediaFiles.length < maxFiles && (
                  <div className="aspect-square">
                    <Input
                      type="file"
                      accept="image/*,video/*"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="media-upload"
                      multiple
                    />
                    <label
                      htmlFor="media-upload"
                      className="w-full h-full flex flex-col items-center justify-center gap-2 border-2 border-dashed border-[#E5E5E5] rounded-lg cursor-pointer hover:border-primary/50 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-[#F8F8F8] flex items-center justify-center">
                        <Upload className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {t("Add")}
                      </span>
                    </label>
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {t("Up to {{count}} photos or videos", { count: maxFiles })}
              </p>
            </motion.div>

            {/* Tips Box */}
            <motion.div 
              className="bg-[#F8F8F8] rounded-lg p-4 space-y-3" 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 1 }}
            >
              <div className="flex items-center gap-2 text-sm font-medium">
                <Info className="w-4 h-4" />
                {t("Tips for a Great Review")}
              </div>
              <ul className="text-xs text-muted-foreground space-y-2">
                <li>• {t("Share your honest experience")}</li>
                <li>• {t("Include photos to show product quality")}</li>
                <li>• {t("Mention specific features you liked or disliked")}</li>
                <li>• {t("Keep it respectful and constructive")}</li>
              </ul>
            </motion.div>

            {/* Submit Button */}
            <motion.div 
              className="flex gap-3" 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 1.1 }}
            >
              <Button
                variant="outline"
                className="flex-1 h-12 border-[#E5E5E5] hover:bg-[#F8F8F8]"
                onClick={() => onOpenChange(false)}
              >
                {t("Cancel")}
              </Button>
              <Button
                className="flex-1 h-12 bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={rating === 0 || isSubmitting}
                onClick={handleSubmit}
              >
                {isSubmitting ? t("Submitting...") : t("Submit Review")}
              </Button>
            </motion.div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}