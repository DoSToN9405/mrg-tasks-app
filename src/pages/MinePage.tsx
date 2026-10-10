import React, { useState, useEffect, useRef } from 'react';
import {
  Zap,
  TrendingUp,
  ChevronRight,
  Wallet,
  Coins,
  LineChart,
  ChevronDown,
} from 'lucide-react';
import { useMrg } from '../context/MrgContext';
import {
  COIN_IMAGE_URL,
  le,
  He,
  getMiningProgress,
  isMiningStopped,
  MRG_PRICE_USD,
  WINDOW_DURATION_SEC,
  formatMRG,
} from '../data/mrgMath';

interface FloatingParticle {
  id: number;
  x: number;
  y: number;
  offsetX: number;
  rotation: number;
  scale: number;
}

export const MinePage: React.FC = () => {
  const {
    activeLevel,
    inAppBalance,
    tonWalletBalance,
    isTonConnected,
    miningClock,
    claimMiningReward,
    setActiveTab,
    connectTonWallet,
    t,
    haptic,
  } = useMrg();

  const [now, setNow] = useState<number>(Date.now());
  const [isChartOpen, setIsChartOpen] = useState<boolean>(false);
  const [particles, setParticles] = useState<FloatingParticle[]>([]);
  const [tilt, setTilt] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const tiltTimerRef = useRef<any>(null);

  // Live ticker updating every 100ms for smooth 6-decimal accrual
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const speedTHs = le(activeLevel);
  const dailyOutput = He(activeLevel);
  const accruedReward = getMiningProgress(miningClock, now);
  const isStopped = isMiningStopped(miningClock, now);

  const remainingSec = Math.max(0, Math.ceil((miningClock.windowEnd - now) / 1000));
  const formatTimer = (sec: number) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // 3D Coin tap physics
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    haptic('light');
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    setTilt({
      x: -((y - centerY) / centerY) * 16,
      y: ((x - centerX) / centerX) * 16,
    });

    if (tiltTimerRef.current) clearTimeout(tiltTimerRef.current);
    tiltTimerRef.current = setTimeout(() => setTilt({ x: 0, y: 0 }), 160);

    // Spawn floating coins
    const newParticles: FloatingParticle[] = [0, 1].map((idx) => ({
      id: Date.now() + Math.random() + idx,
      x,
      y,
      offsetX: (Math.random() - 0.5) * 50,
      rotation: (Math.random() - 0.5) * 40,
      scale: 0.85 + Math.random() * 0.3,
    }));

    setParticles((prev) => [...prev.slice(-12), ...newParticles]);
    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => !newParticles.some((np) => np.id === p.id)));
    }, 850);
  };

  const handlePointerReset = () => {
    if (tiltTimerRef.current) clearTimeout(tiltTimerRef.current);
    setTilt({ x: 0, y: 0 });
  };

  // Ring dimensions
  const size = 228;
  const stroke = 7;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progressRatio = isStopped ? 0 : remainingSec / WINDOW_DURATION_SEC;
  const strokeDashoffset = circumference * (1 - progressRatio);

  const hasClaimable = accruedReward > 0.0001;

  return (
    <div style={{ padding: '16px 16px 90px 16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* Mining Reactor Card */}
      <section
        id="mining-reactor-card"
        className="tg-card"
        style={{
          position: 'relative',
          padding: '20px',
          overflow: 'hidden',
          borderRadius: '28px',
          backgroundColor: 'var(--app-section)',
        }}
      >
        {/* Glow */}
        <div
          className="hero-glow"
          style={{
            position: 'absolute',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '280px',
            height: '280px',
            pointerEvents: 'none',
          }}
        />

        {/* Reactor Header */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--app-hint)', margin: 0 }}>
              {t('levelMiner', { level: activeLevel })}
            </p>
            <p style={{ fontSize: '18px', fontWeight: 800, color: 'var(--app-text)', margin: '2px 0 0 0' }}>
              Cloud Mining
            </p>
          </div>

          <div>
            {isStopped ? (
              <span className="tg-badge" style={{ backgroundColor: 'rgba(238, 104, 111, 0.2)', color: 'var(--app-destructive)' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'currentColor' }} />
                Stopped
              </span>
            ) : (
              <span className="tg-badge tg-badge-green">
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: 'currentColor',
                    animation: 'pulse 1.5s infinite',
                  }}
                />
                <span style={{ fontVariantNumeric: 'tabular-nums' }}>{formatTimer(remainingSec)}</span>
              </span>
            )}
          </div>
        </div>

        {/* 3D Interactive Coin Center */}
        <div
          style={{
            position: 'relative',
            width: `${size}px`,
            height: `${size}px`,
            margin: '16px auto',
          }}
        >
          {/* SVG Progress Ring */}
          <svg width={size} height={size} style={{ position: 'absolute', inset: 0, transform: 'rotate(-90deg)' }}>
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="var(--app-fill)"
              strokeWidth={stroke}
            />
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="url(#mining-ring-grad)"
              strokeWidth={stroke}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              style={{ transition: 'stroke-dashoffset 1s linear' }}
            />
            <defs>
              <linearGradient id="mining-ring-grad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="var(--app-teal)" />
                <stop offset="100%" stopColor="var(--app-accent)" />
              </linearGradient>
            </defs>
          </svg>

          {/* Coin Disc 184x184 */}
          <div
            id="mining-coin-reactor"
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerReset}
            onPointerLeave={handlePointerReset}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '184px',
              height: '184px',
              borderRadius: '50%',
              cursor: 'pointer',
              userSelect: 'none',
              touchAction: 'none',
              perspective: 800,
            }}
          >
            <div
              className="coin-shine"
              style={{
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                overflow: 'hidden',
                boxShadow: '0 14px 36px rgba(0, 0, 0, 0.45)',
                transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
                transition: 'transform 0.12s cubic-bezier(0.2, 0.8, 0.4, 1)',
                willChange: 'transform',
              }}
            >
              <img
                src={COIN_IMAGE_URL}
                alt="MRG Coin"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                  userSelect: 'none',
                  pointerEvents: 'none',
                }}
              />
            </div>

            {/* Floating Particle Coins */}
            {particles.map((p) => (
              <div
                key={p.id}
                style={{
                  position: 'absolute',
                  left: `${p.x - 18}px`,
                  top: `${p.y - 18}px`,
                  pointerEvents: 'none',
                  animation: 'coinPop 0.85s cubic-bezier(0.22, 1, 0.36, 1) forwards',
                  zIndex: 30,
                }}
              >
                <img
                  src={COIN_IMAGE_URL}
                  alt=""
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Real-time Ticker Value */}
        <div style={{ position: 'relative', textAlign: 'center' }}>
          <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--app-hint)', margin: 0 }}>
            {t('unclaimedMiningReward')}
          </p>

          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              justifyContent: 'center',
              gap: '6px',
              marginTop: '4px',
            }}
          >
            <span
              style={{
                fontSize: '36px',
                fontWeight: 900,
                color: 'var(--app-text)',
                lineHeight: 1,
                fontVariantNumeric: 'tabular-nums',
                letterSpacing: '-0.5px',
              }}
            >
              {accruedReward.toFixed(6)}
            </span>
            <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--app-hint)' }}>
              MRG
            </span>
          </div>

          <p
            style={{
              fontSize: '13px',
              color: 'var(--app-hint)',
              marginTop: '6px',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            ≈ ${(accruedReward * MRG_PRICE_USD).toFixed(4)} · {speedTHs.toFixed(2)} TH/s
          </p>
        </div>

        {/* Main Action Button */}
        <div style={{ position: 'relative', marginTop: '18px' }}>
          {isTonConnected ? (
            <button
              id="btn-claim-mining"
              onClick={claimMiningReward}
              disabled={!hasClaimable}
              className={hasClaimable ? 'btn-primary' : 'tg-secondary-btn'}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '16px',
                fontSize: '15px',
                fontWeight: 800,
                justifyContent: 'center',
              }}
            >
              {hasClaimable ? `${t('claimReward')} · ${accruedReward.toFixed(2)} MRG` : t('claimReward')}
            </button>
          ) : (
            <button
              id="btn-connect-wallet-to-mine"
              onClick={connectTonWallet}
              className="btn-primary"
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '16px',
                fontSize: '15px',
                fontWeight: 800,
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              <Wallet size={18} />
              {t('connectWallet')}
            </button>
          )}
        </div>
      </section>

      {/* Miner Specs Card */}
      <div className="tg-card" style={{ backgroundColor: 'var(--app-section)', padding: '14px 16px' }}>
        <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--app-hint)', marginBottom: '10px' }}>
          Miner
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: 'var(--app-fill)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Zap size={18} color="var(--app-accent)" />
              </div>
              <span style={{ fontSize: '14px', fontWeight: 600 }}>{t('miningSpeed')}</span>
            </div>
            <span style={{ fontSize: '15px', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
              {speedTHs.toFixed(2)} TH/s
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: 'var(--app-fill)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <TrendingUp size={18} color="var(--app-green)" />
              </div>
              <span style={{ fontSize: '14px', fontWeight: 600 }}>{t('output24h')}</span>
            </div>
            <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--app-green)', fontVariantNumeric: 'tabular-nums' }}>
              +{dailyOutput} MRG
            </span>
          </div>

          <div
            onClick={() => {
              haptic('light');
              setActiveTab('miners');
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              paddingTop: '4px',
              borderTop: '1px solid var(--app-separator)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: 'var(--app-fill)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Coins size={18} color="var(--app-gold)" />
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 600 }}>
                  {t('level')} {activeLevel}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--app-hint)' }}>
                  Upgrade to mine faster
                </div>
              </div>
            </div>
            <ChevronRight size={18} color="var(--app-hint)" />
          </div>
        </div>
      </div>

      {/* Holdings Card */}
      <div className="tg-card" style={{ backgroundColor: 'var(--app-section)', padding: '14px 16px' }}>
        <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--app-hint)', marginBottom: '10px' }}>
          {t('myAssetHolding')}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: 'var(--app-fill)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Wallet size={18} color="var(--app-purple)" />
              </div>
              <span style={{ fontSize: '14px', fontWeight: 600 }}>{t('inApp')}</span>
            </div>
            <span style={{ fontSize: '15px', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
              {formatMRG(inAppBalance)} MRG
            </span>
          </div>

          <div
            onClick={() => {
              haptic('light');
              setActiveTab('wallet');
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: 'var(--app-fill)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Wallet size={18} color="var(--app-teal)" />
              </div>
              <span style={{ fontSize: '14px', fontWeight: 600 }}>{t('tonWallet')}</span>
            </div>
            {isTonConnected ? (
              <span style={{ fontSize: '15px', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
                {formatMRG(tonWalletBalance)} MRG
              </span>
            ) : (
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--app-accent)' }}>
                {t('connect')} →
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Live Chart Accordion */}
      <div className="tg-card" style={{ backgroundColor: 'var(--app-section)', padding: '14px 16px' }}>
        <div
          onClick={() => {
            haptic('selection');
            setIsChartOpen(!isChartOpen);
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: 'var(--app-fill)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <LineChart size={18} color="var(--app-indigo)" />
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 600 }}>MRG Live Chart</div>
              <div style={{ fontSize: '11px', color: 'var(--app-hint)' }}>DexScreener · MRG/GRAM</div>
            </div>
          </div>
          <ChevronDown
            size={18}
            color="var(--app-hint)"
            style={{
              transform: isChartOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.25s ease',
            }}
          />
        </div>

        {isChartOpen && (
          <div style={{ marginTop: '12px', height: '280px', borderRadius: '16px', overflow: 'hidden' }}>
            <iframe
              src="https://dexscreener.com/ton/EQDj-zlSvj4Au154XjsU7ATzt13p8JjYEs0weVv1rVbCJSn0?embed=1&theme=dark&trades=0&info=0"
              title="DexScreener"
              style={{ width: '100%', height: '100%', border: 'none' }}
            />
          </div>
        )}
      </div>
    </div>
  );
};
