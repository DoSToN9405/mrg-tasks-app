import React from 'react';
import { Pickaxe, Store, CheckSquare, Users, Wallet } from 'lucide-react';
import { useMrg } from '../context/MrgContext';
import { ActiveTab } from '../types/mrg';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, t, tasks, haptic } = useMrg();

  const pendingTasksCount = tasks.filter((t) => !t.completed).length;

  const rightTabs: Array<{ id: ActiveTab; label: string; icon: React.ReactNode; badge?: number }> = [
    { id: 'tasks', label: t('navTasks'), icon: <CheckSquare size={20} />, badge: pendingTasksCount > 0 ? pendingTasksCount : undefined },
    { id: 'miners', label: t('navMiners'), icon: <Store size={20} /> },
    { id: 'friends', label: t('navFriends'), icon: <Users size={20} /> },
    { id: 'wallet', label: t('navWallet'), icon: <Wallet size={20} /> },
  ];

  const handleTabChange = (tab: ActiveTab) => {
    if (activeTab !== tab) {
      haptic('light');
      setActiveTab(tab);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const isMine = activeTab === 'mine';

  return (
    <nav
      id="bottom-navigation-bar"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        maxWidth: '540px',
        margin: '0 auto',
        padding: '8px 12px calc(10px + env(safe-area-inset-bottom, 0px)) 12px',
        display: 'flex',
        alignItems: 'flex-end',
        gap: '10px',
        zIndex: 50,
        pointerEvents: 'none',
      }}
    >
      {/* Prominent floating Mine circle button on left */}
      <button
        id="nav-tab-mine"
        type="button"
        onClick={() => handleTabChange('mine')}
        aria-label={t('navMine')}
        style={{
          pointerEvents: 'auto',
          width: '62px',
          height: '62px',
          borderRadius: '50%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '2px',
          backgroundColor: isMine ? 'var(--app-accent)' : 'var(--app-section)',
          color: isMine ? '#ffffff' : 'var(--app-hint)',
          border: isMine ? '2px solid rgba(255, 255, 255, 0.3)' : '1px solid var(--app-separator)',
          boxShadow: isMine
            ? '0 8px 24px rgba(34, 154, 240, 0.45)'
            : '0 8px 24px rgba(0, 0, 0, 0.25)',
          backdropFilter: 'blur(20px)',
          transition: 'all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)',
        }}
      >
        <Pickaxe size={22} strokeWidth={isMine ? 2.6 : 2} />
        <span style={{ fontSize: '10px', fontWeight: 700 }}>{t('navMine')}</span>
      </button>

      {/* Pill bar on right containing other 4 tabs */}
      <div
        style={{
          pointerEvents: 'auto',
          flex: 1,
          height: '62px',
          borderRadius: '35px',
          backgroundColor: 'var(--app-section)',
          border: '1px solid var(--app-separator)',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)',
          backdropFilter: 'blur(20px)',
          padding: '0 8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around',
        }}
      >
        {rightTabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`nav-tab-${tab.id}`}
              type="button"
              onClick={() => handleTabChange(tab.id)}
              style={{
                flex: 1,
                height: '50px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '2px',
                background: isActive ? 'var(--app-accent-soft)' : 'none',
                borderRadius: '25px',
                position: 'relative',
                color: isActive ? 'var(--app-accent)' : 'var(--app-hint)',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ position: 'relative' }}>
                {tab.icon}
                {tab.badge !== undefined && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '-6px',
                      right: '-10px',
                      backgroundColor: 'var(--app-destructive)',
                      color: '#ffffff',
                      fontSize: '10px',
                      fontWeight: 800,
                      minWidth: '16px',
                      height: '16px',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '0 3px',
                      border: '2px solid var(--app-section)',
                    }}
                  >
                    {tab.badge > 9 ? '9+' : tab.badge}
                  </span>
                )}
              </div>
              <span
                style={{
                  fontSize: '10.5px',
                  fontWeight: isActive ? 700 : 500,
                  whiteSpace: 'nowrap',
                }}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
