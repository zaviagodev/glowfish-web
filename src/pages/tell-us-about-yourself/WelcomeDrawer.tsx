import EventSection from "@/components/main/EventSection";
import RegisterDrawer from "@/components/main/RegisterDrawer";
import { Button } from "@/components/ui/button";
import { useProducts } from "@/hooks/useProducts";
import { RegisterDrawerProps } from "@/type/type";
import { useTranslate } from "@refinedev/core";
import { useNavigate } from "react-router-dom";

const WelcomeDrawer = ({ isOpen, setIsOpen }: RegisterDrawerProps) => {
  const t = useTranslate();
  const navigate = useNavigate();
  const { products, loading, error } = useProducts();

  const productEvents = products.map((product) => ({
    id: product.id,
    image: product.image,
    title: product.name,
    location: product.location,
    date: product.date,
    price: product.price,
    points: product.price * 10,
    desc: product.description,
  }));

  return (
    <RegisterDrawer
      className="overflow-auto pb-[170px]"
      isOpen={isOpen}
      setIsOpen={setIsOpen}
    >
      <h2 className="main-heading px-5 pt-[30px]">
        {t("Welcome, this is where get people")}{" "}
        <span className="text-[#9B6CDE]">{t("connected.")}</span>
      </h2>
      <EventSection
        list={productEvents}
        title={t("Upcoming Events")}
        cardType="event"
      />
      <footer className="btn-footer">
        <Button className="main-btn w-full" onClick={() => navigate("/home")}>
          {t("Let Glowfish")}
        </Button>
      </footer>
    </RegisterDrawer>
  );
};

export default WelcomeDrawer;
