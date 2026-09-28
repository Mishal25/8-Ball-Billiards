/**
 * Web Audio API Acoustic Billiard Synthesizer
 * Provides crisp procedural audio without external audio file dependencies.
 */
class BilliardAudioManager {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
  }

  public setSoundEnabled(val: boolean) {
    this.enabled = val;
  }

  public playCueStrike(strength: number = 0.5) {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(130 + strength * 110, now);
    osc.frequency.exponentialRampToValueAtTime(35, now + 0.14);

    const vol = 0.35 * Math.min(1, Math.max(0.1, strength));
    gain.gain.setValueAtTime(vol, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.14);
  }

  public playBallCollision(speed: number = 1) {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    // Billiard phenolic resin sharp contact click
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1150 + Math.random() * 250, now);
    osc.frequency.exponentialRampToValueAtTime(260, now + 0.045);

    const vol = Math.min(0.38, Math.max(0.05, speed * 0.08));
    gain.gain.setValueAtTime(vol, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.045);
  }

  public playCushionBounce(speed: number = 1) {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    // Deep rubber cushion thump
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(110, now);
    osc.frequency.exponentialRampToValueAtTime(42, now + 0.08);

    const vol = Math.min(0.28, Math.max(0.04, speed * 0.06));
    gain.gain.setValueAtTime(vol, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.08);
  }

  public playPocket(vibrate: boolean = true) {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();

    const now = this.ctx.currentTime;

    // 1. Drop thump into leather/net pocket
    const drop = this.ctx.createOscillator();
    const dropGain = this.ctx.createGain();
    drop.type = 'sine';
    drop.frequency.setValueAtTime(175, now);
    drop.frequency.exponentialRampToValueAtTime(48, now + 0.2);
    dropGain.gain.setValueAtTime(0.4, now);
    dropGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    drop.connect(dropGain);
    dropGain.connect(this.ctx.destination);
    drop.start(now);
    drop.stop(now + 0.2);

    // 2. Clear golden chime of successful pot
    const chime = this.ctx.createOscillator();
    const chimeGain = this.ctx.createGain();
    chime.type = 'triangle';
    chime.frequency.setValueAtTime(587.33, now + 0.05); // D5
    chime.frequency.setValueAtTime(880.00, now + 0.12); // A5
    chimeGain.gain.setValueAtTime(0.14, now + 0.05);
    chimeGain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);
    chime.connect(chimeGain);
    chimeGain.connect(this.ctx.destination);
    chime.start(now + 0.05);
    chime.stop(now + 0.38);

    if (vibrate && typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([30, 40, 30]);
    }
  }

  public playFoul(vibrate: boolean = true) {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(190, now);
    osc.frequency.linearRampToValueAtTime(115, now + 0.32);
    gain.gain.setValueAtTime(0.22, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.32);

    if (vibrate && typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(220);
    }
  }

  public playWin() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();

    const now = this.ctx.currentTime;
    // Royal fanfare chord progression C - E - G - High C
    const chord = [523.25, 659.25, 783.99, 1046.5];
    chord.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.12);
      gain.gain.setValueAtTime(0.18, now + idx * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.65);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + idx * 0.12);
      osc.stop(now + idx * 0.12 + 0.65);
    });
  }
}

export const audio = new BilliardAudioManager();
