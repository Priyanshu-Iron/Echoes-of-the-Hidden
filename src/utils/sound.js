/**
 * SoundManager — Handles game audio using Web Audio API and Speech Synthesis.
 * Provides methods for background music, sound effects, and NPC speech.
 */

class SoundManager {
    constructor() {
        this.ctx = null;
        this.masterGain = null;
        this.isMuted = false;
        this.synth = window.speechSynthesis;
        this.voices = [];
        this.initialized = false;

        // Load voices when available
        if (this.synth.onvoiceschanged !== undefined) {
            this.synth.onvoiceschanged = () => {
                this.voices = this.synth.getVoices();
            };
        }
    }

    /** Initialize AudioContext on user interaction */
    init() {
        if (this.initialized) return;
        
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();
            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.value = 0.3; // Master volume
            this.masterGain.connect(this.ctx.destination);
            this.initialized = true;
            this.voices = this.synth.getVoices();
        } catch (e) {
            console.error('Web Audio API not supported:', e);
        }
    }

    /** Play a simple oscillator sound */
    playTone(freq, type, duration, vol = 1.0) {
        if (!this.initialized || this.isMuted) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        
        gain.gain.setValueAtTime(vol, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    }

    /** 
     * Play a "funny" guard alert sound 
     * High pitched "Huh?" sound
     */
    playGuardAlert() {
        this.playTone(400, 'sawtooth', 0.2, 0.5);
        setTimeout(() => this.playTone(600, 'sawtooth', 0.4, 0.5), 100);
    }

    /** 
     * Play a "funny" guard chase sound 
     * Sirens!
     */
    playGuardChase() {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.linearRampToValueAtTime(800, now + 0.1);
        osc.frequency.linearRampToValueAtTime(600, now + 0.2);
        osc.frequency.linearRampToValueAtTime(800, now + 0.3);

        gain.gain.setValueAtTime(0.3, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.5);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start();
        osc.stop(now + 0.5);
    }

    /**
     * Speak text using SpeechSynthesis with "funny" pitch/rate
     * @param {string} text - Text to speak
     * @param {Object} params - { pitch, rate, voiceIndex }
     */
    speak(text, params = {}) {
        if (this.isMuted) return;
        
        // Cancel previous speech to avoid queue buildup
        this.synth.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        
        // Default "funny" parameters
        utterance.pitch = params.pitch || 1.0;
        utterance.rate = params.rate || 1.0;
        utterance.volume = 0.8;

        // Try to select a voice
        if (this.voices.length > 0) {
            // Prefer English voices
            const englishVoices = this.voices.filter(v => v.lang.startsWith('en'));
            const voice = englishVoices[params.voiceIndex % englishVoices.length] || this.voices[0];
            utterance.voice = voice;
        }

        this.synth.speak(utterance);
    }

    /**
     * Play "sneaky" background music loop
     * Simple pizzicato-style sequence
     */
    playBackgroundMusic() {
        if (!this.initialized || this.isMuted) return;
        
        // Simple bass line loop
        const sequence = [110, 0, 130, 0, 146, 0, 130, 0]; // A2, C3, D3, C3
        let step = 0;

        // Use setInterval for simple sequencing (not precise, but "funny" enough)
        if (this.musicInterval) clearInterval(this.musicInterval);
        
        this.musicInterval = setInterval(() => {
            if (this.isMuted) return;
            
            const freq = sequence[step];
            if (freq > 0) {
                this.playTone(freq, 'triangle', 0.1, 0.2);
            }
            step = (step + 1) % sequence.length;
        }, 250); // 240 BPM eighth notes
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.isMuted) {
            this.synth.cancel();
            if (this.ctx) this.ctx.suspend();
        } else {
            if (this.ctx) this.ctx.resume();
        }
        return this.isMuted;
    }
}

export const soundManager = new SoundManager();
