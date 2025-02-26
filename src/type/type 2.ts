import { ReactNode } from "react"

export interface ProductVariant {
    id: string;
    name: string;
    sku: string;
    price: number;
    compare_at_price: number | null;
    quantity: number;
    points_based_price?: number;
    options: Array<{
      name: string;
      value: string;
    }>;
    status: string;
    position: number;
}

export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    product_images?: Array<{
      id: string;
      url: string;
      alt?: string;
      position: number;
    }>;
    product_variants?: ProductVariant[];
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
    gallery_link?: string | null;
    hide_cart?: boolean;
    end_datetime?: string;
}

export interface AnimatedCardProps {
    id: string | number;
    image: string;
    title: string;
    description?: string;
    location?: string;
    date?: string;
    price?: string | number;
    compareAtPrice?: string | number;
    variant_id?: string;
    product_variants?: ProductVariant[];
    points?: string | number;
    type?: "small" | "event";
    validDate?: string;
    isSelected?: boolean;
    hasGallery?: boolean;
    imageClassName?: string;
    onClick?: () => void;
    end_datetime?: string;
  }

type EventDataTypes = "small" | "event"

export interface EventDataProps {
    id?: string | number;
    image: string;
    title: string;
    description: string;
    location?: string;
    compare_at_price?: string | number;
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

export interface Event {
  event_id: string;
  event_name: string;
  google_maps_link: string | null;
  organizer_contact: string;
  organizer_name: string;
  start_datetime: string;
  end_datetime: string;
  updated_at: string;
  venue_address: string;
  venue_name: string;
  image_url: string;
  ticket_details: Ticket[];
  total_count: number;
}

export interface Ticket {
  id: string;
  code: string;
  status: string;
  metadata: {
    eventId: string;
    attendeeName?: string;
    [key: string]: any;
  };
  order_item_id: string;
}

export interface ServiceListProps {
    title: string;
    descriptions: ReactNode;
}