/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { HomeScreen } from './components/HomeScreen';
import { GameScreen } from './components/GameScreen';
import { AiDifficultyModal } from './components/AiDifficultyModal';
import { HowToPlayModal } from './components/HowToPlayModal';
import { SettingsModal } from './components/SettingsModal';
import { MatchResultModal } from './components/MatchResultModal';
import {
  GameMode,
  AIDifficulty,
  UserProfileData,
  SettingsData,
  PlayerStats,
  MatchRecord,
} from './types';
import { audio } from './audio';

const DEFAULT_PROFILE: UserProfileData = {
  name: 'Mishal',
  level: 7,
  coins: 2450,
  wins: 32,
  matches: 41,
  bestStreak: 7,
};

const DEFAULT_SETTINGS: SettingsData = {
  sound: true,
  aimGuide: true,
  feltColor: 'classic',
  vibration: true,
  aiDifficulty: 'medium',
};

const DEFAULT_MATCH_HISTORY: MatchRecord[] = [
  {
    id: 'm1',
    opponent: 'Royale AI (Medium)',
    mode: 'ai',
    difficulty: 'medium',
    isWin: true,
    coinsEarned: 250,
    shots: 13,
    date: '12m ago',
  },
  {
    id: 'm2',
    opponent: 'Royale AI (Hard)',
    mode: 'ai',
    difficulty: 'hard',
    isWin: true,
    coinsEarned: 300,
    shots: 16,
    date: '48m ago',
  },
  {
    id: 'm3',
    opponent: 'Player 2 (Hotseat)',
    mode: 'pvp',
    isWin: false,
    coinsEarned: -50,
    shots: 21,
    date: '2h ago',
  },
  {
    id: 'm4',
    opponent: 'Royale AI (Medium)',
    mode: 'ai',
    difficulty: 'medium',
    isWin: true,
    coinsEarned: 250,
    shots: 11,
    date: 'Yesterday',
  },
  {
    id: 'm5',
    opponent: 'Royale AI (Easy)',
    mode: 'ai',
    difficulty: 'easy',
    isWin: true,
    coinsEarned: 150,
    shots: 9,
    date: 'Yesterday',
  },
];

export default function App() {
  // Navigation & Match State
  const [view, setView] = useState<'home' | 'game'>('home');
  const [mode, setMode] = useState<GameMode>('ai');
  const [difficulty, setDifficulty] = useState<AIDifficulty>('medium');

  // User Profile
  const [userProfile, setUserProfile] = useState<UserProfileData>(() => {
    const saved = localStorage.getItem('pocket_royale_user');
    if (saved) {
      try {
        return { ...DEFAULT_PROFILE, ...JSON.parse(saved) };
      } catch (e) {
        console.error(e);
      }
    }
    return DEFAULT_PROFILE;
  });

  // Match History (last 5 results)
  const [matchHistory, setMatchHistory] = useState<MatchRecord[]>(() => {
    const saved = localStorage.getItem('pocket_royale_history');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return DEFAULT_MATCH_HISTORY;
  });

  // Settings
  const [settings, setSettings] = useState<SettingsData>(() => {
    const saved = localStorage.getItem('pocket_royale_settings');
    if (saved) {
      try {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      } catch (e) {
        console.error(e);
      }
    }
    return DEFAULT_SETTINGS;
  });

  // Modals
  const [showAiModal, setShowAiModal] = useState<boolean>(false);
  const [showHowToPlayModal, setShowHowToPlayModal] = useState<boolean>(false);
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [showResultModal, setShowResultModal] = useState<boolean>(false);

  // Match Outcome
  const [matchResult, setMatchResult] = useState<{
    winner: PlayerStats;
    p1Stats: PlayerStats;
    coinsEarned: number;
    isWinner: boolean;
  }>({
    winner: { name: '', group: null, remaining: 0, fouls: 0, shots: 0, pocketed: 0 },
    p1Stats: { name: '', group: null, remaining: 0, fouls: 0, shots: 0, pocketed: 0 },
    coinsEarned: 0,
    isWinner: false,
  });

  // Key to force reset GameScreen when rematched
  const [gameKey, setGameKey] = useState<number>(0);

  // Sync sound settings with audio engine
  useEffect(() => {
    audio.setSoundEnabled(settings.sound);
  }, [settings.sound]);

  // Persist settings
  const handleUpdateSetting = <K extends keyof SettingsData>(
    key: K,
    value: SettingsData[K]
  ) => {
    setSettings((prev) => {
      const next = { ...prev, [key]: value };
      localStorage.setItem('pocket_royale_settings', JSON.stringify(next));
      return next;
    });
  };

  const handleResetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
    localStorage.setItem('pocket_royale_settings', JSON.stringify(DEFAULT_SETTINGS));
  };

  const handleToggleSound = () => {
    handleUpdateSetting('sound', !settings.sound);
  };

  // Start Matches
  const handleStartMatch = (selectedMode: GameMode, selectedDifficulty?: AIDifficulty) => {
    setMode(selectedMode);
    if (selectedDifficulty) {
      setDifficulty(selectedDifficulty);
    } else {
      setDifficulty(settings.aiDifficulty);
    }
    setShowAiModal(false);
    setShowResultModal(false);
    setGameKey((k) => k + 1);
    setView('game');
  };

  // Handle Match Result
  const handleMatchComplete = (
    winner: PlayerStats,
    p1Stats: PlayerStats,
    coinsEarned: number
  ) => {
    const isWinner = winner.name === userProfile.name;

    // Update Profile
    setUserProfile((prev) => {
      const next = {
        ...prev,
        matches: prev.matches + 1,
        wins: isWinner ? prev.wins + 1 : prev.wins,
        coins: Math.max(0, prev.coins + coinsEarned),
        level: isWinner && (prev.wins + 1) % 5 === 0 ? prev.level + 1 : prev.level,
        bestStreak: isWinner ? Math.max(prev.bestStreak, 1) : prev.bestStreak,
      };
      localStorage.setItem('pocket_royale_user', JSON.stringify(next));
      return next;
    });

    if (isWinner) {
      audio.playWin();
    } else {
      audio.playFoul(settings.vibration);
    }

    setMatchResult({
      winner,
      p1Stats,
      coinsEarned,
      isWinner,
    });
    setShowResultModal(true);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between text-gray-100 antialiased">
      {/* GLOBAL HEADER */}
      <Header
        userProfile={userProfile}
        soundEnabled={settings.sound}
        onToggleSound={handleToggleSound}
        onOpenHowToPlay={() => setShowHowToPlayModal(true)}
        onOpenSettings={() => setShowSettingsModal(true)}
        onNavigateHome={() => {
          setShowResultModal(false);
          setView('home');
        }}
      />

      {/* MAIN VIEW */}
      <main className="flex-1 flex flex-col items-center justify-center w-full relative z-10 px-2 sm:px-4 py-2 sm:py-3">
        {view === 'home' ? (
          <HomeScreen
            userProfile={userProfile}
            onSelectAiMode={() => setShowAiModal(true)}
            onStartMatch={(m) => handleStartMatch(m)}
            onOpenHowToPlay={() => setShowHowToPlayModal(true)}
            onOpenSettings={() => setShowSettingsModal(true)}
          />
        ) : (
          <GameScreen
            key={gameKey}
            mode={mode}
            difficulty={difficulty}
            settings={settings}
            playerName={userProfile.name}
            onMatchComplete={handleMatchComplete}
            onExitHome={() => {
              setShowResultModal(false);
              setView('home');
            }}
          />
        )}
      </main>

      {/* FOOTER */}
      <footer className="w-full border-t border-white/5 bg-[#090d10]/95 py-2.5 px-4 text-center text-xs text-gray-500 relative z-20">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-cinzel text-amber-400 font-bold">POCKET ROYALE</span>
            <span>•</span>
            <span>HTML5 Responsive Physics Web Game</span>
          </div>
          <div className="text-[11px] text-gray-400">
            Controls:{' '}
            <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-gray-200 text-[10px] font-mono">
              Mouse
            </kbd>{' '}
            or{' '}
            <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-gray-200 text-[10px] font-mono">
              Touch
            </kbd>{' '}
            to aim,{' '}
            <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-gray-200 text-[10px] font-mono">
              Space
            </kbd>{' '}
            to strike
          </div>
        </div>
      </footer>

      {/* MODALS */}
      <AiDifficultyModal
        isOpen={showAiModal}
        onClose={() => setShowAiModal(false)}
        onSelectDifficulty={(diff) => handleStartMatch('ai', diff)}
      />

      <HowToPlayModal
        isOpen={showHowToPlayModal}
        onClose={() => setShowHowToPlayModal(false)}
      />

      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        settings={settings}
        onUpdateSetting={handleUpdateSetting}
        onResetDefaults={handleResetSettings}
      />

      <MatchResultModal
        isOpen={showResultModal}
        isWinner={matchResult.isWinner}
        winner={matchResult.winner}
        p1Stats={matchResult.p1Stats}
        coinsEarned={matchResult.coinsEarned}
        onRematch={() => {
          setShowResultModal(false);
          setGameKey((k) => k + 1);
        }}
        onExitHome={() => {
          setShowResultModal(false);
          setView('home');
        }}
      />
    </div>
  );
}
