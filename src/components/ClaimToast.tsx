import React, { useEffect } from 'react';
import { Check } from 'lucide-react';
import { useMrg } from '../context/MrgContext';

export const ClaimToast: React.FC = () => {
  const { notification, dismissNotification } = useMrg();

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        dismissNotification();
      }, 2600);
      return () => clearTimeout(timer);
    }
  }, [notification, dismissNotification]);

  if (!notification) return null;

  return (
    <div
      id="claim-notification-container"
      onClick={dismissNotification}
      style={{
        position: 'fixed',
        top: 'calc(10px + env(safe-area-inset-top, 0px))',
        left: 0,
        right: 0,
        zIndex: 110,
        display: 'flex',
        justifyContent: 'center',
        padding: '0 16px',
        animation: 'slideDown 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        cursor: 'pointer',
      }}
    >
      <div
        style={{
          backgroundColor: 'rgba(30, 30, 32, 0.94)',
          backdropFilter: 'blur(16px)',
          borderRadius: '16px',
          padding: '10px 14px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          width: '100%',
          maxWidth: '380px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <span
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: 'var(--app-green)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Check size={20} color="#ffffff" strokeWidth={2.6} />
        </span>

        <div style={{ flex: 1, minWidth: 0 }}>
          <span style={{ display: 'block', fontSize: '14.5px', fontWeight: 700, color: '#ffffff', lineHeight: 1.2 }}>
            Claim successful
          </span>
          <span style={{ display: 'block', fontSize: '12.5px', color: 'rgba(255, 255, 255, 0.6)', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {notification.source}
          </span>
        </div>

        <span style={{ flexShrink: 0, fontSize: '15px', fontWeight: 800, color: 'var(--app-green)', fontVariantNumeric: 'tabular-nums' }}>
          {notification.amountFormatted}{' '}
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(255, 255, 255, 0.6)' }}>
            MRG
          </span>
        </span>
      </div>
    </div>
  );
};
