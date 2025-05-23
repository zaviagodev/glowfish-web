import Header from "@/components/main/Header";
import { useState } from "react";
import { WelcomeDrawer } from "./WelcomeDrawer";
import { RateForm } from "./RateForm";
import { useTranslate } from "@refinedev/core";

export const TellUsAboutYourself = () => {
  const t = useTranslate();
  const [isNext, setIsNext] = useState(true);

  return (
    <>
      {/* <Header /> */}
      {/* <section className="flex flex-col gap-y-9 mb-20 mt-14 p-5">
        <h2 className="main-heading">
          {t("Rate what you are")}{" "}
          <span className="text-[#FF2F00]">{t("into.")}</span>
        </h2>
        <RateForm onSubmit={setIsNext} />
      </section> */}
      <WelcomeDrawer isOpen={isNext} setIsOpen={setIsNext} />
    </>
  );
};
