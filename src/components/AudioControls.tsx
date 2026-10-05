import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Sparkles, Bell } from 'lucide-react';
import { oceanAudio } from '../utils/audio';

export const AudioControls: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.4);
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    oceanAudio.setVolume(volume);
  }, [volume]);

  const toggleSound = async () => {
    setHasInteracted(true);
    if (isPlaying) {
      oceanAudio.stop();
      setIsPlaying(false);
    } else {
      await oceanAudio.start(volume);
      setIsPlaying(true);
    }
  };

  const handleChime = () => {
    oceanAudio.playChime();
  };

  return (
    <div className="flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-3 py-2 rounded-2xl border border-cyan-500/20 shadow-xl">
      <button
        onClick={toggleSound}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
          isPlaying
            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_15px_rgba(34,211,238,0.2)]'
            : 'bg-slate-800/80 text-slate-300 hover:text-white border border-slate-700/50'
        }`}
        title={isPlaying ? "Désactiver l'ambiance des vagues" : "Écouter le ressac des vagues nocturnes"}
      >
        {isPlaying ? (
          <>
            <Volume2 className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span className="hidden sm:inline">Ressac marin</span>
          </>
        ) : (
          <>
            <VolumeX className="w-4 h-4 text-slate-400" />
            <span className="hidden sm:inline">Écouter la mer</span>
          </>
        )}
      </button>

      {isPlaying && (
        <div className="flex items-center gap-2 px-1">
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-16 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            title="Volume des vagues"
          />
        </div>
      )}

      <button
        onClick={handleChime}
        className="p-1.5 rounded-xl bg-slate-800/60 hover:bg-cyan-950/60 text-slate-300 hover:text-cyan-300 border border-slate-700/40 transition-colors"
        title="Faire résonner le carillon de marée"
      >
        <Bell className="w-4 h-4" />
      </button>

      {!hasInteracted && (
        <span className="text-[11px] text-cyan-300/80 hidden md:flex items-center gap-1 animate-pulse">
          <Sparkles className="w-3 h-3 text-amber-300" /> Activez le son pour l'immersion
        </span>
      )}
    </div>
  );
};
