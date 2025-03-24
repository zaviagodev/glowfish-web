import EventSection from "@/components/main/EventSection";
import RegisterDrawer from "@/components/main/RegisterDrawer";
import { Button } from "@/components/ui/button";
import { useProducts } from "@/features/home/hooks/useProducts";
import { useStore } from "@/hooks/useStore";
import { RegisterDrawerProps } from "@/type/type 2";
import { useTranslate } from "@refinedev/core";
import { useNavigate } from "react-router-dom";

export const WelcomeDrawer = ({ isOpen, setIsOpen }: RegisterDrawerProps) => {
  const t = useTranslate();
  const navigate = useNavigate();
  const { events, loading, error } = useProducts();

  const productEvents = events.map((event) => ({
    ...event,
    title: event.name,
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
        <EventSection
          list={productEvents.slice(0, 5)}
          title={t("Upcoming Events")}
        />
        <footer className="btn-footer">
          <Button className="main-btn w-full" onClick={() => navigate("/home")}>
            {t("Let Glowfish")}
          </Button>
        </footer>
      </RegisterDrawer>
    </>
  );
};
