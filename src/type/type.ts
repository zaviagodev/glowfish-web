import { ReactNode } from "react"

export interface EventDataProps {
    image: string
    title: string
    location: string
    date: string
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
    children: ReactNode
  }

export interface RegisterFormProps {
    first_name: string
    last_name: string
    phone: string
    email: string
}
