import { Link, useNavigate } from "react-router-dom"
import { ChevronLeft } from "../icons/MainIcons"
import { cn } from "@/lib/utils"

interface HeaderProps {
  title?: string
  rightButtonText?: string
  onClickBackButton?: () => void
  onClickRightButton?: () => void
  navigateBackTo?: string,
  className?: string
}

const Header = ({
  title,
  rightButtonText,
  onClickBackButton,
  onClickRightButton,
  navigateBackTo,
  className
} : HeaderProps) => {

  const navigate = useNavigate()

  return (
    <header className={cn("px-4 py-3 fixed top-0 left-0 w-full h-[57px] flex items-center justify-between bg-background border-b border-b-[#181818]", className)}>
      <div className="flex items-center gap-5">
        <button onClick={() => navigateBackTo ? navigate(navigateBackTo) : onClickBackButton()} className="text-white">
          <ChevronLeft />
        </button>
        <p className="text-base font-semibold">{title}</p>
      </div>

      <button onClick={onClickRightButton} className="text-sm">{rightButtonText}</button>
    </header>
  )
}

export default Header