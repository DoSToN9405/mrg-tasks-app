import React from 'react';
import { Check, X } from 'lucide-react';
import { useMrg } from '../context/MrgContext';
import { LANGUAGES } from '../data/translations';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const LanguageModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { language, setLanguage, t, haptic } = useMrg();

  if (!isOpen) return null;

  const handleSelect = (code: string) => {
    haptic('medium');
    setLanguage(code);
    setTimeout(onClose, 150);
  };

  return (
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
      onClick={onClose}
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
          padding: '20px 16px calc(24px + env(safe-area-inset-bottom, 0px)) 16px',
          maxHeight: '80vh',
          overflowY: 'auto',
          backgroundColor: 'var(--app-section)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div style={{ fontSize: '18px', fontWeight: 800 }}>{t('selectLanguage')}</div>
          <button onClick={onClose} style={{ background: 'none', color: 'var(--app-hint)' }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ fontSize: '13px', color: 'var(--app-hint)', marginBottom: '16px' }}>
          {t('chooseLanguageDesc')}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {LANGUAGES.map((l) => {
            const isSelected = language === l.code;
            return (
              <button
                key={l.code}
                onClick={() => handleSelect(l.code)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  borderRadius: '14px',
                  backgroundColor: isSelected ? 'var(--app-accent-soft)' : 'var(--app-fill)',
                  border: isSelected ? '1px solid var(--app-accent)' : '1px solid var(--app-separator)',
                  color: 'var(--app-text)',
                  textAlign: 'left',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '24px' }}>{l.flag}</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '14px' }}>{l.nativeName}</div>
                    <div style={{ fontSize: '12px', color: 'var(--app-hint)' }}>{l.name}</div>
                  </div>
                </div>

                {isSelected && (
                  <span
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--app-accent)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Check size={14} color="#fff" strokeWidth={3} />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
