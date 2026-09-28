import React from 'react';
import { HelpCircle, Settings, Volume2, VolumeX } from 'lucide-react';
import { UserProfileData } from '../types';

interface HeaderProps {
  userProfile: UserProfileData;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenHowToPlay: () => void;
  onOpenSettings: () => void;
  onNavigateHome: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  userProfile,
  soundEnabled,
  onToggleSound,
  onOpenHowToPlay,
  onOpenSettings,
  onNavigateHome,
}) => {
  return (
    <header className="w-full border-b border-white/10 bg-[#0d1319]/90 backdrop-blur-md sticky top-0 z-40 px-4 py-2.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo & Name */}
        <div
          onClick={onNavigateHome}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-300 via-yellow-600 to-amber-900 p-[2px] shadow-gold-glow flex items-center justify-center transition-transform group-hover:scale-105">
            <div className="w-full h-full bg-[#0d141b] rounded-[10px] flex items-center justify-center">
              <div className="w-6 h-6 rounded-full bg-black border border-white/20 flex items-center justify-center text-[11px] font-black text-white font-mono shadow-inner">
                8
              </div>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-cinzel text-xl md:text-2xl font-black tracking-wider gold-gradient-text">
                POCKET ROYALE
              </span>
              <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-400 border border-amber-500/30 rounded">
                PRO
              </span>
            </div>
            <p className="text-[10px] text-gray-400 tracking-wider hidden sm:block">
              PLAY SMART • AIM SHARP • RULE THE TABLE
            </p>
          </div>
        </div>

        {/* Live Profile Counters & Actions */}
        <div className="flex items-center gap-3 md:gap-5">
          {/* Coins Badge */}
          <div className="flex items-center gap-1.5 bg-black/40 border border-amber-500/30 px-3 py-1.5 rounded-full text-xs font-semibold text-amber-400 shadow-inner">
            <span className="w-4 h-4 rounded-full bg-amber-400 flex items-center justify-center text-[9px] font-black text-black">
              $
            </span>
            <span className="font-mono">{userProfile.coins.toLocaleString()}</span>
          </div>

          {/* Level Badge */}
          <div className="hidden sm:flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full text-xs">
            <div className="w-4 h-4 rounded bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[10px] border border-emerald-500/40">
              ★
            </div>
            <span className="text-gray-300">
              Level <strong className="text-white font-mono">{userProfile.level}</strong>
            </span>
          </div>

          {/* Quick Buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={onOpenHowToPlay}
              className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition"
              title="How to Play"
            >
              <HelpCircle className="w-5 h-5" />
            </button>
            <button
              onClick={onOpenSettings}
              className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition"
              title="Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
            <button
              onClick={onToggleSound}
              className={`p-2 rounded-lg transition ${
                soundEnabled ? 'text-emerald-400 hover:bg-emerald-500/10' : 'text-gray-500 hover:bg-white/10'
              }`}
              title={soundEnabled ? 'Mute Sound' : 'Enable Sound'}
            >
              {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
