// White-label configuration for fireplace store customization
// Each store can override these settings with their own values

export interface StoreConfig {
  // Branding
  storeName: string;
  tagline: string;
  logo: string;
  favicon: string;
  
  // Contact Information
  phone: string;
  email: string;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  
  // Social Media
  social: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    youtube?: string;
    pinterest?: string;
  };
  
  // Theme Colors
  theme: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    headerBg: string;
    footerBg: string;
  };
  
  // Business Settings
  business: {
    hours: {
      weekdays: string;
      saturday: string;
      sunday: string;
    };
    showrooms: boolean;
    installationServices: boolean;
    freeShipping: {
      enabled: boolean;
      minimum: number;
    };
  };
  
  // SEO
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
  };
}

// Default configuration — Aaron's Hearth and Home
export const defaultStoreConfig: StoreConfig = {
  storeName: "Aaron's Hearth and Home",
  tagline: "Republic, Missouri's Trusted Fireplace & Heating Experts",
  logo: "/logo.svg",
  favicon: "/favicon.ico",
  
  phone: "(417) 555-0199",
  email: "info@aaronshearthandhome.com",
  address: {
    street: "100 E Hines St",
    city: "Republic",
    state: "MO",
    zip: "65738",
  },
  
  social: {
    facebook: "https://facebook.com/aaronshearthandhome",
    instagram: "https://instagram.com/aaronshearthandhome",
    youtube: "https://youtube.com/aaronshearthandhome",
  },
  
  theme: {
    primaryColor: "#b91c1c", // Deep Red
    secondaryColor: "#1e3a5f", // Navy Blue
    accentColor: "#f59e0b", // Amber
    headerBg: "#1f2937", // Gray-800
    footerBg: "#111827", // Gray-900
  },
  
  business: {
    hours: {
      weekdays: "8:00 AM - 5:00 PM",
      saturday: "9:00 AM - 3:00 PM",
      sunday: "Closed",
    },
    showrooms: true,
    installationServices: true,
    freeShipping: {
      enabled: true,
      minimum: 499,
    },
  },
  
  seo: {
    metaTitle: "Aaron's Hearth and Home | Fireplaces, Inserts & Stoves in Republic, MO",
    metaDescription: "Aaron's Hearth and Home in Republic, Missouri — shop gas fireplaces, wood stoves, electric fireplaces, inserts, and accessories. Expert advice, professional installation, and free shipping on orders over $499.",
    keywords: [
      "fireplace",
      "fireplace store Republic MO",
      "gas fireplace",
      "wood stove",
      "electric fireplace",
      "fireplace insert",
      "pellet stove",
      "fireplace accessories",
      "Aaron's Hearth and Home",
      "Republic Missouri fireplace",
    ],
  },
};

// Product Categories for fireplace stores
export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  subcategories?: ProductCategory[];
}

export const productCategories: ProductCategory[] = [
  {
    id: "fireplaces",
    name: "Fireplaces",
    slug: "fireplaces",
    description: "Complete fireplace units for any home",
    image: "/categories/fireplaces.jpg",
    subcategories: [
      { id: "gas-fireplaces", name: "Gas Fireplaces", slug: "gas-fireplaces", description: "Natural gas and propane fireplaces", image: "/categories/gas-fireplaces.jpg" },
      { id: "wood-fireplaces", name: "Wood Fireplaces", slug: "wood-fireplaces", description: "Traditional wood-burning fireplaces", image: "/categories/wood-fireplaces.jpg" },
      { id: "electric-fireplaces", name: "Electric Fireplaces", slug: "electric-fireplaces", description: "Easy installation, no venting required", image: "/categories/electric-fireplaces.jpg" },
      { id: "outdoor-fireplaces", name: "Outdoor Fireplaces", slug: "outdoor-fireplaces", description: "Fireplaces for outdoor living spaces", image: "/categories/outdoor-fireplaces.jpg" },
    ],
  },
  {
    id: "inserts",
    name: "Fireplace Inserts",
    slug: "inserts",
    description: "Upgrade your existing fireplace",
    image: "/categories/inserts.jpg",
    subcategories: [
      { id: "gas-inserts", name: "Gas Inserts", slug: "gas-inserts", description: "Efficient gas fireplace inserts", image: "/categories/gas-inserts.jpg" },
      { id: "wood-inserts", name: "Wood Inserts", slug: "wood-inserts", description: "High-efficiency wood burning inserts", image: "/categories/wood-inserts.jpg" },
      { id: "electric-inserts", name: "Electric Inserts", slug: "electric-inserts", description: "Easy-install electric fireplace inserts", image: "/categories/electric-inserts.jpg" },
      { id: "pellet-inserts", name: "Pellet Inserts", slug: "pellet-inserts", description: "Convenient pellet-burning inserts", image: "/categories/pellet-inserts.jpg" },
    ],
  },
  {
    id: "stoves",
    name: "Stoves",
    slug: "stoves",
    description: "Freestanding heating stoves",
    image: "/categories/stoves.jpg",
    subcategories: [
      { id: "wood-stoves", name: "Wood Stoves", slug: "wood-stoves", description: "Classic wood-burning stoves", image: "/categories/wood-stoves.jpg" },
      { id: "pellet-stoves", name: "Pellet Stoves", slug: "pellet-stoves", description: "Efficient pellet-burning stoves", image: "/categories/pellet-stoves.jpg" },
      { id: "gas-stoves", name: "Gas Stoves", slug: "gas-stoves", description: "Clean-burning gas stoves", image: "/categories/gas-stoves.jpg" },
    ],
  },
  {
    id: "outdoor",
    name: "Outdoor Living",
    slug: "outdoor",
    description: "Fire pits, outdoor fireplaces & more",
    image: "/categories/outdoor.jpg",
    subcategories: [
      { id: "fire-pits", name: "Fire Pits", slug: "fire-pits", description: "Fire pits for outdoor gatherings", image: "/categories/fire-pits.jpg" },
      { id: "outdoor-kitchens", name: "Outdoor Kitchens", slug: "outdoor-kitchens", description: "Complete outdoor cooking solutions", image: "/categories/outdoor-kitchens.jpg" },
    ],
  },
  {
    id: "accessories",
    name: "Accessories",
    slug: "accessories",
    description: "Fireplace accessories & parts",
    image: "/categories/accessories.jpg",
    subcategories: [
      { id: "mantels", name: "Mantels & Surrounds", slug: "mantels", description: "Fireplace mantels and surrounds", image: "/categories/mantels.jpg" },
      { id: "doors-screens", name: "Doors & Screens", slug: "doors-screens", description: "Glass doors and fireplace screens", image: "/categories/doors-screens.jpg" },
      { id: "tools-sets", name: "Tool Sets", slug: "tools-sets", description: "Fireplace tool sets and holders", image: "/categories/tools-sets.jpg" },
      { id: "logs-media", name: "Logs & Media", slug: "logs-media", description: "Gas logs and decorative media", image: "/categories/logs-media.jpg" },
    ],
  },
  {
    id: "parts",
    name: "Parts Department",
    slug: "parts",
    description: "Dedicated replacement parts catalog organized by appliance type and brand",
    image: "/categories/parts.jpg",
    subcategories: [
      { id: "wood-coal-stove-parts", name: "Wood & Coal Stove Parts", slug: "wood-coal-stove-parts", description: "Wood stove, insert, and furnace repair parts", image: "/categories/wood-stoves.jpg" },
      { id: "gas-fireplace-parts", name: "Gas Fireplace Parts", slug: "gas-fireplace-parts", description: "Valves, pilots, burners, and gas fireplace service parts", image: "/categories/gas-fireplaces.jpg" },
      { id: "gas-stove-parts", name: "Gas Stove Parts", slug: "gas-stove-parts", description: "Gas stove replacement components and controls", image: "/categories/gas-stoves.jpg" },
      { id: "pellet-stove-parts", name: "Pellet Stove Parts", slug: "pellet-stove-parts", description: "Augers, blowers, igniters, and pellet stove wear parts", image: "/categories/pellet-stoves.jpg" },
      { id: "electric-stove-parts", name: "Electric Stove Parts", slug: "electric-stove-parts", description: "Electric stove and fireplace service parts", image: "/categories/electric-fireplaces.jpg" },
      { id: "outdoor-fireplace-parts", name: "Outdoor Fireplace Parts", slug: "outdoor-fireplace-parts", description: "Outdoor hearth burners, valves, and media components", image: "/categories/outdoor-fireplaces.jpg" },
    ],
  },
];

// Product interface
export interface Product {
  id: string;
  sku: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  price: number;
  salePrice?: number;
  categoryId: string;
  subcategoryId?: string;
  brand: string;
  images: string[];
  features: string[];
  specifications: Record<string, string>;
  inStock: boolean;
  stockQuantity: number;
  rating: number;
  reviewCount: number;
  isFeatured: boolean;
  isNew: boolean;
  isBestSeller: boolean;
}

// Sample products for demo
export const sampleProducts: Product[] = [
  {
    id: "prod-001",
    sku: "GFP-5000",
    name: "Superior 42\" Direct Vent Gas Fireplace",
    slug: "superior-42-direct-vent-gas-fireplace",
    description: "Experience the warmth and beauty of a real fire with the Superior 42\" Direct Vent Gas Fireplace. This stunning fireplace features a realistic flame presentation with hand-painted ceramic logs, creating an authentic wood-burning appearance without the hassle. The direct vent technology ensures safe, efficient operation while maintaining excellent indoor air quality. Perfect for larger living spaces, this fireplace delivers up to 40,000 BTUs of comforting heat.",
    shortDescription: "42\" direct vent gas fireplace with 40,000 BTU output and realistic flame presentation.",
    price: 2499.99,
    salePrice: 2299.99,
    categoryId: "fireplaces",
    subcategoryId: "gas-fireplaces",
    brand: "Superior",
    images: ["/products/fireplace-1.jpg", "/products/fireplace-1-alt.jpg"],
    features: [
      "40,000 BTU output",
      "Direct vent technology",
      "Hand-painted ceramic logs",
      "Variable flame height control",
      "Remote control included",
      "Optional blower kit available",
    ],
    specifications: {
      "Width": "42 inches",
      "Height": "32 inches",
      "Depth": "18 inches",
      "BTU Output": "40,000",
      "Efficiency": "83%",
      "Vent Type": "Direct Vent",
      "Fuel Type": "Natural Gas / Propane",
    },
    inStock: true,
    stockQuantity: 15,
    rating: 4.8,
    reviewCount: 127,
    isFeatured: true,
    isNew: false,
    isBestSeller: true,
  },
  {
    id: "prod-002",
    sku: "WS-3000",
    name: "Vogelzang Defender Wood Stove",
    slug: "vogelzang-defender-wood-stove",
    description: "The Vogelzang Defender Wood Stove combines classic design with modern efficiency. EPA certified and capable of heating up to 2,400 square feet, this robust wood stove is perfect for those who appreciate the traditional warmth of a wood fire. The large viewing window provides an excellent view of the flames, while the air wash system keeps the glass clean.",
    shortDescription: "EPA certified wood stove heats up to 2,400 sq ft with classic design.",
    price: 1299.99,
    categoryId: "stoves",
    subcategoryId: "wood-stoves",
    brand: "Vogelzang",
    images: ["/products/stove-1.jpg"],
    features: [
      "Heats up to 2,400 sq ft",
      "EPA Certified",
      "Up to 78% efficiency",
      "Large viewing window",
      "Air wash glass cleaning system",
      "Firebrick lined firebox",
    ],
    specifications: {
      "Max BTU": "68,000",
      "Heating Area": "2,400 sq ft",
      "Firebox Capacity": "3.0 cu ft",
      "Log Length": "21 inches",
      "Efficiency": "78%",
      "Emissions": "1.63 g/hr",
    },
    inStock: true,
    stockQuantity: 8,
    rating: 4.6,
    reviewCount: 89,
    isFeatured: true,
    isNew: false,
    isBestSeller: true,
  },
  {
    id: "prod-003",
    sku: "EFP-2000",
    name: "Dimplex 50\" Linear Electric Fireplace",
    slug: "dimplex-50-linear-electric-fireplace",
    description: "Transform your space with the Dimplex 50\" Linear Electric Fireplace. This sleek, modern fireplace features Dimplex's patented flame technology for the most realistic electric flame effect on the market. With multiple flame colors, brightness settings, and heat options, you can customize your experience to match any mood or season.",
    shortDescription: "50\" linear electric fireplace with realistic flame effects and multi-color LED lighting.",
    price: 1599.99,
    categoryId: "fireplaces",
    subcategoryId: "electric-fireplaces",
    brand: "Dimplex",
    images: ["/products/electric-1.jpg"],
    features: [
      "Patented flame technology",
      "Multi-color flame options",
      "Adjustable brightness",
      "Thermostat controlled heater",
      "No venting required",
      "Remote control included",
    ],
    specifications: {
      "Width": "50 inches",
      "Height": "20 inches",
      "Depth": "5 inches",
      "Heater Output": "5,000 BTU",
      "Voltage": "120V",
      "Watts": "1,500W",
    },
    inStock: true,
    stockQuantity: 22,
    rating: 4.7,
    reviewCount: 156,
    isFeatured: true,
    isNew: true,
    isBestSeller: false,
  },
  {
    id: "prod-004",
    sku: "GI-4000",
    name: "Napoleon 36\" High Efficiency Gas Insert",
    slug: "napoleon-36-high-efficiency-gas-insert",
    description: "Convert your drafty, inefficient wood-burning fireplace into an efficient heating source with the Napoleon 36\" High Efficiency Gas Insert. This premium insert features Napoleon's exclusive PHAZERAMIC burner system for incredibly realistic flames and even heat distribution. The included blower helps circulate warm air throughout your room.",
    shortDescription: "36\" high efficiency gas insert with PHAZERAMIC burner and included blower.",
    price: 3299.99,
    salePrice: 2999.99,
    categoryId: "inserts",
    subcategoryId: "gas-inserts",
    brand: "Napoleon",
    images: ["/products/insert-1.jpg"],
    features: [
      "PHAZERAMIC burner system",
      "Up to 85% efficiency",
      "Variable heat control",
      "Included blower",
      "Battery backup ignition",
      "Multiple trim options",
    ],
    specifications: {
      "Width": "36 inches",
      "BTU Input": "40,000",
      "Efficiency": "85%",
      "Heating Area": "2,000 sq ft",
      "Vent Type": "Direct Vent",
      "Fuel Type": "Natural Gas / Propane",
    },
    inStock: true,
    stockQuantity: 6,
    rating: 4.9,
    reviewCount: 78,
    isFeatured: true,
    isNew: false,
    isBestSeller: true,
  },
  {
    id: "prod-005",
    sku: "PS-2500",
    name: "Harman P68 Pellet Stove",
    slug: "harman-p68-pellet-stove",
    description: "The Harman P68 Pellet Stove represents the pinnacle of pellet stove technology. With automatic ignition, room sensing temperature control, and a massive 76 lb hopper capacity, this stove provides up to 68,000 BTUs of consistent, efficient heat. The easy-to-use controls and minimal maintenance make it perfect for whole-home heating.",
    shortDescription: "Premium pellet stove with 76 lb hopper and automatic temperature control.",
    price: 4199.99,
    categoryId: "stoves",
    subcategoryId: "pellet-stoves",
    brand: "Harman",
    images: ["/products/pellet-1.jpg"],
    features: [
      "68,000 BTU output",
      "76 lb hopper capacity",
      "Automatic ignition",
      "Room sensing temperature control",
      "Up to 86% efficiency",
      "Whisper-quiet operation",
    ],
    specifications: {
      "Max BTU": "68,000",
      "Hopper Capacity": "76 lbs",
      "Heating Area": "2,800 sq ft",
      "Efficiency": "86%",
      "Emissions": "0.8 g/hr",
      "Burn Time": "Up to 48 hours",
    },
    inStock: true,
    stockQuantity: 4,
    rating: 4.9,
    reviewCount: 203,
    isFeatured: true,
    isNew: false,
    isBestSeller: true,
  },
  {
    id: "prod-006",
    sku: "FP-1000",
    name: "Outland Living 36\" Fire Pit Table",
    slug: "outland-living-36-fire-pit-table",
    description: "Create the perfect outdoor gathering space with the Outland Living 36\" Fire Pit Table. This elegant propane fire pit table provides warmth and ambiance without the smoke and mess of a traditional wood fire. The decorative glass beads and realistic flame create a stunning focal point for your patio or deck.",
    shortDescription: "36\" propane fire pit table with decorative glass beads and auto-ignition.",
    price: 599.99,
    categoryId: "outdoor",
    subcategoryId: "fire-pits",
    brand: "Outland Living",
    images: ["/products/firepit-1.jpg"],
    features: [
      "36\" diameter table",
      "Propane powered",
      "Auto-ignition system",
      "Decorative glass beads included",
      "Weather-resistant cover included",
      "CSA approved",
    ],
    specifications: {
      "Diameter": "36 inches",
      "Height": "25 inches",
      "BTU Output": "50,000",
      "Fuel Type": "Propane",
      "Weight": "52 lbs",
      "Material": "Steel with UV-resistant finish",
    },
    inStock: true,
    stockQuantity: 18,
    rating: 4.5,
    reviewCount: 67,
    isFeatured: false,
    isNew: true,
    isBestSeller: false,
  },
];
