import { Link, useNavigate } from "react-router-dom"
import { ChevronLeft } from "../icons/MainIcons"
import { cn } from "@/lib/utils"
import { HeaderProps } from "@/type/type"

const Header = ({
  title,
  leftButton,
  rightButton,
  onClickBackButton,
  onClickRightButton,
  navigateBackTo,
  className
} : HeaderProps) => {

  const navigate = useNavigate()

  return (
    <header className={
      cn("px-4 py-3 fixed top-0 left-0 w-full h-[57px] z-[49] flex items-center justify-between bg-background border-b border-b-[#181818]", className
    )}>
      <div className="flex items-center gap-5">
        <button onClick={() => navigateBackTo ? navigate(navigateBackTo) : onClickBackButton()} className="text-white">
          {leftButton || <ChevronLeft />}
        </button>
        <p className="text-base font-semibold">{title}</p>
      </div>

      <button onClick={onClickRightButton} className="text-sm">{rightButton}</button>
    </header>
  )
}

export default Header