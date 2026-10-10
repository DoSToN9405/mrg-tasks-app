import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  Award,
  ChevronRight,
  Lock,
  CheckCircle,
  ExternalLink,
  X,
  Sparkles,
} from 'lucide-react';
import { useMrg } from '../context/MrgContext';
import {
  calculateLevelInfo,
  formatMRG,
} from '../data/mrgMath';
import { LevelInfo } from '../types/mrg';

export const MinersPage: React.FC = () => {
  const {
    activeLevel,
    peakLevel,
    inAppBalance,
    tonWalletBalance,
    unlockLevel,
    setActiveTab,
    t,
    haptic,
  } = useMrg();

  const totalHolding = inAppBalance + tonWalletBalance;
  const [visibleCount, setVisibleCount] = useState<number>(30);
  const [selectedLevel, setSelectedLevel] = useState<LevelInfo | null>(null);

  // Generate levels list up to visibleCount (max 1000)
  const levels = useMemo(() => {
    const list: LevelInfo[] = [];
    for (let i = 1; i <= visibleCount; i++) {
      list.push(calculateLevelInfo(i, totalHolding, activeLevel));
    }
    return list;
  }, [visibleCount, totalHolding, activeLevel]);

  const handleSelectLevel = (levelInfo: LevelInfo) => {
    haptic('light');
    setSelectedLevel(levelInfo);
  };

  const handleUnlock = (lvl: number) => {
    haptic('heavy');
    unlockLevel(lvl);
    setSelectedLevel(null);
  };

  const loadMore = () => {
    haptic('medium');
    setVisibleCount((prev) => Math.min(1000, prev + 30));
  };

  return (
    <div style={{ padding: '16px 16px 90px 16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* Header Card: My Level Journey */}
      <div
        className="tg-card"
        style={{
          backgroundColor: 'var(--app-section)',
          padding: '16px 18px',
          background: 'linear-gradient(135deg, var(--app-section) 0%, rgba(34, 154, 240, 0.08) 100%)',
        }}
      >
        <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--app-hint)', letterSpacing: '0.5px' }}>
          {t('myLevelJourney')}
        </div>

        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '6px' }}>
          <div>
            <span style={{ fontSize: '26px', fontWeight: 900, color: 'var(--app-text)' }}>
              Lv {activeLevel}
            </span>
            <span style={{ fontSize: '14px', color: 'var(--app-hint)', marginLeft: '6px' }}>
              / 1000
            </span>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span className="tg-badge tg-badge-gold">
              <Award size={12} /> {t('peak')}: Lv {peakLevel}
            </span>
          </div>
        </div>

        <div
          style={{
            marginTop: '12px',
            paddingTop: '10px',
            borderTop: '1px solid var(--app-separator)',
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '12px',
          }}
        >
          <span style={{ color: 'var(--app-hint)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <TrendingUp size={13} color="var(--app-green)" /> {t('todayPnl')}
          </span>
          <span style={{ fontWeight: 700, color: 'var(--app-green)' }}>+14.85%</span>
        </div>
      </div>

      {/* Levels List */}
      <div
        className="tg-card"
        style={{
          backgroundColor: 'var(--app-section)',
          padding: 0,
          overflow: 'hidden',
        }}
      >
        <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--app-separator)', fontSize: '13px', fontWeight: 700, color: 'var(--app-hint)' }}>
          {t('minerStore')}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {levels.map((item) => {
            const isActive = item.level === activeLevel;
            const isUnlocked = item.level < activeLevel;
            const isReady = item.status === 'ready' && !isActive && !isUnlocked;
            const isNeed = item.status === 'need';

            return (
              <button
                key={item.level}
                onClick={() => handleSelectLevel(item)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  borderBottom: '1px solid var(--app-separator)',
                  backgroundColor: isActive ? 'var(--app-accent-soft)' : 'transparent',
                  textAlign: 'left',
                  color: 'inherit',
                  cursor: 'pointer',
                }}
              >
                {/* Level square icon */}
                <span
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    lineHeight: 1,
                    fontWeight: 900,
                    flexShrink: 0,
                    backgroundColor: isActive
                      ? 'var(--app-accent)'
                      : isUnlocked
                      ? 'var(--app-green)'
                      : isReady
                      ? 'var(--app-gold)'
                      : 'var(--app-fill)',
                    color: isActive || isUnlocked || isReady ? '#ffffff' : 'var(--app-hint)',
                  }}
                >
                  <span style={{ fontSize: '9px', textTransform: 'uppercase', opacity: 0.8 }}>Lv</span>
                  <span style={{ fontSize: item.level >= 100 ? '13px' : '15px', marginTop: '1px' }}>
                    {item.level}
                  </span>
                </span>

                {/* Level details */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontWeight: 700, fontSize: '15px' }}>
                      {t('level')} {item.level}
                    </span>
                    {isActive && (
                      <span className="tg-badge tg-badge-blue" style={{ fontSize: '10px', padding: '2px 6px' }}>
                        {t('currentBadge')}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--app-hint)', marginTop: '2px' }}>
                    {item.speedTHs.toFixed(2)} TH/s · +{item.dailyOutputMRG}/day
                  </div>
                </div>

                {/* Right price / status info */}
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: '14px', fontVariantNumeric: 'tabular-nums' }}>
                    {item.priceUSDFormatted}
                  </div>

                  {isActive ? (
                    <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--app-accent)' }}>
                      {t('activeBadge')}
                    </span>
                  ) : isUnlocked ? (
                    <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--app-green)' }}>
                      {t('unlockedBadge')}
                    </span>
                  ) : isReady ? (
                    <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--app-green)' }}>
                      Ready to unlock
                    </span>
                  ) : isNeed ? (
                    <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--app-orange)' }}>
                      {t('needMRG', { amount: formatMRG(item.missingMRG, 0) })}
                    </span>
                  ) : (
                    <span style={{ fontSize: '11px', color: 'var(--app-hint)', display: 'flex', alignItems: 'center', gap: '3px', justifyContent: 'flex-end' }}>
                      <Lock size={10} /> {formatMRG(item.requiredHoldingMRG, 0)} MRG
                    </span>
                  )}
                </div>

                <ChevronRight size={16} color="var(--app-hint)" style={{ flexShrink: 0 }} />
              </button>
            );
          })}
        </div>

        {visibleCount < 1000 && (
          <div style={{ padding: '14px' }}>
            <button
              onClick={loadMore}
              className="tg-secondary-btn"
              style={{ width: '100%', justifyContent: 'center', fontSize: '13px' }}
            >
              {t('loadMoreLevels')}
            </button>
          </div>
        )}
      </div>

      {/* Level Detail Modal Drawer */}
      {selectedLevel && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(6px)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
          }}
          onClick={() => setSelectedLevel(null)}
        >
          <div
            className="tg-card"
            style={{
              width: '100%',
              maxWidth: '540px',
              borderBottomLeftRadius: 0,
              borderBottomRightRadius: 0,
              borderTopLeftRadius: '24px',
              borderTopRightRadius: '24px',
              padding: '20px 18px calc(24px + env(safe-area-inset-bottom, 0px)) 18px',
              backgroundColor: 'var(--app-section)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ fontSize: '18px', fontWeight: 800 }}>
                {t('level')} {selectedLevel.level} Miner
              </div>
              <button onClick={() => setSelectedLevel(null)} style={{ background: 'none', color: 'var(--app-hint)' }}>
                <X size={20} />
              </button>
            </div>

            {/* Speed & Daily output */}
            <div style={{ textAlign: 'center', padding: '10px 0 16px 0' }}>
              <div style={{ fontSize: '12px', color: 'var(--app-hint)', fontWeight: 600 }}>
                {t('miningSpeed')}
              </div>
              <div style={{ fontSize: '36px', fontWeight: 900, marginTop: '2px' }}>
                {selectedLevel.speedTHs.toFixed(2)}{' '}
                <span style={{ fontSize: '18px', color: 'var(--app-hint)' }}>TH/s</span>
              </div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--app-green)', marginTop: '2px' }}>
                +{selectedLevel.dailyOutputMRG} MRG / day
              </div>
            </div>

            {/* Proof of Holding Progress Bar */}
            <div style={{ backgroundColor: 'var(--app-fill)', padding: '14px', borderRadius: '16px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                <span style={{ fontWeight: 600 }}>{t('yourAssets')}</span>
                <span style={{ color: 'var(--app-hint)', fontVariantNumeric: 'tabular-nums' }}>
                  {formatMRG(totalHolding)} / {formatMRG(selectedLevel.requiredHoldingMRG, 0)} MRG
                </span>
              </div>
              <div style={{ height: '8px', borderRadius: '4px', backgroundColor: 'var(--app-section)', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${Math.min(100, selectedLevel.requiredHoldingMRG > 0 ? (totalHolding / selectedLevel.requiredHoldingMRG) * 100 : 100)}%`,
                    backgroundColor: totalHolding >= selectedLevel.requiredHoldingMRG ? 'var(--app-green)' : 'var(--app-accent)',
                    borderRadius: '4px',
                    transition: 'width 0.3s ease',
                  }}
                />
              </div>
            </div>

            {/* Specs Breakdown */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--app-hint)' }}>{t('requiredHolding')}:</span>
                <span style={{ fontWeight: 700 }}>{formatMRG(selectedLevel.requiredHoldingMRG, 0)} MRG ({selectedLevel.priceUSDFormatted})</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--app-hint)' }}>{t('walletHoldingDesc')}:</span>
                <span style={{ fontWeight: 700 }}>{formatMRG(totalHolding)} MRG</span>
              </div>
              {selectedLevel.missingMRG > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--app-orange)' }}>
                  <span>{t('missing')}:</span>
                  <span style={{ fontWeight: 700 }}>{formatMRG(selectedLevel.missingMRG, 0)} MRG (${selectedLevel.missingUSD.toFixed(2)})</span>
                </div>
              )}
            </div>

            {/* Action Button */}
            {selectedLevel.level <= activeLevel ? (
              <button
                onClick={() => setSelectedLevel(null)}
                className="tg-secondary-btn"
                style={{ width: '100%', padding: '14px', borderRadius: '16px', justifyContent: 'center', fontSize: '15px' }}
              >
                <CheckCircle size={18} color="var(--app-green)" /> {t('activeBadge')}
              </button>
            ) : totalHolding >= selectedLevel.requiredHoldingMRG ? (
              <button
                onClick={() => handleUnlock(selectedLevel.level)}
                className="btn-primary"
                style={{ width: '100%', padding: '14px', borderRadius: '16px', justifyContent: 'center', fontSize: '15px' }}
              >
                <Sparkles size={18} /> {t('unlockLvl', { level: selectedLevel.level })}
              </button>
            ) : (
              <button
                onClick={() => {
                  setSelectedLevel(null);
                  setActiveTab('wallet');
                }}
                className="btn-primary"
                style={{ width: '100%', padding: '14px', borderRadius: '16px', justifyContent: 'center', fontSize: '15px' }}
              >
                <ExternalLink size={18} /> {t('getMrgOnDex')}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
