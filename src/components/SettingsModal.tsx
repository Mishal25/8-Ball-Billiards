import React from 'react';
import { Sliders, X, RotateCcw } from 'lucide-react';
import { SettingsData } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: SettingsData;
  onUpdateSetting: <K extends keyof SettingsData>(key: K, value: SettingsData[K]) => void;
  onResetDefaults: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSetting,
  onResetDefaults,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-[#121921] border border-white/10 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-5">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-amber-400" />
            <h3 className="font-cinzel text-lg font-bold text-white">Game Settings</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3.5">
          {/* Sound FX Toggle */}
          <div className="flex items-center justify-between p-3.5 bg-white/5 rounded-xl border border-white/5">
            <div>
              <div className="text-sm font-semibold text-white">Audio Synthesizer</div>
              <div className="text-[11px] text-gray-400">
                Cue strikes, ball collisions, cushion bounces, pocket chime
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.sound}
                onChange={(e) => onUpdateSetting('sound', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
          </div>

          {/* Aim Guide Toggle */}
          <div className="flex items-center justify-between p-3.5 bg-white/5 rounded-xl border border-white/5">
            <div>
              <div className="text-sm font-semibold text-white">Extended Aim Guide</div>
              <div className="text-[11px] text-gray-400">
                Laser trajectory line & ghost ball contact projection
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.aimGuide}
                onChange={(e) => onUpdateSetting('aimGuide', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
            </label>
          </div>

          {/* Felt Color Theme */}
          <div className="flex items-center justify-between p-3.5 bg-white/5 rounded-xl border border-white/5">
            <div>
              <div className="text-sm font-semibold text-white">Table Felt Cloth</div>
              <div className="text-[11px] text-gray-400">Classic green, tournament blue, or midnight onyx</div>
            </div>
            <select
              value={settings.feltColor}
              onChange={(e) =>
                onUpdateSetting('feltColor', e.target.value as SettingsData['feltColor'])
              }
              className="bg-[#1a232d] text-white text-xs border border-white/20 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value="classic">Classic Green</option>
              <option value="tournament">Tournament Blue</option>
              <option value="midnight">Midnight Onyx</option>
            </select>
          </div>

          {/* Vibration / Haptic */}
          <div className="flex items-center justify-between p-3.5 bg-white/5 rounded-xl border border-white/5">
            <div>
              <div className="text-sm font-semibold text-white">Haptic Feedback</div>
              <div className="text-[11px] text-gray-400">Vibrate on pocket drop & fouls</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.vibration}
                onChange={(e) => onUpdateSetting('vibration', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
          </div>

          {/* AI Difficulty Default */}
          <div className="flex items-center justify-between p-3.5 bg-white/5 rounded-xl border border-white/5">
            <div>
              <div className="text-sm font-semibold text-white">Default AI Challenge</div>
              <div className="text-[11px] text-gray-400">Bot accuracy and cut-angle planning</div>
            </div>
            <select
              value={settings.aiDifficulty}
              onChange={(e) =>
                onUpdateSetting('aiDifficulty', e.target.value as SettingsData['aiDifficulty'])
              }
              className="bg-[#1a232d] text-white text-xs border border-white/20 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value="easy">Easy (Rookie)</option>
              <option value="medium">Medium (Challenger)</option>
              <option value="hard">Hard (Grandmaster)</option>
            </select>
          </div>
        </div>

        <div className="mt-6 pt-3.5 border-t border-white/10 flex items-center justify-between">
          <button
            onClick={onResetDefaults}
            className="text-xs text-rose-400 hover:text-rose-300 underline flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset to Defaults
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-semibold cursor-pointer transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
