// src/services/eventService.ts
import { supabase } from '@/lib/supabase';

export interface Event {
  order_item_id: string;
  tickets: {
    id: string;
    code: string;
    status: string;
    metadata: {
      eventId: string;
      eventName: string;
      attendeeName: string;
      attendeeEmail: string;
    };
  }[];
  order: {
    id: string;
    status: string;
    customer_id: string;
  };
  event: {
    id: string;
    name: string;
    description: string;
    start_date: string;
    end_date: string;
    location: string;
    image_url: string;
  };
  product: {
    id: string;
    name: string;
    description: string;
    images: string[];
  };
}

export const EventService = {
  async getEvents(storeName: string): Promise<Event[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // First get tickets with orders
      const { data: tickets, error: ticketsError } = await supabase
        .from('tickets')
        .select(`
          order_item_id,
          id,
          code,
          status,
          metadata,
          orders:order_id (
            id,
            status,
            customer_id
          )
        `)
        .eq('orders.customer_id', user.id)
        .order('created_at', { ascending: false });

      if (ticketsError) throw ticketsError;
      if (!tickets) return [];

      // Extract unique event IDs from metadata
      const eventIds = [...new Set(tickets.map(t => t.metadata?.eventId).filter(Boolean))];

      // Get events with their products
      const { data: events, error: eventsError } = await supabase
        .from('events')
        .select(`
          *,
          products (
            id,
            name,
            description,
            product_images (*)
          )
        `)
        .in('id', eventIds);

      if (eventsError) throw eventsError;

      // Group tickets by order_item_id and combine with event data
      const groupedData = tickets.reduce((acc: { [key: string]: any }, ticket) => {
        if (!acc[ticket.order_item_id]) {
          const event = events?.find(e => e.id === ticket.metadata?.eventId);
          acc[ticket.order_item_id] = {
            id: ticket.order_item_id,
            tickets: [],
            event: event ? {
              id: event.id,
              name: event.products?.name,
              google_maps_link: event.google_maps_link,
              organizer_contact: event.organizer_contact,
              organizer_name: event.organizer_name,
              start_datetime: event.start_datetime,
              updated_at: event.updated_at,
              venue_address: event.venue_address,
              venue_name: event.venue_name,
              images: event.products?.product_images?.[0]?.url,
            } : null,
          };
        }
        acc[ticket.order_item_id].tickets.push({
          id: ticket.id,
          code: ticket.code,
          status: ticket.status,
          metadata: ticket.metadata
        });
        return acc;
      }, {});

      return Object.values(groupedData);

    } catch (error) {
      console.error('Failed to fetch events:', error);
      throw error;
    }
  }
};
