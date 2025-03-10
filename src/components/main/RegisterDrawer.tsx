import Header from "@/components/main/Header";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { RegisterMainDrawerProps } from "@/type/type 2";

const RegisterDrawer = ({
  setIsOpen,
  isOpen,
  className,
  children,
}: RegisterMainDrawerProps) => {
  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent
        className="h-full p-0 border-0 outline-none main-container max-width-mobile"
        side="bottom"
        hideCloseButton={true}
      >
        <div
          className={cn(
            "bg-[#AFAFAF] h-full w-full absolute top-0 left-[50%] translate-x-[-50%] flex justify-center z-[-1] max-width-mobile"
          )}
        />
        <div className="w-[95%] h-6 bg-[#5F5F5F] rounded-t-2xl relative top-3 max-width-mobile z-[9]" />
        <Header
          className="relative rounded-t-2xl"
          onClickBackButton={() => setIsOpen(false)}
        />
        <section className={cn("bg-background h-full", className)}>
          {children}
        </section>
      </SheetContent>
    </Sheet>
  );
};

export default RegisterDrawer;
