import EventSection from "@/components/main/EventSection";
import RegisterDrawer from "@/components/main/RegisterDrawer";
import { Button } from "@/components/ui/button";
import { useProducts } from "@/features/home/hooks/useProducts";
import { RegisterDrawerProps } from "@/type/type 2";
import { useTranslate } from "@refinedev/core";
import { useNavigate } from "react-router-dom";

export const WelcomeDrawer = ({ isOpen, setIsOpen }: RegisterDrawerProps) => {
  const t = useTranslate();
  const navigate = useNavigate();
  const { products, loading, error } = useProducts();

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
        isOpen={isOpen}
        setIsOpen={setIsOpen}
      >
        <h2 className="main-heading px-5 pt-[30px]">
          {t("Welcome, this is where get people")}{" "}
          <span className="text-[#9B6CDE]">{t("connected.")}</span>
        </h2>
        <EventSection list={productEvents} title={t("Upcoming Events")} />
        <footer className="btn-footer">
          <Button className="main-btn w-full" onClick={() => navigate("/home")}>
            {t("Let Glowfish")}
          </Button>
        </footer>
      </RegisterDrawer>
    </>
  );
};
