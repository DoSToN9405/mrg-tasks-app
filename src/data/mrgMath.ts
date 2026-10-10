import { MiningClock, LevelInfo } from '../types/mrg';

export const MRG_PRICE_USD = 0.00129;
export const JETTON_CONTRACT = 'EQDj-zlSvj4Au154XjsU7ATzt13p8JjYEs0weVv1rVbCJSn0';
export const GENESIS_NFT_COLLECTION = 'EQAwe5pFTrqv-sLqHQW8OzZ-COA2dpuxPM_dziNBGZZc1ixS';
export const COIN_IMAGE_URL = 'https://i.ibb.co/FC6v49b/Picsart-26-09-09-01-35-44-649.png';
export const WINDOW_DURATION_SEC = 86400; // 24 hours

// Hashrate speed in TH/s for level (1..1000)
export function le(level: number): number {
  if (level <= 0) return 0;
  if (level === 1) return 0.2;
  if (level === 203) return 7.56;
  if (level >= 1000) return 5000;
  if (level <= 203) {
    const i = 0.2 + (level - 1) * 0.03643564356435643;
    return Number(i.toFixed(2));
  }
  const t = (level - 203) / 797;
  const n = 7.56 + (5000 - 7.56) * Math.pow(t, 2.1);
  return Number(n.toFixed(2));
}

// Daily mining output in MRG for level
export function He(level: number): number {
  return level <= 0 ? 0 : level === 1 ? 5 : Number((le(level) * 25).toFixed(2));
}

// Required MRG token holding for level
export function gt(level: number): number {
  if (level <= 0) return 0;
  if (level === 1) return 100;
  if (level === 203) return 10000;
  if (level >= 1000) return 3875968992;
  if (level <= 203) {
    const n = (level - 1) / 202;
    return Math.round(100 + 9900 * Math.pow(n, 1.8));
  }
  if (level <= 450) {
    const n = (level - 203) / 247;
    return Math.round(10000 + 240000 * Math.pow(n, 2));
  }
  if (level <= 650) {
    const n = (level - 450) / 200;
    return Math.round(250000 + 26881780 * Math.pow(n, 2.2));
  }
  if (level <= 850) {
    const n = (level - 650) / 200;
    return Math.round(27131780 + 321705420 * Math.pow(n, 2.5));
  }
  const t = (level - 850) / 150;
  return Math.round(348837200 + 3527131792 * Math.pow(t, 2.6));
}

// Holding requirement in USD formatting
export function ui(level: number, mrgAmount: number): { priceUSD: number; formatted: string } {
  if (level <= 1 || mrgAmount <= 0) return { priceUSD: 0, formatted: '0$' };
  const usd = mrgAmount * MRG_PRICE_USD;
  if (usd >= 1e6) {
    const m = usd / 1e6;
    return {
      priceUSD: usd,
      formatted: `${m >= 10 ? m.toFixed(1) : m.toFixed(2).replace(/\.?0+$/, '')}M$`,
    };
  }
  if (usd >= 1e3) {
    const k = usd / 1e3;
    return {
      priceUSD: usd,
      formatted: `${k >= 100 ? k.toFixed(0) : k >= 10 ? k.toFixed(1) : k.toFixed(2).replace(/\.?0+$/, '')}k$`,
    };
  }
  return usd >= 10
    ? { priceUSD: usd, formatted: `${usd.toFixed(2)}$` }
    : usd >= 1
    ? { priceUSD: usd, formatted: `${usd.toFixed(2)}$` }
    : { priceUSD: usd, formatted: `${usd.toFixed(3)}$` };
}

// Calculate full LevelInfo for UI display
export function calculateLevelInfo(level: number, totalHolding: number, activeLevel: number): LevelInfo {
  const reqHolding = gt(level);
  const { priceUSD, formatted } = ui(level, reqHolding);
  const speed = le(level);
  const daily = He(level);

  let status: 'active' | 'ready' | 'need' | 'locked' = 'locked';
  if (level <= activeLevel) {
    status = 'active';
  } else if (level === activeLevel + 1) {
    status = totalHolding >= reqHolding ? 'ready' : 'need';
  } else {
    status = totalHolding >= reqHolding ? 'ready' : 'locked';
  }

  const missingMRG = Math.max(0, reqHolding - totalHolding);
  const missingUSD = missingMRG * MRG_PRICE_USD;

  return {
    level,
    speedTHs: speed,
    dailyOutputMRG: daily,
    requiredHoldingMRG: reqHolding,
    priceUSD,
    priceUSDFormatted: formatted,
    status,
    missingMRG,
    missingUSD,
  };
}

// Calculate real-time accumulated mining rewards to 6 decimals
export function getMiningProgress(clock: MiningClock | null, now: number = Date.now()): number {
  if (!clock || clock.level <= 0) return 0;
  const n = Math.min(now, clock.windowEnd);
  const elapsedSec = Math.max(0, (n - clock.anchorAt) / 1000);
  const dailyOutput = He(clock.level);
  return clock.balance + (dailyOutput * elapsedSec) / 86400;
}

export function isMiningStopped(clock: MiningClock | null, now: number = Date.now()): boolean {
  if (!clock) return true;
  return now >= clock.windowEnd;
}

export function formatMRG(amount: number, decimals: number = 2): string {
  if (!amount || isNaN(amount)) return '0';
  if (amount >= 1e9) return `${(amount / 1e9).toFixed(decimals)}B`;
  if (amount >= 1e6) return `${(amount / 1e6).toFixed(decimals)}M`;
  if (amount >= 1e4) return `${(amount / 1e3).toFixed(1)}k`;
  return amount.toLocaleString('ru-RU', {
    maximumFractionDigits: decimals,
    minimumFractionDigits: 0,
  });
}
