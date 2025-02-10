import { ReactNode } from "react"

export interface ProductVariant {
    id: string;
    name: string;
    sku: string;
    price: number;
    compare_at_price: number | null;
    quantity: number;
    options: Array<{
      name: string;
      value: string;
    }>;
    status: string;
    position: number;
}

export interface ProductDetailProps {
    id: string | number;
    image: string;
    name: string;
    description?: string;
    location?: string;
    venue_address?: string;
    date?: string;
    price?: string | number;
    points?: string | number;
    variant_id?: string;
    quantity?: number;
    track_quantity?: boolean;
    onClose: () => void;
    variant_options?: any[];
    product_variants?: ProductVariant[];
    organizer_name?: string;
    organizer_contact?: string;
  }

type EventDataTypes = "small" | "event"

export interface EventDataProps {
    id?: string | number;
    image: string;
    title: string;
    description: string;
    location?: string;
    date?: string;
    start_datetime?: string;
    end_datetime?: string;
    desc?: string;
    validDate?: string;
    price?: string | number;
    points?: string | number;
    type?: EventDataTypes | string;
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