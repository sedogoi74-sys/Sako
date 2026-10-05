import React, { useState } from 'react';
import { Sparkles, Bookmark, Volume2, Square, RefreshCw, Feather } from 'lucide-react';
import { turtleVoice } from '../utils/speech';
import { oceanAudio } from '../utils/audio';

interface WisdomPearlsProps {
  onSavePearl: (text: string, title?: string) => void;
  savedPearls: string[];
}

interface PearlData {
  theme: string;
  themeTitle: string;
  icon: string;
  text: string;
  explanation: string;
}

const STATIC_PEARLS: PearlData[] = [
  {
    theme: 'lenteur',
    themeTitle: 'La Lenteur & Le Temps',
    icon: '⏳',
    text: "Le monde court après des mirages en croyant devancer le temps. Moi qui ai franchi des siècles de houle, je te le dis : la lenteur n'est point du retard, c'est l'art d'arriver entier là où tu dois être.",
    explanation: 'Ralentir n’est pas renoncer : c’est s’ancrer pour ne pas être dispersé par les tempêtes futiles.',
  },
  {
    theme: 'tempete',
    themeTitle: 'Les Tempêtes & L’Épreuve',
    icon: '🌊',
    text: "Ne livre pas bataille à la vague géante à la surface où l'écume déchire tout. Plonge de dix brasses dans les profondeurs : là où le vent ne peut atteindre l'eau, le calme demeure souverain.",
    explanation: 'Face aux crises extérieures, réfugie-toi dans ton sanctuaire intérieur avant de reprendre ta nage.',
  },
  {
    theme: 'carapace',
    themeTitle: 'La Carapace & Le Sanctuaire',
    icon: '🪨',
    text: "Ta carapace ne sert pas à t'enfermer loin du monde, mais à protéger la tendresse de ta chair lorsque la roche est trop tranchante. Honore tes limites, car sans elles, aucun voyage ne dure.",
    explanation: 'Poser des limites saines n’est point de la dureté, mais le respect sacré de sa propre vulnérabilité.',
  },
  {
    theme: 'lacher-prise',
    themeTitle: 'Le Lâcher-prise & Le Courant',
    icon: '🐚',
    text: "Regarde l'algue attachée au récif : si elle résiste au courant avec raideur, elle est arrachée. Si elle ondule et s'abandonne au flux, elle danse avec la marée sans jamais se rompre.",
    explanation: 'Cesser de forcer les choses permet à l’énergie universelle de nous porter avec fluidité.',
  },
  {
    theme: 'orientation',
    themeTitle: 'L’Étoile & La Direction',
    icon: '🌌',
    text: "Même au milieu de la nuit la plus ténébreuse, lorsque nul rivage n'est en vue, l'étoile polaire ne vacille jamais. Ton cœur possède aussi son aimant silencieux : écoute-le quand les yeux ne suffisent plus.",
    explanation: 'Lorsque tout semble flou, l’intuition et les valeurs profondes restent des guides infaillibles.',
  },
  {
    theme: 'silence',
    themeTitle: 'La Nuit & Le Silence',
    icon: '🌙',
    text: "Les hommes ont peur de la nuit parce qu'elle les dépouille de leurs masques de jour. Pourtant, ce n'est que dans l'obscurité totale que l'on découvre que le plancton peut briller comme une constellation.",
    explanation: 'La solitude et le silence révèlent notre propre lumière cachée.',
  },
];

export const WisdomPearls: React.FC<WisdomPearlsProps> = ({ onSavePearl, savedPearls }) => {
  const [selectedTheme, setSelectedTheme] = useState<string>('all');
  const [activePearl, setActivePearl] = useState<PearlData>(STATIC_PEARLS[0]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [speakingText, setSpeakingText] = useState<string | null>(null);

  const filterList = [
    { id: 'all', label: 'Toutes les marées' },
    { id: 'lenteur', label: '⏳ Lenteur' },
    { id: 'tempete', label: '🌊 Tempêtes' },
    { id: 'carapace', label: '🪨 Carapace' },
    { id: 'lacher-prise', label: '🐚 Lâcher-prise' },
    { id: 'orientation', label: '🌌 Direction' },
    { id: 'silence', label: '🌙 Nuit & Silence' },
  ];

  const filteredPearls =
    selectedTheme === 'all'
      ? STATIC_PEARLS
      : STATIC_PEARLS.filter((p) => p.theme === selectedTheme);

  const handleGenerateCustomPearl = async (themeLabel: string) => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/turtle/pearl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme: themeLabel }),
      });
      const data = await res.json();
      if (data.pearl) {
        const newPearl: PearlData = {
          theme: selectedTheme === 'all' ? 'lenteur' : selectedTheme,
          themeTitle: `Inspiration du Ressac : ${themeLabel}`,
          icon: '✨',
          text: data.pearl,
          explanation: "Perle tout juste cueillie au fond des courants célestes de la nuit.",
        };
        setActivePearl(newPearl);
        oceanAudio.playChime();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleVoice = (text: string) => {
    if (speakingText === text) {
      turtleVoice.stop();
      setSpeakingText(null);
    } else {
      setSpeakingText(text);
      turtleVoice.speak(text, () => setSpeakingText(null));
    }
  };

  const isCurrentSaved = savedPearls.includes(activePearl.text);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Category pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {filterList.map((f) => (
          <button
            key={f.id}
            onClick={() => setSelectedTheme(f.id)}
            className={`px-4 py-2 rounded-xl text-xs md:text-sm font-cinzel whitespace-nowrap transition-all cursor-pointer ${
              selectedTheme === f.id
                ? 'bg-cyan-500/25 text-cyan-200 border border-cyan-400/50 shadow-[0_0_15px_rgba(34,211,238,0.25)]'
                : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Hero Active Pearl Display */}
      <div className="relative bg-gradient-to-b from-slate-900/90 via-cyan-950/20 to-slate-950/90 border border-cyan-500/30 rounded-3xl p-6 md:p-10 shadow-2xl overflow-hidden glow-cyan">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <span className="text-3xl p-3 bg-cyan-950/60 border border-cyan-500/30 rounded-2xl shadow-inner">
              {activePearl.icon}
            </span>
            <div>
              <span className="text-[11px] font-cinzel uppercase tracking-widest text-cyan-400">
                Parole d'Éternité
              </span>
              <h3 className="font-cinzel text-lg md:text-xl font-bold text-slate-100">
                {activePearl.themeTitle}
              </h3>
            </div>
          </div>

          <button
            onClick={() => handleGenerateCustomPearl(activePearl.themeTitle)}
            disabled={isGenerating}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-cyan-950/60 text-xs text-cyan-300 border border-slate-700 hover:border-cyan-500/40 transition-all disabled:opacity-50 cursor-pointer"
            title="Pêcher une nouvelle perle de sagesse sur ce thème"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Nouvelle perle</span>
          </button>
        </div>

        {/* Quote text */}
        <div className="my-6 relative pl-6 border-l-2 border-cyan-400/60">
          <p className="font-quote text-xl md:text-2xl text-cyan-50/95 leading-relaxed italic">
            « {activePearl.text} »
          </p>
        </div>

        {/* Deep reflection note */}
        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 mb-6 flex items-start gap-3">
          <Feather className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs md:text-sm text-slate-300 font-light leading-relaxed">
            <span className="text-cyan-300 font-medium">Méditation de la tortue :</span> {activePearl.explanation}
          </p>
        </div>

        {/* Actions bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800">
          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleVoice(activePearl.text)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs md:text-sm font-cinzel transition-all cursor-pointer ${
                speakingText === activePearl.text
                  ? 'bg-cyan-500/30 text-cyan-200 border border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.3)] animate-pulse'
                  : 'bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700'
              }`}
            >
              {speakingText === activePearl.text ? (
                <>
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>Arrêter la voix</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-cyan-300" />
                  <span>Écouter la parole</span>
                </>
              )}
            </button>

            <button
              onClick={() => onSavePearl(activePearl.text, activePearl.themeTitle)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs md:text-sm font-cinzel transition-all cursor-pointer ${
                isCurrentSaved
                  ? 'bg-amber-950/60 text-amber-300 border border-amber-500/50'
                  : 'bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isCurrentSaved ? 'fill-current' : ''}`} />
              <span>{isCurrentSaved ? 'Perle gardée' : 'Garder dans mon carnet'}</span>
            </button>
          </div>

          <span className="text-xs text-slate-400 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-300" />
            Paroles nées sous la lune
          </span>
        </div>
      </div>

      {/* Grid of other pearls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredPearls.map((p, idx) => (
          <div
            key={idx}
            onClick={() => setActivePearl(p)}
            className={`p-5 rounded-2xl border transition-all cursor-pointer ${
              activePearl.text === p.text
                ? 'bg-cyan-950/40 border-cyan-400/60 shadow-[0_0_20px_rgba(34,211,238,0.15)] ring-1 ring-cyan-400/40'
                : 'bg-slate-900/60 hover:bg-slate-850 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xl">{p.icon}</span>
              <span className="text-[11px] font-cinzel text-cyan-300/80">
                {p.themeTitle}
              </span>
            </div>
            <p className="font-quote text-sm text-slate-200 line-clamp-3 italic">
              « {p.text} »
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
