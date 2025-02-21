interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  total: number;
  variant_id: string;
  product_variants: {
    name: string;
    options: {
      name: string;
      value: string;
    }[];
    product: {
      id: string;
      name: string;
      description: string;
      product_images: {
        url: string;
      }[];
    };
  };
}

interface DbOrder {
  id: string;
  status: string;
  total: number;
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  points_discount: number;
  loyalty_points_used: number;
  created_at: string;
  customer_id: string;
  customer: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
  };
  order_items: OrderItem[];
}

export interface Order {
  id: string;
  status: string;
  total_amount: number;
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  points_discount: number;
  loyalty_points_used: number;
  created_at: string;
  customer_id: string;
  customer: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
  };
  order_items: {
    id: string;
    quantity: number;
    unit_price: number;
    variant_id: string;
    product_variants: {
      name: string;
      options: {
        name: string;
        value: string;
      }[];
      product: {
        id: string;
        name: string;
        description: string;
        image: string;
      };
    };
  }[];
}

export const transformOrder = (order: DbOrder): Order => ({
  id: order.id,
  status: order.status,
  total_amount: order.total || 0,
  subtotal: order.subtotal || 0,
  tax: order.tax || 0,
  shipping: order.shipping || 0,
  discount: order.discount || 0,
  points_discount: order.points_discount || 0,
  loyalty_points_used: order.loyalty_points_used || 0,
  created_at: order.created_at,
  customer_id: order.customer_id,
  customer: {
    id: order.customer.id,
    email: order.customer.email,
    first_name: order.customer.first_name,
    last_name: order.customer.last_name
  },
  order_items: order.order_items.map((item) => ({
    id: item.id,
    quantity: item.quantity,
    unit_price: item.price,
    variant_id: item.variant_id,
    product_variants: {
      name: item.product_variants?.name || "",
      options: item.product_variants?.options || [],
      product: {
        id: item.product_variants?.product.id || "",
        name: item.product_variants?.product.name || "",
        description: item.product_variants?.product.description || "",
        image: item.product_variants?.product.product_images?.[0]?.url || ''
      }
    }
  }))
});

export const transformOrders = (orders: DbOrder[]): Order[] => {
  return orders.map(transformOrder);
}; 