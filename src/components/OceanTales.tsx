import React, { useState } from 'react';
import { BookOpen, Volume2, Square, Sparkles, Wand2, Bookmark, Check, Copy } from 'lucide-react';
import { turtleVoice } from '../utils/speech';
import { oceanAudio } from '../utils/audio';

interface OceanTalesProps {
  onSavePearl: (text: string, title?: string) => void;
}

interface Tale {
  id: string;
  title: string;
  subtitle: string;
  content: string;
  moral: string;
}

const PRESET_TALES: Tale[] = [
  {
    id: 'perle-sable',
    title: 'La Perle et le Grain de Sable',
    subtitle: 'Sur la métamorphose de nos blessures',
    content: `Il y a bien des siècles, au fond d'un récif oublié, un jeune coquillage pleurait auprès des marées. Un grain de sable tranchant et rugueux s'était glissé dans sa chair la plus tendre.\n\nIl se lamentait chaque nuit : « Pourquoi le courant m'a-t-il infligé cette blessure ? Pourquoi ce caillou dans mon repos ? »\n\nJe suis venue me poser près de lui et lui ai murmuré : « Ne lutte pas contre cette poussière avec rage. Enveloppe-la plutôt de ta plus belle nacre à chaque nouveau cycle de la lune. »\n\nDes décennies passèrent. Le coquillage cessa de maudire son intrus. Quand une marée d'équinoxe ouvrit enfin sa coquille, il n'y avait plus la moindre douleur : au centre brillait une perle aux reflets d'argent, d'une perfection rare.\n\nCe qui te fait mal aujourd'hui n'est pas une condamnation, mais la semence de ta future lumière.`,
    moral: 'Ce que nous choisissons d’enrober de patience et de douceur finit toujours par devenir notre plus grand trésor.',
  },
  {
    id: 'etoile-lagon',
    title: 'L’Étoile Tombée dans le Lagon',
    subtitle: 'D’où vient la lueur de la nuit',
    content: `À l'aube des temps, une petite étoile voulut regarder de trop près le miroir des flots et glissa de la voûte céleste. Elle tomba au cœur de l'océan dans un grand fracas de vapeur.\n\nEffrayée d'être engloutie par l'obscurité des fosses marines, elle crut que sa lumière allait mourir à jamais. Mais en s'éparpillant dans l'eau salée, chacune de ses étincelles donna naissance à des milliards de créatures minuscules qui peuplent aujourd'hui le rivage : le plancton luminescent.\n\nDepuis cette nuit-là, dès qu'une vague touche le sable dans l'obscurité, l'océan se met à briller comme un ciel inversé.\n\nMême quand tu as le sentiment de chuter dans le vide, ton éclat ne disparaît jamais : il apprend simplement à éclairer une autre profondeur.`,
    moral: 'La chute apparente d’une lumière n’est souvent que sa dissémination féconde dans l’inconnu.',
  },
  {
    id: 'vague-ocean',
    title: 'La Vague qui Avait Peur du Rivage',
    subtitle: 'L’illusion de la séparation',
    content: `Une petite vague galopait fièrement sur l'eau libre. Mais en approchant de la plage, elle vit les vagues devant elle se briser avec force sur le sable et s'évanouir dans l'écume.\n\nSaisie d'effroi, elle cria à la vague voisine : « C'est terrible ! Regarde ce qui nous attend ! Nous allons nous fracasser et cesser d'exister ! »\n\nLa vieille vague à ses côtés sourit doucement et lui répondit : « Ma petite, tu as peur parce que tu crois n'être qu'une vague. Mais tu n'es pas seulement une ondulation passagère : tu es l'Océan tout entier. Tu ne meurs pas sur le sable ; tu retrouves simplement l'immensité de ton eau. »\n\nNe crains point les fins de cycle : tu n'es pas une feuille isolée, tu es l'arbre tout entier.`,
    moral: 'Nous ne sommes pas des êtres séparés luttant contre le monde : nous sommes la vie elle-même qui fait l’expérience d’elle-même.',
  },
];

export const OceanTales: React.FC<OceanTalesProps> = ({ onSavePearl }) => {
  const [selectedTale, setSelectedTale] = useState<Tale>(PRESET_TALES[0]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  const [speaking, setSpeaking] = useState(false);
  const [copied, setCopied] = useState(false);

  const toggleSpeak = () => {
    if (speaking) {
      turtleVoice.stop();
      setSpeaking(false);
    } else {
      setSpeaking(true);
      const fullTextToRead = `${selectedTale.title}. ${selectedTale.subtitle}. ${selectedTale.content}. Méditation de la tortue : ${selectedTale.moral}`;
      turtleVoice.speak(fullTextToRead, () => setSpeaking(false));
    }
  };

  const handleGenerateTale = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/turtle/tale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: customPrompt }),
      });
      const data = await res.json();
      if (data.tale) {
        const newTale: Tale = {
          id: `custom-${Date.now()}`,
          title: customPrompt ? `Le Conte de « ${customPrompt} »` : "Le Conte de l'Abysse Étoilé",
          subtitle: "Récit nocturne tissé au gré des marées",
          content: data.tale,
          moral: "L’écoute des marées dissout l’agitation de l’âme.",
        };
        setSelectedTale(newTale);
        setCustomPrompt('');
        oceanAudio.playChime();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(`${selectedTale.title}\n\n${selectedTale.content}\n\n${selectedTale.moral}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Tales Selector Carousel */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {PRESET_TALES.map((tale) => (
          <button
            key={tale.id}
            onClick={() => {
              turtleVoice.stop();
              setSpeaking(false);
              setSelectedTale(tale);
            }}
            className={`p-4 rounded-2xl text-left border transition-all cursor-pointer ${
              selectedTale.id === tale.id
                ? 'bg-cyan-950/60 border-cyan-400/60 shadow-[0_0_20px_rgba(34,211,238,0.2)] ring-1 ring-cyan-400/30'
                : 'bg-slate-900/60 hover:bg-slate-800/80 border-slate-800'
            }`}
          >
            <div className="flex items-center gap-2 text-cyan-400 mb-1">
              <BookOpen className="w-4 h-4" />
              <span className="text-[11px] font-cinzel uppercase tracking-wider">Conte initiatique</span>
            </div>
            <h4 className="font-cinzel text-sm font-bold text-slate-100 mb-1">
              {tale.title}
            </h4>
            <p className="text-xs text-slate-400 font-light truncate">
              {tale.subtitle}
            </p>
          </button>
        ))}
      </div>

      {/* Main Tale Reader Card */}
      <div className="relative bg-slate-950/80 backdrop-blur-xl border border-teal-500/30 rounded-3xl p-6 md:p-10 shadow-2xl glow-cyan">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800">
          <div>
            <span className="text-xs font-cinzel uppercase tracking-widest text-cyan-400 flex items-center gap-1.5 mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              Parabole de l'Ancienne Tortue
            </span>
            <h3 className="font-cinzel text-2xl md:text-3xl font-bold text-slate-100">
              {selectedTale.title}
            </h3>
            <p className="text-xs md:text-sm text-cyan-200/70 font-light mt-0.5">
              {selectedTale.subtitle}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleSpeak}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs md:text-sm font-cinzel transition-all cursor-pointer ${
                speaking
                  ? 'bg-cyan-500/30 text-cyan-200 border border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.3)] animate-pulse'
                  : 'bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700'
              }`}
            >
              {speaking ? (
                <>
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>Arrêter le récit</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-cyan-300" />
                  <span>Écouter le conte</span>
                </>
              )}
            </button>

            <button
              onClick={() => onSavePearl(selectedTale.content, selectedTale.title)}
              className="p-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
              title="Garder ce conte dans le carnet"
            >
              <Bookmark className="w-4 h-4" />
            </button>

            <button
              onClick={handleCopy}
              className="p-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
              title="Copier le conte"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Narrative text */}
        <div className="prose prose-invert max-w-none mb-8">
          {selectedTale.content.split('\n\n').map((paragraph, idx) => (
            <p
              key={idx}
              className="font-quote text-base md:text-lg text-slate-200 leading-relaxed font-light mb-4"
            >
              {paragraph}
            </p>
          ))}
        </div>

        {/* Moral callout */}
        <div className="p-4 md:p-5 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 flex items-start gap-3.5">
          <Sparkles className="w-5 h-5 text-amber-300 flex-shrink-0 mt-0.5" />
          <div>
            <h5 className="font-cinzel text-xs uppercase tracking-wider text-cyan-300 font-semibold mb-1">
              Enseignement des Marées
            </h5>
            <p className="font-quote text-sm md:text-base text-cyan-100/95 italic">
              « {selectedTale.moral} »
            </p>
          </div>
        </div>
      </div>

      {/* Ask for a custom tale */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
        <h4 className="font-cinzel text-sm font-semibold text-slate-200 mb-2 flex items-center gap-2">
          <Wand2 className="w-4 h-4 text-cyan-400" />
          Demander à la tortue un conte sur mesure :
        </h4>
        <div className="flex gap-2">
          <input
            type="text"
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="Ex : Le voyageur égaré, la barque sans rames, la lune solitaire..."
            className="flex-1 bg-slate-950/80 border border-slate-800 focus:border-cyan-400 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none"
          />
          <button
            onClick={handleGenerateTale}
            disabled={isGenerating}
            className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-cinzel text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {isGenerating ? 'Tissage...' : 'Raconter'}
          </button>
        </div>
      </div>
    </div>
  );
};
