/**
 * Procedural Web Audio API for immersive nocturnal ocean soundscape:
 * - Soothing rhythmic ocean surf (pink noise filtered through low-pass LFO)
 * - Gentle night wind/breeze
 * - Singing bowl / celestial chime tone on wisdom moments
 */

class OceanSoundscape {
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private masterGain: GainNode | null = null;
  private surfGain: GainNode | null = null;
  private noiseNode: AudioBufferSourceNode | null = null;
  private filterNode: BiquadFilterNode | null = null;
  private lfoNode: OscillatorNode | null = null;
  private lfoGain: GainNode | null = null;

  public init() {
    if (this.ctx) return;
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    this.ctx = new AudioCtx();
  }

  public async start(volume = 0.5) {
    this.init();
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }
    if (this.isPlaying) return;

    // Master volume
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(volume, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);

    // Create 5 seconds of pink noise buffer
    const bufferSize = this.ctx.sampleRate * 5;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.08;
      b6 = white * 0.115926;
    }

    this.noiseNode = this.ctx.createBufferSource();
    this.noiseNode.buffer = noiseBuffer;
    this.noiseNode.loop = true;

    // Low-pass filter for ocean wave whoosh
    this.filterNode = this.ctx.createBiquadFilter();
    this.filterNode.type = 'lowpass';
    this.filterNode.frequency.setValueAtTime(320, this.ctx.currentTime);
    this.filterNode.Q.setValueAtTime(1.8, this.ctx.currentTime);

    // Gain for waves
    this.surfGain = this.ctx.createGain();
    this.surfGain.gain.setValueAtTime(0.2, this.ctx.currentTime);

    // LFO for rhythmic swells (approx 8 seconds per wave: 0.125 Hz)
    this.lfoNode = this.ctx.createOscillator();
    this.lfoNode.type = 'sine';
    this.lfoNode.frequency.setValueAtTime(0.12, this.ctx.currentTime); // 8.3s cycle

    // LFO modulates the filter frequency and surf gain
    this.lfoGain = this.ctx.createGain();
    this.lfoGain.gain.setValueAtTime(260, this.ctx.currentTime);

    this.lfoNode.connect(this.lfoGain);
    this.lfoGain.connect(this.filterNode.frequency);

    // Also modulate wave volume slightly with LFO
    const lfoAmpGain = this.ctx.createGain();
    lfoAmpGain.gain.setValueAtTime(0.35, this.ctx.currentTime);
    this.lfoNode.connect(lfoAmpGain);
    lfoAmpGain.connect(this.surfGain.gain);

    this.noiseNode.connect(this.filterNode);
    this.filterNode.connect(this.surfGain);
    this.surfGain.connect(this.masterGain);

    this.noiseNode.start(0);
    this.lfoNode.start(0);
    this.isPlaying = true;
  }

  public setVolume(volume: number) {
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(Math.max(0, Math.min(1, volume)), this.ctx.currentTime, 0.1);
    }
  }

  public stop() {
    if (!this.isPlaying || !this.ctx) return;
    try {
      if (this.noiseNode) {
        this.noiseNode.stop();
        this.noiseNode.disconnect();
      }
      if (this.lfoNode) {
        this.lfoNode.stop();
        this.lfoNode.disconnect();
      }
    } catch {
      // Ignored
    }
    this.isPlaying = false;
  }

  public playChime() {
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      // Beautiful harmonic chime in pentatonic scale (E4, B4, F#5)
      const freqs = [329.63, 493.88, 739.99];
      freqs.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.exponentialRampToValueAtTime(0.12 / (idx + 1), now + idx * 0.08 + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 2.8);

        osc.connect(gain);
        if (this.masterGain) {
          gain.connect(this.masterGain);
        } else {
          gain.connect(this.ctx!.destination);
        }

        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 3.0);
      });
    } catch {
      // Audio context might be restricted
    }
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }
}

export const oceanAudio = new OceanSoundscape();
