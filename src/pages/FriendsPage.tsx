import React, { useState } from 'react';
import {
  Users,
  Copy,
  Share2,
  Bell,
  Globe,
  Check,
  Percent,
} from 'lucide-react';
import { useMrg } from '../context/MrgContext';
import { LanguageModal } from '../components/LanguageModal';
import { MRG_PRICE_USD, formatMRG } from '../data/mrgMath';

export const FriendsPage: React.FC = () => {
  const {
    user,
    friendsSquad,
    unclaimedCommission,
    claimCommission,
    nudgeFriend,
    currentLanguageOption,
    t,
    haptic,
  } = useMrg();

  const [isLangModalOpen, setIsLangModalOpen] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const referralLink = `https://t.me/mrgminerbot/app?startapp=ref_${user.id}`;

  const handleCopy = () => {
    haptic('medium');
    navigator.clipboard?.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    haptic('medium');
    const text = encodeURIComponent('🚀 Присоединяйся к MRG Tasks и начни майнить токены вместе со мной!');
    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${text}`;
    if (typeof window !== 'undefined' && window.Telegram?.WebApp?.openTelegramLink) {
      window.Telegram.WebApp.openTelegramLink(shareUrl);
    } else {
      window.open(shareUrl, '_blank');
    }
  };

  const totalEarnedFromSquad = friendsSquad.reduce((sum, f) => sum + f.earnedForYouMRG, 0);

  return (
    <div style={{ padding: '16px 16px 90px 16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* Top Bar with Language selector */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: '18px', fontWeight: 800 }}>{t('referralSquad')}</div>

        <button
          onClick={() => setIsLangModalOpen(true)}
          className="tg-secondary-btn"
          style={{ padding: '6px 10px', fontSize: '12px' }}
        >
          <Globe size={14} />
          <span>{currentLanguageOption.flag} {currentLanguageOption.nativeName}</span>
        </button>
      </div>

      {/* Commission Pool Hero Card */}
      <div
        className="tg-card"
        style={{
          backgroundColor: 'var(--app-section)',
          padding: '18px 16px',
          background: 'linear-gradient(135deg, var(--app-section) 0%, rgba(245, 166, 35, 0.08) 100%)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--app-hint)' }}>
            {t('commissionPool')}
          </span>
          <span className="tg-badge tg-badge-gold">
            <Percent size={11} /> {t('rate10Percent')}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', margin: '8px 0' }}>
          <span style={{ fontSize: '34px', fontWeight: 900, color: 'var(--app-text)', fontVariantNumeric: 'tabular-nums' }}>
            {unclaimedCommission.toFixed(3)}
          </span>
          <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--app-hint)' }}>MRG</span>
        </div>

        <p style={{ fontSize: '12px', color: 'var(--app-hint)', margin: '0 0 14px 0' }}>
          ≈ ${(unclaimedCommission * MRG_PRICE_USD).toFixed(4)} · {t('squadMiningDesc')}
        </p>

        <button
          onClick={claimCommission}
          disabled={unclaimedCommission <= 0}
          className={unclaimedCommission > 0 ? 'btn-primary' : 'tg-secondary-btn'}
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '14px',
            fontWeight: 800,
            fontSize: '14px',
            justifyContent: 'center',
          }}
        >
          {unclaimedCommission > 0 ? t('claimCommissionBtn') : t('noCommissionToClaim')}
        </button>
      </div>

      {/* Invite Friends & Perks */}
      <div className="tg-card" style={{ backgroundColor: 'var(--app-section)', padding: '16px' }}>
        <div style={{ fontWeight: 800, fontSize: '16px', marginBottom: '4px' }}>
          {t('get100ForInvite')}
        </div>
        <p style={{ fontSize: '12px', color: 'var(--app-hint)', margin: '0 0 14px 0' }}>
          {t('get100Desc')}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px', fontSize: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--app-green)' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'currentColor' }} />
            <span>{t('instantRewardPerk')}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--app-accent)' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'currentColor' }} />
            <span>{t('recurringCommissionPerk')}</span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <button
            onClick={handleShare}
            className="btn-primary"
            style={{ padding: '12px', borderRadius: '12px', fontSize: '13px', justifyContent: 'center' }}
          >
            <Share2 size={16} /> {t('inviteFriendsBtn')}
          </button>
          <button
            onClick={handleCopy}
            className="tg-secondary-btn"
            style={{ padding: '12px', borderRadius: '12px', fontSize: '13px', justifyContent: 'center' }}
          >
            {copied ? <Check size={16} color="var(--app-green)" /> : <Copy size={16} />}
            <span>{copied ? 'Скопировано!' : t('copyLinkBtn')}</span>
          </button>
        </div>
      </div>

      {/* Squad Members List */}
      <div
        className="tg-card"
        style={{
          backgroundColor: 'var(--app-section)',
          padding: 0,
          overflow: 'hidden',
        }}
      >
        <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--app-separator)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--app-hint)' }}>
            {t('squadMembersTitle')} ({friendsSquad.length})
          </span>
          <span style={{ fontSize: '12px', color: 'var(--app-hint)' }}>
            Всего: +{formatMRG(totalEarnedFromSquad)} MRG
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {friendsSquad.map((friend) => (
            <div
              key={friend.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                borderBottom: '1px solid var(--app-separator)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--app-fill)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                  }}
                >
                  <Users size={18} color="var(--app-accent)" />
                  {friend.isOnline && (
                    <span
                      style={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--app-green)',
                        border: '2px solid var(--app-section)',
                      }}
                    />
                  )}
                </div>

                <div>
                  <div style={{ fontWeight: 700, fontSize: '14px' }}>{friend.name}</div>
                  <div style={{ fontSize: '11px', color: 'var(--app-hint)' }}>
                    Lv {friend.level} · {friend.speedTHs.toFixed(2)} TH/s · +{friend.commissionCutMRG} MRG/день
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--app-green)' }}>
                    +{friend.earnedForYouMRG}
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--app-hint)' }}>MRG</div>
                </div>

                <button
                  onClick={() => nudgeFriend(friend.id)}
                  className="tg-secondary-btn"
                  style={{
                    padding: '6px 10px',
                    fontSize: '11px',
                    color: friend.nudged ? 'var(--app-green)' : 'inherit',
                  }}
                >
                  <Bell size={12} /> {friend.nudged ? t('justNudged') : t('nudgeFriend')}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <LanguageModal isOpen={isLangModalOpen} onClose={() => setIsLangModalOpen(false)} />
    </div>
  );
};
