import { useTranslate } from "@refinedev/core";
import { useNavigate } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CheckCircle } from "lucide-react";

interface SuccessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SuccessDialog({ open, onOpenChange }: SuccessDialogProps) {
  const t = useTranslate();
  const navigate = useNavigate();

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-background/80 backdrop-blur-xl border-0 rounded-lg max-w-[90%] w-[400px]">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center flex-col gap-4 text-2xl font-semibold tracking-tight">
            <CheckCircle className="h-12 w-12 text-green-500" />
            {t("Order Placed Successfully!")}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm text-muted-foreground mt-2">
            {t(
              "Your order has been placed successfully. You can track your order in the My Orders section."
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction
            onClick={() => {
              onOpenChange(false);
              navigate("/home");
            }}
            className="main-btn w-full"
          >
            {t("Continue Shopping")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
