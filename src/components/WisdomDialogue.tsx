import React, { useState, useRef, useEffect } from 'react';
import { Send, Volume2, Square, Bookmark, BookmarkCheck, Copy, Check, Sparkles, RefreshCw, Compass } from 'lucide-react';
import { turtleVoice } from '../utils/speech';
import { oceanAudio } from '../utils/audio';

export interface DialogueMessage {
  id: string;
  role: 'user' | 'turtle';
  text: string;
  timestamp: string;
}

interface WisdomDialogueProps {
  onSavePearl: (text: string, title?: string) => void;
  savedPearls: string[];
  onSpeakingChange: (speaking: boolean) => void;
}

const INSPIRATIONAL_PROMPTS = [
  "Comment trouver le calme intérieur au milieu de l'agitation ?",
  "J'ai peur de manquer de temps et de ne pas être à la hauteur...",
  "Comment traverser une tempête sans que mon esprit ne se brise ?",
  "Apprends-moi le lâcher-prise de l'écume et du ressac...",
  "Que murmurent les étoiles à ceux qui doutent dans la nuit ?",
  "Pourquoi est-il si difficile de pardonner et d'alléger sa carapace ?"
];

export const WisdomDialogue: React.FC<WisdomDialogueProps> = ({
  onSavePearl,
  savedPearls,
  onSpeakingChange,
}) => {
  const [messages, setMessages] = useState<DialogueMessage[]>([
    {
      id: 'initial-greeting',
      role: 'turtle',
      text: "Viens près de moi, voyageur de la nuit... Assieds-toi sur ce sable encore tiède où la mer vient mourir en dentelle de lumière. Quel souci ou quel silence portes-tu en ton cœur ce soir ?",
      timestamp: 'Au premier éclat d\'étoile',
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    turtleVoice.setListener((speaking) => {
      onSpeakingChange(speaking);
      if (!speaking) {
        setSpeakingMessageId(null);
      }
    });
    return () => {
      turtleVoice.stop();
    };
  }, [onSpeakingChange]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputValue).trim();
    if (!query || isLoading) return;

    const userMsg: DialogueMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      const historyPayload = messages.map((m) => ({
        role: m.role === 'user' ? 'user' : 'model',
        text: m.text,
      }));

      const res = await fetch('/api/turtle/dialogue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          history: historyPayload,
        }),
      });

      const data = await res.json();
      const replyText = data.reply || "Écoute le souffle de la mer... La réponse repose déjà au fond de tes propres abysses.";

      const turtleMsg: DialogueMessage = {
        id: `turtle-${Date.now()}`,
        role: 'turtle',
        text: replyText,
        timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, turtleMsg]);
      oceanAudio.playChime();
    } catch (err) {
      console.error(err);
      const fallbackMsg: DialogueMessage = {
        id: `turtle-${Date.now()}`,
        role: 'turtle',
        text: "La mer est parfois troublée par les vents, mais au fond de l'abysse, la paix reste intacte. Prends une longue inspiration, respire avec la marée...",
        timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSpeak = (id: string, text: string) => {
    if (speakingMessageId === id) {
      turtleVoice.stop();
      setSpeakingMessageId(null);
    } else {
      setSpeakingMessageId(id);
      turtleVoice.speak(text, () => {
        setSpeakingMessageId(null);
      });
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto bg-slate-950/70 backdrop-blur-xl border border-teal-500/20 rounded-2xl md:rounded-3xl shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-teal-500/20 bg-slate-900/50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-cyan-950 border border-cyan-400/50 flex items-center justify-center text-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.25)]">
            <Compass className="w-5 h-5 animate-[spin_20s_linear_infinite]" />
          </div>
          <div>
            <h3 className="font-cinzel text-base md:text-lg font-bold text-slate-100 flex items-center gap-2">
              Le Conseil de la Marée
            </h3>
            <p className="text-xs text-slate-400 font-light">
              Posez votre fardeau ou votre question au silence de l'océan
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            turtleVoice.stop();
            setMessages([
              {
                id: `reset-${Date.now()}`,
                role: 'turtle',
                text: "Une nouvelle vague efface les traces sur le sable. Dis-moi, que cherches-tu à présent sous cette voûte céleste ?",
                timestamp: 'Sous les étoiles',
              },
            ]);
          }}
          className="text-xs text-slate-400 hover:text-cyan-300 flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-800/60 transition-colors"
          title="Effacer le sable et recommencer l'échange"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Nouvelle marée</span>
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5 min-h-[380px] max-h-[480px]">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          const isSaved = savedPearls.includes(msg.text);

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} transition-all`}
            >
              <div
                className={`max-w-[90%] md:max-w-[80%] rounded-2xl p-4 md:p-5 relative ${
                  isUser
                    ? 'bg-gradient-to-r from-teal-800/50 to-cyan-900/60 border border-cyan-500/30 text-slate-100 rounded-tr-none shadow-lg'
                    : 'bg-slate-900/90 border border-teal-500/30 text-slate-200 rounded-tl-none shadow-[0_4px_25px_rgba(0,0,0,0.5)] glow-cyan'
                }`}
              >
                {!isUser && (
                  <div className="flex items-center gap-2 mb-2 text-cyan-300 font-cinzel text-xs font-semibold tracking-wide">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    <span>L'Ancienne des Rivages</span>
                  </div>
                )}

                <p
                  className={`leading-relaxed whitespace-pre-wrap ${
                    isUser
                      ? 'text-sm md:text-base font-normal'
                      : 'font-quote text-base md:text-lg text-cyan-50/95 italic font-light'
                  }`}
                >
                  {msg.text}
                </p>

                <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-700/30 text-[11px] text-slate-400">
                  <span>{msg.timestamp}</span>

                  {!isUser && (
                    <div className="flex items-center gap-1.5 ml-4">
                      {/* Voice button */}
                      <button
                        onClick={() => toggleSpeak(msg.id, msg.text)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          speakingMessageId === msg.id
                            ? 'bg-cyan-500/30 text-cyan-300 ring-1 ring-cyan-400 animate-pulse'
                            : 'hover:bg-slate-800 text-slate-400 hover:text-cyan-300'
                        }`}
                        title={speakingMessageId === msg.id ? 'Arrêter la voix' : 'Écouter la parole de la tortue'}
                      >
                        {speakingMessageId === msg.id ? (
                          <Square className="w-3.5 h-3.5 fill-current" />
                        ) : (
                          <Volume2 className="w-3.5 h-3.5" />
                        )}
                      </button>

                      {/* Save to Journal */}
                      <button
                        onClick={() => onSavePearl(msg.text, 'Parole du Rivage')}
                        className={`p-1.5 rounded-lg transition-colors ${
                          isSaved
                            ? 'text-amber-400 bg-amber-950/40'
                            : 'hover:bg-slate-800 text-slate-400 hover:text-amber-300'
                        }`}
                        title={isSaved ? 'Déjà gardée dans votre carnet' : 'Garder cette perle dans mon carnet'}
                      >
                        {isSaved ? (
                          <BookmarkCheck className="w-3.5 h-3.5 text-amber-400" />
                        ) : (
                          <Bookmark className="w-3.5 h-3.5" />
                        )}
                      </button>

                      {/* Copy */}
                      <button
                        onClick={() => handleCopy(msg.id, msg.text)}
                        className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                        title="Copier la parole"
                      >
                        {copiedId === msg.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-start">
            <div className="bg-slate-900/80 border border-teal-500/30 rounded-2xl rounded-tl-none p-4 glow-cyan flex items-center gap-3">
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:-0.3s]" />
                <span className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-bounce [animation-delay:-0.15s]" />
                <span className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-bounce" />
              </div>
              <span className="text-xs text-cyan-200 font-cinzel italic tracking-wide">
                L'Ancienne respire avec le ressac avant de te répondre...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompts Pill Carousel */}
      <div className="px-4 py-2.5 bg-slate-900/30 border-t border-slate-800/80">
        <p className="text-[11px] uppercase tracking-wider text-slate-400 mb-2 font-cinzel flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-cyan-400" />
          Murmures inspirants pour commencer :
        </p>
        <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-thin">
          {INSPIRATIONAL_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(prompt)}
              className="text-xs whitespace-nowrap px-3 py-1.5 rounded-full bg-slate-800/70 hover:bg-cyan-950/70 text-slate-300 hover:text-cyan-300 border border-slate-700/50 hover:border-cyan-500/40 transition-all cursor-pointer flex-shrink-0"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Input bar */}
      <div className="p-4 bg-slate-900/60 border-t border-teal-500/20">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Confiez votre pensée ou votre question à la tortue..."
            disabled={isLoading}
            className="flex-1 bg-slate-950/80 border border-slate-700/70 focus:border-cyan-400 rounded-xl px-4 py-3 text-sm md:text-base text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-all"
          />
          <button
            type="submit"
            disabled={isLoading || !inputValue.trim()}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white font-cinzel text-sm font-semibold tracking-wide disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(20,184,166,0.3)] transition-all cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Confier</span>
          </button>
        </form>
      </div>
    </div>
  );
};
