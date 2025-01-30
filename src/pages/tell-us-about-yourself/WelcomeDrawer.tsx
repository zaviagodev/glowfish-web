import EventSection from "@/components/main/EventSection";
import RegisterDrawer from "@/components/main/RegisterDrawer";
import { Button } from "@/components/ui/button";
import { event_data } from "@/data/data";
import { RegisterDrawerProps } from "@/type/type";
import { useTranslate } from "@refinedev/core";
import { useNavigate } from "react-router-dom";

const WelcomeDrawer = ({ isOpen, setIsOpen }: RegisterDrawerProps) => {
  const t = useTranslate();
  const navigate = useNavigate();

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
        list={event_data}
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
