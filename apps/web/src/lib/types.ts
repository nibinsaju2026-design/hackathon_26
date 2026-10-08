export type User = {
  id: string;
  name: string;
  email: string;
  role: 'BUYER' | 'SELLER';
  verified: boolean;
};

export type Listing = {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  condition: string;
  availability: 'AVAILABLE' | 'RESERVED' | 'SOLD';
  imageUrl?: string | null;
  hostel?: string | null;
  createdAt: string;
  sellerId: string;
  seller?: Pick<User, 'id' | 'name' | 'verified'>;
};

export type Offer = {
  id: string;
  price: number;
  status: 'PENDING' | 'COUNTERED' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';
  message?: string | null;
  pickupPoint: string | null;
  pickupDate: string | null;
  pickupTime: string | null;
  createdAt: string;
  buyerId: string;
  buyer?: Pick<User, 'id' | 'name' | 'verified'>;
  listingId: string;
  listing?: Listing;
};

export type Order = {
  id: string;
  price: number;
  status: string;
  createdAt: string;
  listing: Listing;
  buyer: Pick<User, 'id' | 'name'>;
  seller: Pick<User, 'id' | 'name'>;
  review?: { rating: number; comment?: string | null } | null;
};

export type NotificationItem = {
  id: string;
  type: string;
  content: string;
  read: boolean;
  createdAt: string;
};

export type DashboardData = {
  metrics: {
    activeListings: number;
    offersReceived: number;
    completedDeals: number;
  };
  listings: Listing[];
  offersReceived: Offer[];
  offersSent: Offer[];
  orders: Order[];
};

export type SellerProfile = {
  id: string;
  name: string;
  verified: boolean;
  joinedAt: string;
  listings: Listing[];
  stats: {
    completedDeals: number;
    averageRating: string | null;
    reviewCount: number;
  };
};
