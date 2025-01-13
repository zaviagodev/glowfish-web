import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslate } from "@refinedev/core";
import Header from "@/components/main/Header";
import { supabase } from "@/lib/supabase";
import Barcode from "react-barcode";
import ScanQRCode from "@/components/icons/ScanQRCode";

interface OrderDetails {
  id: string;
  status: string;
  product_name: string;
  variant_name: string;
  customer_name: string;
  location: string;
  date: string;
  image: string;
}

const MyEventDetail = () => {
  const { id } = useParams();
  const t = useTranslate();
  const [isQRCode, setIsQRCode] = useState(false);
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select(`
            id,
            status,
            customers (
              first_name,
              last_name
            ),
            order_items (
              product_variants (
                id,
                name,
                product:products (
                  name,
                  location,
                  product_images (url)
                )
              )
            )
          `)
          .eq('id', id)
          .single();

        if (error) throw error;

        if (data) {
          const item = data.order_items[0];
          const variant = item.product_variants;
          const product = variant.product;

          setOrderDetails({
            id: data.id,
            status: data.status,
            product_name: product.name,
            variant_name: variant.name,
            customer_name: `${data.customers.first_name} ${data.customers.last_name}`,
            location: product.location,
            date: new Date().toLocaleDateString(), // Replace with actual event date
            image: product.product_images?.[0]?.url
          });
        }
      } catch (error) {
        console.error('Error fetching order details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [id]);

  if (loading) {
    return (
      <>
        <Header title={t("Event Details")} />
        <div className="flex items-center justify-center h-[60vh]">
          <p>{t("Loading...")}</p>
        </div>
      </>
    );
  }

  if (!orderDetails) {
    return (
      <>
        <Header title={t("Event Details")} />
        <div className="flex items-center justify-center h-[60vh]">
          <p>{t("Event not found")}</p>
        </div>
      </>
    );
  }

  const BookedDataComp = ({ title, value }: { title: string; value: string }) => (
    <div className="space-y-1">
      <h3 className="text-[#5F5A5A] text-xs font-medium">{title}</h3>
      <p className="text-black page-title">{value}</p>
    </div>
  );

  return (
    <>
      <Header title={t("Event Details")} />
      <section className="bg-white rounded-xl p-5 relative">
        {!isQRCode && <img src={orderDetails.image} className="rounded-sm" />}
        <div className="border-b border-b-[#675E5E0D] space-y-2 pt-4 pb-5">
          <h3 className="text-black font-semibold text-lg leading-5">
            {orderDetails.product_name} - {orderDetails.variant_name}
          </h3>
          <p className="text-[#5F5A5A] text-xs">
            {orderDetails.date} - {orderDetails.location}
          </p>
        </div>

        <div className="grid grid-cols-2 pt-5 gap-6">
          <BookedDataComp title={t("Name")} value={orderDetails.customer_name} />
          <BookedDataComp title={t("Order Number")} value={orderDetails.id} />
          <BookedDataComp title={t("Date")} value={orderDetails.date} />
          <BookedDataComp title={t("Status")} value={orderDetails.status} />
        </div>

        <div className="relative h-full -bottom-5">
          <div className="bg-background h-9 w-9 absolute -left-10 rounded-full"/>
          {!isQRCode && <div className="border border-dashed border-[#675E5E80] relative top-[18px]"/>}
          <div className="bg-background h-9 w-9 absolute -right-10 rounded-full"/>
        </div>

        <div className="flex flex-col items-center relative pt-16">
          {isQRCode ? <ScanQRCode /> : <Barcode value={orderDetails.id} />}
          <p 
            className="text-black text-xs cursor-pointer" 
            onClick={() => setIsQRCode(!isQRCode)}
          >
            {isQRCode ? t("Switch to Barcode") : t("Switch to QR Code")}
          </p>
        </div>
      </section>
    </>
  );
};

export default MyEventDetail;
