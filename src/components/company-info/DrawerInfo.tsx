import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useState } from "react";
import TermsAndConditions from "./TermsAndConditions";
import PrivacyPolicy from "./PrivacyPolicy";
import { X } from "lucide-react";

const DrawerInfo = () => {
  const [openModal, setOpenModal] = useState(false);
  const [title, setTitle] = useState("");

  const handleOpenModal = (title: string) => {
    setOpenModal(true);
    setTitle(title);
  };

  return (
    <>
      <p className="text-center font-light text-sm px-5">
        By proceeding, you agree to our{" "}
        <span
          onClick={() => handleOpenModal("Terms of Service")}
          className="underline"
        >
          terms of use
        </span>{" "}
        and acknowledge the{" "}
        <span
          onClick={() => handleOpenModal("Privacy Policy")}
          className="underline"
        >
          privacy statement
        </span>
      </p>

      <Sheet open={openModal}>
        <SheetContent
          side="bottom"
          className="h-[70%] bg-background rounded-t-xl p-4 pb-8 overflow-auto max-width-mobile"
          hideCloseButton={true}
        >
          <SheetHeader className="py-4 flex-shrink-0 bg-background/80 backdrop-blur-xl flex flex-row items-center justify-start before:-top-1">
            <SheetTitle className="font-semibold tracking-tight flex w-full justify-between">
              <div className="text-left">
                <h2>
                  {title === "Terms of Service"
                    ? "Terms of Service"
                    : "Privacy Policy"}
                </h2>
                <h2>Good Afterwork at Glowfish</h2>
                <p>Last Updated: 4 February 2025</p>
              </div>
              <div
                onClick={() => setOpenModal(false)}
                className="bg-white/[12%] p-1 rounded-full w-fit h-fit"
              >
                <X className="w-4 h-4" />
              </div>
            </SheetTitle>
          </SheetHeader>
          {title === "Terms of Service" ? <TermsAndConditions /> : <PrivacyPolicy />}
        </SheetContent>
      </Sheet>
    </>
  );
};

export default DrawerInfo;
