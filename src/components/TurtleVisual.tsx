import React, { useState } from 'react';
import { Eye, Waves, Sparkles, Volume2 } from 'lucide-react';

interface TurtleVisualProps {
  isSpeaking: boolean;
  isBreathing: boolean;
  breathPhase?: 'inhale' | 'hold-in' | 'exhale' | 'hold-out';
}

export const TurtleVisual: React.FC<TurtleVisualProps> = ({
  isSpeaking,
  isBreathing,
  breathPhase,
}) => {
  const [viewMode, setViewMode] = useState<'panoramic' | 'portrait'>('panoramic');

  const panoramicSrc = '/src/assets/images/turtle_night_beach_1791198498773.jpg';
  const portraitSrc = '/src/assets/images/turtle_portrait_1791198511008.jpg';

  const currentSrc = viewMode === 'panoramic' ? panoramicSrc : portraitSrc;

  // Compute glowing aura strength based on breathing or speech
  let glowClasses = 'border-teal-500/20 shadow-cyan-950/40';
  if (isSpeaking) {
    glowClasses = 'border-cyan-400/80 shadow-[0_0_50px_rgba(34,211,238,0.35)] animate-pulse';
  } else if (isBreathing) {
    if (breathPhase === 'inhale') {
      glowClasses = 'border-teal-400/80 shadow-[0_0_45px_rgba(45,212,191,0.4)] transition-all duration-4000';
    } else if (breathPhase === 'exhale') {
      glowClasses = 'border-indigo-400/40 shadow-[0_0_20px_rgba(99,102,241,0.2)] transition-all duration-4000';
    }
  }

  return (
    <div className="relative w-full max-w-4xl mx-auto mb-6 group">
      {/* Decorative celestial background aura */}
      <div className="absolute -inset-1.5 bg-gradient-to-r from-teal-500/20 via-cyan-500/30 to-blue-600/20 rounded-3xl blur-xl opacity-75 group-hover:opacity-100 transition duration-1000 -z-10" />

      <div
        className={`relative overflow-hidden rounded-2xl md:rounded-3xl border ${glowClasses} bg-[#040d1a] shadow-2xl transition-all duration-700`}
      >
        {/* The Image */}
        <div className="relative aspect-[16/9] md:aspect-[21/9] w-full max-h-[380px] overflow-hidden">
          <img
            src={currentSrc}
            alt="La Tortue millénaire au bord de la plage sous les étoiles"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center transform transition-transform duration-1000 group-hover:scale-[1.02]"
          />

          {/* Bioluminescent shoreline gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#030712] via-transparent to-black/30 pointer-events-none" />

          {/* Bioluminescent wave light streaks */}
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-cyan-950/70 via-teal-900/20 to-transparent pointer-events-none" />

          {/* Active Speaking Indicator */}
          {isSpeaking && (
            <div className="absolute top-4 left-4 z-20 flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-cyan-950/80 backdrop-blur-md border border-cyan-400/50 text-cyan-200 text-xs tracking-wider animate-pulse">
              <Volume2 className="w-3.5 h-3.5 text-cyan-300 animate-bounce" />
              <span className="font-cinzel">L'Ancienne murmure...</span>
            </div>
          )}

          {/* Active Breathing Indicator */}
          {isBreathing && breathPhase && (
            <div className="absolute top-4 left-4 z-20 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-950/85 backdrop-blur-md border border-teal-400/60 text-teal-200 text-xs">
              <Waves className="w-3.5 h-3.5 text-teal-300 animate-spin" />
              <span className="font-cinzel uppercase tracking-widest font-semibold text-[11px]">
                {breathPhase === 'inhale' && 'Inspiration de la Marée'}
                {breathPhase === 'hold-in' && 'Plénitude des Profondeurs'}
                {breathPhase === 'exhale' && 'Reflux de l\'Écume'}
                {breathPhase === 'hold-out' && 'Calme de l\'Abysse'}
              </span>
            </div>
          )}

          {/* View mode toggle button */}
          <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 bg-slate-950/80 backdrop-blur-md p-1 rounded-xl border border-slate-700/60 shadow-lg text-xs">
            <button
              onClick={() => setViewMode('panoramic')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                viewMode === 'panoramic'
                  ? 'bg-cyan-500/20 text-cyan-300 font-medium border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Vue du rivage nocturne"
            >
              <Waves className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Rivage</span>
            </button>
            <button
              onClick={() => setViewMode('portrait')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                viewMode === 'portrait'
                  ? 'bg-cyan-500/20 text-cyan-300 font-medium border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Regard bienveillant de la tortue"
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Regard</span>
            </button>
          </div>

          {/* Bottom badge description */}
          <div className="absolute bottom-3 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
              <p className="text-xs text-cyan-200/90 drop-shadow-md font-cinzel tracking-wider">
                Moana-Pono · Gardienne des Marées Nocturnes
              </p>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-slate-300/80 bg-slate-900/60 backdrop-blur-sm px-2.5 py-1 rounded-full border border-slate-800">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-300" /> Nuit étoilée
              </span>
              <span>·</span>
              <span>Ressac à marée haute</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
