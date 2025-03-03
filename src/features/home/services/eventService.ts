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

interface EventProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  compare_at_price: number | null;
  status: string;
  images: {
    id: string;
    url: string;
    alt: string;
    position: number;
  }[];
  variants: {
    id: string;
    name: string;
    sku: string;
    price: number;
    compare_at_price: number | null;
    quantity: number;
    status: string;
  }[];
}

interface EventDetails {
  name: string;
  event_id: string;
  venue_name: string;
  end_datetime: string;
  venue_address: string;
  organizer_name: string;
  start_datetime: string;
  google_maps_link: string;
  attendance_points: number;
  organizer_contact: string;
  product: EventProduct;
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
        total: eventsWithTickets?.[0]?.total_count || 0,
        page,
        pageSize
      };

    } catch (error) {
      console.error('Failed to fetch events by customer:', error);
      throw error;
    }
  },

  async getEventByOrderId(orderId: string): Promise<Event | null> {
    try {
      if (!orderId) {
        throw new Error('Order ID is required');
      }

      // First check if any tickets exist for this order
      const { data: tickets, error } = await supabase
        .from('tickets')
        .select(`*`)
        .eq('order_id', orderId);

      if (error) throw error;
      if (!tickets || tickets.length === 0) return null;

      // Return the tickets data
      return {
        order_id: orderId,
        customer_id: tickets[0].customer_id,
        created_at: tickets[0].created_at,
        tickets: tickets.map(ticket => ({
          id: ticket.id,
          code: ticket.code,
          status: ticket.status,
          metadata: ticket.metadata,
          order_item_id: ticket.id
        })),
        event: {
          name: tickets[0].event_name,
          event_id: tickets[0].event_id,
          venue_name: tickets[0].venue_name || '',
          end_datetime: tickets[0].end_datetime || '',
          venue_address: tickets[0].venue_address || '',
          organizer_name: tickets[0].organizer_name || '',
          start_datetime: tickets[0].start_datetime || '',
          google_maps_link: tickets[0].google_maps_link || '',
          attendance_points: tickets[0].attendance_points || 0,
          organizer_contact: tickets[0].organizer_contact || '',
          product: tickets[0].product || {
            id: '',
            name: '',
            description: '',
            price: 0,
            compare_at_price: null,
            status: '',
            images: [],
            variants: []
          }
        },
        total_orders: 1
      };
    } catch (error) {
      console.error('Failed to fetch event by order ID:', error);
      throw error;
    }
  }
};
