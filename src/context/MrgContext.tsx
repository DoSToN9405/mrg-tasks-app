import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  TelegramUser,
  MiningClock,
  TaskItem,
  SquadMember,
  TransactionItem,
  NftHolding,
  ClaimNotification,
  ActiveTab,
  WalletSubView,
} from '../types/mrg';
import {
  le,
  He,
  getMiningProgress,
  WINDOW_DURATION_SEC,
} from '../data/mrgMath';
import { TRANSLATIONS, LANGUAGES, LanguageOption } from '../data/translations';

// Default user matching the user's prompt
const DEFAULT_USER: TelegramUser = {
  id: 1873407633,
  first_name: 'Mr.DoSToN',
  last_name: '| Tasky 🐻',
  username: 'DoSToN_SoDiQoV',
  language_code: 'ru',
  allows_write_to_pm: true,
  photo_url: 'https://t.me/i/userpic/320/rLoknJGv2MRVPGGTh1gdWnFkbtB-eoE5xCUEWU4wgcA.svg',
};

const DEFAULT_TASKS: TaskItem[] = [
  {
    id: 'tg_channel',
    title: 'Подписаться на официальный канал MRG',
    reward: 50,
    rewardFormatted: '+50 MRG',
    url: 'https://t.me/mrgminer',
    category: 'social',
    completed: false,
  },
  {
    id: 'tg_chat',
    title: 'Вступить в сообщество MRG Community',
    reward: 40,
    rewardFormatted: '+40 MRG',
    url: 'https://t.me/MRGFun',
    category: 'social',
    completed: false,
  },
  {
    id: 'x_follow',
    title: 'Подписаться на MRG в X (Twitter)',
    reward: 35,
    rewardFormatted: '+35 MRG',
    url: 'https://twitter.com',
    category: 'social',
    completed: false,
  },
  {
    id: 'dex_view',
    title: 'Проверить график токена на DexScreener',
    reward: 20,
    rewardFormatted: '+20 MRG',
    url: 'https://dexscreener.com/ton/EQDj-zlSvj4Au154XjsU7ATzt13p8JjYEs0weVv1rVbCJSn0',
    category: 'partner',
    completed: false,
  },
  {
    id: 'hold_mrg_500',
    title: 'Держать от 500 MRG на кошельке GRAM',
    reward: 150,
    rewardFormatted: '+150 MRG',
    category: 'holding',
    completed: false,
  },
];

const DEFAULT_SQUAD: SquadMember[] = [
  {
    id: 1,
    name: 'Alex Miner',
    username: 'alex_crypto',
    level: 5,
    speedTHs: 0.35,
    commissionCutMRG: 0.88,
    earnedForYouMRG: 124.5,
    isOnline: true,
    lastActive: '5 мин назад',
  },
  {
    id: 2,
    name: 'Dmitry TON',
    username: 'dmitry_ton',
    level: 12,
    speedTHs: 0.60,
    commissionCutMRG: 1.50,
    earnedForYouMRG: 310.2,
    isOnline: true,
    lastActive: '12 мин назад',
  },
  {
    id: 3,
    name: 'Sardorbek',
    username: 'sardor_dev',
    level: 3,
    speedTHs: 0.27,
    commissionCutMRG: 0.68,
    earnedForYouMRG: 64.0,
    isOnline: false,
    lastActive: '2 часа назад',
  },
  {
    id: 4,
    name: 'Elena Web3',
    username: 'elena_chain',
    level: 8,
    speedTHs: 0.46,
    commissionCutMRG: 1.15,
    earnedForYouMRG: 198.8,
    isOnline: true,
    lastActive: 'Только что',
  },
];

interface AchievementState {
  previousLevel: number;
  newLevel: number;
  newSpeedTHs: number;
  dailyBoostMRG: number;
}

interface MrgContextValue {
  user: TelegramUser;
  language: string;
  setLanguage: (lang: string) => void;
  currentLanguageOption: LanguageOption;
  t: (key: string, params?: Record<string, string | number>) => string;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  activeLevel: number;
  peakLevel: number;
  inAppBalance: number;
  tonWalletBalance: number;
  isTonConnected: boolean;
  tonAddress: string;
  miningClock: MiningClock;
  checkinStreak: number;
  checkinLastDay: string | null;
  tasks: TaskItem[];
  completedTaskIds: string[];
  friendsSquad: SquadMember[];
  unclaimedCommission: number;
  transactions: TransactionItem[];
  nftHoldings: NftHolding[];
  nftDiscountPercent: number;
  notification: ClaimNotification | null;
  achievement: AchievementState | null;
  dismissNotification: () => void;
  dismissAchievement: () => void;
  claimMiningReward: () => void;
  claimCommission: () => void;
  claimOneTimeBonus: () => void;
  nudgeFriend: (friendId: number) => void;
  dailyCheckIn: () => void;
  startTask: (taskId: string) => void;
  claimTask: (taskId: string) => void;
  unlockLevel: (level: number) => void;
  connectTonWallet: () => void;
  disconnectTonWallet: () => void;
  executeWithdraw: (amount: number) => boolean;
  walletSubView: WalletSubView;
  setWalletSubView: (view: WalletSubView) => void;
  haptic: (style: 'light' | 'medium' | 'heavy' | 'selection' | 'success' | 'warning' | 'error') => void;
}

const MrgContext = createContext<MrgContextValue | null>(null);

export const MrgProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Telegram User detection
  const [user] = useState<TelegramUser>(() => {
    const tg = typeof window !== 'undefined' ? window.Telegram?.WebApp : undefined;
    if (tg?.initDataUnsafe?.user) {
      return tg.initDataUnsafe.user;
    }
    return DEFAULT_USER;
  });

  // Language state
  const [language, setLanguageState] = useState<string>(() => {
    return localStorage.getItem('mrg_language') || user.language_code?.slice(0, 2) || 'ru';
  });

  const setLanguage = useCallback((lang: string) => {
    setLanguageState(lang);
    localStorage.setItem('mrg_language', lang);
    const opt = LANGUAGES.find((l) => l.code === lang);
    if (opt && typeof document !== 'undefined') {
      document.documentElement.lang = lang;
      document.documentElement.dir = opt.dir;
    }
  }, []);

  const currentLanguageOption = useMemo(
    () => LANGUAGES.find((l) => l.code === language) || LANGUAGES[0],
    [language]
  );

  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      let str = TRANSLATIONS[language]?.[key] || TRANSLATIONS.en?.[key] || key;
      if (params) {
        Object.entries(params).forEach(([k, val]) => {
          str = str.replace(new RegExp(`\\{${k}\\}`, 'g'), String(val));
        });
      }
      return str;
    },
    [language]
  );

  // Tab routing
  const [activeTab, setActiveTab] = useState<ActiveTab>('mine');
  const [walletSubView, setWalletSubView] = useState<WalletSubView>('main');

  // Balances & Levels
  const [activeLevel, setActiveLevel] = useState<number>(() => {
    return Number(localStorage.getItem('mrg_active_level') || '1');
  });

  const [peakLevel, setPeakLevel] = useState<number>(() => {
    return Number(localStorage.getItem('mrg_peak_level') || '1');
  });

  const [inAppBalance, setInAppBalance] = useState<number>(() => {
    return Number(localStorage.getItem('mrg_inapp_balance') || '35.40');
  });

  const [tonWalletBalance, setTonWalletBalance] = useState<number>(() => {
    return Number(localStorage.getItem('mrg_ton_balance') || '150.00');
  });

  const [isTonConnected, setIsTonConnected] = useState<boolean>(() => {
    return localStorage.getItem('mrg_ton_connected') === 'true';
  });

  const [tonAddress] = useState<string>(() => {
    return localStorage.getItem('mrg_ton_address') || 'UQAi-7sNccqXmN0iNOODp4YbJF48_lP-NlV-S9Sv9h6q8136';
  });

  // Mining clock
  const [miningClock, setMiningClock] = useState<MiningClock>(() => {
    const saved = localStorage.getItem('mrg_mining_clock');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    const now = Date.now();
    return {
      anchorAt: now - 3600 * 4 * 1000, // 4 hours in
      windowEnd: now + (WINDOW_DURATION_SEC - 3600 * 4) * 1000,
      balance: 0.85,
      level: 1,
    };
  });

  // Tasks & Daily Streak
  const [checkinStreak, setCheckinStreak] = useState<number>(() => {
    return Number(localStorage.getItem('mrg_streak') || '2');
  });

  const [checkinLastDay, setCheckinLastDay] = useState<string | null>(() => {
    return localStorage.getItem('mrg_checkin_last_day') || null;
  });

  const [tasks, setTasks] = useState<TaskItem[]>(() => {
    const saved = localStorage.getItem('mrg_tasks');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return DEFAULT_TASKS;
  });

  const [completedTaskIds, setCompletedTaskIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('mrg_completed_tasks');
    return saved ? JSON.parse(saved) : [];
  });

  // Referral Squad
  const [friendsSquad, setFriendsSquad] = useState<SquadMember[]>(() => {
    const saved = localStorage.getItem('mrg_squad');
    return saved ? JSON.parse(saved) : DEFAULT_SQUAD;
  });

  const [unclaimedCommission, setUnclaimedCommission] = useState<number>(() => {
    return Number(localStorage.getItem('mrg_unclaimed_commission') || '4.215');
  });

  // Transactions History
  const [transactions, setTransactions] = useState<TransactionItem[]>(() => {
    const saved = localStorage.getItem('mrg_transactions');
    return saved
      ? JSON.parse(saved)
      : [
          {
            id: 'tx-1',
            type: 'mining_claim',
            amount: 5.0,
            timestamp: Date.now() - 86400 * 1000,
            status: 'completed',
          },
          {
            id: 'tx-2',
            type: 'daily_checkin',
            amount: 5.0,
            timestamp: Date.now() - 86400 * 2 * 1000,
            status: 'completed',
          },
        ];
  });

  // Genesis NFTs
  const [nftHoldings] = useState<NftHolding[]>([
    { type: 'common', quantity: 1 },
  ]);

  const nftDiscountPercent = useMemo(() => {
    const totalCount = nftHoldings.reduce((sum, n) => sum + n.quantity, 0);
    if (totalCount >= 3) return 50;
    let disc = 0;
    nftHoldings.forEach((n) => {
      if (n.type === 'mythic') disc = Math.max(disc, 35);
      if (n.type === 'rare') disc = Math.max(disc, 20);
      if (n.type === 'common') disc = Math.max(disc, 10);
    });
    return disc;
  }, [nftHoldings]);

  // Notifications
  const [notification, setNotification] = useState<ClaimNotification | null>(null);
  const [achievement, setAchievement] = useState<AchievementState | null>(null);

  // Persistence effects
  useEffect(() => {
    localStorage.setItem('mrg_active_level', activeLevel.toString());
    localStorage.setItem('mrg_peak_level', peakLevel.toString());
    localStorage.setItem('mrg_inapp_balance', inAppBalance.toString());
    localStorage.setItem('mrg_ton_balance', tonWalletBalance.toString());
    localStorage.setItem('mrg_ton_connected', isTonConnected ? 'true' : 'false');
    localStorage.setItem('mrg_ton_address', tonAddress);
    localStorage.setItem('mrg_mining_clock', JSON.stringify(miningClock));
    localStorage.setItem('mrg_streak', checkinStreak.toString());
    if (checkinLastDay) localStorage.setItem('mrg_checkin_last_day', checkinLastDay);
    localStorage.setItem('mrg_tasks', JSON.stringify(tasks));
    localStorage.setItem('mrg_completed_tasks', JSON.stringify(completedTaskIds));
    localStorage.setItem('mrg_squad', JSON.stringify(friendsSquad));
    localStorage.setItem('mrg_unclaimed_commission', unclaimedCommission.toString());
    localStorage.setItem('mrg_transactions', JSON.stringify(transactions));
  }, [
    activeLevel,
    peakLevel,
    inAppBalance,
    tonWalletBalance,
    isTonConnected,
    tonAddress,
    miningClock,
    checkinStreak,
    checkinLastDay,
    tasks,
    completedTaskIds,
    friendsSquad,
    unclaimedCommission,
    transactions,
  ]);

  // Haptic Feedback helper
  const haptic = useCallback(
    (style: 'light' | 'medium' | 'heavy' | 'selection' | 'success' | 'warning' | 'error') => {
      const tg = typeof window !== 'undefined' ? window.Telegram?.WebApp : undefined;
      if (tg?.HapticFeedback) {
        if (style === 'success' || style === 'warning' || style === 'error') {
          tg.HapticFeedback.notificationOccurred(style);
        } else if (style === 'selection') {
          tg.HapticFeedback.selectionChanged();
        } else {
          tg.HapticFeedback.impactOccurred(style);
        }
      } else if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(style === 'heavy' ? 30 : 15);
      }
    },
    []
  );

  const dismissNotification = useCallback(() => setNotification(null), []);
  const dismissAchievement = useCallback(() => setAchievement(null), []);

  // Action: Claim Accumulated Mining Reward
  const claimMiningReward = useCallback(() => {
    const earned = getMiningProgress(miningClock, Date.now());
    if (earned < 0.0001) {
      haptic('warning');
      return;
    }

    haptic('success');
    setInAppBalance((prev) => prev + earned);

    const now = Date.now();
    setMiningClock({
      anchorAt: now,
      windowEnd: now + WINDOW_DURATION_SEC * 1000,
      balance: 0,
      level: activeLevel,
    });

    setTransactions((prev) => [
      {
        id: `tx-${Date.now()}`,
        type: 'mining_claim',
        amount: Number(earned.toFixed(4)),
        timestamp: now,
        status: 'completed',
      },
      ...prev.slice(0, 30),
    ]);

    setNotification({
      id: `claim-${Date.now()}`,
      amount: Number(earned.toFixed(4)),
      amountFormatted: `+${earned.toFixed(4)}`,
      source: t('cloudMiningSource'),
    });
  }, [miningClock, activeLevel, haptic, t]);

  // Action: Claim Squad Commission
  const claimCommission = useCallback(() => {
    if (unclaimedCommission <= 0) {
      haptic('warning');
      return;
    }
    haptic('success');
    const amount = unclaimedCommission;
    setInAppBalance((prev) => prev + amount);
    setUnclaimedCommission(0);

    setNotification({
      id: `comm-${Date.now()}`,
      amount,
      amountFormatted: `+${amount.toFixed(3)}`,
      source: t('squadCommissionSource'),
    });
  }, [unclaimedCommission, haptic, t]);

  // Action: Claim One-time referral bonus
  const claimOneTimeBonus = useCallback(() => {
    const eligibleCount = friendsSquad.length;
    const bonus = eligibleCount * 100;
    if (bonus <= 0) return;
    haptic('success');
    setInAppBalance((prev) => prev + bonus);

    setNotification({
      id: `bonus-${Date.now()}`,
      amount: bonus,
      amountFormatted: `+${bonus}`,
      source: t('activationBonusSource'),
    });
  }, [friendsSquad, haptic, t]);

  // Action: Nudge Friend
  const nudgeFriend = useCallback(
    (friendId: number) => {
      haptic('light');
      setFriendsSquad((prev) =>
        prev.map((f) => (f.id === friendId ? { ...f, nudged: true } : f))
      );
    },
    [haptic]
  );

  // Action: Daily Check-in Streak
  const dailyCheckIn = useCallback(() => {
    const today = new Date().toISOString().slice(0, 10);
    if (checkinLastDay === today) {
      haptic('warning');
      return;
    }

    haptic('success');
    const currentDay = ((checkinStreak - 1) % 7) + 1;
    const rewardTable = [5, 6, 7, 8, 9, 10, 15];
    const reward = rewardTable[currentDay - 1] || 5;

    setInAppBalance((prev) => prev + reward);
    setCheckinStreak((prev) => prev + 1);
    setCheckinLastDay(today);

    setTransactions((prev) => [
      {
        id: `checkin-${Date.now()}`,
        type: 'daily_checkin',
        amount: reward,
        timestamp: Date.now(),
        status: 'completed',
      },
      ...prev.slice(0, 30),
    ]);

    setNotification({
      id: `checkin-notif-${Date.now()}`,
      amount: reward,
      amountFormatted: `+${reward}`,
      source: `День ${currentDay} Ежедневного входа`,
    });
  }, [checkinLastDay, checkinStreak, haptic]);

  // Action: Start Task with 15-second verification
  const startTask = useCallback(
    (taskId: string) => {
      haptic('medium');
      const task = tasks.find((t) => t.id === taskId);
      if (task?.url) {
        if (typeof window !== 'undefined' && window.Telegram?.WebApp?.openLink) {
          window.Telegram.WebApp.openLink(task.url);
        } else {
          window.open(task.url, '_blank');
        }
      }
      const until = Date.now() + 15 * 1000;
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId ? { ...t, waitingUntil: until, isClaimable: false } : t
        )
      );
    },
    [tasks, haptic]
  );

  // Action: Claim Completed Task
  const claimTask = useCallback(
    (taskId: string) => {
      const task = tasks.find((t) => t.id === taskId);
      if (!task || task.completed) return;
      haptic('success');

      setInAppBalance((prev) => prev + task.reward);
      setCompletedTaskIds((prev) => [...prev, taskId]);
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId ? { ...t, completed: true, isClaimable: false } : t
        )
      );

      setTransactions((prev) => [
        {
          id: `task-${Date.now()}`,
          type: 'task_reward',
          amount: task.reward,
          timestamp: Date.now(),
          status: 'completed',
        },
        ...prev.slice(0, 30),
      ]);

      setNotification({
        id: `task-notif-${Date.now()}`,
        amount: task.reward,
        amountFormatted: `+${task.reward}`,
        source: task.title,
      });
    },
    [tasks, haptic]
  );

  // Action: Unlock Level (1..1000)
  const unlockLevel = useCallback(
    (newLevel: number) => {
      haptic('heavy');
      const prevLvl = activeLevel;
      setActiveLevel(newLevel);
      setPeakLevel((p) => Math.max(p, newLevel));

      // Reset mining clock with new level
      const now = Date.now();
      setMiningClock({
        anchorAt: now,
        windowEnd: now + WINDOW_DURATION_SEC * 1000,
        balance: 0,
        level: newLevel,
      });

      // Show Achievement Modal
      setAchievement({
        previousLevel: prevLvl,
        newLevel,
        newSpeedTHs: le(newLevel),
        dailyBoostMRG: He(newLevel),
      });
    },
    [activeLevel, haptic]
  );

  // Wallet operations
  const connectTonWallet = useCallback(() => {
    haptic('medium');
    setIsTonConnected(true);
    setTonWalletBalance(350.0);
    setNotification({
      id: `wallet-conn-${Date.now()}`,
      amount: 350.0,
      amountFormatted: 'Подключено',
      source: 'Tonkeeper Wallet Synced',
    });
  }, [haptic]);

  const disconnectTonWallet = useCallback(() => {
    haptic('light');
    setIsTonConnected(false);
  }, [haptic]);

  const executeWithdraw = useCallback(
    (amount: number): boolean => {
      if (amount > inAppBalance || amount < 500) {
        haptic('error');
        return false;
      }
      haptic('success');
      setInAppBalance((prev) => prev - amount);

      const fee = Math.max(2, Math.round(amount * 0.05 * (1 - nftDiscountPercent / 100)));
      setTransactions((prev) => [
        {
          id: `wd-${Date.now()}`,
          type: 'withdrawal',
          amount: amount - fee,
          timestamp: Date.now(),
          status: 'completed',
          address: tonAddress,
        },
        ...prev.slice(0, 30),
      ]);

      setNotification({
        id: `wd-notif-${Date.now()}`,
        amount,
        amountFormatted: `-${amount}`,
        source: 'Вывод на GRAM кошелек',
      });
      return true;
    },
    [inAppBalance, nftDiscountPercent, tonAddress, haptic]
  );

  return (
    <MrgContext.Provider
      value={{
        user,
        language,
        setLanguage,
        currentLanguageOption,
        t,
        activeTab,
        setActiveTab,
        activeLevel,
        peakLevel,
        inAppBalance,
        tonWalletBalance,
        isTonConnected,
        tonAddress,
        miningClock,
        checkinStreak,
        checkinLastDay,
        tasks,
        completedTaskIds,
        friendsSquad,
        unclaimedCommission,
        transactions,
        nftHoldings,
        nftDiscountPercent,
        notification,
        achievement,
        dismissNotification,
        dismissAchievement,
        claimMiningReward,
        claimCommission,
        claimOneTimeBonus,
        nudgeFriend,
        dailyCheckIn,
        startTask,
        claimTask,
        unlockLevel,
        connectTonWallet,
        disconnectTonWallet,
        executeWithdraw,
        walletSubView,
        setWalletSubView,
        haptic,
      }}
    >
      {children}
    </MrgContext.Provider>
  );
};

export function useMrg() {
  const context = useContext(MrgContext);
  if (!context) throw new Error('useMrg must be used within MrgProvider');
  return context;
}
