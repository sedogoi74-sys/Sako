import React, { useState, useEffect } from 'react';
import { Waves, Play, Pause, RotateCcw, Heart, Sparkles } from 'lucide-react';
import { oceanAudio } from '../utils/audio';

interface TidalBreathingProps {
  onPhaseChange?: (phase: 'inhale' | 'hold-in' | 'exhale' | 'hold-out', active: boolean) => void;
}

export const TidalBreathing: React.FC<TidalBreathingProps> = ({ onPhaseChange }) => {
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<'inhale' | 'hold-in' | 'exhale' | 'hold-out'>('inhale');
  const [secondsLeft, setSecondsLeft] = useState(4);
  const [cyclesCompleted, setCyclesCompleted] = useState(0);

  // Box breathing: 4s inhale, 4s hold, 4s exhale, 4s hold
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isActive) {
      if (onPhaseChange) onPhaseChange(phase, true);

      timer = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            // Transition phase
            setPhase((curr) => {
              if (curr === 'inhale') return 'hold-in';
              if (curr === 'hold-in') return 'exhale';
              if (curr === 'exhale') return 'hold-out';
              setCyclesCompleted((c) => c + 1);
              oceanAudio.playChime();
              return 'inhale';
            });
            return 4;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (onPhaseChange) onPhaseChange(phase, false);
    }

    return () => clearInterval(timer);
  }, [isActive, phase, onPhaseChange]);

  const toggleBreathing = () => {
    if (!isActive) {
      // Start
      setIsActive(true);
      setSecondsLeft(4);
      setPhase('inhale');
    } else {
      setIsActive(false);
    }
  };

  const resetBreathing = () => {
    setIsActive(false);
    setPhase('inhale');
    setSecondsLeft(4);
    setCyclesCompleted(0);
    if (onPhaseChange) onPhaseChange('inhale', false);
  };

  const getPhaseInstruction = () => {
    switch (phase) {
      case 'inhale':
        return {
          title: 'Inspiration de la Marée',
          desc: 'Accueille l’air frais et la sérénité du ciel étoilé',
          scale: 'scale-125',
          color: 'from-teal-400 to-cyan-300',
        };
      case 'hold-in':
        return {
          title: 'Plénitude des Profondeurs',
          desc: 'Retiens la paix dans ton sanctuaire intérieur',
          scale: 'scale-125',
          color: 'from-cyan-400 to-blue-400',
        };
      case 'exhale':
        return {
          title: 'Reflux de l\'Écume',
          desc: 'Laisse la mer emporter tes tensions et tes doutes',
          scale: 'scale-90',
          color: 'from-blue-500 to-indigo-500',
        };
      case 'hold-out':
        return {
          title: 'Silence de l\'Abysse',
          desc: 'Repose dans la quiétude sans rien chercher à retenir',
          scale: 'scale-90',
          color: 'from-indigo-600 to-teal-700',
        };
    }
  };

  const currentInfo = getPhaseInstruction();

  return (
    <div className="max-w-3xl mx-auto bg-slate-950/70 backdrop-blur-xl border border-teal-500/20 rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-2xl text-center relative overflow-hidden">
      {/* Background bioluminescent halo */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex items-center justify-center gap-2 mb-2">
        <Waves className="w-5 h-5 text-cyan-400" />
        <h3 className="font-cinzel text-xl md:text-2xl font-bold text-slate-100">
          Le Souffle de la Marée
        </h3>
      </div>
      <p className="text-sm text-slate-400 max-w-md mx-auto mb-8 font-light">
        Synchronisez votre respiration avec le rythme lent et séculaire de la tortue marine et le reflux de l'océan.
      </p>

      {/* Main Breathing Circle */}
      <div className="relative w-64 h-64 mx-auto my-6 flex items-center justify-center">
        {/* Outer glowing rings */}
        <div
          className={`absolute inset-0 rounded-full border-2 border-dashed border-cyan-400/30 transition-transform duration-1000 ${
            isActive ? 'animate-[spin_40s_linear_infinite]' : ''
          }`}
        />

        {/* Breathing aura */}
        <div
          className={`w-48 h-48 rounded-full bg-gradient-to-br ${currentInfo.color} opacity-20 blur-xl transition-all duration-4000 transform ${
            isActive ? currentInfo.scale : 'scale-100'
          }`}
        />

        {/* Inner pulsing orb */}
        <div
          className={`relative z-10 w-44 h-44 rounded-full bg-slate-900/90 border-2 border-cyan-400/60 flex flex-col items-center justify-center p-4 transition-all duration-4000 transform ${
            isActive ? currentInfo.scale : 'scale-100'
          } shadow-[0_0_35px_rgba(34,211,238,0.3)]`}
        >
          {isActive ? (
            <>
              <span className="font-cinzel text-4xl font-bold text-cyan-200 drop-shadow-md">
                {secondsLeft}s
              </span>
              <span className="text-[11px] font-cinzel uppercase tracking-widest text-cyan-300/80 mt-1">
                {phase === 'inhale' && 'Inspirez'}
                {phase === 'hold-in' && 'Retenez'}
                {phase === 'exhale' && 'Expirez'}
                {phase === 'hold-out' && 'Silence'}
              </span>
            </>
          ) : (
            <div className="flex flex-col items-center">
              <Sparkles className="w-8 h-8 text-cyan-400 mb-2 animate-pulse" />
              <span className="font-cinzel text-sm text-slate-200 font-semibold">
                Prêt à respirer
              </span>
              <span className="text-[11px] text-slate-400 mt-1">Rythme océanique</span>
            </div>
          )}
        </div>
      </div>

      {/* Phase status text */}
      <div className="min-h-[64px] mb-6">
        <h4 className="font-cinzel text-lg font-semibold text-cyan-300 transition-all">
          {isActive ? currentInfo.title : "Calme de l'Océan"}
        </h4>
        <p className="font-quote italic text-sm text-slate-300 max-w-sm mx-auto mt-1">
          {isActive
            ? `« ${currentInfo.desc} »`
            : "Trouvez une posture confortable au bord de l'eau, relâchez vos épaules et laissez la mer vous guider."}
        </p>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={toggleBreathing}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white font-cinzel text-sm font-semibold tracking-wide shadow-lg shadow-cyan-900/30 transition-all cursor-pointer"
        >
          {isActive ? (
            <>
              <Pause className="w-4 h-4 fill-current" />
              <span>Suspendre</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              <span>Commencer la marée</span>
            </>
          )}
        </button>

        <button
          onClick={resetBreathing}
          className="p-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition-colors"
          title="Réinitialiser"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Cycles counter */}
      {cyclesCompleted > 0 && (
        <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-center gap-2 text-xs text-teal-300">
          <Heart className="w-3.5 h-3.5 text-teal-400 fill-teal-400/30" />
          <span>
            {cyclesCompleted} cycle{cyclesCompleted > 1 ? 's' : ''} de ressac complété{cyclesCompleted > 1 ? 's' : ''} · Votre esprit s'apaise
          </span>
        </div>
      )}
    </div>
  );
};
