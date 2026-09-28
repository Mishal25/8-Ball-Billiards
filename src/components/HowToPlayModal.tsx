import React from 'react';
import { BookOpen, X, Crosshair, Zap, Shield, AlertTriangle, Trophy } from 'lucide-react';

interface HowToPlayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-[#121921] border border-white/10 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4 sticky top-0 bg-[#121921] z-10">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-400" />
            <h3 className="font-cinzel text-lg font-bold text-white">How to Play Pocket Royale</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3.5 text-xs text-gray-300 leading-relaxed">
          {/* Step 1 */}
          <div className="p-3 bg-white/5 rounded-xl border border-white/5 flex gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold font-cinzel shrink-0">
              <Crosshair className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm mb-1">Aiming & Trajectory</h4>
              <p>
                Move your mouse or drag your touch around the cue ball to rotate the cue stick and
                inspect the projected laser guideline. A ghost ball preview shows the contact spot
                and the target ball deflection direction.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="p-3 bg-white/5 rounded-xl border border-white/5 flex gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold font-cinzel shrink-0">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm mb-1">Power Meter & Striking</h4>
              <p>
                Adjust shot power using the Power slider or vertical rack. Click{' '}
                <strong className="text-amber-400">STRIKE</strong> or tap the{' '}
                <kbd className="px-1.5 py-0.5 rounded bg-black/60 border border-white/20 text-white font-mono text-[10px]">
                  SPACEBAR
                </kbd>{' '}
                to release the cue stick.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="p-3 bg-white/5 rounded-xl border border-white/5 flex gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold font-cinzel shrink-0">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm mb-1">Solids vs. Stripes Groups</h4>
              <p>
                The table starts open during the break. The first legal object ball pocketed sets
                your group (<span className="text-amber-300 font-semibold">Solids 1–7</span> or{' '}
                <span className="text-sky-300 font-semibold">Stripes 9–15</span>). You must pocket all
                7 of your group's balls before legally pocketing the 8-ball.
              </p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="p-3 bg-white/5 rounded-xl border border-white/5 flex gap-3">
            <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold font-cinzel shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm mb-1">Fouls & Ball In Hand</h4>
              <p>
                Potting the cue ball (scratch), failing to make contact with any ball, or hitting
                an opponent's ball first constitutes a foul. The incoming player earns{' '}
                <strong>Ball in Hand</strong> and can reposition the cue ball anywhere on the table.
              </p>
            </div>
          </div>

          {/* Step 5 */}
          <div className="p-3 bg-white/5 rounded-xl border border-white/5 flex gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold font-cinzel shrink-0">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm mb-1">Winning or Losing on the 8-Ball</h4>
              <p>
                Pocketing the black 8-ball <em>before</em> your group is cleared results in an
                immediate loss. Pocketing the 8-ball legally once your group is cleared secures the
                Victory Royale!
              </p>
            </div>
          </div>
        </div>

        <div className="mt-5 pt-3 border-t border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-semibold text-xs rounded-lg transition cursor-pointer shadow-gold-glow"
          >
            Got It, Let's Play
          </button>
        </div>
      </div>
    </div>
  );
};
