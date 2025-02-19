import { Event, PaginatedEvents } from '../types/event.types';

export const transformEvent = (rawEvent: any): Event => ({
  id: rawEvent.id,
  title: rawEvent.title,
  description: rawEvent.description,
  start_date: rawEvent.start_date,
  end_date: rawEvent.end_date,
  status: rawEvent.status,
  customer_id: rawEvent.customer_id,
  store_name: rawEvent.store_name,
  created_at: rawEvent.created_at,
  updated_at: rawEvent.updated_at,
});

export const transformPaginatedEvents = (rawData: any): PaginatedEvents => ({
  data: (rawData.data || []).map(transformEvent),
  total: rawData.total || 0,
  page: rawData.page || 1,
  pageSize: rawData.pageSize || 10,
}); 