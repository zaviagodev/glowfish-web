import { ReactNode } from "react"

type EventDataTypes = "small" | "event"

export interface EventDataProps {
    id?: number,
    image: string
    title: string
    location?: string
    date?: string
    desc?: string
    validDate?: string
    price?: string | number
    points?: string | number
    type?: EventDataTypes | string
}

export interface EventCardProps extends EventDataProps {
    onClick?: () => void
}

export interface RegisterDrawerProps {
    setIsOpen: (val: boolean) => void
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
    backButtonClassName?: string
    onClickBackButton?: (val?: any) => void
    onClickRightButton?: () => void
    className?: string
}

export interface BookedDataProps {
    name: string
    order_number: string
    date: string
    time: string
    gate: string
    seat: string
}
  
export interface BookedDataCompProps {
    title: string
    value: string
}

export interface RewardProps extends EventDataProps {
    category?: string
}