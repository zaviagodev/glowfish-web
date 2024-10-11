import { ReactNode } from "react"
import { Path } from "react-router-dom"

export interface EventDataProps {
    id?: number,
    image: string
    title: string
    location: string
    date: string
    desc?: string
    price: string | number
    type?: string
}

export interface EventCardProps extends EventDataProps {
    onClick?: () => void
}

export interface RegisterDrawerProps {
    setIsOpen: (val: boolean) => void,
    isOpen: boolean
}

export interface RegisterMainDrawerProps extends RegisterDrawerProps {
    className?: string
    children: ReactNode
}

export interface RegisterFormProps {
    first_name: string
    last_name: string
    phone: string
    email: string
}

export interface HeaderProps {
    title?: string
    leftButton?: string | ReactNode
    rightButton?: string | ReactNode
    onClickBackButton?: (val?: any) => void
    onClickRightButton?: () => void
    navigateBackTo?: string | Partial<Path>
    className?: string
}