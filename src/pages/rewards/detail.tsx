import Header from "@/components/main/Header";
import { myRewardsList } from "@/data/data";
import { useTranslate } from "@refinedev/core";
import { useState } from "react";
import { useParams } from "react-router-dom";
import {
  Sheet,
  SheetContent,
  SheetOverlay,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  Barcode as BarcodeIcon,
  Download,
  Gift,
  Ticket,
  QrCode,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Barcode from "react-barcode";

const RewardDetail = () => {
  const t = useTranslate();
  const { id } = useParams();
  const [isUsingCoupon, setIsUsingCoupon] = useState(false);
  const tabsClassName =
    "w-full rounded-none flex py-4 gap-2 items-center text-[#979797] text-xs font-semibold box-border border-b border-[#282828] !bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-white data-[state=active]:text-white";
  const [codeType, setCodeType] = useState("barcode");

  return (
    <>
      <Header className="bg-transparent border-0" />
      {myRewardsList
        .filter((data) => data.id == id)
        .map((data) => (
          <>
            <img
              src={data.image}
              className="w-full z-100 h-[316px] object-cover"
            />
            <section className="p-5 bg-background relative -top-10 backdrop-blur-sm rounded-[14px] flex flex-col gap-7 mb-[120px]">
              <div className="flex flex-col gap-4">
                <p className="text-xs text-fadewhite">{data.category}</p>
                <h2 className="page-title">{data.title}</h2>
              </div>

              <div className="grid grid-cols-2">
                <div className="flex flex-col gap-1 pr-7 border-r border-r-[#FFFFFF1A]">
                  <p className="text-xs text-fadewhite">{t("Used points")}</p>
                  <h2 className="text-mainorange text-2xl font-semibold">
                    {data.points} {data.points === 1 ? t("point") : t("points")}
                  </h2>
                </div>
                <div className="flex flex-col gap-2 pl-7">
                  <p className="text-xs text-fadewhite">{t("Valid to")}</p>
                  <h2 className="page-title">{data.validDate}</h2>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <h2 className="font-medium text-sm">{t("Description")}</h2>
                <p className="text-xs">{data.desc}</p>
              </div>

              <div className="flex flex-col gap-4">
                <Accordion type="single" collapsible>
                  <AccordionItem
                    value="item-1"
                    className="bg-darkgray border-0 text-sm px-5 py-4 rounded-lg"
                  >
                    <AccordionTrigger className="p-0">
                      {t("How to redeem the reward")}
                    </AccordionTrigger>
                    <AccordionContent className="pt-4 pb-0">
                      Yes. It adheres to the WAI-ARIA design pattern.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                <Accordion type="single" collapsible>
                  <AccordionItem
                    value="item-1"
                    className="bg-darkgray border-0 text-sm px-5 py-4 rounded-lg"
                  >
                    <AccordionTrigger className="p-0">
                      {t("Redemption condition")}
                    </AccordionTrigger>
                    <AccordionContent className="pt-4 pb-0">
                      Yes. It adheres to the WAI-ARIA design pattern. TEST OF
                      CONDITION
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </section>
            <footer className="btn-footer flex flex-col gap-7">
              <Sheet open={isUsingCoupon} onOpenChange={setIsUsingCoupon}>
                <SheetOverlay className="backdrop-blur-sm bg-transparent" />
                <SheetTrigger className="main-btn !bg-mainbutton rounded-full flex gap-2 items-center justify-center">
                  <Gift />
                  {t("Use the coupon")}
                </SheetTrigger>
                <SheetContent
                  className="h-3/4 border-0 outline-none bg-background rounded-t-2xl p-5 flex flex-col justify-between"
                  side="bottom"
                >
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
                      <TabsTrigger
                        value="coupon-code"
                        className={tabsClassName}
                      >
                        <Ticket />
                        {t("Coupon Code")}
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="barcode" className="mt-10">
                      <Barcode value="Glowfish" width={2.5} />
                    </TabsContent>
                    <TabsContent value="qrcode" className="mt-10">
                      {/* TODO: add ScanQRCode */}
                      QR Code Prototype
                    </TabsContent>
                    <TabsContent value="coupon-code" className="mt-10">
                      <h3 className="text-center">COUPON CODE</h3>
                    </TabsContent>
                  </Tabs>
                  <footer className="space-y-4 p-5">
                    <Button className="!bg-transparent w-full flex items-center gap-2">
                      <Download />
                      {t("Download image")}
                    </Button>
                    <p className="text-sm text-[#979797] text-center">
                      {t("Please fill or send the code to the staff")}
                      <br />
                      {t("at the storefront to redeem the reward")}
                    </p>
                  </footer>
                </SheetContent>
              </Sheet>
            </footer>
          </>
        ))}
    </>
  );
};

export default RewardDetail;
