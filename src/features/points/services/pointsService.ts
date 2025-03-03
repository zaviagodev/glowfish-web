import { supabase } from "@/lib/supabase";

export interface PointTransaction {
  id: string;
  customer_id: string;
  points: number;
  type: "earn" | "redeem";
  description?: string;
  created_at: string;
}

export interface CustomerPoints {
  loyalty_points: number;
  points_transactions: PointTransaction[];
  total_count: number;
}

export interface GetPointsParams {
  customerId: string;
  page?: number;
  pageSize?: number;
  type?: "earn" | "redeem" | "all";
}

export const getCustomerPoints = async ({
  customerId,
  page = 1,
  pageSize = 10,
  type = "all",
}: GetPointsParams): Promise<CustomerPoints | null> => {
  // Calculate offset
  const offset = (page - 1) * pageSize;

  // First get the total count with type filter
  const countQuery = supabase
    .from("points_transactions")
    .select("*", { count: "exact", head: true })
    .eq("customer_id", customerId);

  if (type !== "all") {
    countQuery.eq("type", type);
  }

  const { count, error: countError } = await countQuery;

  if (countError) {
    throw new Error(countError.message);
  }

  // Build the base query
  let query = supabase
    .from("customers")
    .select(`
      loyalty_points,
      points_transactions!inner (
        id,
        customer_id,
        points,
        type,
        description,
        created_at
      )
    `)
    .eq("id", customerId)
    .eq("points_transactions.customer_id", customerId);

  // Add type filter if not "all"
  if (type !== "all") {
    query = query.eq("points_transactions.type", type);
  }

  // Add ordering and pagination
  const { data, error } = await query
    .order("created_at", { foreignTable: "points_transactions", ascending: false })
    .range(offset, offset + pageSize - 1, { foreignTable: "points_transactions" });

  if (error) {
    throw new Error(error.message);
  }

  if (!data || !data[0]) return null;

  return {
    loyalty_points: data[0].loyalty_points,
    points_transactions: data[0].points_transactions || [],
    total_count: count || 0,
  };
}; 