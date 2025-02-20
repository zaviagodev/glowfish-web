// src/services/eventService.ts
import { supabase } from '@/lib/supabase';

interface TicketMetadata {
  eventId: string;
  eventName: string;
  attendeeName: string;
  attendeeEmail: string;
  purchaseDate: string;
  ticketNumber: string;
}

interface Ticket {
  id: string;
  code: string;
  status: string;
  metadata: TicketMetadata;
  order_item_id: string;
}

interface ProductVariant {
  id: string;
  sku: string;
  name: string;
  price: number;
  status: string;
  quantity: number;
  compare_at_price: number | null;
}

interface Product {
  id: string;
  name: string;
  price: number;
  images: Array<{ url: string }>;
  status: string;
  variants: ProductVariant[];
  description: string;
  compare_at_price: number | null;
}

interface EventDetails {
  name: string;
  product: Product;
  event_id: string;
  venue_name: string;
  end_datetime: string;
  venue_address: string;
  organizer_name: string;
  start_datetime: string;
  google_maps_link: string | null;
  attendance_points: number;
  organizer_contact: string;
}

export interface Event {
  order_id: string;
  customer_id: string;
  created_at: string;
  tickets: Ticket[];
  event: EventDetails;
  total_orders: number;
}

export interface PaginatedEvents {
  data: Event[];
  total: number;
  page: number;
  pageSize: number;
}

export const EventService = {
  async getEventsByCustomerId(
    customerId: string,
    storeName: string,
    page: number = 1,
    pageSize: number = 10
  ): Promise<PaginatedEvents> {
    try {
      if (!customerId) {
        throw new Error('Customer ID is required');
      }

      const offset = (page - 1) * pageSize;

      const { data: eventsWithTickets, error: eventsError } = await supabase
        .rpc('get_customer_events', {
          p_customer_id: customerId,
          p_limit: pageSize,
          p_offset: offset
        });

      if (eventsError) throw eventsError;

      return {
        data: eventsWithTickets || [],
        total: eventsWithTickets?.[0]?.total_orders || 0,
        page,
        pageSize
      };

    } catch (error) {
      console.error('Failed to fetch events by customer:', error);
      throw error;
    }
  }
};
