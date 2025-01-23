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
          <AlertDialogTitle className="text-2xl font-semibold tracking-tight">
            {t("Order Placed Successfully!")}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm text-muted-foreground mt-2">
            {t("Your order has been placed successfully. You can track your order in the My Orders section.")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction 
            onClick={() => {
              onOpenChange(false);
              navigate('/home');
            }}
            className="bg-[#EE4D2D] text-white hover:bg-[#EE4D2D]/90 w-full"
          >
            {t("Continue Shopping")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}