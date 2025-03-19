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
import { cn } from "@/lib/utils";

interface DrawerInfoProps {
  className?: string;
  isLogin?: boolean;
}

const DrawerInfo = ({ className, isLogin }: DrawerInfoProps) => {
  const [openModal, setOpenModal] = useState(false);
  const [title, setTitle] = useState("");

  const handleOpenModal = (title: string) => {
    setOpenModal(true);
    setTitle(title);
  };

  return (
    <>
      <p
        className={cn(
          "text-center font-light text-sm px-5 text-muted-foreground",
          className
        )}
      >
        {isLogin && `By proceeding, you agree to our `}
        <span
          onClick={() => handleOpenModal("Terms of Service")}
          className="underline"
        >
          Terms of Use
        </span>{" "}
        {isLogin ? "and acknowledge the " : "• "}
        <span
          onClick={() => handleOpenModal("Privacy Policy")}
          className="underline"
        >
          Privacy Statement
        </span>
      </p>

      <Sheet open={openModal}>
        <SheetContent
          side="bottom"
          className="h-[70%] bg-background rounded-t-xl p-0 pb-8 overflow-auto max-width-mobile outline-none"
          hideCloseButton={true}
        >
          <SheetHeader className="p-4 pt-7 rounded-t-xl bg-background backdrop-blur-xl flex flex-row items-center justify-start before:top-3 fixed max-width-mobile w-full -translate-y-[1px]">
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
          <div className="p-4 pt-[108px]">
            {title === "Terms of Service" ? (
              <TermsAndConditions />
            ) : (
              <PrivacyPolicy />
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default DrawerInfo;
