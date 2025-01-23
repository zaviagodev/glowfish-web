import { useTranslate } from "@refinedev/core";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/shared/PageHeader";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VoucherCard } from "./VoucherCard";
import { useState } from "react";

// Mock data - replace with actual data from your API
const mockVouchers = [
  {
    id: "1",
    type: "gift",
    title: "50% Off Any Coffee",
    description: "Valid at any Glowfish location",
    expiryDate: "2024-02-28",
    status: "ready",
    image: "https://picsum.photos/200/300",
    code: "COFFEE50"
  },
  {
    id: "2",
    type: "coupon",
    title: "Free Delivery Voucher",
    description: "Free delivery on your next order",
    expiryDate: "2024-03-15",
    status: "used",
    image: "https://picsum.photos/201/300",
    code: "FREEDEL"
  },
  {
    id: "3",
    type: "gift",
    title: "Birthday Special Gift",
    description: "One free dessert on your birthday",
    expiryDate: "2024-12-31",
    status: "ready",
    image: "https://picsum.photos/202/300",
    code: "BDAY2024"
  }
];

export default function MyItemsPage() {
  const t = useTranslate();
  const [activeTab, setActiveTab] = useState("all");
  
  const filteredVouchers = mockVouchers.filter(voucher => {
    if (activeTab === "all") return true;
    if (activeTab === "gifts") return voucher.type === "gift";
    if (activeTab === "coupons") return voucher.type === "coupon";
    if (activeTab === "ready") return voucher.status === "ready";
    if (activeTab === "used") return voucher.status === "used";
    return true;
  });

  return (
    <div className="min-h-screen bg-background">
      <PageHeader title={t("My Items")} />

      <div className="pt-14 pb-4">
        {/* Tabs */}
        <Tabs defaultValue="all" onValueChange={setActiveTab}>
          <div className="px-4">
            <TabsList className="w-full h-auto p-1 bg-[rgba(245,245,245,0.5)] grid grid-cols-5 gap-1">
              <TabsTrigger 
                value="all" 
                className="text-xs py-2.5 data-[state=active]:bg-white"
              >
                {t("All")}
              </TabsTrigger>
              <TabsTrigger 
                value="gifts"
                className="text-xs py-2.5 data-[state=active]:bg-white"
              >
                {t("Gifts")}
              </TabsTrigger>
              <TabsTrigger 
                value="coupons"
                className="text-xs py-2.5 data-[state=active]:bg-white"
              >
                {t("Coupons")}
              </TabsTrigger>
              <TabsTrigger 
                value="ready"
                className="text-xs py-2.5 data-[state=active]:bg-white"
              >
                {t("Ready")}
              </TabsTrigger>
              <TabsTrigger 
                value="used"
                className="text-xs py-2.5 data-[state=active]:bg-white"
              >
                {t("Used")}
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="mt-4 px-4 space-y-4">
            {filteredVouchers.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-12"
              >
                <p className="text-muted-foreground">
                  {t("No items found")}
                </p>
              </motion.div>
            ) : (
              filteredVouchers.map((voucher, index) => (
                <motion.div
                  key={voucher.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <VoucherCard voucher={voucher} />
                </motion.div>
              ))
            )}
          </div>
        </Tabs>
      </div>
    </div>
  );
}