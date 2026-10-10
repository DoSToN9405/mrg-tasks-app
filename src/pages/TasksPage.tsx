import React, { useState, useEffect } from 'react';
import {
  Calendar,
  CheckCircle,
  ExternalLink,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useMrg } from '../context/MrgContext';
import { TaskItem } from '../types/mrg';

const STREAK_REWARDS = [
  { day: 1, reward: '+5', value: 5 },
  { day: 2, reward: '+6', value: 6 },
  { day: 3, reward: '+7', value: 7 },
  { day: 4, reward: '+8', value: 8 },
  { day: 5, reward: '+9', value: 9 },
  { day: 6, reward: '+10', value: 10 },
  { day: 7, reward: '+15', value: 15 },
];

export const TasksPage: React.FC = () => {
  const {
    tasks,
    checkinStreak,
    checkinLastDay,
    dailyCheckIn,
    startTask,
    claimTask,
    t,
  } = useMrg();

  const [now, setNow] = useState<number>(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const todayStr = new Date().toISOString().slice(0, 10);
  const isCheckedInToday = checkinLastDay === todayStr;
  const currentDayIndex = ((Math.max(1, checkinStreak) - 1) % 7) + 1;

  return (
    <div style={{ padding: '16px 16px 90px 16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* Daily Check-in Streak Card */}
      <div
        className="tg-card"
        style={{
          backgroundColor: 'var(--app-section)',
          padding: '18px 16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={18} color="var(--app-gold)" />
            <span style={{ fontSize: '16px', fontWeight: 800 }}>{t('dailyCheckIn')}</span>
          </div>

          <span className="tg-badge tg-badge-gold">
            День {currentDayIndex} / 7
          </span>
        </div>

        <p style={{ fontSize: '12px', color: 'var(--app-hint)', margin: '0 0 14px 0' }}>
          {t('dayStreakDesc', { day: currentDayIndex })}
        </p>

        {/* 7 Days Row */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: '6px',
            marginBottom: '16px',
          }}
        >
          {STREAK_REWARDS.map((item) => {
            const isPast = item.day < currentDayIndex;
            const isToday = item.day === currentDayIndex;

            return (
              <div
                key={item.day}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '8px 2px',
                  borderRadius: '12px',
                  backgroundColor: isToday
                    ? 'var(--app-accent-soft)'
                    : isPast
                    ? 'rgba(48, 209, 88, 0.12)'
                    : 'var(--app-fill)',
                  border: isToday
                    ? '1.5px solid var(--app-accent)'
                    : isPast
                    ? '1px solid rgba(48, 209, 88, 0.3)'
                    : '1px solid var(--app-separator)',
                  color: isPast ? 'var(--app-green)' : 'inherit',
                }}
              >
                <span style={{ fontSize: '10px', color: 'var(--app-hint)', fontWeight: 600 }}>
                  Д{item.day}
                </span>
                <span style={{ fontSize: '12px', fontWeight: 800, margin: '2px 0' }}>
                  {item.reward}
                </span>
                {isPast ? (
                  <CheckCircle size={12} color="var(--app-green)" />
                ) : (
                  <span style={{ fontSize: '9px', color: 'var(--app-hint)' }}>MRG</span>
                )}
              </div>
            );
          })}
        </div>

        <button
          onClick={dailyCheckIn}
          disabled={isCheckedInToday}
          className={isCheckedInToday ? 'tg-secondary-btn' : 'btn-primary'}
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '14px',
            fontWeight: 800,
            fontSize: '14px',
            justifyContent: 'center',
          }}
        >
          {isCheckedInToday ? t('checkedInBtn') : t('checkInBtn')}
        </button>
      </div>

      {/* Task List Card */}
      <div
        className="tg-card"
        style={{
          backgroundColor: 'var(--app-section)',
          padding: 0,
          overflow: 'hidden',
        }}
      >
        <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--app-separator)', fontSize: '13px', fontWeight: 700, color: 'var(--app-hint)' }}>
          {t('tasksPageTitle')}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {tasks.map((task: TaskItem) => {
            const isWaiting = task.waitingUntil && now < task.waitingUntil;
            const remaining = isWaiting ? Math.ceil((task.waitingUntil! - now) / 1000) : 0;
            const isClaimReady = !task.completed && (task.isClaimable || (task.waitingUntil && now >= task.waitingUntil));

            return (
              <div
                key={task.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 16px',
                  borderBottom: '1px solid var(--app-separator)',
                  gap: '12px',
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: '14px', color: task.completed ? 'var(--app-hint)' : 'var(--app-text)' }}>
                    {task.title}
                  </div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--app-green)', marginTop: '2px' }}>
                    {task.rewardFormatted}
                  </div>
                </div>

                <div style={{ flexShrink: 0 }}>
                  {task.completed ? (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '12px',
                        fontWeight: 700,
                        color: 'var(--app-hint)',
                        padding: '6px 10px',
                        borderRadius: '10px',
                        backgroundColor: 'var(--app-fill)',
                      }}
                    >
                      <CheckCircle size={14} color="var(--app-green)" /> Выполнено
                    </span>
                  ) : isWaiting ? (
                    <button
                      disabled
                      className="tg-secondary-btn"
                      style={{
                        padding: '8px 14px',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'wait',
                      }}
                    >
                      <Clock size={14} className="animate-spin" /> {t('waitSecBtn', { seconds: remaining })}
                    </button>
                  ) : isClaimReady ? (
                    <button
                      onClick={() => claimTask(task.id)}
                      className="btn-success"
                      style={{
                        padding: '8px 16px',
                        borderRadius: '12px',
                        fontSize: '13px',
                        fontWeight: 800,
                      }}
                    >
                      <Sparkles size={14} /> {t('claimTaskBtn')}
                    </button>
                  ) : (
                    <button
                      onClick={() => startTask(task.id)}
                      className="btn-primary"
                      style={{
                        padding: '8px 16px',
                        borderRadius: '12px',
                        fontSize: '13px',
                        fontWeight: 800,
                      }}
                    >
                      <ExternalLink size={13} /> {t('startBtn')}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
