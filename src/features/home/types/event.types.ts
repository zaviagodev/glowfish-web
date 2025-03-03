export interface Event {
  id: string;
  title: string;
  description?: string;
  start_date: string;
  end_date: string;
  status: 'active' | 'completed' | 'cancelled';
  customer_id: string;
  store_name: string;
  created_at: string;
  updated_at: string;
}

export interface PaginatedEvents {
  data: Event[];
  total: number;
  page: number;
  pageSize: number;
}

export interface EventQueryOptions {
  page?: number;
  pageSize?: number;
  orderId?: string;
}

export interface EventQueryResult {
  event?: Event;
  events?: Event[];
  total?: number;
  page?: number;
  pageSize?: number;
  loading: boolean;
  error: string | null;
  refreshEvents: () => Promise<void>;
  isLoading: boolean;
  isError: boolean;
} 