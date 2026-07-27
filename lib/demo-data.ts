import type {
  Book,
  Category,
  HeroBanner,
  StoreSettings,
  Writer
} from "@/lib/types";

const categorySeed = [
  ["Fiction", "fiction", "Stories that stay with you."],
  ["Self Development", "self-development", "Clear ideas for a better life."],
  ["Business", "business", "Strategy, leadership, and modern work."],
  ["Children", "children", "Bright books for curious young minds."],
  ["History", "history", "The people and events that shaped us."],
  ["Religion", "religion", "Faith, reflection, and spiritual growth."],
  ["Science", "science", "Big questions, beautifully explained."],
  ["Bangla Literature", "bangla-literature", "Essential voices from Bangladesh."]
] as const;

const categoryImages = [
  "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1461360370896-922624d12aa1?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=900&q=80"
];

export const demoCategories: Category[] = categorySeed.map(
  ([name, slug, description], index) => ({
    id: `category-${index + 1}`,
    name,
    slug,
    description,
    image_url: categoryImages[index],
    is_active: true,
    book_count: 5
  })
);

const writerSeed = [
  ["Aminul Hoque", "Essayist and thoughtful observer of modern life."],
  ["Nadia Rahman", "Award-winning novelist writing about memory and belonging."],
  ["Farhan Kabir", "Entrepreneur and author focused on practical leadership."],
  ["Samira Ahmed", "Children's author and advocate for joyful learning."],
  ["Rezaul Karim", "Historian documenting the stories of Bengal."],
  ["Mariam Sultana", "Writer on faith, family, and intentional living."],
  ["Tanvir Hasan", "Science communicator making complex ideas accessible."],
  ["Anika Chowdhury", "Contemporary fiction writer based in Dhaka."],
  ["Rafiq Azad", "Poet and translator of modern Bengali literature."],
  ["Sara Mahmud", "Psychologist and writer on resilience and wellbeing."],
  ["Imran Hossain", "Researcher exploring cities, culture, and technology."],
  ["Lamia Noor", "Illustrator and author of imaginative books for children."]
] as const;

const writerPhotos = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=500&q=80",
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=500&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=500&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=500&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=500&q=80",
  "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=500&q=80"
];

export const demoWriters: Writer[] = writerSeed.map(
  ([name, biography], index) => ({
    id: `writer-${index + 1}`,
    name,
    slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    biography,
    photo_url: writerPhotos[index % writerPhotos.length],
    is_active: true,
    book_count: index < 4 ? 4 : 3
  })
);

const bookTitles = [
  "The Quiet Architecture of Life",
  "A River Remembers",
  "Small Decisions, Remarkable Days",
  "The Last Tea House",
  "Building What Matters",
  "Mina and the Moon Garden",
  "A Brief History of Bengal",
  "Letters to the Restless Heart",
  "The Curious Universe",
  "Dhaka After Rain",
  "The Craft of Clear Thinking",
  "Where the Kites Return",
  "A Practical Guide to Deep Work",
  "The Mango Tree Mystery",
  "Maps of Forgotten Roads",
  "The Grace of Ordinary Things",
  "Science at the Breakfast Table",
  "The City of Paper Birds",
  "The Long View",
  "Stories from Sonargaon",
  "Kindness Is a Superpower",
  "Notes on Starting Again",
  "The Honest Company",
  "Rumi's Red Umbrella",
  "The Monsoon Archive",
  "A Home for the Soul",
  "How Stars Learn to Shine",
  "Window Seat to Chattogram",
  "Good Questions, Better Work",
  "The Blue Bicycle Club",
  "Bengal: A People's Story",
  "Daily Light",
  "The Physics of Almost Everything",
  "A Thousand Little Windows",
  "Leading Without Noise",
  "The Library Under the Stairs",
  "1971: Voices of Courage",
  "The Mindful Believer",
  "Future Cities of Bangladesh",
  "Poems for a Tender Country"
];

const coverImages = [
  "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=700&q=85",
  "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=700&q=85",
  "https://images.unsplash.com/photo-1541963463532-d68292c34b19?auto=format&fit=crop&w=700&q=85",
  "https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=700&q=85",
  "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=700&q=85",
  "https://images.unsplash.com/photo-1519682337058-a94d519337bc?auto=format&fit=crop&w=700&q=85",
  "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=700&q=85",
  "https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=700&q=85"
];

export const demoBooks: Book[] = bookTitles.map((name, index) => {
  const writer = demoWriters[index % demoWriters.length];
  const category = demoCategories[index % demoCategories.length];
  const regular = 320 + (index % 7) * 85;
  const onSale = index % 3 !== 1;

  return {
    id: `book-${index + 1}`,
    name,
    slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    writer_id: writer.id,
    category_id: category.id,
    writer,
    category,
    publisher: index % 2 ? "Cottage Press" : "North Star Publications",
    isbn: `978984${String(1000000 + index).slice(-7)}`,
    language: index % 9 === 0 ? "Bangla" : "English",
    pages: 176 + (index % 8) * 24,
    edition: "First Edition",
    stock: index % 11 === 0 ? 0 : 8 + (index % 17),
    description:
      "A carefully written, beautifully produced book for readers who value enduring ideas and memorable stories. This edition includes thoughtful notes and a reader-friendly layout.",
    regular_price: regular,
    discount_price: onSale ? Math.round(regular * (0.78 + (index % 3) * 0.04)) : null,
    cover_url: coverImages[index % coverImages.length],
    featured: index < 8,
    trending: index >= 6 && index < 14,
    new_arrival: index >= 14 && index < 22,
    best_seller: index >= 22 && index < 30,
    is_active: true,
    view_count: 150 + index * 31,
    sold_count: 25 + index * 7,
    seo_title: name,
    seo_description: `Buy ${name} online from Mini Book Cottage.`,
    created_at: new Date(2026, 6, 26 - index).toISOString(),
    gallery: [
      {
        id: `gallery-${index}-1`,
        book_id: `book-${index + 1}`,
        url: coverImages[(index + 1) % coverImages.length],
        storage_path: null,
        alt_text: `${name} inside pages`,
        sort_order: 1
      }
    ],
    previews: [
      {
        id: `preview-${index}-1`,
        book_id: `book-${index + 1}`,
        type: "image",
        url: coverImages[(index + 2) % coverImages.length],
        storage_path: `demo/${index + 1}/page-1.jpg`,
        page_number: 1,
        sort_order: 1
      }
    ],
    rating: 4.4 + (index % 6) / 10,
    review_count: 8 + index
  };
});

export const demoBanners: HeroBanner[] = [
  {
    id: "banner-1",
    title: "A quieter way to find your next book.",
    subtitle:
      "Thoughtful editions, honest prices, and delivery anywhere in Bangladesh.",
    button_text: "Explore the collection",
    button_url: "/shop",
    image_url:
      "https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=1800&q=88",
    image_path: null,
    is_active: true,
    sort_order: 1
  },
  {
    id: "banner-2",
    title: "Fresh stories for unhurried evenings.",
    subtitle: "Discover this month's most talked-about fiction.",
    button_text: "Shop new fiction",
    button_url: "/category/fiction",
    image_url:
      "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1800&q=88",
    image_path: null,
    is_active: true,
    sort_order: 2
  },
  {
    id: "banner-3",
    title: "Big imagination. Small readers.",
    subtitle: "Beautiful books chosen for curious young minds.",
    button_text: "Browse children's books",
    button_url: "/category/children",
    image_url:
      "https://images.unsplash.com/photo-1472162072942-cd5147eb3902?auto=format&fit=crop&w=1800&q=88",
    image_path: null,
    is_active: true,
    sort_order: 3
  },
  {
    id: "banner-4",
    title: "Ideas for work that matters.",
    subtitle: "Practical business and leadership books, without the noise.",
    button_text: "View business books",
    button_url: "/category/business",
    image_url:
      "https://images.unsplash.com/photo-1456324504439-367cee3b3c32?auto=format&fit=crop&w=1800&q=88",
    image_path: null,
    is_active: true,
    sort_order: 4
  },
  {
    id: "banner-5",
    title: "Read more. Spend thoughtfully.",
    subtitle: "Selected editions with meaningful savings.",
    button_text: "See current offers",
    button_url: "/shop?discount=true",
    image_url:
      "https://images.unsplash.com/photo-1511108690759-009324a90311?auto=format&fit=crop&w=1800&q=88",
    image_path: null,
    is_active: true,
    sort_order: 5
  },
  {
    id: "banner-6",
    title: "Essential voices from Bangladesh.",
    subtitle: "Poetry, history, and stories rooted close to home.",
    button_text: "Explore Bangla literature",
    button_url: "/category/bangla-literature",
    image_url:
      "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=1800&q=88",
    image_path: null,
    is_active: true,
    sort_order: 6
  }
];

export const demoSettings: StoreSettings = {
  store_name: "Mini Book Cottage",
  logo_url: null,
  favicon_url: null,
  phone: "+880 1700-000000",
  whatsapp: "+880 1700-000000",
  facebook_url: "https://facebook.com",
  messenger_url: "https://m.me",
  instagram_url: "https://instagram.com",
  support_email: "hello@minibookcottage.com",
  support_phone: "+880 1700-000000",
  address: "Dhaka, Bangladesh",
  delivery_inside_dhaka: 80,
  delivery_outside_dhaka: 120,
  payment_number: "01700-000000",
  payment_instruction:
    "Send only the delivery charge via bKash, Nagad, or Rocket to confirm your order.",
  homepage_title: "Books worth keeping.",
  homepage_subtitle:
    "A thoughtful online bookstore for curious readers across Bangladesh.",
  seo_title: "Mini Book Cottage — Books worth keeping",
  seo_description:
    "Shop carefully selected books with delivery across Bangladesh.",
  footer_text:
    "A small, thoughtful bookstore for readers who choose with care.",
  copyright: "© 2026 Mini Book Cottage. All rights reserved.",
  confirmation_message:
    "Our team usually confirms orders within 12 hours. If you are not contacted within 12 hours, please contact us through our Facebook Page or phone number.",
  google_analytics_id: null,
  meta_pixel_id: null
};
