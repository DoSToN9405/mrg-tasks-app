export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  allows_write_to_pm?: boolean;
  photo_url?: string;
}

export interface MiningClock {
  anchorAt: number;
  windowEnd: number;
  balance: number;
  level: number;
}

export interface LevelInfo {
  level: number;
  speedTHs: number;
  dailyOutputMRG: number;
  requiredHoldingMRG: number;
  priceUSD: number;
  priceUSDFormatted: string;
  status: 'active' | 'ready' | 'need' | 'locked';
  missingMRG: number;
  missingUSD: number;
}

export interface TaskItem {
  id: string;
  title: string;
  reward: number;
  rewardFormatted: string;
  url?: string;
  category: 'daily' | 'social' | 'holding' | 'partner';
  completed: boolean;
  waitingUntil?: number;
  isClaimable?: boolean;
}

export interface SquadMember {
  id: number;
  name: string;
  username?: string;
  level: number;
  speedTHs: number;
  commissionCutMRG: number;
  earnedForYouMRG: number;
  isOnline: boolean;
  lastActive: string;
  nudged?: boolean;
}

export interface TransactionItem {
  id: string;
  type: 'mining_claim' | 'squad_commission' | 'daily_checkin' | 'task_reward' | 'withdrawal';
  amount: number;
  timestamp: number;
  status: 'completed' | 'pending' | 'processing';
  address?: string;
}

export interface NftHolding {
  type: 'common' | 'rare' | 'mythic';
  quantity: number;
}

export type ActiveTab = 'mine' | 'miners' | 'tasks' | 'friends' | 'wallet';

export type WalletSubView = 'main' | 'withdraw' | 'buy_dex' | 'kyc' | 'genesis_nft';

export interface ClaimNotification {
  id: string;
  amount: number;
  amountFormatted: string;
  source: string;
}
