import React from 'react';
import {
  Bot,
  Users,
  Target,
  Trophy,
  BookOpen,
  Sliders,
  ChevronRight,
  ShieldCheck,
  Sparkles,
  History,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { UserProfileData, GameMode, MatchRecord } from '../types';

interface HomeScreenProps {
  userProfile: UserProfileData;
  matchHistory: MatchRecord[];
  onSelectAiMode: () => void;
  onStartMatch: (mode: GameMode) => void;
  onOpenHowToPlay: () => void;
  onOpenSettings: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  userProfile,
  matchHistory,
  onSelectAiMode,
  onStartMatch,
  onOpenHowToPlay,
  onOpenSettings,
}) => {
  const winRate =
    userProfile.matches > 0
      ? Math.round((userProfile.wins / userProfile.matches) * 100)
      : 78;

  const recentMatches = matchHistory.slice(0, 5);
  const winsCount = recentMatches.filter((m) => m.isWin).length;
  const lossesCount = recentMatches.length - winsCount;
  const netCoins = recentMatches.reduce((acc, m) => acc + m.coinsEarned, 0);

  return (
    <section className="w-full max-w-6xl mx-auto flex flex-col items-center my-auto transition-opacity duration-300 py-3 sm:py-6">
      {/* Hero Header */}
      <div className="text-center mb-6 max-w-2xl px-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-gradient-to-r from-amber-500/10 via-amber-500/20 to-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold mb-3 tracking-wider">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
          REAL-TIME 8-BALL BILLIARDS ENGINE
        </div>
        <h1 className="text-4xl sm:text-6xl font-cinzel font-black tracking-tight mb-2">
          <span className="gold-gradient-text drop-shadow-md">POCKET ROYALE</span>
        </h1>
        <p className="text-base sm:text-lg text-gray-300 font-light tracking-wide max-w-lg mx-auto italic">
          "Play Smart. Aim Sharp. Rule the Table."
        </p>
      </div>

      {/* Center Grid: Profile on Left, Modes on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 w-full items-stretch">
        {/* Player Profile Card (Left) */}
        <div className="lg:col-span-4 bg-gradient-to-b from-[#161f28]/95 to-[#0f151c]/95 border border-white/10 rounded-2xl p-6 shadow-glass-box flex flex-col justify-between backdrop-blur-md relative overflow-hidden">
          <div className="absolute -right-12 -top-12 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div>
            {/* Avatar & Title */}
            <div className="flex items-center gap-4 mb-5">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-700 p-0.5 shadow-gold-glow">
                  <div className="w-full h-full bg-[#11171f] rounded-[14px] flex items-center justify-center overflow-hidden">
                    <span className="font-cinzel text-2xl font-bold text-amber-400">
                      {userProfile.name.charAt(0)}
                    </span>
                  </div>
                </div>
                <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-black text-[10px] font-black px-1.5 py-0.5 rounded-full border border-black">
                  PRO
                </div>
              </div>
              <div>
                <h3 className="font-bold text-lg text-white">{userProfile.name}</h3>
                <p className="text-xs text-amber-400 font-mono">Rank: Royal Cue Master</p>
                <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-400">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>
                    Win Rate: <strong className="text-emerald-400">{winRate}%</strong>
                  </span>
                </div>
              </div>
            </div>

            {/* 4 Stat Boxes (2x2 Grid) */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-black/35 border border-white/5 rounded-xl p-3">
                <span className="text-[10px] text-gray-400 block mb-0.5 uppercase tracking-wider font-semibold">
                  Total Wins
                </span>
                <span className="text-xl font-bold font-mono text-emerald-400">
                  {userProfile.wins}
                </span>
              </div>
              <div className="bg-black/35 border border-white/5 rounded-xl p-3">
                <span className="text-[10px] text-gray-400 block mb-0.5 uppercase tracking-wider font-semibold">
                  Matches
                </span>
                <span className="text-xl font-bold font-mono text-white">
                  {userProfile.matches}
                </span>
              </div>
              <div className="bg-black/35 border border-white/5 rounded-xl p-3">
                <span className="text-[10px] text-gray-400 block mb-0.5 uppercase tracking-wider font-semibold">
                  Coins Bank
                </span>
                <span className="text-xl font-bold font-mono text-amber-400">
                  {userProfile.coins.toLocaleString()}
                </span>
              </div>
              <div className="bg-black/35 border border-white/5 rounded-xl p-3">
                <span className="text-[10px] text-gray-400 block mb-0.5 uppercase tracking-wider font-semibold">
                  Best Run
                </span>
                <span className="text-xl font-bold font-mono text-sky-400">
                  {userProfile.bestStreak} Win
                </span>
              </div>
            </div>

            {/* Equipped Cue Bar */}
            <div className="bg-black/40 border border-white/5 rounded-xl p-3">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-gray-300">
                  Equipped: <strong className="text-amber-400">Excalibur Maple</strong>
                </span>
                <span className="text-amber-400 font-mono text-[11px]">Tier III</span>
              </div>
              <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-amber-500 to-yellow-300 h-full rounded-full transition-all duration-500"
                  style={{ width: '82%' }}
                ></div>
              </div>
            </div>
          </div>

          {/* Daily bonus row */}
          <div className="pt-4 border-t border-white/10 mt-4 flex items-center justify-between text-xs text-gray-400">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Daily bonus claimed
            </span>
            <button
              onClick={onOpenHowToPlay}
              className="text-amber-400 hover:text-amber-300 underline font-medium cursor-pointer"
            >
              Rules
            </button>
          </div>
        </div>

        {/* Game Mode Cards (Center & Right) */}
        <div className="lg:col-span-8 flex flex-col justify-between gap-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
            {/* MODE 1: PLAY VS AI */}
            <div
              onClick={onSelectAiMode}
              className="bg-gradient-to-b from-[#18232e] to-[#10171f] border border-amber-500/30 hover:border-amber-400 rounded-2xl p-5 shadow-lg hover:shadow-gold-glow transition-all duration-300 flex flex-col justify-between group cursor-pointer"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                    <Bot className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-amber-400/10 text-amber-300 border border-amber-400/20">
                    POPULAR
                  </span>
                </div>
                <h3 className="font-cinzel text-xl font-bold text-white group-hover:text-amber-400 transition-colors">
                  PLAY VS AI
                </h3>
                <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                  Challenge the Royale Bot across Easy, Medium, or Hard AI algorithms with smart
                  break & pocket tracking.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                <span className="text-xs font-semibold text-amber-400 flex items-center gap-1">
                  Select Difficulty <ChevronRight className="w-4 h-4" />
                </span>
                <span className="text-xs font-mono text-gray-400">+150 XP</span>
              </div>
            </div>

            {/* MODE 2: 2 PLAYER LOCAL */}
            <div
              onClick={() => onStartMatch('pvp')}
              className="bg-gradient-to-b from-[#18232e] to-[#10171f] border border-emerald-500/30 hover:border-emerald-400 rounded-2xl p-5 shadow-lg hover:shadow-emerald-500/20 transition-all duration-300 flex flex-col justify-between group cursor-pointer"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                    <Users className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-emerald-400/10 text-emerald-300 border border-emerald-400/20">
                    HOTSEAT
                  </span>
                </div>
                <h3 className="font-cinzel text-xl font-bold text-white group-hover:text-emerald-400 transition-colors">
                  2 PLAYER LOCAL
                </h3>
                <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                  Pass & Play on the same screen. Player 1 & Player 2 duel under official competitive
                  8-ball rules.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                  Start Duel <ChevronRight className="w-4 h-4" />
                </span>
                <span className="text-xs font-mono text-gray-400">Pass & Play</span>
              </div>
            </div>

            {/* MODE 3: PRACTICE TABLE */}
            <div
              onClick={() => onStartMatch('practice')}
              className="bg-gradient-to-b from-[#18232e] to-[#10171f] border border-sky-500/30 hover:border-sky-400 rounded-2xl p-5 shadow-lg hover:shadow-sky-500/20 transition-all duration-300 flex flex-col justify-between group cursor-pointer"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 group-hover:scale-110 transition-transform">
                    <Target className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-sky-400/10 text-sky-300 border border-sky-400/20">
                    SOLO
                  </span>
                </div>
                <h3 className="font-cinzel text-xl font-bold text-white group-hover:text-sky-400 transition-colors">
                  PRACTICE TABLE
                </h3>
                <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                  No turn timers, no opponent. Test bank shots, power finesse, cushion angles, and
                  break mechanics freely.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                <span className="text-xs font-semibold text-sky-400 flex items-center gap-1">
                  Open Table <ChevronRight className="w-4 h-4" />
                </span>
                <span className="text-xs font-mono text-gray-400">Sandbox</span>
              </div>
            </div>
          </div>

          {/* Bottom Championship Banner */}
          <div className="bg-black/40 border border-white/10 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30 shrink-0">
                <Trophy className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="text-sm font-semibold text-white">
                  Season 1: Royal Championship Live
                </div>
                <div className="text-xs text-gray-400">
                  Clear racks cleanly with high accuracy to climb the global tier.
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={onOpenHowToPlay}
                className="flex-1 sm:flex-none px-4 py-2 text-xs font-semibold rounded-lg bg-white/10 hover:bg-white/20 text-white transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <BookOpen className="w-4 h-4" /> How to Play
              </button>
              <button
                onClick={onOpenSettings}
                className="flex-1 sm:flex-none px-4 py-2 text-xs font-semibold rounded-lg bg-white/10 hover:bg-white/20 text-white transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sliders className="w-4 h-4" /> Settings
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MATCH HISTORY SECTION */}
      <div className="w-full mt-6 bg-gradient-to-b from-[#161f28]/95 to-[#0f151c]/95 border border-white/10 rounded-2xl p-5 sm:p-6 shadow-glass-box backdrop-blur-md relative overflow-hidden">
        {/* Subtle accent glow */}
        <div className="absolute -left-16 -bottom-16 w-36 h-36 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-white/10 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400 shrink-0">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-cinzel text-base sm:text-lg font-bold text-white tracking-wide">
                MATCH HISTORY
              </h3>
              <p className="text-xs text-gray-400">
                Recent 5 encounters, outcomes, and coin winnings
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="text-gray-300">
              Last 5: <strong className="text-emerald-400 font-mono">{winsCount}W</strong> ·{' '}
              <strong className="text-rose-400 font-mono">{lossesCount}L</strong>
            </span>
            <span className="text-gray-600">•</span>
            <span className="text-gray-300">
              Net Coins:{' '}
              <strong
                className={`font-mono ${
                  netCoins >= 0 ? 'text-amber-400' : 'text-rose-400'
                }`}
              >
                {netCoins >= 0 ? `+${netCoins.toLocaleString()}` : netCoins.toLocaleString()}
              </strong>
            </span>
          </div>
        </div>

        {/* History List */}
        {recentMatches.length === 0 ? (
          <div className="py-8 text-center text-xs text-gray-500">
            No recent matches recorded yet. Step up to the table to begin your record!
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {recentMatches.map((match) => (
              <div
                key={match.id}
                className="py-3 sm:py-3.5 flex items-center justify-between gap-3 hover:bg-white/[0.02] px-2 rounded-xl transition"
              >
                {/* Left: Win/Loss Emblem + Opponent details */}
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                      match.isWin
                        ? 'bg-emerald-500/15 border-emerald-500/35 text-emerald-400'
                        : 'bg-rose-500/15 border-rose-500/35 text-rose-400'
                    }`}
                  >
                    {match.isWin ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <XCircle className="w-5 h-5" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs sm:text-sm text-white truncate">
                        vs. {match.opponent}
                      </span>
                      <span
                        className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded border ${
                          match.isWin
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                        }`}
                      >
                        {match.isWin ? 'VICTORY' : 'DEFEAT'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-gray-400 mt-0.5">
                      <span>
                        {match.mode === 'ai'
                          ? `AI Duel (${match.difficulty?.toUpperCase() || 'MEDIUM'})`
                          : match.mode === 'pvp'
                          ? '2 Player Local'
                          : 'Practice Session'}
                      </span>
                      <span>•</span>
                      <span>{match.shots} shots</span>
                      <span>•</span>
                      <span className="text-gray-500">{match.date}</span>
                    </div>
                  </div>
                </div>

                {/* Right: Coins Reward / Loss */}
                <div className="text-right shrink-0 flex items-center gap-2">
                  <div
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-full border ${
                      match.coinsEarned >= 0
                        ? 'bg-amber-500/10 border-amber-500/25 text-amber-400'
                        : 'bg-rose-500/10 border-rose-500/25 text-rose-400'
                    }`}
                  >
                    <span className="w-3.5 h-3.5 rounded-full bg-amber-400/90 flex items-center justify-center text-[8px] font-black text-black">
                      $
                    </span>
                    <span className="font-mono text-xs font-bold">
                      {match.coinsEarned >= 0
                        ? `+${match.coinsEarned}`
                        : `${match.coinsEarned}`}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
