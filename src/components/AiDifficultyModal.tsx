import React from 'react';
import { Bot, X, Zap } from 'lucide-react';
import { AIDifficulty } from '../types';

interface AiDifficultyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDifficulty: (difficulty: AIDifficulty) => void;
}

export const AiDifficultyModal: React.FC<AiDifficultyModalProps> = ({
  isOpen,
  onClose,
  onSelectDifficulty,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-[#121921] border border-white/10 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-amber-400" />
            <h3 className="font-cinzel text-lg font-bold text-white">Select AI Difficulty</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3 mb-6">
          {/* EASY */}
          <div
            onClick={() => onSelectDifficulty('easy')}
            className="p-4 rounded-xl border border-white/10 hover:border-emerald-400 bg-white/5 hover:bg-emerald-500/10 cursor-pointer transition flex items-center justify-between group"
          >
            <div>
              <div className="font-bold text-white text-sm group-hover:text-emerald-400 transition flex items-center gap-1.5">
                <span>Rookie Bot (Easy)</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Beginner
                </span>
              </div>
              <div className="text-xs text-gray-400 mt-1">
                Gentle pace, occasional misaims, great for learning table position.
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-400 shrink-0 ml-3">
              +50 XP
            </span>
          </div>

          {/* MEDIUM */}
          <div
            onClick={() => onSelectDifficulty('medium')}
            className="p-4 rounded-xl border border-amber-500/30 hover:border-amber-400 bg-amber-500/5 hover:bg-amber-500/10 cursor-pointer transition flex items-center justify-between group"
          >
            <div>
              <div className="font-bold text-amber-300 text-sm group-hover:text-amber-400 transition flex items-center gap-1.5">
                <span>Club Challenger (Medium)</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Balanced
                </span>
              </div>
              <div className="text-xs text-gray-400 mt-1">
                Calculates cut angles, consistent speed control, solid break shots.
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-amber-400 shrink-0 ml-3">
              +150 XP
            </span>
          </div>

          {/* HARD */}
          <div
            onClick={() => onSelectDifficulty('hard')}
            className="p-4 rounded-xl border border-rose-500/30 hover:border-rose-400 bg-rose-500/5 hover:bg-rose-500/10 cursor-pointer transition flex items-center justify-between group"
          >
            <div>
              <div className="font-bold text-rose-300 text-sm group-hover:text-rose-400 transition flex items-center gap-1.5">
                <span>Grandmaster Cue (Hard)</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  Pro
                </span>
              </div>
              <div className="text-xs text-gray-400 mt-1">
                Pinpoint ghost ball cuts, high bank accuracy, punishing safety play.
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-rose-400 shrink-0 ml-3 flex items-center gap-1">
              <Zap className="w-3 h-3 text-rose-400" /> +300 XP
            </span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 bg-white/10 hover:bg-white/15 text-gray-300 rounded-lg text-xs font-semibold cursor-pointer transition"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};
