import React from 'react';
import { Trophy, AlertOctagon, RotateCw, Home } from 'lucide-react';
import { PlayerStats } from '../types';

interface MatchResultModalProps {
  isOpen: boolean;
  isWinner: boolean;
  winner: PlayerStats;
  p1Stats: PlayerStats;
  coinsEarned: number;
  onRematch: () => void;
  onExitHome: () => void;
}

export const MatchResultModal: React.FC<MatchResultModalProps> = ({
  isOpen,
  isWinner,
  winner,
  p1Stats,
  coinsEarned,
  onRematch,
  onExitHome,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="bg-gradient-to-b from-[#18232e] to-[#0c1218] border border-amber-500/40 rounded-2xl max-w-md w-full p-6 sm:p-8 text-center shadow-gold-glow relative overflow-hidden">
        {/* Glow backdrop bubbles */}
        <div className="absolute -top-16 -left-16 w-32 h-32 bg-amber-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-16 -right-16 w-32 h-32 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none"></div>

        {/* Trophy / Emblem */}
        <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-700 p-0.5 shadow-gold-glow flex items-center justify-center">
          <div className="w-full h-full bg-[#11171f] rounded-[14px] flex items-center justify-center">
            {isWinner ? (
              <Trophy className="w-10 h-10 text-amber-400 animate-bounce" />
            ) : (
              <AlertOctagon className="w-10 h-10 text-rose-400" />
            )}
          </div>
        </div>

        <h2 className="font-cinzel text-2xl sm:text-3xl font-black gold-gradient-text mb-1">
          {isWinner ? 'VICTORY ROYALE!' : 'MATCH CONCLUDED'}
        </h2>
        <p className="text-xs sm:text-sm text-gray-300 mb-6">
          {isWinner
            ? `${winner.name} cleared the rack and claimed the 8-Ball crown!`
            : `${winner.name} took the match. Review angles and step up again.`}
        </p>

        {/* Match Statistics */}
        <div className="grid grid-cols-2 gap-3 mb-6 text-left">
          <div className="bg-black/40 border border-white/5 rounded-xl p-3">
            <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-semibold">
              Shots Taken
            </span>
            <span className="font-mono text-lg font-bold text-white">{p1Stats.shots}</span>
          </div>
          <div className="bg-black/40 border border-white/5 rounded-xl p-3">
            <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-semibold">
              Balls Pocketed
            </span>
            <span className="font-mono text-lg font-bold text-emerald-400">
              {p1Stats.pocketed}
            </span>
          </div>
          <div className="bg-black/40 border border-white/5 rounded-xl p-3">
            <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-semibold">
              Fouls
            </span>
            <span className="font-mono text-lg font-bold text-rose-400">{p1Stats.fouls}</span>
          </div>
          <div className="bg-black/40 border border-white/5 rounded-xl p-3">
            <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-semibold">
              Coins Bank
            </span>
            <span
              className={`font-mono text-lg font-bold ${
                coinsEarned >= 0 ? 'text-amber-400' : 'text-rose-400'
              }`}
            >
              {coinsEarned >= 0 ? `+${coinsEarned}` : `${coinsEarned}`}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onRematch}
            className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-cinzel font-black text-sm rounded-xl shadow-gold-glow transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            <RotateCw className="w-4 h-4" /> REMATCH
          </button>
          <button
            onClick={onExitHome}
            className="flex-1 py-3 bg-white/10 hover:bg-white/20 border border-white/10 text-white font-cinzel font-bold text-sm rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Home className="w-4 h-4" /> MAIN MENU
          </button>
        </div>
      </div>
    </div>
  );
};
