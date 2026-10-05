/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Waves,
  Sparkles,
  BookOpen,
  Bookmark,
  Moon,
  Compass,
} from 'lucide-react';
import { BeachSkyCanvas } from './components/BeachSkyCanvas';
import { TurtleVisual } from './components/TurtleVisual';
import { AudioControls } from './components/AudioControls';
import { WisdomDialogue } from './components/WisdomDialogue';
import { TidalBreathing } from './components/TidalBreathing';
import { WisdomPearls } from './components/WisdomPearls';
import { OceanTales } from './components/OceanTales';
import { WisdomJournal, SavedPearlItem } from './components/WisdomJournal';
import { oceanAudio } from './utils/audio';

type ActiveTab = 'dialogue' | 'breathing' | 'pearls' | 'tales' | 'journal';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dialogue');
  const [isTurtleSpeaking, setIsTurtleSpeaking] = useState<boolean>(false);
  const [isBreathingActive, setIsBreathingActive] = useState<boolean>(false);
  const [breathPhase, setBreathPhase] = useState<'inhale' | 'hold-in' | 'exhale' | 'hold-out'>('inhale');
  
  // Saved pearls in localStorage
  const [savedPearls, setSavedPearls] = useState<SavedPearlItem[]>(() => {
    try {
      const stored = localStorage.getItem('moana_saved_pearls');
      if (stored) return JSON.parse(stored);
    } catch {
      // Ignore
    }
    return [
      {
        id: 'seed-1',
        title: 'La Marche de l’Ancienne',
        text: "La lenteur n'est point une faiblesse, c'est la seule façon d'écouter les murmures du récif que les créatures pressées piétinent sans voir.",
        date: 'Nuit première',
        notes: 'Prendre le temps le matin avant de plonger dans le tumulte.',
      },
    ];
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync saved pearls with localStorage
  useEffect(() => {
    try {
      localStorage.setItem('moana_saved_pearls', JSON.stringify(savedPearls));
    } catch {
      // Ignore
    }
  }, [savedPearls]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSavePearl = (text: string, title = 'Parole de Sagesse') => {
    if (savedPearls.some((p) => p.text === text)) {
      showToast('Cette perle est déjà dans votre carnet.');
      return;
    }

    const newItem: SavedPearlItem = {
      id: `pearl-${Date.now()}`,
      title,
      text,
      date: new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
    };

    setSavedPearls((prev) => [newItem, ...prev]);
    oceanAudio.playChime();
    showToast('Perle déposée dans votre Carnet de Sagesse.');
  };

  const handleDeletePearl = (id: string) => {
    setSavedPearls((prev) => prev.filter((p) => p.id !== id));
    showToast('Perle effacée du carnet.');
  };

  const handleUpdateNotes = (id: string, notes: string) => {
    setSavedPearls((prev) =>
      prev.map((p) => (p.id === id ? { ...p, notes } : p))
    );
    showToast('Réflexion enregistrée.');
  };

  const handleBreathingPhaseChange = (
    phase: 'inhale' | 'hold-in' | 'exhale' | 'hold-out',
    active: boolean
  ) => {
    setBreathPhase(phase);
    setIsBreathingActive(active);
  };

  return (
    <div className="relative min-h-screen bg-[#030712] text-slate-100 flex flex-col justify-between selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Interactive Background Canvas (Stars, shooting stars & bioluminescent ripples) */}
      <BeachSkyCanvas />

      {/* Subtle background ambient gradients */}
      <div className="fixed inset-0 bg-gradient-to-b from-indigo-950/20 via-transparent to-[#030712]/90 pointer-events-none z-0" />
      <div className="fixed bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-[#02050c] via-cyan-950/15 to-transparent pointer-events-none z-0" />

      {/* Main Content Container */}
      <div className="relative z-10 flex flex-col flex-1 max-w-6xl mx-auto w-full px-4 py-4 md:py-6">
        {/* Top Bar Header */}
        <header className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-cyan-500/15">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-cyan-900/80 to-slate-900 border border-cyan-400/40 flex items-center justify-center shadow-[0_0_20px_rgba(34,211,238,0.25)]">
              <Moon className="w-6 h-6 text-cyan-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-cinzel text-lg md:text-2xl font-bold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-slate-100 via-cyan-200 to-teal-300">
                  La Tortue du Rivage
                </h1>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] uppercase font-cinzel rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300">
                  Nuit & Sagesse
                </span>
              </div>
              <p className="text-xs text-slate-400 font-light flex items-center gap-1.5">
                <Compass className="w-3 h-3 text-cyan-400" />
                Au bord de la plage nocturne, sous la voûte des étoiles
              </p>
            </div>
          </div>

          {/* Sound Controls */}
          <AudioControls />
        </header>

        {/* Visual Showcase of the Wise Sea Turtle */}
        <TurtleVisual
          isSpeaking={isTurtleSpeaking}
          isBreathing={isBreathingActive}
          breathPhase={breathPhase}
        />

        {/* Navigation Tabs */}
        <nav className="flex items-center justify-center mb-6">
          <div className="flex items-center gap-1 sm:gap-2 p-1.5 bg-slate-950/80 backdrop-blur-xl border border-teal-500/20 rounded-2xl shadow-xl overflow-x-auto max-w-full scrollbar-none">
            <button
              onClick={() => setActiveTab('dialogue')}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-cinzel transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'dialogue'
                  ? 'bg-gradient-to-r from-teal-600/40 to-cyan-600/40 text-cyan-200 border border-cyan-400/50 shadow-[0_0_15px_rgba(34,211,238,0.25)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <MessageSquare className="w-4 h-4 text-cyan-400" />
              <span>Dialogue</span>
            </button>

            <button
              onClick={() => setActiveTab('breathing')}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-cinzel transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'breathing'
                  ? 'bg-gradient-to-r from-teal-600/40 to-cyan-600/40 text-cyan-200 border border-cyan-400/50 shadow-[0_0_15px_rgba(34,211,238,0.25)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <Waves className="w-4 h-4 text-teal-400" />
              <span>Souffle de la Marée</span>
            </button>

            <button
              onClick={() => setActiveTab('pearls')}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-cinzel transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'pearls'
                  ? 'bg-gradient-to-r from-teal-600/40 to-cyan-600/40 text-cyan-200 border border-cyan-400/50 shadow-[0_0_15px_rgba(34,211,238,0.25)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Perles de Sagesse</span>
            </button>

            <button
              onClick={() => setActiveTab('tales')}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-cinzel transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'tales'
                  ? 'bg-gradient-to-r from-teal-600/40 to-cyan-600/40 text-cyan-200 border border-cyan-400/50 shadow-[0_0_15px_rgba(34,211,238,0.25)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <BookOpen className="w-4 h-4 text-indigo-400" />
              <span>Contes Marins</span>
            </button>

            <button
              onClick={() => setActiveTab('journal')}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-cinzel transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'journal'
                  ? 'bg-gradient-to-r from-teal-600/40 to-cyan-600/40 text-cyan-200 border border-cyan-400/50 shadow-[0_0_15px_rgba(34,211,238,0.25)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <Bookmark className="w-4 h-4 text-emerald-400" />
              <span>Mon Carnet</span>
              {savedPearls.length > 0 && (
                <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] flex items-center justify-center font-bold">
                  {savedPearls.length}
                </span>
              )}
            </button>
          </div>
        </nav>

        {/* Tab View Content */}
        <main className="flex-1 mb-8">
          {activeTab === 'dialogue' && (
            <WisdomDialogue
              onSavePearl={handleSavePearl}
              savedPearls={savedPearls.map((p) => p.text)}
              onSpeakingChange={setIsTurtleSpeaking}
            />
          )}

          {activeTab === 'breathing' && (
            <TidalBreathing onPhaseChange={handleBreathingPhaseChange} />
          )}

          {activeTab === 'pearls' && (
            <WisdomPearls
              onSavePearl={handleSavePearl}
              savedPearls={savedPearls.map((p) => p.text)}
            />
          )}

          {activeTab === 'tales' && (
            <OceanTales onSavePearl={handleSavePearl} />
          )}

          {activeTab === 'journal' && (
            <WisdomJournal
              pearls={savedPearls}
              onDeletePearl={handleDeletePearl}
              onUpdateNotes={handleUpdateNotes}
              onSelectTab={(tab) => setActiveTab(tab as ActiveTab)}
            />
          )}
        </main>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right pm-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-slate-900/95 border border-cyan-400/60 shadow-[0_0_25px_rgba(34,211,238,0.3)] text-cyan-100 text-xs md:text-sm backdrop-blur-md animate-fade-in">
          <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Ambient Footer */}
      <footer className="relative z-10 border-t border-slate-900/80 py-4 px-6 text-center text-xs text-slate-500 font-light bg-[#02050c]/80 backdrop-blur-md">
        <p className="flex items-center justify-center gap-2 font-cinzel">
          <span>« Le temps appartient à ceux qui écoutent la marée. »</span>
        </p>
        <p className="text-[11px] text-slate-600 mt-1">
          Touchez le rivage pour faire scintiller l'écume bioluminescente sous les étoiles.
        </p>
      </footer>
    </div>
  );
}
