import React, { useState } from 'react';
import { Bookmark, Trash2, Copy, Check, Sparkles, Feather, Share2 } from 'lucide-react';

export interface SavedPearlItem {
  id: string;
  title: string;
  text: string;
  date: string;
  notes?: string;
}

interface WisdomJournalProps {
  pearls: SavedPearlItem[];
  onDeletePearl: (id: string) => void;
  onUpdateNotes: (id: string, notes: string) => void;
  onSelectTab: (tab: string) => void;
}

export const WisdomJournal: React.FC<WisdomJournalProps> = ({
  pearls,
  onDeletePearl,
  onUpdateNotes,
  onSelectTab,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');

  const handleCopy = (item: SavedPearlItem) => {
    const textToCopy = `« ${item.text} »\n— Sagesse de la Tortue du Rivage (${item.title})\n${item.notes ? `\nRéflexion personnelle : ${item.notes}` : ''}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const startEditNote = (item: SavedPearlItem) => {
    setEditingId(item.id);
    setNoteText(item.notes || '');
  };

  const saveEditNote = (id: string) => {
    onUpdateNotes(id, noteText);
    setEditingId(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h3 className="font-cinzel text-xl md:text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-amber-400" />
            Mon Carnet de Sagesse
          </h3>
          <p className="text-xs md:text-sm text-slate-400 font-light mt-0.5">
            Vos perles et réflexions recueillies au bord de l'eau
          </p>
        </div>
        <span className="text-xs font-cinzel px-3 py-1 rounded-full bg-slate-900 border border-slate-700 text-cyan-300">
          {pearls.length} perle{pearls.length > 1 ? 's' : ''} gardée{pearls.length > 1 ? 's' : ''}
        </span>
      </div>

      {pearls.length === 0 ? (
        <div className="text-center py-16 px-4 bg-slate-950/60 border border-dashed border-slate-800 rounded-3xl">
          <Sparkles className="w-10 h-10 text-cyan-500/50 mx-auto mb-3" />
          <h4 className="font-cinzel text-lg font-semibold text-slate-300 mb-2">
            Votre carnet est encore vierge
          </h4>
          <p className="text-sm text-slate-400 max-w-md mx-auto mb-6 font-light">
            Lorsque la tortue vous transmettra une parole qui résonne en vous, cliquez sur l'icône de marque-page pour la recueillir ici.
          </p>
          <button
            onClick={() => onSelectTab('dialogue')}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white font-cinzel text-xs font-semibold tracking-wider transition-all cursor-pointer shadow-lg shadow-cyan-950"
          >
            Aller parler à la tortue
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5">
          {pearls.map((item) => (
            <div
              key={item.id}
              className="bg-slate-950/80 backdrop-blur-xl border border-teal-500/25 rounded-2xl md:rounded-3xl p-6 shadow-xl relative glow-cyan"
            >
              <div className="flex items-center justify-between gap-4 mb-3">
                <span className="text-xs font-cinzel uppercase tracking-wider text-cyan-400 font-semibold">
                  {item.title}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-500">{item.date}</span>

                  <button
                    onClick={() => handleCopy(item)}
                    className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                    title="Copier la perle"
                  >
                    {copiedId === item.id ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Share2 className="w-4 h-4" />
                    )}
                  </button>

                  <button
                    onClick={() => onDeletePearl(item.id)}
                    className="p-1.5 rounded-lg hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 transition-colors"
                    title="Retirer du carnet"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Quote */}
              <div className="pl-4 border-l-2 border-cyan-400/50 my-4">
                <p className="font-quote text-base md:text-lg text-slate-100 italic leading-relaxed">
                  « {item.text} »
                </p>
              </div>

              {/* Personal Reflection Notes */}
              <div className="mt-4 pt-3 border-t border-slate-800/80">
                {editingId === item.id ? (
                  <div className="space-y-2">
                    <textarea
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      placeholder="Notez ce que cette parole éveille en vous..."
                      rows={3}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs md:text-sm text-slate-200 focus:outline-none focus:border-cyan-400"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-3 py-1 rounded-lg text-xs text-slate-400 hover:text-slate-200"
                      >
                        Annuler
                      </button>
                      <button
                        onClick={() => saveEditNote(item.id)}
                        className="px-3 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-xs text-white font-medium"
                      >
                        Enregistrer
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2 text-xs text-slate-300">
                      <Feather className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0 mt-0.5" />
                      <div>
                        {item.notes ? (
                          <p className="italic text-slate-300">« {item.notes} »</p>
                        ) : (
                          <span className="text-slate-500 italic">Aucune note personnelle pour l'instant.</span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => startEditNote(item)}
                      className="text-xs text-cyan-400 hover:underline flex-shrink-0 font-medium"
                    >
                      {item.notes ? 'Modifier la note' : '+ Ajouter une réflexion'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
