import Header from "@/components/main/Header"
import { Button } from "@/components/ui/Button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { RegisterMainDrawerProps } from "@/type/type"

const RegisterDrawer = ({ 
  setIsOpen,
  isOpen,
  children
} : RegisterMainDrawerProps) => {

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent className="h-full p-0 border-0 outline-none main-container" side="bottom">
        <div className={cn("bg-[#AFAFAF] h-full w-full absolute top-0 left-0 flex justify-center z-[-1]")} />
        <div className="w-[95%] h-6 bg-[#5F5F5F] rounded-t-2xl relative top-3 mx-auto" />

        <Header className="relative rounded-t-2xl" onClickBackButton={() => setIsOpen(false)}/>
        
        <section className="bg-background h-full p-5">
          {children}
        </section>
      </SheetContent>
    </Sheet>
  )
}

export default RegisterDrawer