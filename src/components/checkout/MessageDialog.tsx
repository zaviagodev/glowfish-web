import { useTranslate } from "@refinedev/core";
import { MessageCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface MessageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialMessage?: string;
  onSave: (message: string) => void;
}

export function MessageDialog({
  open,
  onOpenChange,
  initialMessage = "",
  onSave,
}: MessageDialogProps) {
  const t = useTranslate();
  const [message, setMessage] = useState(initialMessage);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-background max-w-[90%] w-[400px] rounded-lg p-0 border-0 gap-0">
        {/* Header */}
        <DialogHeader className="px-4 py-3 border-b">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-primary" />
            <DialogTitle className="text-lg font-semibold">
              {t("Message to Store")}
            </DialogTitle>
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="p-4 space-y-4">
          <Textarea
            placeholder={t("Enter your message to the store...")}
            className="min-h-[120px] bg-darkgray border border-input focus:border-[#EE5736] resize-none focus:!ring-0 !ring-offset-0"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />

          {/* Footer */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="main-btn !bg-darkgray w-full !text-white"
              onClick={() => onOpenChange(false)}
            >
              {t("Cancel")}
            </Button>
            <Button
              className="main-btn w-full"
              onClick={() => {
                onSave(message);
                onOpenChange(false);
              }}
            >
              {t("Save")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Alternative Version
export function MessageDialogAlt({
  open,
  onOpenChange,
  initialMessage = "",
  onSave,
}: MessageDialogProps) {
  const t = useTranslate();
  const [message, setMessage] = useState(initialMessage);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-background max-w-[90%] w-[400px] rounded-[20px] p-0 border-0">
        {/* Header */}
        <DialogHeader className="p-6 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-primary" />
            </div>
            <DialogTitle className="text-xl font-semibold">
              {t("Message to Store")}
            </DialogTitle>
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="px-6 pb-6 space-y-6">
          <div className="bg-background rounded-xl p-4">
            <Textarea
              placeholder={t("Enter your message to the store...")}
              className="min-h-[120px] bg-transparent border-0 focus:ring-0 resize-none placeholder:text-muted-foreground/50"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>

          {/* Footer */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="h-12 border-[#E5E5E5] rounded-xl font-medium"
              onClick={() => onOpenChange(false)}
            >
              {t("Cancel")}
            </Button>
            <Button
              className="h-12 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl font-medium"
              onClick={() => {
                onSave(message);
                onOpenChange(false);
              }}
            >
              {t("Save")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
