export type Product = {
  title: string;
  image: string;
  oldPrice: string;
  price: string;
  badge?: string;
};

export const navLinks = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "New Arrivals", href: "/new-arrivals" },
  { label: "Categories", href: "/categories" },
  { label: "Contact", href: "/contact" },
];

export const newArrivalTabs = ["All", "New-Born", "Boy", "Girl"] as const;

export type NewArrivalTab = (typeof newArrivalTabs)[number];

/**
 * `tabs` mirrors the reference catalogue filters. Every product belongs to
 * "All"; the remaining memberships drive the New Arrivals tab filter.
 */
export const newArrivals: (Product & { tabs: NewArrivalTab[] })[] = [
  {
    title:
      "Short-Sleeve Bodysuit: Premium Cotton-Blend “Dino Party” Brown Daily Casual Wear",
    image: "/images/products/dino-party-bodysuit.jpg",
    oldPrice: "₨ 1,082.74",
    price: "₨ 812.06",
    badge: "new",
    tabs: ["New-Born", "Boy"],
  },
  {
    title: "2-Piece Night Suit With Crew-Neck",
    image: "/images/products/night-suit-crew-neck.png",
    oldPrice: "₨ 3,448.60",
    price: "₨ 2,586.45",
    badge: "new",
    tabs: ["New-Born", "Girl"],
  },
  {
    title: "APPLE ISLAND TEE",
    image: "/images/products/apple-island-tee.jpg",
    oldPrice: "₨ 1,109.40",
    price: "₨ 832.05",
    badge: "new",
    tabs: ["Boy", "Girl"],
  },
  {
    title: "Astral Polo Romper",
    image: "/images/products/astral-polo-romper.png",
    oldPrice: "₨ 1,720.00",
    price: "₨ 1,290.00",
    badge: "new",
    tabs: ["New-Born", "Boy"],
  },
  {
    title: "Adventure Begins Polo",
    image: "/images/products/adventure-begins-polo.png",
    oldPrice: "₨ 1,419.00",
    price: "₨ 1,064.25",
    badge: "new",
    tabs: ["Boy"],
  },
  {
    title: "Aerial Sando",
    image: "/images/products/aerial-sando.png",
    oldPrice: "₨ 1,315.80",
    price: "₨ 986.85",
    badge: "new",
    tabs: ["Boy", "Girl"],
  },
];

export const topPicks: Product[] = [
  {
    title: "Baby Pajama Pack Of 3",
    image: "/images/products/baby-pajama-pack-of-3.jpg",
    oldPrice: "₨ 3,646.40",
    price: "₨ 2,734.80",
    badge: "new",
  },
  {
    title: "Billi Ke Bachon Ke Mozay Henley Sweatshirt – Deep Lagoon",
    image: "/images/products/billi-ke-bachon-henley.jpg",
    oldPrice: "₨ 1,599.60",
    price: "₨ 1,199.70",
    badge: "new",
  },
  {
    title: "Bermuda Shorts",
    image: "/images/products/bermuda-shorts.jpg",
    oldPrice: "₨ 911.60",
    price: "₨ 683.70",
    badge: "new",
  },
  {
    title: "Bear Print Henley T-Shirt",
    image: "/images/products/bear-print-henley-tshirt.png",
    oldPrice: "₨ 1,212.60",
    price: "₨ 909.45",
    badge: "new",
  },
  {
    title: "Beach Fun Henley Tee",
    image: "/images/products/beach-fun-henley-tee.jpg",
    oldPrice: "₨ 1,212.60",
    price: "₨ 909.45",
    badge: "new",
  },
  {
    title: "Basic Tee Set (3PC Pack)",
    image: "/images/products/basic-tee-set.png",
    oldPrice: "₨ 3,345.40",
    price: "₨ 2,509.05",
    badge: "new",
  },
  {
    title: "Autumn Forest Sleeping Suit",
    image: "/images/products/autumn-forest-sleeping-suit.png",
    oldPrice: "₨ 2,433.80",
    price: "₨ 1,825.35",
    badge: "new",
  },
  {
    title: "Autumn Forest Bib",
    image: "/images/products/autumn-forest-bib.png",
    oldPrice: "₨ 739.60",
    price: "₨ 554.70",
    badge: "new",
  },
  {
    title: "An Apple A Day Bodysuit",
    image: "/images/products/an-apple-a-day-bodysuit.png",
    oldPrice: "₨ 1,109.40",
    price: "₨ 832.05",
    badge: "new",
  },
  {
    title: "Aloo Miyaan Rose Pink Full-Sleeve Tee",
    image: "/images/products/aloo-miyaan-rose-pink-tee.jpg",
    oldPrice: "₨ 1,599.60",
    price: "₨ 1,199.70",
    badge: "new",
  },
];

export const dreamwearFeatures = [
  "Ultra Soft",
  "Gentle Comfort",
  "Breathable Fabric",
  "All-Day Cozy",
];

export const testimonials = [
  {
    quote:
      "Tempus integer consectetur fusce torquent volutpat tristique in lacinia taciti, pulvinar ultrices dignissim ipsum vel habitasse dapibus tellus sociosqu, sollicitudin elit nisl per laoreet nec iaculis cras. Vestibulum dis cum velit sociosqu natoque iaculis euismod, id parturient posuere vivamus tempus nunc mattis magna, justo dui himenaeos malesuada vel adipiscing. Sem montes magna condimen",
    name: "Jenifer Lauren",
    role: "Mom of Anna",
    avatar: "/images/client1.jpg",
  },
  {
    quote:
      "Vel tellus hendrerit aliquet dignissim elementum arcu sagittis auctor ad, fermentum mus eu placerat mi viverra aptent etiam, posuere litora proin quis in ridiculus eleifend et. Litora adipiscing justo aliquam curabitur nullam enim massa elit sociis, felis donec imperdiet curae proin porta ad sodales fringilla, turpis tortor tristique sollicitudin habitasse lectus elementum velit. Habitasse dictumst diam soc",
    name: "Maria Nyla",
    role: "Mom of Lina",
    avatar: "/images/client2-1.png",
  },
  {
    quote:
      "Himenaeos mi primis libero volutpat facilisi ultricies quisque enim diam iaculis, sagittis inceptos hac justo euismod cubilia dui arcu. Risus hendrerit sit tempus ac arcu varius venenatis, nam dolor lectus et condi mentum id metus rutrum, aliquet magna vulputate gravida fermentum ornare. Sed rutrum tincidunt pretium eros hac interdum, ridiculus sapien habitasse auctor felis dictumst magna",
    name: "David Jame",
    role: "Dad of Kevin",
    avatar: "/images/client3.jpg",
  },
];

export const brandLogos = Array.from({ length: 7 }, (_, i) => ({
  src: `/images/client-logo-${i + 1}.png`,
  alt: `Partner brand ${i + 1}`,
}));

export const footerLinks = [
  { label: "Shop", href: "/shop" },
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms & Conditions", href: "/terms-and-conditions" },
  { label: "Shipping Policy", href: "/shipping-policy" },
  { label: "Contact", href: "/contact" },
];

export type ShopProduct = Product & {
  slug: string;
  categories: string[];
  /** Numeric sale price used for sorting / range filter (PKR). */
  priceValue: number;
};

export const shopCategories: { slug: string; label: string; count: number }[] = [
  { slug: "bodysuits", label: "Bodysuits", count: 3 },
  { slug: "rompers", label: "Rompers", count: 2 },
  { slug: "sleepsuits", label: "Sleepsuits", count: 2 },
  { slug: "suits", label: "Suits", count: 1 },
  { slug: "co-ord-sets", label: "Co-ord Sets", count: 1 },
  { slug: "t-shirts", label: "T-Shirts", count: 7 },
  { slug: "polos", label: "Polos", count: 1 },
  { slug: "tank-tops", label: "Tank Tops", count: 0 },
  { slug: "dungarees", label: "Dungarees", count: 1 },
  { slug: "frocks", label: "Frocks", count: 1 },
  { slug: "sweatshirts", label: "Sweatshirts", count: 1 },
  { slug: "hoodies", label: "Hoodies", count: 1 },
  { slug: "jackets", label: "Jackets", count: 1 },
  { slug: "shorts", label: "Shorts", count: 2 },
  { slug: "pajamas", label: "Pajamas", count: 2 },
  { slug: "caps", label: "Caps", count: 1 },
  { slug: "bibs", label: "Bibs", count: 2 },
  { slug: "mittens", label: "Mittens", count: 0 },
  { slug: "booties", label: "Booties", count: 0 },
  { slug: "carry-nests", label: "Carry Nests", count: 1 },
  { slug: "swaddle-sheets", label: "Swaddle Sheets", count: 1 },
  { slug: "wrapping-sheets", label: "Wrapping Sheets", count: 0 },
  { slug: "feeder-covers", label: "Feeder Covers", count: 0 },
  { slug: "hair-bands", label: "Hair Bands", count: 0 },
  { slug: "napkins", label: "Napkins", count: 0 },
  { slug: "underwears", label: "Underwears", count: 0 },
];

/** Full catalogue — order matches the reference shop archive (A–Z menu order). */
export const shopProducts: ShopProduct[] = [
  {
    title: "2-piece Night suit with crew-neck",
    slug: "2-piece-night-suit-with-crew-neck",
    image: "/images/products/night-suit-crew-neck.png",
    oldPrice: "₨ 3,448.60",
    price: "₨ 2,586.45",
    priceValue: 2586.45,
    badge: "new",
    categories: ["suits", "pajamas"],
  },
  {
    title: "Adventure Begins Polo",
    slug: "adventure-begins-polo",
    image: "/images/products/adventure-begins-polo.png",
    oldPrice: "₨ 1,419.00",
    price: "₨ 1,064.25",
    priceValue: 1064.25,
    badge: "new",
    categories: ["polos", "t-shirts"],
  },
  {
    title: "Aerial Sando",
    slug: "aerial-sando",
    image: "/images/products/aerial-sando.png",
    oldPrice: "₨ 1,315.80",
    price: "₨ 986.85",
    priceValue: 986.85,
    badge: "new",
    categories: ["tank-tops", "t-shirts"],
  },
  {
    title: "Aloo Miyaan Rose Pink Full-sleeve tee",
    slug: "aloo-miyaan-rose-pink-full-sleeve-tee",
    image: "/images/products/aloo-miyaan-rose-pink-tee.jpg",
    oldPrice: "₨ 1,599.60",
    price: "₨ 1,199.70",
    priceValue: 1199.7,
    badge: "new",
    categories: ["t-shirts"],
  },
  {
    title: "An Apple a day bodysuit",
    slug: "an-apple-a-day-bodysuit",
    image: "/images/products/an-apple-a-day-bodysuit.png",
    oldPrice: "₨ 1,109.40",
    price: "₨ 832.05",
    priceValue: 832.05,
    badge: "new",
    categories: ["bodysuits"],
  },
  {
    title: "APPLE ISLAND TEE",
    slug: "apple-island-tee",
    image: "/images/products/apple-island-tee.jpg",
    oldPrice: "₨ 1,109.40",
    price: "₨ 832.05",
    priceValue: 832.05,
    badge: "new",
    categories: ["t-shirts"],
  },
  {
    title: "Astral Polo Romper",
    slug: "astral-polo-romper",
    image: "/images/products/astral-polo-romper.png",
    oldPrice: "₨ 1,720.00",
    price: "₨ 1,290.00",
    priceValue: 1290,
    badge: "new",
    categories: ["rompers"],
  },
  {
    title: "Autumn Forest bib",
    slug: "autumn-forest-bib",
    image: "/images/products/autumn-forest-bib.png",
    oldPrice: "₨ 739.60",
    price: "₨ 554.70",
    priceValue: 554.7,
    badge: "new",
    categories: ["bibs"],
  },
  {
    title: "Autumn Forest sleeping suit",
    slug: "autumn-forest-sleeping-suit",
    image: "/images/products/autumn-forest-sleeping-suit.png",
    oldPrice: "₨ 2,433.80",
    price: "₨ 1,825.35",
    priceValue: 1825.35,
    badge: "new",
    categories: ["sleepsuits"],
  },
  {
    title: "Baby Pajama Pack of 3",
    slug: "baby-pajama-pack-of-3",
    image: "/images/products/baby-pajama-pack-of-3.jpg",
    oldPrice: "₨ 3,646.40",
    price: "₨ 2,734.80",
    priceValue: 2734.8,
    badge: "new",
    categories: ["pajamas"],
  },
  {
    title: "Basic Tee Set (3PC Pack)",
    slug: "basic-tee-set-3pc-pack",
    image: "/images/products/basic-tee-set.png",
    oldPrice: "₨ 3,345.40",
    price: "₨ 2,509.05",
    priceValue: 2509.05,
    badge: "new",
    categories: ["co-ord-sets", "t-shirts"],
  },
  {
    title: "Beach fun Henley tee",
    slug: "beach-fun-henley-tee",
    image: "/images/products/beach-fun-henley-tee.jpg",
    oldPrice: "₨ 1,212.60",
    price: "₨ 909.45",
    priceValue: 909.45,
    badge: "new",
    categories: ["t-shirts"],
  },
  {
    title: "Bear Print Henley T-Shirt",
    slug: "bear-print-henley-t-shirt",
    image: "/images/products/bear-print-henley-tshirt.png",
    oldPrice: "₨ 1,212.60",
    price: "₨ 909.45",
    priceValue: 909.45,
    badge: "new",
    categories: ["t-shirts"],
  },
  {
    title: "Bermuda Shorts",
    slug: "bermuda-shorts",
    image: "/images/products/bermuda-shorts.jpg",
    oldPrice: "₨ 911.60",
    price: "₨ 683.70",
    priceValue: 683.7,
    badge: "new",
    categories: ["shorts"],
  },
  {
    title: "Billi Ke Bachon Ke Mozay Henley Sweatshirt – Deep Lagoon",
    slug: "billi-ke-bachon-ke-mozay-henley-sweatshirt-deep-lagoon",
    image: "/images/products/billi-ke-bachon-henley.jpg",
    oldPrice: "₨ 1,599.60",
    price: "₨ 1,199.70",
    priceValue: 1199.7,
    badge: "new",
    categories: ["sweatshirts"],
  },
  {
    title:
      "Short-Sleeve Bodysuit: Premium Cotton-Blend “Dino Party” Brown Daily Casual Wear",
    slug: "dino-party-bodysuit",
    image: "/images/products/dino-party-bodysuit.jpg",
    oldPrice: "₨ 1,082.74",
    price: "₨ 812.06",
    priceValue: 812.06,
    badge: "new",
    categories: ["bodysuits"],
  },
];

/** Sidebar “Latest products” strip — order matches the reference widget. */
export const latestProducts: ShopProduct[] = [
  shopProducts.find((p) => p.slug === "baby-pajama-pack-of-3")!,
  shopProducts.find(
    (p) => p.slug === "billi-ke-bachon-ke-mozay-henley-sweatshirt-deep-lagoon",
  )!,
  shopProducts.find((p) => p.slug === "bermuda-shorts")!,
  shopProducts.find((p) => p.slug === "bear-print-henley-t-shirt")!,
  shopProducts.find((p) => p.slug === "beach-fun-henley-tee")!,
  shopProducts.find((p) => p.slug === "basic-tee-set-3pc-pack")!,
];

export const shopSortOptions = [
  { value: "menu_order", label: "Default sorting" },
  { value: "popularity", label: "Sort by popularity" },
  { value: "rating", label: "Sort by average rating" },
  { value: "date", label: "Sort by latest" },
  { value: "price", label: "Sort by price: low to high" },
  { value: "price-desc", label: "Sort by price: high to low" },
] as const;

export type ShopSortValue = (typeof shopSortOptions)[number]["value"];

export const SHOP_PRICE_MIN = 645;
export const SHOP_PRICE_MAX = 3180;
export const SHOP_PER_PAGE = 12;

/** Standard checkout shipping fee (PKR). */
export const STANDARD_SHIPPING_FEE = 200;

export const productSizes = [
  "2-3 Years",
  "3-4 Years",
  "4-5 Years",
  "5-6 Years",
  "6-7 Years",
  "7-8 Years",
] as const;

export const productDescriptionBullets = [
  "Made with Cotton grown in Pakistan",
  "Soft, breathable fabric ideal for everyday wear and sleep",
  "Gentle on sensitive baby skin",
  "Easy care — machine washable on a gentle cycle",
  "Designed for comfort with room to move and play",
];

export const productOffers = [
  { title: "Free shipping orders from PKR 5,000", icon: "truck" as const },
  { title: "Membership offers 10%, 15%, 20% off", icon: "tag" as const },
  { title: "100% safe for kid", icon: "shield" as const },
  { title: "Returns within 7 days", icon: "return" as const },
];

export function getShopProduct(slug: string): ShopProduct | undefined {
  return shopProducts.find((p) => p.slug === slug);
}

export function getCategoryLabel(slug: string): string {
  return shopCategories.find((c) => c.slug === slug)?.label ?? slug;
}

export function getProductGallery(product: ShopProduct): string[] {
  return [product.image, product.image, product.image, product.image];
}

/**
 * Recent Products / New Arrivals archive — newest-first order.
 * Full catalogue so filters + pagination have enough items (2 pages at 10/page).
 */
export const recentProducts: ShopProduct[] = [
  shopProducts.find((p) => p.slug === "baby-pajama-pack-of-3")!,
  shopProducts.find(
    (p) => p.slug === "billi-ke-bachon-ke-mozay-henley-sweatshirt-deep-lagoon",
  )!,
  shopProducts.find((p) => p.slug === "bermuda-shorts")!,
  shopProducts.find((p) => p.slug === "bear-print-henley-t-shirt")!,
  shopProducts.find((p) => p.slug === "beach-fun-henley-tee")!,
  shopProducts.find((p) => p.slug === "basic-tee-set-3pc-pack")!,
  shopProducts.find((p) => p.slug === "autumn-forest-sleeping-suit")!,
  shopProducts.find((p) => p.slug === "autumn-forest-bib")!,
  shopProducts.find((p) => p.slug === "an-apple-a-day-bodysuit")!,
  shopProducts.find((p) => p.slug === "aloo-miyaan-rose-pink-full-sleeve-tee")!,
  shopProducts.find((p) => p.slug === "aerial-sando")!,
  shopProducts.find((p) => p.slug === "adventure-begins-polo")!,
  shopProducts.find((p) => p.slug === "astral-polo-romper")!,
  shopProducts.find((p) => p.slug === "apple-island-tee")!,
  shopProducts.find((p) => p.slug === "2-piece-night-suit-with-crew-neck")!,
  shopProducts.find((p) => p.slug === "dino-party-bodysuit")!,
];

export const contactInfo = {
  mapSrc:
    "https://maps.google.com/maps?q=London%20Eye%2C%20London%2C%20United%20Kingdom&t=m&z=14&output=embed&iwloc=near",
  mapTitle: "London Eye, London, United Kingdom",
  stores: [
    "Store 1: 25 West 21th Street, Miami FL, US",
    "Store 2: 76 East Houston Street New York City",
    "Store 3: 102 West 16th Street, Miami FL, USA",
  ],
  phone: "+1-541-754-3010",
  hotline: "+1-541-651-4228",
  email: "kidxtore@elysa.com",
  hours: "Monday – Sunday: 8:00 am – 10:00pm",
};

export type LegalBlock =
  | { type: "p"; text: string }
  | { type: "h3"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "updated"; text: string };

export type LegalPageContent = {
  title: string;
  description: string;
  blocks: LegalBlock[];
};

export const privacyPolicy: LegalPageContent = {
  title: "Privacy Policy",
  description:
    "How Babies Bloomers collects, uses, and protects your personal information when you shop with us online.",
  blocks: [
    {
      type: "p",
      text: "At Babies Bloomers, we respect your privacy and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, and safeguard your data when you shop with us online.",
    },
    { type: "h3", text: "Information We Collect" },
    {
      type: "p",
      text: "We may collect personal details such as your name, email address, phone number, shipping address, billing information, and order history when you place an order, create an account, or contact us.",
    },
    { type: "h3", text: "How We Use Your Information" },
    {
      type: "ul",
      items: [
        "To process and deliver your orders",
        "To communicate order updates, shipping notices, and customer support responses",
        "To improve our website, products, and shopping experience",
        "To send promotional emails only if you have opted in",
      ],
    },
    { type: "h3", text: "Sharing Your Information" },
    {
      type: "p",
      text: "We do not sell your personal information. We may share necessary details with trusted service providers such as payment gateways, shipping partners, and IT services solely to fulfill your order.",
    },
    { type: "h3", text: "Cookies" },
    {
      type: "p",
      text: "Our website may use cookies to remember your preferences, keep items in your cart, and understand how visitors use our site.",
    },
    { type: "h3", text: "Data Security" },
    {
      type: "p",
      text: "We take reasonable technical and organizational measures to protect your personal data. However, no online transmission is 100% secure.",
    },
    { type: "h3", text: "Your Rights" },
    {
      type: "p",
      text: "You may request access, correction, or deletion of your personal information by contacting us at orders@babiesbloomers.com.",
    },
    { type: "h3", text: "Updates" },
    {
      type: "p",
      text: "We may update this Privacy Policy from time to time. The latest version will always be available on this page.",
    },
    { type: "updated", text: "Last updated: July 2026" },
  ],
};

export const termsAndConditions: LegalPageContent = {
  title: "Terms & Conditions",
  description:
    "Terms governing use of the Babies Bloomers website, products, pricing, orders, and payments.",
  blocks: [
    {
      type: "p",
      text: "Welcome to Babies Bloomers. By accessing our website and placing an order, you agree to the following Terms & Conditions. Please read them carefully.",
    },
    { type: "h3", text: "Use of Website" },
    {
      type: "p",
      text: "You agree to use this website for lawful purposes only. You must not misuse our site, attempt unauthorized access, or interfere with its normal operation.",
    },
    { type: "h3", text: "Products & Pricing" },
    {
      type: "p",
      text: "We aim to display product details, colors, and prices accurately. Slight variations may occur due to screen settings. Prices are listed in PKR and may change without prior notice.",
    },
    { type: "h3", text: "Orders" },
    {
      type: "p",
      text: "Placing an order constitutes an offer to purchase. We reserve the right to cancel or refuse any order due to stock issues, pricing errors, or suspected fraud. You will be notified if this happens.",
    },
    { type: "h3", text: "Payment" },
    {
      type: "p",
      text: "We accept the payment methods shown at checkout, including Cash on Delivery where available. You are responsible for providing accurate billing and shipping information.",
    },
    { type: "h3", text: "Intellectual Property" },
    {
      type: "p",
      text: "All content on this website — including logos, images, text, and designs — belongs to Babies Bloomers and may not be copied or reused without permission.",
    },
    { type: "h3", text: "Limitation of Liability" },
    {
      type: "p",
      text: "Babies Bloomers is not liable for indirect or consequential losses arising from the use of our website or products, except where required by applicable law.",
    },
    { type: "h3", text: "Contact" },
    {
      type: "p",
      text: "For questions about these Terms & Conditions, email us at orders@babiesbloomers.com.",
    },
    { type: "updated", text: "Last updated: July 2026" },
  ],
};

export const shippingPolicy: LegalPageContent = {
  title: "Shipping Policy",
  description:
    "How Babies Bloomers processes, ships, and delivers orders across Pakistan.",
  blocks: [
    {
      type: "p",
      text: "This Shipping Policy explains how Babies Bloomers delivers your orders across Pakistan.",
    },
    { type: "h3", text: "Processing Time" },
    {
      type: "p",
      text: "Orders are typically processed within 1–2 business days after payment confirmation (or COD order confirmation). During sales or high-demand periods, processing may take a little longer.",
    },
    { type: "h3", text: "Delivery Time" },
    {
      type: "ul",
      items: [
        "Major cities: usually 2–4 business days after dispatch",
        "Other areas: usually 3–6 business days after dispatch",
      ],
    },
    {
      type: "p",
      text: "Delivery timelines are estimates and may vary due to courier conditions, weather, or remote locations.",
    },
    { type: "h3", text: "Shipping Charges" },
    {
      type: "p",
      text: "Shipping charges (if any) are calculated at checkout based on your location and order total. Free shipping promotions may apply from time to time and will be clearly mentioned on the site.",
    },
    { type: "h3", text: "Order Tracking" },
    {
      type: "p",
      text: "Once your order is shipped, you will receive tracking details by email or SMS (where available) so you can follow your delivery.",
    },
    { type: "h3", text: "Failed Delivery" },
    {
      type: "p",
      text: "Please ensure your address and phone number are correct. If a delivery attempt fails due to incomplete information or unavailability, the courier may attempt redelivery or return the parcel to us.",
    },
    { type: "h3", text: "Damaged or Missing Items" },
    {
      type: "p",
      text: "If your package arrives damaged or incomplete, please contact us within 48 hours of delivery at orders@babiesbloomers.com with your order number and photos so we can help resolve it quickly.",
    },
    { type: "h3", text: "International Shipping" },
    {
      type: "p",
      text: "Currently, we primarily ship within Pakistan. International shipping options (if enabled) will be shown at checkout.",
    },
    { type: "updated", text: "Last updated: July 2026" },
  ],
};

