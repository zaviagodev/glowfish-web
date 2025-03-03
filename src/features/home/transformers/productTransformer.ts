import { Product, Category, ProductVariant } from '../types/product.types';

export const transformProductVariant = (rawVariant: any): ProductVariant => ({
  id: rawVariant.id,
  sku: rawVariant.sku,
  name: rawVariant.name,
  price: rawVariant.price,
  status: rawVariant.status,
  options: rawVariant.options,
  position: rawVariant.position,
  quantity: rawVariant.quantity,
  compare_at_price: rawVariant.compare_at_price,
});

export const transformProduct = (rawProduct: any): Product => ({
  id: rawProduct.id,
  pro_id: rawProduct.pro_id,
  name: rawProduct.name,
  description: rawProduct.description,
  price: rawProduct.price,
  category_id: rawProduct.category_id,
  variant_options: rawProduct.variant_options,
  track_quantity: rawProduct.track_quantity,
  product_variants: rawProduct.product_variants.map(transformProductVariant),
  image: rawProduct.image,
  location: rawProduct.location,
  venue_address: rawProduct.venue_address,
  organizer_contact: rawProduct.organizer_contact,
  organizer_name: rawProduct.organizer_name,
  start_datetime: rawProduct.start_datetime,
  end_datetime: rawProduct.end_datetime,
  created_at: rawProduct.created_at,
  updated_at: rawProduct.updated_at,
});

export const transformCategory = (rawCategory: any): Category => ({
  id: rawCategory.id,
  name: rawCategory.name,
  description: rawCategory.description,
  store_name: rawCategory.store_name,
  created_at: rawCategory.created_at,
  updated_at: rawCategory.updated_at,
}); 