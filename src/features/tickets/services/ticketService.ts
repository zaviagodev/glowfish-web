import { supabase } from '@/lib/supabase';

export interface ProductImage {
  id: string;
  url: string;
  alt: string;
  position: number;
}

export interface ProductVariant {
  id: string;
  name: string;
  sku: string;
  price: number;
  compare_at_price: number;
  quantity: number;
  status: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  compare_at_price: number;
  status: string;
  images: ProductImage[];
  variants: ProductVariant[];
}

export interface Event {
  event_id: string;
  name: string;
  start_datetime: string;
  end_datetime: string;
  venue_name: string;
  venue_address: string;
  organizer_name: string;
  organizer_contact: string;
  google_maps_link: string;
  attendance_points: number;
  product: Product;
}

export interface TicketMetadata {
  eventId: string;
  eventName: string;
  attendeeName?: string;
  attendeeEmail?: string;
  purchaseDate: string;
  ticketNumber: string;
}

export interface Ticket {
  id: string;
  code: string;
  status: string;
  metadata: TicketMetadata;
  order_item_id: string;
}

export interface CustomerEvent {
  id: string;
  order_id: string;
  customer_id: string;
  created_at: string;
  tickets: Ticket[];
  event: Event;
  total_orders: number;
  code: string;
  status: string;
}

export interface TicketService {
  getTickets: (customerId: string, limit?: number, offset?: number) => Promise<CustomerEvent[]>;
  getTicketById: (customerId: string, id: string) => Promise<Ticket | null>;
  updateTicketStatus: (id: string, status: 'used' | 'unused') => Promise<void>;
  checkTicketStatus: (id: string) => Promise<string>;
}

export const ticketService: TicketService = {
  getTickets: async (customerId: string, limit = 10, offset = 0) => {
    const { data: customerEvents, error } = await supabase
      .rpc('get_customer_events', {
        p_customer_id: customerId,
        p_limit: limit,
        p_offset: offset
      });

    if (error) throw error;
    return customerEvents as CustomerEvent[];
  },

  getTicketById: async (customerId: string, id: string) => {
    // First get all customer events
    const { data: customerEvents, error } = await supabase
      .rpc('get_customer_events', { 
        p_customer_id: customerId,
        p_limit: 100, 
        p_offset: 0 
      });

    if (error) throw error;

    // Find the ticket in the customer events
    for (const event of customerEvents) {
      const ticket = event.tickets.find((t: Ticket) => t.id === id);
      if (ticket) {
        return {
          ...ticket,
          order_items: {
            event_id: event.event.event_id,
            event: {
              id: event.event.event_id,
              name: event.event.name,
              start_datetime: event.event.start_datetime,
              end_datetime: event.event.end_datetime,
              venue_name: event.event.venue_name,
              product: {
                images: event.event.product.images
              }
            }
          }
        } as Ticket;
      }
    }

    return null;
  },

  updateTicketStatus: async (id: string, status: 'used' | 'unused') => {
    const { error } = await supabase
      .from('tickets')
      .update({ status })
      .eq('id', id);

    if (error) throw error;
  },

  checkTicketStatus: async (id: string) => {
    const { data, error } = await supabase
      .from('tickets')
      .select('status')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data.status;
  },
}; 