import EventSection from "@/components/main/EventSection";
import RegisterDrawer from "@/components/main/RegisterDrawer";
import { ProductDetail } from "@/components/product/ProductDetail";
import { Button } from "@/components/ui/button";
import { useProducts } from "@/features/home/hooks/useProducts";
import { RegisterDrawerProps } from "@/type/type";
import { useTranslate } from "@refinedev/core";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const WelcomeDrawer = ({ isOpen, setIsOpen }: RegisterDrawerProps) => {
  const t = useTranslate();
  const navigate = useNavigate();
  const { products, loading, error } = useProducts();
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  const productEvents = products.map((product) => ({
    id: product.id,
    description: product.description,
    image: product.image,
    title: product.name,
    location: product.location,
    start_datetime: product.start_datetime,
    end_datetime: product.end_datetime,
    price: product.price,
    points: product.price * 10,
    desc: product.description,
    organizer_contact: product.organizer_contact,
    organizer_name: product.organizer_name,
    venue_address: product.venue_address,
    product_variants: product.product_variants,
  }));

  return (
    <>
      <RegisterDrawer
        className="overflow-auto pb-[170px] max-width-mobile"
        isOpen={isOpen && !selectedEvent}
        setIsOpen={setIsOpen}
      >
        <h2 className="main-heading px-5 pt-[30px]">
          {t("Welcome, this is where get people")}{" "}
          <span className="text-[#9B6CDE]">{t("connected.")}</span>
        </h2>
        <EventSection
          list={productEvents}
          title={t("Upcoming Events")}
          selectedEvent={selectedEvent}
          setSelectedEvent={setSelectedEvent}
        />
        <footer className="btn-footer">
          <Button className="main-btn w-full" onClick={() => navigate("/home")}>
            {t("Let Glowfish")}
          </Button>
        </footer>
      </RegisterDrawer>

      {selectedEvent && (
        <ProductDetail
          {...selectedEvent}
          name={selectedEvent.title}
          points={null}
          hide_cart={true}
          onClose={(e: any) => {
            e.stopPropagation();
            setSelectedEvent(null);
          }}
        />
      )}
    </>
  );
};

export default WelcomeDrawer;
