import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslate } from "@refinedev/core";
import { useState } from "react";

interface RedeemSheetProps {
  isRedeemSheetOpen: boolean;
  setIsRedeemSheetOpen: (open: boolean) => void;
}

const RedeemSheet = ({
  isRedeemSheetOpen,
  setIsRedeemSheetOpen,
}: RedeemSheetProps) => {
  const t = useTranslate();
  const [codeType, setCodeType] = useState("barcode");
  return (
    <Sheet open={isRedeemSheetOpen} onOpenChange={setIsRedeemSheetOpen}>
      <SheetContent
        className="h-3/4 border-0 outline-none bg-background rounded-t-2xl p-5 flex flex-col justify-between"
        side="bottom"
      >
        <div>
          <h3 className="text-lg font-semibold text-center mb-4">
            {t("Redeem Your Reward")}
          </h3>
          <p className="text-sm text-[#979797] text-center mb-6">
            {t("Show this code to the staff to redeem your reward")}
          </p>
          <Tabs defaultValue={codeType} onValueChange={setCodeType}>
            <TabsList className="w-full bg-transparent">
              <TabsTrigger value="barcode" className={tabsClassName}>
                <BarcodeIcon />
                {t("Barcode")}
              </TabsTrigger>
              <TabsTrigger value="qrcode" className={tabsClassName}>
                <QrCode />
                {t("QR Code")}
              </TabsTrigger>
              <TabsTrigger value="coupon-code" className={tabsClassName}>
                <Ticket />
                {t("Code")}
              </TabsTrigger>
            </TabsList>
            <TabsContent value="barcode" className="mt-10 flex justify-center">
              <Barcode value={reward.id} width={2.5} />
            </TabsContent>
            <TabsContent value="qrcode" className="mt-10 text-center">
              {/* TODO: add ScanQRCode */}
              QR Code Prototype
            </TabsContent>
            <TabsContent value="coupon-code" className="mt-10">
              <h3 className="text-center text-2xl font-bold tracking-wider">
                {reward.id}
              </h3>
            </TabsContent>
          </Tabs>
        </div>
        <footer className="space-y-4 p-5">
          <Button className="!bg-transparent w-full flex items-center gap-2">
            <Download />
            {t("Download Code")}
          </Button>
          <p className="text-sm text-[#979797] text-center">
            {t("This code is valid for one-time use only")}
          </p>
        </footer>
      </SheetContent>
    </Sheet>
  );
};
