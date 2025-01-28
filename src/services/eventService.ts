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

export interface Event {
  event_id: string;
  event_name: string;
  google_maps_link: string | null;
  organizer_contact: string;
  organizer_name: string;
  start_datetime: string;
  updated_at: string;
  venue_address: string;
  venue_name: string;
  image_url: string;
  ticket_details: Ticket[];
  total_count: number;
}

export interface PaginatedEvents {
  data: Event[];
  total: number;
  page: number;
  pageSize: number;
}

export const EventService = {
  async getEvents(
    storeName: string,
    page: number = 1,
    pageSize: number = 10
  ): Promise<PaginatedEvents> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const offset = (page - 1) * pageSize;

      const { data: eventsWithTickets, error } = await supabase
        .rpc('get_customer_events', {
          p_customer_id: user.id,
          p_limit: pageSize,
          p_offset: offset
        });

      if (error) throw error;

      return {
        data: eventsWithTickets || [],
        total: eventsWithTickets?.[0]?.total_count || 0,
        page,
        pageSize
      };

    } catch (error) {
      console.error('Failed to fetch events:', error);
      throw error;
    }
  },

  async getEventsByCustomerId(
    customerId: string,
    page: number = 1,
    pageSize: number = 10
  ): Promise<PaginatedEvents> {
    try {
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
  }
};
