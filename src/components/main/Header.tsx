import { Link } from "react-router-dom"
import { ChevronLeft } from "../icons/MainIcons"

interface HeaderProps {
  onClickBack?: (link: string) => void
  title?: string
  rightButtonText?: string
  onClickRightButton?: () => void
  navigateBackTo?: string
}

const Header = ({
  onClickBack,
  title,
  rightButtonText,
  onClickRightButton,
  navigateBackTo
} : HeaderProps) => {
  return (
    <header className="px-4 py-3 fixed top-0 w-full h-[57px] flex items-center justify-between bg-background border-b border-b-[#181818]">
      <div className="flex items-center">
        <Link to={navigateBackTo || ""} className="text-white">
          <ChevronLeft />
        </Link>
        {title}
      </div>

      <button onClick={onClickRightButton}>{rightButtonText}</button>
    </header>
  )
}

export default Header