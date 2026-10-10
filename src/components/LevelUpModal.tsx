import React from 'react';
import { Award, Zap, TrendingUp, X } from 'lucide-react';
import { useMrg } from '../context/MrgContext';

export const LevelUpModal: React.FC = () => {
  const { achievement, dismissAchievement, t, haptic } = useMrg();

  if (!achievement) return null;

  const handleShare = () => {
    haptic('medium');
    const text = encodeURIComponent(
      `🚀 Я повысил свой уровень майнера до Lv ${achievement.newLevel} в MRG Tasks! Скорость майнинга: ${achievement.newSpeedTHs.toFixed(2)} TH/s. Присоединяйся!`
    );
    const url = `https://t.me/share/url?url=https://t.me/mrgminerbot/app&text=${text}`;
    if (typeof window !== 'undefined' && window.Telegram?.WebApp?.openTelegramLink) {
      window.Telegram.WebApp.openTelegramLink(url);
    } else {
      window.open(url, '_blank');
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        zIndex: 120,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.2s ease',
      }}
    >
      <div
        className="tg-card"
        style={{
          width: '100%',
          maxWidth: '380px',
          textAlign: 'center',
          position: 'relative',
          padding: '24px 20px',
          border: '1px solid rgba(245, 166, 35, 0.4)',
          boxShadow: '0 16px 40px rgba(0, 0, 0, 0.5), 0 0 30px rgba(245, 166, 35, 0.2)',
          backgroundColor: 'var(--app-section)',
        }}
      >
        <button
          onClick={dismissAchievement}
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            background: 'none',
            color: 'var(--app-hint)',
            padding: '4px',
          }}
        >
          <X size={20} />
        </button>

        <div
          style={{
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            margin: '0 auto 16px auto',
            background: 'linear-gradient(135deg, #ffd700 0%, #f5a623 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(245, 166, 35, 0.4)',
          }}
        >
          <Award size={40} color="#3a2500" />
        </div>

        <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--app-gold)', letterSpacing: '1px' }}>
          {t('achievementUnlocked')}
        </div>

        <div style={{ fontSize: '24px', fontWeight: 800, margin: '4px 0 16px 0' }}>
          {t('levelUpTitle')}
        </div>

        {/* Level Progression Indicator */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            backgroundColor: 'var(--app-fill)',
            padding: '12px',
            borderRadius: '16px',
            marginBottom: '16px',
          }}
        >
          <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--app-hint)' }}>
            Lv {achievement.previousLevel}
          </span>
          <span style={{ fontSize: '20px', color: 'var(--app-accent)' }}>→</span>
          <span
            style={{
              fontSize: '22px',
              fontWeight: 900,
              color: '#ffffff',
              backgroundColor: 'var(--app-accent)',
              padding: '4px 12px',
              borderRadius: '12px',
            }}
          >
            Lv {achievement.newLevel}
          </span>
        </div>

        {/* Stat boosts */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '20px' }}>
          <div style={{ backgroundColor: 'var(--app-fill)', padding: '10px', borderRadius: '12px' }}>
            <div style={{ fontSize: '11px', color: 'var(--app-hint)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
              <Zap size={12} color="#ffd700" /> {t('newMiningRate')}
            </div>
            <div style={{ fontSize: '16px', fontWeight: 800, marginTop: '2px', color: '#ffffff' }}>
              {achievement.newSpeedTHs.toFixed(2)} TH/s
            </div>
          </div>

          <div style={{ backgroundColor: 'var(--app-fill)', padding: '10px', borderRadius: '12px' }}>
            <div style={{ fontSize: '11px', color: 'var(--app-hint)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
              <TrendingUp size={12} color="#30d158" /> {t('dailyOutputBoost')}
            </div>
            <div style={{ fontSize: '16px', fontWeight: 800, marginTop: '2px', color: 'var(--app-green)' }}>
              +{achievement.dailyBoostMRG} MRG
            </div>
          </div>
        </div>

        <button
          onClick={dismissAchievement}
          className="btn-primary"
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '14px',
            fontWeight: 800,
            fontSize: '14px',
            marginBottom: '8px',
          }}
        >
          {t('continueMining')}
        </button>

        <button
          onClick={handleShare}
          className="tg-secondary-btn"
          style={{
            width: '100%',
            padding: '10px',
            borderRadius: '14px',
            fontSize: '13px',
            justifyContent: 'center',
          }}
        >
          {t('shareAchievement')}
        </button>
      </div>
    </div>
  );
};
