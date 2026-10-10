import React, { useEffect } from 'react';
import { MrgProvider, useMrg } from './context/MrgContext';
import { BottomNav } from './components/BottomNav';
import { ClaimToast } from './components/ClaimToast';
import { LevelUpModal } from './components/LevelUpModal';
import { MinePage } from './pages/MinePage';
import { MinersPage } from './pages/MinersPage';
import { TasksPage } from './pages/TasksPage';
import { FriendsPage } from './pages/FriendsPage';
import { WalletPage } from './pages/WalletPage';

const AppContent: React.FC = () => {
  const { activeTab } = useMrg();

  useEffect(() => {
    const tg = typeof window !== 'undefined' ? window.Telegram?.WebApp : undefined;
    if (tg) {
      try {
        tg.ready();
        tg.expand();
        if (tg.setHeaderColor) tg.setHeaderColor('#151e27');
        if (tg.setBackgroundColor) tg.setBackgroundColor('#151e27');
      } catch (err) {
        console.warn('Telegram WebApp setup error:', err);
      }
    }
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', position: 'relative' }}>
      {/* Top Claim Toast notification */}
      <ClaimToast />

      {/* Level Up Achievement Celebration Modal */}
      <LevelUpModal />

      {/* Main View Area */}
      <main style={{ flex: 1 }}>
        {activeTab === 'mine' && <MinePage />}
        {activeTab === 'miners' && <MinersPage />}
        {activeTab === 'tasks' && <TasksPage />}
        {activeTab === 'friends' && <FriendsPage />}
        {activeTab === 'wallet' && <WalletPage />}
      </main>

      {/* Iconic Floating Bottom Navigation */}
      <BottomNav />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <MrgProvider>
      <AppContent />
    </MrgProvider>
  );
};

export default App;
