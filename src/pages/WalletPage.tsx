import React, { useState } from 'react';
import {
  Wallet,
  ArrowUpRight,
  TrendingUp,
  ShieldCheck,
  Sparkles,
  Copy,
  Check,
  ArrowLeft,
  Lock,
  ExternalLink,
  Video,
  FileText,
} from 'lucide-react';
import { useMrg } from '../context/MrgContext';
import {
  JETTON_CONTRACT,
  formatMRG,
  MRG_PRICE_USD,
} from '../data/mrgMath';

export const WalletPage: React.FC = () => {
  const {
    user,
    inAppBalance,
    tonWalletBalance,
    isTonConnected,
    tonAddress,
    transactions,
    nftDiscountPercent,
    connectTonWallet,
    disconnectTonWallet,
    executeWithdraw,
    walletSubView,
    setWalletSubView,
    t,
    haptic,
  } = useMrg();

  const [withdrawAmount, setWithdrawAmount] = useState<string>('500');
  const [copiedContract, setCopiedContract] = useState<boolean>(false);
  const [copiedTgid, setCopiedTgid] = useState<boolean>(false);

  const totalHolding = inAppBalance + (isTonConnected ? tonWalletBalance : 0);

  const handleCopyContract = () => {
    haptic('medium');
    navigator.clipboard?.writeText(JETTON_CONTRACT);
    setCopiedContract(true);
    setTimeout(() => setCopiedContract(false), 2000);
  };

  const handleCopyTgid = () => {
    haptic('medium');
    navigator.clipboard?.writeText(String(user.id));
    setCopiedTgid(true);
    setTimeout(() => setCopiedTgid(false), 2000);
  };

  const handleWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(withdrawAmount);
    if (isNaN(val) || val < 500) {
      haptic('error');
      alert('Минимальная сумма для вывода: 500 MRG');
      return;
    }
    if (val > inAppBalance) {
      haptic('error');
      alert('Недостаточно баланса в приложении!');
      return;
    }
    const success = executeWithdraw(val);
    if (success) {
      setWalletSubView('main');
    }
  };

  /* Subview: Withdraw */
  if (walletSubView === 'withdraw') {
    const numAmount = parseFloat(withdrawAmount) || 0;
    const baseFee = Math.round(numAmount * 0.05);
    const feeDiscount = Math.round(baseFee * (nftDiscountPercent / 100));
    const effectiveFee = Math.max(2, baseFee - feeDiscount);
    const receiveAmount = Math.max(0, numAmount - effectiveFee);

    return (
      <div style={{ padding: '16px 16px 90px 16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <button
          onClick={() => setWalletSubView('main')}
          className="tg-secondary-btn"
          style={{ width: 'fit-content', padding: '6px 12px', fontSize: '13px' }}
        >
          <ArrowLeft size={16} /> Назад в кошелек
        </button>

        <div className="tg-card" style={{ backgroundColor: 'var(--app-section)', padding: '18px' }}>
          <div style={{ fontSize: '18px', fontWeight: 800, marginBottom: '4px' }}>{t('withdrawMrg')}</div>
          <div style={{ fontSize: '12px', color: 'var(--app-hint)', marginBottom: '16px' }}>
            {t('toExternalTonWallet')}
          </div>

          <form onSubmit={handleWithdrawSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Connected Destination Address */}
            <div>
              <label style={{ fontSize: '11px', color: 'var(--app-hint)', display: 'block', marginBottom: '4px' }}>
                {t('destinationTonAddress')}
              </label>
              <div
                style={{
                  padding: '10px 12px',
                  borderRadius: '12px',
                  backgroundColor: 'var(--app-fill)',
                  border: '1px solid var(--app-separator)',
                  fontSize: '12px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {isTonConnected ? tonAddress : 'Кошелек не подключен'}
                </span>
                <Lock size={14} color="var(--app-hint)" />
              </div>
            </div>

            {/* Withdraw Amount */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <label style={{ fontSize: '11px', color: 'var(--app-hint)' }}>{t('withdrawAmount')}</label>
                <button
                  type="button"
                  onClick={() => setWithdrawAmount(Math.floor(inAppBalance).toString())}
                  style={{ background: 'none', color: 'var(--app-accent)', fontSize: '11px', fontWeight: 700 }}
                >
                  {t('useMax')} ({formatMRG(inAppBalance)} MRG)
                </button>
              </div>

              <input
                type="number"
                min="500"
                step="1"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '12px',
                  backgroundColor: 'var(--app-fill)',
                  border: '1px solid var(--app-separator)',
                  color: '#ffffff',
                  fontSize: '16px',
                  fontWeight: 700,
                  outline: 'none',
                }}
              />
              <span style={{ fontSize: '11px', color: 'var(--app-hint)', marginTop: '4px', display: 'block' }}>
                {t('minimumWithdrawal')}
              </span>
            </div>

            {/* Fee Breakdown */}
            <div style={{ backgroundColor: 'var(--app-fill)', padding: '12px', borderRadius: '12px', fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--app-hint)' }}>{t('networkFee')}:</span>
                <span style={{ fontWeight: 600 }}>{effectiveFee} MRG</span>
              </div>
              {nftDiscountPercent > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--app-green)' }}>
                  <span>Скидка Genesis NFT (-{nftDiscountPercent}%):</span>
                  <span style={{ fontWeight: 700 }}>-{feeDiscount} MRG</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--app-separator)', paddingTop: '6px', fontSize: '14px', fontWeight: 800 }}>
                <span>{t('youWillReceive')}:</span>
                <span style={{ color: 'var(--app-green)' }}>{receiveAmount} MRG</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={!isTonConnected || numAmount < 500 || numAmount > inAppBalance}
              className="btn-primary"
              style={{ padding: '14px', borderRadius: '14px', fontSize: '15px', fontWeight: 800, justifyContent: 'center' }}
            >
              {t('confirmWithdraw')}
            </button>
          </form>
        </div>
      </div>
    );
  }

  /* Subview: Buy on DEX */
  if (walletSubView === 'buy_dex') {
    return (
      <div style={{ padding: '16px 16px 90px 16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <button
          onClick={() => setWalletSubView('main')}
          className="tg-secondary-btn"
          style={{ width: 'fit-content', padding: '6px 12px', fontSize: '13px' }}
        >
          <ArrowLeft size={16} /> Назад в кошелек
        </button>

        <div className="tg-card" style={{ backgroundColor: 'var(--app-section)', padding: '18px' }}>
          <div style={{ fontSize: '18px', fontWeight: 800, marginBottom: '4px' }}>{t('buyMrgOnDex')}</div>
          <p style={{ fontSize: '12px', color: 'var(--app-hint)', marginBottom: '16px' }}>
            {t('buyOnTonDexDesc')}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
            <div style={{ backgroundColor: 'var(--app-fill)', padding: '12px', borderRadius: '12px' }}>
              <span style={{ fontSize: '11px', color: 'var(--app-hint)', display: 'block', marginBottom: '4px' }}>
                {t('mrgJettonContract')}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, wordBreak: 'break-all' }}>
                  {JETTON_CONTRACT}
                </span>
                <button
                  onClick={handleCopyContract}
                  style={{ background: 'none', color: 'var(--app-accent)', padding: '4px', flexShrink: 0, marginLeft: '8px' }}
                >
                  {copiedContract ? <Check size={16} color="var(--app-green)" /> : <Copy size={16} />}
                </button>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <a
              href="https://dedust.io"
              target="_blank"
              rel="noreferrer"
              className="btn-primary"
              style={{ padding: '12px', borderRadius: '12px', fontSize: '13px', justifyContent: 'center', textDecoration: 'none' }}
            >
              <ExternalLink size={16} /> Купить на DeDust.io
            </a>
            <a
              href="https://sgram.fi"
              target="_blank"
              rel="noreferrer"
              className="tg-secondary-btn"
              style={{ padding: '12px', borderRadius: '12px', fontSize: '13px', justifyContent: 'center', textDecoration: 'none' }}
            >
              <ExternalLink size={16} /> Купить на SGRAM.fi / STON.fi
            </a>
          </div>
        </div>
      </div>
    );
  }

  /* Subview: Account Verification / KYC */
  if (walletSubView === 'kyc') {
    return (
      <div style={{ padding: '16px 16px 90px 16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <button
          onClick={() => setWalletSubView('main')}
          className="tg-secondary-btn"
          style={{ width: 'fit-content', padding: '6px 12px', fontSize: '13px' }}
        >
          <ArrowLeft size={16} /> Назад в кошелек
        </button>

        <div className="tg-card" style={{ backgroundColor: 'var(--app-section)', padding: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <ShieldCheck size={22} color="var(--app-green)" />
            <span style={{ fontSize: '18px', fontWeight: 800 }}>Верификация аккаунта</span>
          </div>

          <div style={{ backgroundColor: 'var(--app-fill)', padding: '14px', borderRadius: '14px', marginBottom: '16px' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FileText size={16} color="var(--app-accent)" /> Напишите на листе бумаги:
            </div>
            <ul style={{ fontSize: '12px', color: 'var(--app-hint)', paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <li>1. <strong>MRG</strong></li>
              <li>2. Ваш Telegram Username: <strong>@{user.username || 'username'}</strong></li>
              <li>3. Ваш TGID: <strong>{user.id}</strong></li>
              <li>4. Сегодняшняя дата: <strong>{new Date().toLocaleDateString('ru-RU')}</strong></li>
              <li>5. Текст: <strong>"I am not a robot"</strong></li>
            </ul>
          </div>

          <div style={{ backgroundColor: 'var(--app-fill)', padding: '14px', borderRadius: '14px', marginBottom: '16px' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Video size={16} color="var(--app-gold)" /> Запишите 5-секундное видео:
            </div>
            <p style={{ fontSize: '12px', color: 'var(--app-hint)', lineHeight: 1.5, margin: 0 }}>
              Держите лист перед собой, посмотрите в камеру и четко произнесите на английском: <em>"I am not a robot"</em>.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button
              onClick={handleCopyTgid}
              className="tg-secondary-btn"
              style={{ padding: '10px', borderRadius: '12px', fontSize: '13px', justifyContent: 'center' }}
            >
              {copiedTgid ? <Check size={16} color="var(--app-green)" /> : <Copy size={16} />}
              <span>{copiedTgid ? 'TGID Скопирован!' : `Копировать TGID (${user.id})`}</span>
            </button>

            <a
              href="https://t.me/MRG_Verification_bot"
              target="_blank"
              rel="noreferrer"
              className="btn-primary"
              style={{ padding: '12px', borderRadius: '12px', fontSize: '14px', justifyContent: 'center', textDecoration: 'none' }}
            >
              Отправить видео в @MRG_Verification_bot
            </a>
          </div>
        </div>
      </div>
    );
  }

  /* Subview: Genesis NFT */
  if (walletSubView === 'genesis_nft') {
    return (
      <div style={{ padding: '16px 16px 90px 16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <button
          onClick={() => setWalletSubView('main')}
          className="tg-secondary-btn"
          style={{ width: 'fit-content', padding: '6px 12px', fontSize: '13px' }}
        >
          <ArrowLeft size={16} /> Назад в кошелек
        </button>

        <div className="tg-card" style={{ backgroundColor: 'var(--app-section)', padding: '18px' }}>
          <div style={{ fontSize: '18px', fontWeight: 800, marginBottom: '6px' }}>Margcoin Genesis NFT</div>
          <p style={{ fontSize: '12px', color: 'var(--app-hint)', marginBottom: '16px' }}>
            Владение NFT дает мгновенное освобождение от KYC и пожизненную скидку на комиссии вывода до 50%.
          </p>

          <div style={{ backgroundColor: 'rgba(48, 209, 88, 0.12)', border: '1px solid rgba(48, 209, 88, 0.3)', padding: '12px', borderRadius: '12px', marginBottom: '16px' }}>
            <div style={{ fontWeight: 800, fontSize: '13px', color: 'var(--app-green)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={16} /> Главное правило
            </div>
            <div style={{ fontSize: '12px', color: 'var(--app-text)', marginTop: '4px' }}>
              Храните минимум 1 NFT: Верификация аккаунта НЕ требуется!
            </div>
          </div>

          {/* Rarity Tiers */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', backgroundColor: 'var(--app-fill)', borderRadius: '10px', fontSize: '13px' }}>
              <span>Common NFT</span>
              <span style={{ fontWeight: 700, color: 'var(--app-accent)' }}>-10% комиссия</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', backgroundColor: 'var(--app-fill)', borderRadius: '10px', fontSize: '13px' }}>
              <span>Rare NFT</span>
              <span style={{ fontWeight: 700, color: 'var(--app-gold)' }}>-20% комиссия</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', backgroundColor: 'var(--app-fill)', borderRadius: '10px', fontSize: '13px' }}>
              <span>Mythic NFT</span>
              <span style={{ fontWeight: 700, color: 'var(--app-purple)' }}>-35% комиссия</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', backgroundColor: 'var(--app-fill)', borderRadius: '10px', fontSize: '13px' }}>
              <span>Любые 3 NFT (Стек)</span>
              <span style={{ fontWeight: 800, color: 'var(--app-green)' }}>-50% МАКСИМУМ</span>
            </div>
          </div>

          <a
            href="https://getgems.io/margcoingenesis"
            target="_blank"
            rel="noreferrer"
            className="btn-primary"
            style={{ padding: '12px', borderRadius: '12px', fontSize: '14px', justifyContent: 'center', textDecoration: 'none' }}
          >
            <ExternalLink size={16} /> Открыть на GetGems.io
          </a>
        </div>
      </div>
    );
  }

  /* Default Subview: Main Wallet Overview */
  return (
    <div style={{ padding: '16px 16px 90px 16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* Total Balance Card */}
      <div
        className="tg-card"
        style={{
          backgroundColor: 'var(--app-section)',
          padding: '20px 18px',
          background: 'linear-gradient(135deg, var(--app-section) 0%, rgba(34, 154, 240, 0.12) 100%)',
        }}
      >
        <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--app-hint)' }}>
          {t('totalMrgHolding')}
        </span>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', margin: '8px 0' }}>
          <span style={{ fontSize: '36px', fontWeight: 900, color: 'var(--app-text)', fontVariantNumeric: 'tabular-nums' }}>
            {formatMRG(totalHolding)}
          </span>
          <span style={{ fontSize: '18px', fontWeight: 700, color: 'var(--app-hint)' }}>MRG</span>
        </div>

        <p style={{ fontSize: '13px', color: 'var(--app-hint)', margin: '0 0 16px 0' }}>
          ≈ ${(totalHolding * MRG_PRICE_USD).toFixed(2)} USD
        </p>

        {/* Breakdown row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', paddingTop: '12px', borderTop: '1px solid var(--app-separator)' }}>
          <div>
            <span style={{ fontSize: '11px', color: 'var(--app-hint)' }}>{t('inApp')}:</span>
            <div style={{ fontSize: '15px', fontWeight: 700, marginTop: '2px' }}>
              {formatMRG(inAppBalance)} MRG
            </div>
          </div>
          <div>
            <span style={{ fontSize: '11px', color: 'var(--app-hint)' }}>{t('tonWallet')}:</span>
            <div style={{ fontSize: '15px', fontWeight: 700, marginTop: '2px' }}>
              {isTonConnected ? `${formatMRG(tonWalletBalance)} MRG` : 'Не подключен'}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <button
          onClick={() => {
            haptic('medium');
            setWalletSubView('withdraw');
          }}
          className="btn-primary"
          style={{ padding: '14px', borderRadius: '16px', fontSize: '14px', justifyContent: 'center' }}
        >
          <ArrowUpRight size={18} /> {t('withdrawMrg')}
        </button>

        <button
          onClick={() => {
            haptic('medium');
            setWalletSubView('buy_dex');
          }}
          className="tg-secondary-btn"
          style={{ padding: '14px', borderRadius: '16px', fontSize: '14px', justifyContent: 'center' }}
        >
          <TrendingUp size={18} color="var(--app-green)" /> {t('buyMrgOnDex')}
        </button>
      </div>

      {/* TON Connect Card */}
      <div className="tg-card" style={{ backgroundColor: 'var(--app-section)', padding: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: 'var(--app-fill)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Wallet size={20} color="var(--app-accent)" />
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 700 }}>Tonkeeper / GRAM Connect</div>
              <div style={{ fontSize: '11px', color: 'var(--app-hint)' }}>
                {isTonConnected ? 'Синхронизирован' : 'Подключите для авто-разблокировки уровней'}
              </div>
            </div>
          </div>

          <button
            onClick={isTonConnected ? disconnectTonWallet : connectTonWallet}
            className={isTonConnected ? 'tg-secondary-btn' : 'btn-primary'}
            style={{ padding: '8px 12px', borderRadius: '10px', fontSize: '12px' }}
          >
            {isTonConnected ? 'Отключить' : 'Подключить'}
          </button>
        </div>
      </div>

      {/* Security & Perks Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <div
          onClick={() => {
            haptic('selection');
            setWalletSubView('kyc');
          }}
          className="tg-card"
          style={{ backgroundColor: 'var(--app-section)', padding: '14px', cursor: 'pointer' }}
        >
          <ShieldCheck size={20} color="var(--app-green)" style={{ marginBottom: '6px' }} />
          <div style={{ fontWeight: 700, fontSize: '13px' }}>Верификация KYC</div>
          <div style={{ fontSize: '11px', color: 'var(--app-hint)', marginTop: '2px' }}>
            Видео инструкция →
          </div>
        </div>

        <div
          onClick={() => {
            haptic('selection');
            setWalletSubView('genesis_nft');
          }}
          className="tg-card"
          style={{ backgroundColor: 'var(--app-section)', padding: '14px', cursor: 'pointer' }}
        >
          <Sparkles size={20} color="var(--app-gold)" style={{ marginBottom: '6px' }} />
          <div style={{ fontWeight: 700, fontSize: '13px' }}>Genesis NFT Pass</div>
          <div style={{ fontSize: '11px', color: 'var(--app-hint)', marginTop: '2px' }}>
            Скидка до 50% →
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="tg-card" style={{ backgroundColor: 'var(--app-section)', padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--app-separator)', fontSize: '13px', fontWeight: 700, color: 'var(--app-hint)' }}>
          {t('recentTransactions')}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {transactions.map((tx) => (
            <div
              key={tx.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                borderBottom: '1px solid var(--app-separator)',
              }}
            >
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600 }}>
                  {tx.type === 'mining_claim'
                    ? 'Сбор облачного майнинга'
                    : tx.type === 'daily_checkin'
                    ? 'Ежедневный вход'
                    : tx.type === 'squad_commission'
                    ? 'Комиссия сквада'
                    : tx.type === 'withdrawal'
                    ? 'Вывод на кошелек'
                    : 'Награда за задание'}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--app-hint)' }}>
                  {new Date(tx.timestamp).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span
                  style={{
                    fontSize: '14px',
                    fontWeight: 700,
                    color: tx.type === 'withdrawal' ? 'var(--app-destructive)' : 'var(--app-green)',
                  }}
                >
                  {tx.type === 'withdrawal' ? `-${tx.amount}` : `+${tx.amount}`} MRG
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
