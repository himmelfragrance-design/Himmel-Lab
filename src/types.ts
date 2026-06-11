export interface PortfolioItem {
  id: string;
  title: string;
  image: string;
  category: string;
}

export interface Order {
  orderId: string;
  date: string;
  customerName: string;
  customerEmail: string;
  customerAddress: string;
  perfumeName: string;
  category: string;
  amount: number;
  status: string;
  moods: string[];
  story: string;
  engraving?: string;
  paymentMethod: string;
}

export interface Customer {
  email: string;
  name: string;
  points: number;
  totalSpent: number;
  lastOrder: string;
}

export interface EmailLog {
  id: string;
  to: string;
  subject: string;
  body: string;
  timestamp: string;
}

export interface RedeemCode {
  id: string;
  email: string;
  rewardName: string;
  pointsSpent: number;
  code: string;
  timestamp: string;
}

export interface LoyaltyReward {
  id: string;
  name: string;
  cost: number;
  desc: string;
}

