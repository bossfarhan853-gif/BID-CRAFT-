export interface Business {
  id: string;
  name: string;
  logo: string;
  website: string;
  category: string;
  description: string;
  currentBid: number;
  visitCount: number;
  uniqueVisits: number;
  bidEndTime: string;
  verified: boolean;
  city: string;
}

export const MIN_BID = 100;
export const COMPETITION_DAYS = 30;

export const SAMPLE_BUSINESSES: Business[] = [
  {
    id: '1',
    name: 'Nova AI',
    logo: '🤖',
    website: 'https://example.com',
    category: 'AI Tools',
    description: 'Next-generation AI agents for enterprise automation.',
    currentBid: 12500,
    visitCount: 8420,
    uniqueVisits: 3102,
    bidEndTime: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000).toISOString(),
    verified: true,
    city: 'San Francisco',
  },
  {
    id: '2',
    name: 'Vexora',
    logo: '⚡',
    website: 'https://example.com',
    category: 'SaaS',
    description: 'No-code workflow platform for global teams.',
    currentBid: 8700,
    visitCount: 5210,
    uniqueVisits: 1980,
    bidEndTime: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString(),
    verified: true,
    city: 'London',
  },
  {
    id: '3',
    name: 'Lumio',
    logo: '💡',
    website: 'https://example.com',
    category: 'Consumer',
    description: 'Smart lighting designed for modern homes.',
    currentBid: 6400,
    visitCount: 3100,
    uniqueVisits: 1240,
    bidEndTime: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
    verified: false,
    city: 'Berlin',
  },
  {
    id: '4',
    name: 'Aether Perfumes',
    logo: '🌸',
    website: 'https://example.com',
    category: 'Fragrance',
    description: 'Luxury niche fragrances with rare ingredients.',
    currentBid: 4100,
    visitCount: 1890,
    uniqueVisits: 720,
    bidEndTime: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
    verified: true,
    city: 'Paris',
  },
  {
    id: '5',
    name: 'Thread & Co',
    logo: '🧵',
    website: 'https://example.com',
    category: 'Fashion',
    description: 'Sustainable streetwear with limited drops.',
    currentBid: 2800,
    visitCount: 2450,
    uniqueVisits: 980,
    bidEndTime: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    verified: false,
    city: 'Mumbai',
  },
];

export interface Transaction {
  id: string;
  businessId: string;
  businessName: string;
  amount: number;
  status: 'completed' | 'failed' | 'refunded';
  mode: 'demo' | 'live';
  createdAt: string;
  type: 'bid' | 'refund';
}

export interface PlatformStats {
  totalPageViews: number;
  uniqueVisitors: number;
  onlineNow: number;
  totalBusinesses: number;
  totalBids: number;
  demoGross: number;
  liveGross: number;
  refunds: number;
  fees: number;
}