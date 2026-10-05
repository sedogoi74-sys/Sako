/**
 * Speech synthesis utility for the wise turtle.
 * Provides slow, deep, soothing French spoken delivery.
 */

class TurtleVoice {
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private isSpeaking: boolean = false;
  private onStateChange: ((speaking: boolean) => void) | null = null;

  public setListener(fn: (speaking: boolean) => void) {
    this.onStateChange = fn;
  }

  public speak(text: string, onEnd?: () => void) {
    if (!('speechSynthesis' in window)) {
      console.warn('Speech synthesis not supported in this browser.');
      return;
    }

    this.stop();

    // Clean text of markdown stars or symbols for clean speech
    const cleanText = text
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/#+/g, '')
      .replace(/\[.*?\]/g, '')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'fr-FR';
    utterance.rate = 0.84; // Calm, meditative, slow cadence
    utterance.pitch = 0.88; // Deep, grounded, ancient timbre

    // Try finding the most fitting French voice
    const voices = window.speechSynthesis.getVoices();
    const frVoice = voices.find(v => v.lang.startsWith('fr') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Amélie') || v.name.includes('Thomas') || v.name.includes('Henri')));
    if (frVoice) {
      utterance.voice = frVoice;
    } else {
      const anyFr = voices.find(v => v.lang.startsWith('fr'));
      if (anyFr) utterance.voice = anyFr;
    }

    utterance.onstart = () => {
      this.isSpeaking = true;
      if (this.onStateChange) this.onStateChange(true);
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      this.currentUtterance = null;
      if (this.onStateChange) this.onStateChange(false);
      if (onEnd) onEnd();
    };

    utterance.onerror = () => {
      this.isSpeaking = false;
      this.currentUtterance = null;
      if (this.onStateChange) this.onStateChange(false);
      if (onEnd) onEnd();
    };

    this.currentUtterance = utterance;
    window.speechSynthesis.speak(utterance);
  }

  public stop() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.isSpeaking = false;
    this.currentUtterance = null;
    if (this.onStateChange) this.onStateChange(false);
  }

  public getIsSpeaking(): boolean {
    return this.isSpeaking;
  }
}

export const turtleVoice = new TurtleVoice();
