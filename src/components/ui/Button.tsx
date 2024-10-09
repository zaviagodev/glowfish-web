import { ButtonHTMLAttributes, ReactNode } from "react"

interface ButtonProps {
    children: ReactNode
    icon?: ReactNode
    bgColor?: string
    color?: string
}

const Button = ({ 
  children, 
  icon, 
  bgColor, 
  color = "#0D0D0D",
  ...props
} : ButtonProps) => {

    const buttonStyle = {
      backgroundColor: bgColor,
      color: color
    }

    return (
      <button className="flex items-center justify-center w-full px-4 py-2 rounded-full border-0 relative" style={buttonStyle} {...props}>
        {icon}
        {children}
      </button>
    )
}

export default Button