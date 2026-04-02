import logoBlack from "@/assets/logo-black.png";

export const LOGO_BLACK = logoBlack;

export enum TripStatus {
  SCHEDULED = "SCHEDULED",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  CANCELED = "CANCELED",
  PLANNED = "PLANNED",
}

export const PAYMENT_SESSION = "PAYMENT_SESSION";

export const GET_TRIPS = "trips";
export const GET_TRIP = "trip";
export const TRIP_STATS = "tripStats";

export const USER = "USER";
export const TRAVELER = "TRAVELER";
export const ADMIN = "ADMIN";
export const EMPLOYEE = "EMPLOYEE";
export const OWNER = "OWNER";
export const CLIENT = "CLIENT";

export const GET_PACKAGES = "packages";
export const GET_RECEIVERS = "GET_RECEIVERS";
export const GET_CONVERSATIONS = "GET_CONVERSATIONS";
export const GET_PACKAGE = "package";
export const GET_DELIVERY_PACKAGES = "deliveryPackages";

export const GET_DELIVERIES = "deliveries";
export const GET_DELIVERY = "delivery";
export const GET_DELIVERY_STATS = "deliveryStats";
export const GET_DELIVERY_HISTORY = "deliveryHistory";

export const GET_INVOICES = "GET_INVOICES";
export const GET_INVOICE = "invoice";
export const GET_INVOICE_STATS = "invoiceStats";
export const GET_DETAILED_INVOICE_STATS = "detailedInvoiceStats";

export const PACKAGE_CATEGORIES = [
  { value: "OTHER", label: "🔄 Autre" },
  { value: "CLOTHING", label: "👕 Vêtements" },
  { value: "ELECTRONICS", label: "📱 Électronique" },
  { value: "FURNITURE", label: "🪑 Meubles" },
  { value: "APPLIANCES", label: "🎰 Appareils" },
  { value: "BOOKS", label: "📚 Livres" },
  { value: "TOYS", label: "🧸 Jouets" },
  { value: "SPORTS", label: "⚽ Articles de sport" },
  { value: "MEDICAL", label: "🩺 Médical" },
  { value: "PERISHABLE", label: "🥕 Périssable" },
  { value: "LIQUIDS", label: "💧 Liquides" },
  { value: "HAZARDOUS", label: "☢️ Dangereux" },
  { value: "FOOD", label: "🍔 Nourriture" },
];

export const VEHICLE_TYPES = [
  { value: "CAR", label: "🚗 Voiture" },
  { value: "SUV", label: "🚙 SUV" },
  { value: "VAN", label: "🚐 Fourgonnette" },
  { value: "TRUCK", label: "🚚 Camion" },
  { value: "PLAN", label: "✈️ Avion" },
  { value: "MOTORBIKE", label: "🏍️ Moto" },
  { value: "SCOOTER", label: "🛵 Scooter" },
  { value: "WALKING", label: "🚶 À pied" },
  { value: "TRAIN", label: "🚆 Train" },
  { value: "BUS", label: "🚌 Bus" },
  { value: "SUBWAY", label: "🚇 Métro" },
  { value: "TRAM", label: "🚊 Tramway" },
  { value: "FERRY", label: "⛴️ Ferry" },
  { value: "AIRPLANE", label: "✈️ Avion de ligne" },
  { value: "HELICOPTER", label: "🚁 Hélicoptère" },
  { value: "BOAT", label: "🚤 Bateau" },
  { value: "BIKE", label: "🚲 Vélo" },
  { value: "MOTORCYCLE", label: "🏍️ Moto" },
  { value: "PUBLIC_TRANSPORT", label: "🚆 Transport en commun" },
  { value: "OTHER", label: "🔄 Autre" },
];

export const COUNTRIES = [
  { value: "Canada", label: "🇨🇦 Canada" },
  { value: "France", label: "🇫🇷 France" },
  { value: "Belgique", label: "🇧🇪 Belgique" },
  { value: "Suisse", label: "🇨🇭 Suisse" },
  { value: "Etats-Unis", label: "🇺🇸 États-Unis" },
  { value: "Allemagne", label: "🇩🇪 Allemagne" },
  { value: "Espagne", label: "🇪🇸 Espagne" },
  { value: "Italie", label: "🇮🇹 Italie" },
  { value: "Portugal", label: "🇵🇹 Portugal" },
  { value: "Royaume-Uni", label: "🇬🇧 Royaume-Uni" },
];

export const PACKAGE_SIZES = [
  {
    value: "LETTER",
    label: "✉️ Lettre",
    volume: "(0-1L)",
    description: "Documents, enveloppes, courriers plats",
    minWeight: 0.1,
    maxWeight: 0.5,
    example: "Enveloppe avec documents",
    icon: "📄",
  },
  {
    value: "EXTRA_SMALL",
    label: "📦 Très petit",
    volume: "(1-5L)",
    description: "Petit objet comme un livre ou un smartphone",
    minWeight: 0.3,
    maxWeight: 3,
    example: "Smartphone, petit livre",
    icon: "📱",
  },
  {
    value: "SMALL",
    label: "👜 Petit",
    volume: "(5-15L)",
    description: "Équivalent à une boîte à chaussures standard",
    minWeight: 1,
    maxWeight: 6,
    example: "Chaussures, petit sac à main",
    icon: "👞",
  },
  {
    value: "MEDIUM",
    label: "💼 Moyen",
    volume: "(15-50L)",
    description: "Équivalent à un sac à dos",
    minWeight: 3,
    maxWeight: 10,
    example: "Sac à dos, petit appareil électronique",
    icon: "🎒",
  },
  {
    value: "LARGE",
    label: "🧳 Grand",
    volume: "(50-100L)",
    description: "Équivalent à une valise format cabine d'avion",
    minWeight: 5,
    maxWeight: 20,
    example: "Valise cabine, carton moyen",
    icon: "🧳",
  },
  {
    value: "EXTRA_LARGE",
    label: "📦 Très grand",
    volume: "(100-200L)",
    description: "Grande valise, carton de déménagement standard",
    minWeight: 10,
    maxWeight: 30,
    example: "Grande valise, carton de déménagement",
    icon: "📦",
  },
  {
    value: "JUMBO",
    label: "🛋️ Jumbo",
    volume: "(200+L)",
    description: "Objets volumineux comme un petit meuble",
    minWeight: 20,
    maxWeight: 40,
    example: "Petit meuble, électroménager",
    icon: "🛋️",
  },
];

//// Old constants

export const GET_USER_ID_AUTHENTICATED = "GET_USER_ID_AUTHENTICATED";
export const GET_CAMPAIGNS = "GET_CAMPAIGNS";
export const GET_ANIMALS = "GET_ANIMALS";
export const GET_USERS = "GET_USERS";
export const GET_CLIENTS = "GET_CLIENTS";
export const GET_USERS_BY_TOKEN = "GET_USERS_BY_TOKEN";
export const GET_W_RECORDS = "GET_W_RECORDS";
export const GET_HEALTH_RECORD = "GET_HEALTH_RECORD";
export const GET_TICKETS_BY_USER = "GET_TICKETS_BY_USER";
export const GET_SUBSCRIPTIONS = "GET_SUBSCRIPTIONS";

export const GET_PLANS = "GET_PLANS";
export const GET_CURRENT_STATUS = "GET_CURRENT_STATUS";
export const GET_SETTINGS = "GET_SETTINGS";
export const GET_COMPANIES = "GET_COMPANIES";
export const GET_COMPANY = "GET_COMPANY";
export const GET_LIMIT_CHECK = "GET_LIMIT_CHECK";
export const GET_PORTAL = "GET_PORTAL";
export const GET_RECEIPTS = "GET_RECEIPTS";
export const GET_TRACKINGS = "GET_TRACKINGS";
export const GET_TRACKING_STATS = "GET_TRACKING_STATS";
export const GET_RECEIPTS_STATS = "GET_RECEIPTS_STATS";
export const GET_RECEIPTS_TAXES = "GET_RECEIPTS_TAXES";
export const GET_INVOICES_STATS = "GET_INVOICES_STATS";
export const GET_PAIEMENTS = "GET_PAIEMENTS";
export const GET_SMS = "GET_SMS";

// Kori Beauty - New constants
export const GET_SALONS = "GET_SALONS";
export const GET_SALON = "GET_SALON";
export const GET_MY_SALON = "GET_MY_SALON";
export const GET_BOOKINGS = "GET_BOOKINGS";
export const GET_BOOKING = "GET_BOOKING";
export const GET_SALON_AVAILABILITY = "GET_SALON_AVAILABILITY";
export const GET_SALON_BOOKING_AVAILABILITY = "GET_SALON_BOOKING_AVAILABILITY";
export const GET_SALON_SERVICES = "GET_SALON_SERVICES";
export const GET_SALON_SERVICE = "GET_SALON_SERVICE";
export const GET_SERVICE_OPTIONS = "GET_SERVICE_OPTIONS";
export const GET_SERVICE_CATEGORIES = "GET_SERVICE_CATEGORIES";
export const GET_DEFAULT_SERVICES = "GET_DEFAULT_SERVICES";
export const GET_REVIEWS = "GET_REVIEWS";
export const GET_REVIEW = "GET_REVIEW";
export const GET_RATINGS = "GET_RATINGS";
export const GET_SALON_RATING_STATS = "GET_SALON_RATING_STATS";
export const GET_SALON_PHOTOS = "GET_SALON_PHOTOS";
export const GET_SALON_STATS = "GET_SALON_STATS";
export const GET_SALON_DASHBOARD_STATS = "GET_SALON_DASHBOARD_STATS";
export const GET_SALON_HOLIDAYS = "GET_SALON_HOLIDAYS";
export const GET_PAYOUTS = "GET_PAYOUTS";
export const GET_PLATFORM_CONFIG = "GET_PLATFORM_CONFIG";
export const GET_STRIPE_CONFIG = "GET_STRIPE_CONFIG";
export const GET_SALON_TYPES = "GET_SALON_TYPES";
export const GET_ADMIN_STATS = "GET_ADMIN_STATS";
export const GET_PROSPECTS = "GET_PROSPECTS";
export const GET_ADMIN_SHORT_LINKS = "GET_ADMIN_SHORT_LINKS";

export const OPTIONS_CATEGORIES = [
  { value: "TRANSPORT", label: "🚖 Transport" },
  // { value: "ESSENCE", label: "⛽️ Essence" },
  { value: "RESTAURANT", label: "🍔 Restaurant" },
  { value: "SOFTWARE", label: "🧑🏽‍💻 Logiciel / Hosting" },
  { value: "TELEPHONIE", label: "📱 Téléphonie / Internet" },
  { value: "AUTO", label: "🚗 Auto - Réparations" },
  { value: "GROCERY", label: "🛒 Épicerie" },
  { value: "CLOTHING", label: "👔 Vêtments" },
  { value: "ELECTRONICS", label: "💿 Appareils Elec." },
  { value: "PHARMACY", label: "💊 Pharmacie" },
  { value: "FURNITURE", label: "🪴 Fourniture" },
  { value: "OTHER", label: "🔄 Autres" },
];

export const PAIMENTS_METHOD = [
  { value: "CREDIT_CARD", label: "💳 Carte de crédit" },
  { value: "DEBIT_CARD", label: "💳 Interact - Débit" },
  { value: "CHECK", label: "📝 Chèque" },
  { value: "TRANSFERT", label: "🏦 Transfert bancaire" },
  { value: "CASH", label: "💵 Cash" },
  { value: "MOBILE_MONEY", label: "💰 Mobile Money" },
  { value: "OTHER", label: "🔄 Autres" },
];

export const VERIFICATION_STATUS = [
  { value: "VERIFIED", label: "✅ Vérifié" },
  { value: "PENDING", label: "🟠 En attente" },
  { value: "FAILED", label: "❌ Rejeté" },
];

export const STORES_CANADA = [
  // Essence / Gas
  { value: "PETRO_CANADA", label: "⛽ Petro Canada" },
  { value: "SHELL", label: "⛽ Shell" },
  { value: "ESSO", label: "⛽ Esso" },
  { value: "ULTRAMAR", label: "⛽ Ultramar" },
  { value: "COSTCO_GAS", label: "⛽ Costco Essence" },
  { value: "COUCHE_TARD", label: "⛽ Couche-Tard" },

  // Grocery / Épicerie
  { value: "IGA", label: "🛒 IGA" },
  { value: "METRO", label: "🛒 Metro" },
  { value: "SUPER_C", label: "🛒 Super C" },
  { value: "MAXI", label: "🛒 Maxi" },
  { value: "PROVIGO", label: "🛒 Provigo" },
  { value: "COSTCO", label: "🛒 Costco" },

  // Restaurants
  { value: "TIM_HORTONS", label: "☕ Tim Hortons" },
  { value: "MCDONALDS", label: "🍔 McDonald's" },
  { value: "ST_HUBERT", label: "🍗 St-Hubert" },
  { value: "SCORES", label: "🍗 Scores" },
  { value: "LA_BELLE_PROVINCE", label: "🌭 La Belle Province" },
  { value: "SUBWAY", label: "🥖 Subway" },
  { value: "HARVEY", label: "🍗 Harvey's" },

  // Retail / Magasins
  { value: "CANADIAN_TIRE", label: "🔧 Canadian Tire" },
  { value: "WALMART", label: "🏪 Walmart" },
  { value: "AMAZON", label: "📦 Amazon" },
  { value: "BESTBUY", label: "💻 Best Buy" },
  { value: "IKEA", label: "🪑 IKEA" },
  { value: "HOME_DEPOT", label: "🏠 Home Depot" },
  { value: "RONA", label: "🏠 Rona" },
  { value: "PHARMAPRIX", label: "💊 Pharmaprix" },
  { value: "JEAN_COUTU", label: "💊 Jean Coutu" },
  { value: "UNIPRIX", label: "💊 Uniprix" },
  { value: "DOLLARAMA", label: "💵 Dollarama" },
  { value: "BUREAU_EN_GROS", label: "📝 Bureau en Gros" },
  { value: "WINNERS", label: "👕 Winners" },
  { value: "SIMONS", label: "👔 Simons" },

  // Default
  { value: "OTHER", label: "🔄 Autres" },
];
