import EventSection from "@/components/main/EventSection";
import RegisterDrawer from "@/components/main/RegisterDrawer";
import { Button } from "@/components/ui/button";
import { useProducts } from "@/features/home/hooks/useProducts";
import { Product, RegisterDrawerProps } from "@/type/type 2";
import { useTranslate } from "@refinedev/core";
import { useNavigate } from "react-router-dom";

export const WelcomeDrawer = ({ isOpen, setIsOpen }: RegisterDrawerProps) => {
  const t = useTranslate();
  const navigate = useNavigate();
  const { events } = useProducts();

  const getPriceDisplay = (product: Product) => {
    if (!product.product_variants || product.product_variants.length === 0) {
      return product.price === 0
        ? t("free")
        : `${product.price.toLocaleString()}`;
    }

    if (product.product_variants.length === 1) {
      return `${product.product_variants[0].price.toLocaleString()}`;
    }

    const prices = product.product_variants.map((v) => v.price);
    const minPrice = Math.min(...prices);

    return `${minPrice.toLocaleString()}`;
  };

  const productEvents = events.map((event) => ({
    ...event,
    title: event.name,
    price: getPriceDisplay(event as Product),
  }));

  return (
    <>
      <RegisterDrawer
        className="overflow-auto pb-[170px] max-width-mobile"
        isOpen={isOpen}
        setIsOpen={setIsOpen}
      >
        <h2 className="main-heading px-5 pt-[30px]">
          {t(`Welcome to ${storeName}!`)} {t("Hope you can enjoy shopping!")}
        </h2>
        <EventSection
          list={productEvents.slice(0, 5)}
          title={t("Upcoming Events")}
        />
        <footer className="btn-footer">
          <Button className="main-btn w-full" onClick={() => navigate("/home")}>
            {t("Let's get started")}
          </Button>
        </footer>
      </RegisterDrawer>
    </>
  );
};
