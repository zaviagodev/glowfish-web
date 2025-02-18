import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useTranslate } from "@refinedev/core";
import { QrCode } from "lucide-react";

interface QRCodeSheetProps {
  showQR: boolean;
  setShowQR: (val: boolean) => void;
}

const QRCodeSheet = ({ showQR, setShowQR }: QRCodeSheetProps) => {
  const t = useTranslate();
  return (
    <Sheet open={showQR} onOpenChange={setShowQR}>
      <SheetContent
        side="bottom"
        className="h-[70%] p-0 bg-background rounded-t-[14px] max-width-mobile"
      >
        <SheetHeader className="px-5 pb-3 pt-6 border-b sticky top-0 bg-background/80 backdrop-blur-xl justify-center h-[50px]">
          <SheetTitle className="text-xs">{t("My Profile QR")}</SheetTitle>
        </SheetHeader>
        <div className="p-6 flex flex-col items-center justify-start h-full">
          <div className="w-64 h-64 rounded-2xl flex items-center justify-center mb-6">
            <QrCode className="w-40 h-40" />
          </div>
          <p className="text-sm text-[#8E8E93] text-center">
            {t("Scan this QR code to view your profile")}
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default QRCodeSheet;
