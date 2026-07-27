export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  is_active: boolean;
  book_count?: number;
};

export type Writer = {
  id: string;
  name: string;
  slug: string;
  biography: string | null;
  photo_url: string | null;
  is_active: boolean;
  book_count?: number;
};

export type Book = {
  id: string;
  name: string;
  slug: string;
  writer_id: string | null;
  category_id: string | null;
  writer?: Pick<Writer, "id" | "name" | "slug" | "photo_url"> | null;
  category?: Pick<Category, "id" | "name" | "slug"> | null;
  publisher: string | null;
  isbn: string | null;
  language: string;
  pages: number | null;
  edition: string | null;
  stock: number;
  description: string;
  regular_price: number;
  discount_price: number | null;
  cover_url: string | null;
  featured: boolean;
  trending: boolean;
  new_arrival: boolean;
  best_seller: boolean;
  is_active: boolean;
  view_count: number;
  sold_count: number;
  seo_title: string | null;
  seo_description: string | null;
  created_at: string;
  gallery?: BookImage[];
  previews?: BookPreview[];
  rating?: number;
  review_count?: number;
};

export type BookImage = {
  id: string;
  book_id: string;
  url: string;
  storage_path: string | null;
  alt_text: string | null;
  sort_order: number;
};

export type BookPreview = {
  id: string;
  book_id: string;
  type: "image" | "pdf";
  url: string | null;
  storage_path: string;
  page_number: number | null;
  sort_order: number;
};

export type HeroBanner = {
  id: string;
  title: string;
  subtitle: string | null;
  button_text: string | null;
  button_url: string | null;
  image_url: string;
  image_path: string | null;
  is_active: boolean;
  sort_order: number;
};

export type StoreSettings = {
  store_name: string;
  logo_url: string | null;
  favicon_url: string | null;
  phone: string;
  whatsapp: string | null;
  facebook_url: string | null;
  messenger_url: string | null;
  instagram_url: string | null;
  support_email: string;
  support_phone: string;
  address: string;
  delivery_inside_dhaka: number;
  delivery_outside_dhaka: number;
  payment_number: string;
  payment_instruction: string;
  homepage_title: string;
  homepage_subtitle: string;
  seo_title: string;
  seo_description: string;
  footer_text: string;
  copyright: string;
  confirmation_message: string;
  google_analytics_id: string | null;
  meta_pixel_id: string | null;
};

export type CartItem = {
  book: Book;
  quantity: number;
};

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "packed"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "returned";
