import { ChevronLeft } from "../icons/MainIcons"
import { cn } from "@/lib/utils"
import { HeaderProps } from "@/type/type"
import { useBack } from "@refinedev/core"

const Header = ({
  title,
  leftButton,
  rightButton,
  backButtonClassName,
  onClickBackButton,
  onClickRightButton,
  className
} : HeaderProps) => {

  const back = useBack();

  return (
    <header className={
      cn("px-4 py-3 fixed top-0 left-0 w-full h-[57px] z-[49] flex items-center justify-between bg-background border-b border-b-header", className
    )}>
      <div className="flex items-center gap-5">
        <button onClick={() => 
          onClickBackButton ? onClickBackButton() : back()
        } className={cn("text-white", backButtonClassName)}>
          {leftButton || <ChevronLeft />}
        </button>
        <p className="text-base font-semibold">{title}</p>
      </div>
      <button onClick={onClickRightButton} className="text-sm">{rightButton}</button>
    </header>
  )
}

export default Header