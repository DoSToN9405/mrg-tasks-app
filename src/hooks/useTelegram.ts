import { useEffect, useState, useCallback, useMemo } from 'react';
import { TelegramWebApp, TelegramUser } from '../types/telegram';

const MOCK_USER: TelegramUser = {
  id: 7770001,
  first_name: 'Павел',
  last_name: 'Дуров',
  username: 'durov',
  language_code: 'ru',
  is_premium: true,
  photo_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&h=200&q=80',
};

export function useTelegram() {
  const tg: TelegramWebApp | undefined = typeof window !== 'undefined' ? window.Telegram?.WebApp : undefined;
  const isInTelegram = Boolean(tg && tg.initData && tg.initData.length > 0);

  const [colorScheme, setColorScheme] = useState<'light' | 'dark'>('dark');
  const [mockUser, setMockUser] = useState<TelegramUser>(MOCK_USER);

  useEffect(() => {
    if (tg) {
      try {
        tg.ready();
        tg.expand();
        if (tg.colorScheme) {
          setColorScheme(tg.colorScheme);
        }
      } catch (err) {
        console.warn('Telegram WebApp init error:', err);
      }
    }
  }, [tg]);

  // Haptic feedback wrappers
  const haptic = useMemo(
    () => ({
      impact: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' = 'light') => {
        if (tg?.HapticFeedback) {
          tg.HapticFeedback.impactOccurred(style);
        } else {
          // Fallback navigator vibrate or console
          if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
            navigator.vibrate(style === 'heavy' ? 30 : 15);
          }
        }
      },
      notification: (type: 'error' | 'success' | 'warning' = 'success') => {
        if (tg?.HapticFeedback) {
          tg.HapticFeedback.notificationOccurred(type);
        } else {
          if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
            navigator.vibrate([15, 50, 15]);
          }
        }
      },
      selection: () => {
        if (tg?.HapticFeedback) {
          tg.HapticFeedback.selectionChanged();
        } else {
          if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
            navigator.vibrate(8);
          }
        }
      },
    }),
    [tg]
  );

  const showAlert = useCallback(
    (message: string, callback?: () => void) => {
      if (tg?.showAlert) {
        tg.showAlert(message, callback);
      } else {
        alert(message);
        callback?.();
      }
    },
    [tg]
  );

  const showConfirm = useCallback(
    (message: string, callback?: (confirmed: boolean) => void) => {
      if (tg?.showConfirm) {
        tg.showConfirm(message, callback);
      } else {
        const confirmed = window.confirm(message);
        callback?.(confirmed);
      }
    },
    [tg]
  );

  const sendData = useCallback(
    (data: any) => {
      const payload = typeof data === 'string' ? data : JSON.stringify(data);
      if (tg?.sendData) {
        tg.sendData(payload);
      } else {
        console.log('[Mock sendData to Bot]:', payload);
        showAlert(`[Тестовый режим браузера]\nДанные отправлены боту:\n\n${payload}`);
      }
    },
    [tg, showAlert]
  );

  const close = useCallback(() => {
    if (tg?.close) {
      tg.close();
    } else {
      console.log('[Mock close]: App closed');
      showAlert('Приложение закрыто (в Telegram окно бы свернулось)');
    }
  }, [tg, showAlert]);

  const toggleMockTheme = useCallback(() => {
    setColorScheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  const user = isInTelegram && tg?.initDataUnsafe?.user ? tg.initDataUnsafe.user : mockUser;

  return {
    tg,
    isInTelegram,
    user,
    setMockUser,
    colorScheme,
    toggleMockTheme,
    haptic,
    showAlert,
    showConfirm,
    sendData,
    close,
    version: tg?.version || '7.10 (Mock)',
    platform: tg?.platform || 'web-browser',
  };
}
