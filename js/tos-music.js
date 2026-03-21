/* ============================================
   TOS Network — "Digital Dawn"
   Sung by synthesized female digital voice
   Pure Web Audio API formant synthesis
   ============================================ */

class TOSSong {
    constructor() {
        this.ctx = null;
        this.masterGain = null;
        this.compressor = null;
        this.reverbNode = null;
        this.playing = false;
        this.bpm = 108;
        this.beat = 60 / this.bpm;       // ~0.556s
        this.bar = this.beat * 4;         // ~2.222s
        this.songTimers = [];
        this.startTime = 0;

        // D minor key
        // Chord progression: Dm → Bb → F → C (i → VI → III → VII)
        this.chords = [
            { bass: 73.42, notes: [293.66, 349.23, 440.00] },   // Dm: D F A
            { bass: 58.27, notes: [233.08, 293.66, 349.23] },   // Bb: Bb D F
            { bass: 87.31, notes: [349.23, 440.00, 523.25] },   // F:  F A C5
            { bass: 65.41, notes: [261.63, 329.63, 392.00] },   // C:  C E G
        ];

        // Female vocal formants (F1, F2, F3, bandwidth)
        // Wide bandwidths for audible output through bandpass filters
        this.vowels = {
            'a':  { f: [850, 1200, 2800], bw: [200, 180, 250], amp: [1, 0.7, 0.4] },
            'e':  { f: [500, 1900, 2700], bw: [170, 200, 250], amp: [1, 0.6, 0.35] },
            'i':  { f: [300, 2500, 3100], bw: [150, 220, 270], amp: [1, 0.5, 0.3] },
            'o':  { f: [450,  900, 2700], bw: [180, 200, 250], amp: [1, 0.6, 0.35] },
            'u':  { f: [350,  700, 2600], bw: [150, 170, 230], amp: [1, 0.5, 0.3] },
            'ah': { f: [800, 1150, 2900], bw: [200, 180, 250], amp: [1, 0.7, 0.4] },
        };

        /*
         * Song melody — each entry: [beatOffset, freq, duration(beats), vowel, volume]
         *
         * Lyrics concept (vocalized):
         *   Verse:  "Laa — ah — ooh — ee... ah — ooh — nah — ee..."
         *   Chorus: "Dii-gi-tal dawn... aah — ooh — laa..."
         *
         * We sing vowels + simple syllables for digital-human aesthetic
         */

        // Verse melody (8 bars = 32 beats) — gentle, floating
        this.verseMelody = [
            // Bar 1-2: ascending phrase
            [0,    293.66, 2, 'a'],     // D4 "laa"
            [2,    349.23, 1, 'ah'],    // F4 "ah"
            [3.5,  440.00, 1.5, 'u'],   // A4 "ooh"
            [5.5,  523.25, 2, 'i'],     // C5 "ee"
            // Bar 3-4: descending answer
            [8,    440.00, 2, 'ah'],    // A4 "ah"
            [10,   349.23, 1.5, 'u'],   // F4 "ooh"
            [12,   329.63, 1, 'a'],     // E4 "nah"
            [13.5, 293.66, 2.5, 'i'],   // D4 "ee"
            // Bar 5-6: higher phrase
            [16,   349.23, 1, 'a'],     // F4 "laa"
            [17.5, 440.00, 1.5, 'e'],   // A4 "eh"
            [19.5, 523.25, 2, 'ah'],    // C5 "ah"
            [22,   587.33, 2, 'u'],     // D5 "ooh"
            // Bar 7-8: resolution
            [24,   523.25, 1.5, 'i'],   // C5 "ee"
            [26,   440.00, 2, 'o'],     // A4 "oh"
            [28.5, 349.23, 1.5, 'ah'],  // F4 "ah"
            [30,   293.66, 2, 'a'],     // D4 "laa"
        ];

        // Chorus melody (8 bars) — soaring, powerful
        this.chorusMelody = [
            // Bar 1-2: "Digital dawn" motif — strong ascending
            [0,    440.00, 0.7, 'i'],   // A4 "di"
            [0.8,  440.00, 0.5, 'i'],   // A4 "gi"
            [1.5,  523.25, 0.7, 'a'],   // C5 "tal"
            [2.5,  587.33, 2.5, 'o'],   // D5 "dawn" (sustained)
            // Bar 3-4: "Agents rise" — peak
            [5.5,  659.25, 1, 'e'],     // E5 "eh"
            [7,    587.33, 1.5, 'a'],   // D5 "ah"
            [9,    523.25, 2, 'i'],     // C5 "ee"
            [11,   440.00, 1, 'u'],     // A4 "ooh"
            // Bar 5-6: "Light and code" — echo of verse
            [12.5, 523.25, 1, 'a'],     // C5 "la"
            [14,   587.33, 1, 'ah'],    // D5 "ah"
            [15.5, 659.25, 2.5, 'u'],   // E5 "ooh" (soaring)
            [18.5, 587.33, 1.5, 'i'],   // D5 "ee"
            // Bar 7-8: resolution with harmony
            [20.5, 523.25, 1.5, 'ah'],  // C5 "ah"
            [22.5, 440.00, 1.5, 'o'],   // A4 "oh"
            [24.5, 349.23, 1.5, 'a'],   // F4 "la"
            [26.5, 293.66, 3, 'ah'],    // D4 "aah" (long resolve)
            [30,   293.66, 2, 'u'],     // D4 "ooh" (fade)
        ];

        // Chorus harmony (sung slightly quieter, offset thirds/fifths)
        this.chorusHarmony = [
            [0,    349.23, 0.7, 'i', 0.5],
            [0.8,  349.23, 0.5, 'i', 0.5],
            [1.5,  440.00, 0.7, 'a', 0.5],
            [2.5,  440.00, 2.5, 'o', 0.5],
            [5.5,  523.25, 1, 'e', 0.5],
            [7,    440.00, 1.5, 'a', 0.5],
            [9,    392.00, 2, 'i', 0.5],
            [11,   349.23, 1, 'u', 0.5],
            [15.5, 523.25, 2.5, 'u', 0.45],
            [20.5, 392.00, 1.5, 'ah', 0.45],
            [22.5, 349.23, 1.5, 'o', 0.45],
            [24.5, 293.66, 1.5, 'a', 0.45],
            [26.5, 220.00, 3, 'ah', 0.4],
        ];

        // Bridge melody — ethereal, minimal
        this.bridgeMelody = [
            [0,    587.33, 3, 'u'],     // D5 "ooh"
            [4,    523.25, 3, 'ah'],    // C5 "ah"
            [8,    659.25, 4, 'a'],     // E5 "laa" (soaring)
            [13,   587.33, 3, 'i'],     // D5 "ee"
            [17,   523.25, 2, 'o'],     // C5 "oh"
            [20,   440.00, 3, 'ah'],    // A4 "ah"
            [24,   349.23, 2, 'u'],     // F4 "ooh"
            [27,   293.66, 4, 'a'],     // D4 "laa" (long fade)
        ];
    }

    /* ========== Initialization ========== */

    init() {
        if (this.ctx) return;
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();

        this.compressor = this.ctx.createDynamicsCompressor();
        this.compressor.threshold.value = -18;
        this.compressor.ratio.value = 6;
        this.compressor.attack.value = 0.003;
        this.compressor.release.value = 0.15;

        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = 0;

        // Shared reverb send
        this.reverbNode = this.buildReverb(2.5);
        this.reverbGain = this.ctx.createGain();
        this.reverbGain.gain.value = 0.25;
        this.reverbNode.connect(this.reverbGain);
        this.reverbGain.connect(this.compressor);

        this.compressor.connect(this.masterGain);
        this.masterGain.connect(this.ctx.destination);
    }

    buildReverb(seconds) {
        const rate = this.ctx.sampleRate;
        const len = rate * seconds;
        const buf = this.ctx.createBuffer(2, len, rate);
        for (let ch = 0; ch < 2; ch++) {
            const d = buf.getChannelData(ch);
            for (let i = 0; i < len; i++) {
                d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.2);
            }
        }
        const conv = this.ctx.createConvolver();
        conv.buffer = buf;
        return conv;
    }

    /* ========== Sound Generators ========== */

    // ---- Kick drum ----
    kick(time) {
        const ctx = this.ctx;
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(150, time);
        osc.frequency.exponentialRampToValueAtTime(30, time + 0.12);
        g.gain.setValueAtTime(0.2, time);
        g.gain.exponentialRampToValueAtTime(0.001, time + 0.35);
        osc.connect(g);
        g.connect(this.compressor);
        osc.start(time);
        osc.stop(time + 0.4);
    }

    // ---- Snare (noise-based) ----
    snare(time) {
        const ctx = this.ctx;
        const len = ctx.sampleRate * 0.15;
        const buf = ctx.createBuffer(1, len, ctx.sampleRate);
        const d = buf.getChannelData(0);
        for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
        const src = ctx.createBufferSource();
        src.buffer = buf;
        const flt = ctx.createBiquadFilter();
        flt.type = 'highpass';
        flt.frequency.value = 1500;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.18, time);
        g.gain.exponentialRampToValueAtTime(0.001, time + 0.15);
        src.connect(flt);
        flt.connect(g);
        g.connect(this.compressor);
        src.start(time);
        src.stop(time + 0.2);
    }

    // ---- Hi-hat ----
    hihat(time, open) {
        const ctx = this.ctx;
        const len = ctx.sampleRate * (open ? 0.15 : 0.05);
        const buf = ctx.createBuffer(1, len, ctx.sampleRate);
        const d = buf.getChannelData(0);
        for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
        const src = ctx.createBufferSource();
        src.buffer = buf;
        const flt = ctx.createBiquadFilter();
        flt.type = 'highpass';
        flt.frequency.value = 7000;
        const g = ctx.createGain();
        g.gain.setValueAtTime(open ? 0.05 : 0.035, time);
        g.gain.exponentialRampToValueAtTime(0.001, time + (open ? 0.15 : 0.05));
        src.connect(flt);
        flt.connect(g);
        g.connect(this.compressor);
        src.start(time);
        src.stop(time + 0.2);
    }

    // ---- Sub bass ----
    bass(time, freq, dur) {
        const ctx = this.ctx;
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        const flt = ctx.createBiquadFilter();
        osc.type = 'sine';
        osc.frequency.value = freq;
        flt.type = 'lowpass';
        flt.frequency.value = 250;
        g.gain.setValueAtTime(0, time);
        g.gain.linearRampToValueAtTime(0.15, time + 0.05);
        g.gain.setValueAtTime(0.15, time + dur - 0.05);
        g.gain.linearRampToValueAtTime(0, time + dur);
        osc.connect(flt);
        flt.connect(g);
        g.connect(this.compressor);
        osc.start(time);
        osc.stop(time + dur + 0.05);
    }

    // ---- Warm pad chord ----
    pad(time, freqs, dur) {
        const ctx = this.ctx;
        freqs.forEach(f => {
            const o1 = ctx.createOscillator();
            const o2 = ctx.createOscillator();
            const g = ctx.createGain();
            const flt = ctx.createBiquadFilter();
            o1.type = 'sine';
            o1.frequency.value = f;
            o2.type = 'triangle';
            o2.frequency.value = f * 1.003;
            flt.type = 'lowpass';
            flt.frequency.value = 900;
            g.gain.setValueAtTime(0, time);
            g.gain.linearRampToValueAtTime(0.04, time + dur * 0.3);
            g.gain.linearRampToValueAtTime(0.03, time + dur * 0.8);
            g.gain.linearRampToValueAtTime(0, time + dur);
            o1.connect(flt);
            o2.connect(flt);
            flt.connect(g);
            g.connect(this.compressor);
            g.connect(this.reverbNode);
            o1.start(time);
            o2.start(time);
            o1.stop(time + dur + 0.1);
            o2.stop(time + dur + 0.1);
        });
    }

    // ---- Crystal arpeggio ----
    arp(time, freq, dur) {
        const ctx = this.ctx;
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        g.gain.setValueAtTime(0, time);
        g.gain.linearRampToValueAtTime(0.06, time + 0.015);
        g.gain.exponentialRampToValueAtTime(0.001, time + dur);
        osc.connect(g);
        g.connect(this.compressor);
        g.connect(this.reverbNode);
        osc.start(time);
        osc.stop(time + dur + 0.05);
    }

    /* ========== VOCAL SYNTHESIZER ========== */

    /**
     * Formant-based female vocal synth
     * @param {number} time - start time
     * @param {number} freq - fundamental pitch
     * @param {number} dur  - duration in seconds
     * @param {string} vowel - vowel key
     * @param {number} vol  - volume multiplier 0-1
     */
    vocal(time, freq, dur, vowel, vol) {
        const ctx = this.ctx;
        const v = this.vowels[vowel] || this.vowels['a'];
        vol = (vol || 1) * 0.7;

        // Glottal source: sawtooth (harmonically rich) + square (adds body) + slight detune
        const src1 = ctx.createOscillator();
        const src2 = ctx.createOscillator();
        const src3 = ctx.createOscillator();
        src1.type = 'sawtooth';
        src1.frequency.value = freq;
        src2.type = 'sawtooth';
        src2.frequency.value = freq * 1.003;
        src3.type = 'square';
        src3.frequency.value = freq * 0.998;

        // Vibrato LFO (5.5 Hz, expressive)
        const vibLfo = ctx.createOscillator();
        const vibGain = ctx.createGain();
        vibLfo.type = 'sine';
        vibLfo.frequency.value = 5.5;
        vibGain.gain.value = freq * 0.015; // ~25 cents
        vibLfo.connect(vibGain);
        vibGain.connect(src1.frequency);
        vibGain.connect(src2.frequency);
        vibGain.connect(src3.frequency);
        // Delay vibrato onset
        vibGain.gain.setValueAtTime(0, time);
        vibGain.gain.linearRampToValueAtTime(freq * 0.015, time + Math.min(dur * 0.35, 0.4));

        // Source mix — loud enough to survive formant filtering
        const srcMix = ctx.createGain();
        srcMix.gain.value = 1.0;
        src1.connect(srcMix);
        src2.connect(srcMix);
        const src3Gain = ctx.createGain();
        src3Gain.gain.value = 0.3;
        src3.connect(src3Gain);
        src3Gain.connect(srcMix);

        // Formant filters (3 parallel bandpass → merger)
        const merger = ctx.createGain();
        merger.gain.value = 2.5; // boost to compensate bandpass attenuation

        for (let i = 0; i < 3; i++) {
            const bp = ctx.createBiquadFilter();
            bp.type = 'bandpass';
            bp.frequency.value = v.f[i];
            bp.Q.value = v.f[i] / v.bw[i];
            const fg = ctx.createGain();
            fg.gain.value = v.amp[i];
            srcMix.connect(bp);
            bp.connect(fg);
            fg.connect(merger);
        }

        // Add breathiness (filtered noise) — makes voice airy and present
        const noiseLen = Math.max(1, Math.floor(ctx.sampleRate * dur));
        const noiseBuf = ctx.createBuffer(1, noiseLen, ctx.sampleRate);
        const nd = noiseBuf.getChannelData(0);
        for (let i = 0; i < noiseLen; i++) nd[i] = Math.random() * 2 - 1;
        const noiseSrc = ctx.createBufferSource();
        noiseSrc.buffer = noiseBuf;
        const noiseFlt = ctx.createBiquadFilter();
        noiseFlt.type = 'bandpass';
        noiseFlt.frequency.value = 2500;
        noiseFlt.Q.value = 0.7;
        const noiseGain = ctx.createGain();
        noiseGain.gain.value = 0.06;
        noiseSrc.connect(noiseFlt);
        noiseFlt.connect(noiseGain);
        noiseGain.connect(merger);

        // Master vocal envelope
        const envGain = ctx.createGain();
        const attack = Math.min(0.08, dur * 0.1);
        const release = Math.min(0.3, dur * 0.25);
        envGain.gain.setValueAtTime(0, time);
        envGain.gain.linearRampToValueAtTime(vol, time + attack);
        envGain.gain.setValueAtTime(vol, time + dur - release);
        envGain.gain.linearRampToValueAtTime(0, time + dur);

        merger.connect(envGain);

        // Vocal reverb (wet send)
        const vocalReverb = ctx.createGain();
        vocalReverb.gain.value = 0.4;
        envGain.connect(this.compressor);
        envGain.connect(vocalReverb);
        vocalReverb.connect(this.reverbNode);

        // Start/stop all
        const endTime = time + dur + 0.1;
        src1.start(time);
        src2.start(time);
        src3.start(time);
        vibLfo.start(time);
        noiseSrc.start(time);
        src1.stop(endTime);
        src2.stop(endTime);
        src3.stop(endTime);
        vibLfo.stop(endTime);
        noiseSrc.stop(endTime);
    }

    /* ========== Drum patterns ========== */

    scheduleDrums(startTime, bars, intensity) {
        for (let bar = 0; bar < bars; bar++) {
            const bt = startTime + bar * this.bar;
            // Kick: beats 1 and 3
            this.kick(bt);
            this.kick(bt + this.beat * 2);
            // Extra kick on beat 3.5 in chorus
            if (intensity > 1) {
                this.kick(bt + this.beat * 2.5);
            }
            // Snare: beats 2 and 4
            this.snare(bt + this.beat);
            this.snare(bt + this.beat * 3);
            // Hi-hats: 8ths
            for (let h = 0; h < 8; h++) {
                this.hihat(bt + h * this.beat * 0.5, h % 4 === 2);
            }
        }
    }

    /* ========== Arpeggio pattern ========== */

    scheduleArp(startTime, chordIdx, bars) {
        const chord = this.chords[chordIdx % 4];
        // Arp pool: chord notes in upper octave
        const pool = chord.notes.map(n => n * 2);
        pool.push(chord.notes[0] * 4); // extra high note

        for (let bar = 0; bar < bars; bar++) {
            const bt = startTime + bar * this.bar;
            for (let i = 0; i < 8; i++) {
                const note = pool[i % pool.length];
                this.arp(bt + i * this.beat * 0.5, note, this.beat * 0.45);
            }
        }
    }

    /* ========== Song arrangement ========== */

    scheduleSong() {
        const t0 = this.ctx.currentTime + 0.2;
        this.startTime = t0;
        let t = t0;

        // ===== INTRO (8 bars) — pad + arp build =====
        for (let i = 0; i < 8; i++) {
            const ci = i % 4;
            const bt = t + i * this.bar;
            this.pad(bt, this.chords[ci].notes, this.bar);
            if (i >= 4) {
                this.scheduleArp(bt, ci, 1);
            }
        }
        t += 8 * this.bar;

        // ===== VERSE 1 (8 bars) — add drums + bass + vocal =====
        for (let i = 0; i < 8; i++) {
            const ci = i % 4;
            const bt = t + i * this.bar;
            this.pad(bt, this.chords[ci].notes, this.bar);
            this.bass(bt, this.chords[ci].bass, this.bar - 0.05);
            this.scheduleArp(bt, ci, 1);
        }
        this.scheduleDrums(t, 8, 1);
        // Vocal
        this.verseMelody.forEach(n => {
            this.vocal(t + n[0] * this.beat, n[1], n[2] * this.beat, n[3], n[4] || 0.9);
        });
        t += 8 * this.bar;

        // ===== CHORUS 1 (8 bars) — full energy + vocal + harmony =====
        for (let i = 0; i < 8; i++) {
            const ci = i % 4;
            const bt = t + i * this.bar;
            this.pad(bt, this.chords[ci].notes, this.bar);
            this.bass(bt, this.chords[ci].bass, this.bar - 0.05);
            this.scheduleArp(bt, ci, 1);
        }
        this.scheduleDrums(t, 8, 2);
        this.chorusMelody.forEach(n => {
            this.vocal(t + n[0] * this.beat, n[1], n[2] * this.beat, n[3], n[4] || 1.0);
        });
        this.chorusHarmony.forEach(n => {
            this.vocal(t + n[0] * this.beat, n[1], n[2] * this.beat, n[3], n[4] || 0.5);
        });
        t += 8 * this.bar;

        // ===== VERSE 2 (8 bars) — same structure, slight variation =====
        for (let i = 0; i < 8; i++) {
            const ci = i % 4;
            const bt = t + i * this.bar;
            this.pad(bt, this.chords[ci].notes, this.bar);
            this.bass(bt, this.chords[ci].bass, this.bar - 0.05);
            if (i % 2 === 0) this.scheduleArp(bt, ci, 1);
        }
        this.scheduleDrums(t, 8, 1);
        this.verseMelody.forEach(n => {
            // Slightly different dynamics
            this.vocal(t + n[0] * this.beat, n[1], n[2] * this.beat, n[3], (n[4] || 0.9) * 0.95);
        });
        t += 8 * this.bar;

        // ===== BRIDGE (8 bars) — stripped back, ethereal =====
        for (let i = 0; i < 8; i++) {
            const ci = i % 4;
            const bt = t + i * this.bar;
            this.pad(bt, this.chords[ci].notes, this.bar);
            if (i >= 4) {
                this.bass(bt, this.chords[ci].bass, this.bar - 0.05);
            }
        }
        // Light drums only second half
        this.scheduleDrums(t + 4 * this.bar, 4, 1);
        this.bridgeMelody.forEach(n => {
            this.vocal(t + n[0] * this.beat, n[1], n[2] * this.beat, n[3], 0.85);
        });
        t += 8 * this.bar;

        // ===== FINAL CHORUS (8 bars) — climax =====
        for (let i = 0; i < 8; i++) {
            const ci = i % 4;
            const bt = t + i * this.bar;
            this.pad(bt, this.chords[ci].notes, this.bar);
            this.bass(bt, this.chords[ci].bass, this.bar - 0.05);
            this.scheduleArp(bt, ci, 1);
        }
        this.scheduleDrums(t, 8, 2);
        this.chorusMelody.forEach(n => {
            this.vocal(t + n[0] * this.beat, n[1], n[2] * this.beat, n[3], (n[4] || 1.0) * 1.1);
        });
        this.chorusHarmony.forEach(n => {
            this.vocal(t + n[0] * this.beat, n[1], n[2] * this.beat, n[3], (n[4] || 0.5) * 1.1);
        });
        // Extra high harmony layer for climax
        this.chorusMelody.forEach(n => {
            if (n[1] >= 440) {
                this.vocal(t + n[0] * this.beat, n[1] * 2, n[2] * this.beat, 'u', 0.25);
            }
        });
        t += 8 * this.bar;

        // ===== OUTRO (4 bars) — fade =====
        for (let i = 0; i < 4; i++) {
            const ci = i % 4;
            const bt = t + i * this.bar;
            this.pad(bt, this.chords[ci].notes, this.bar);
        }
        // Final sustained vocal note
        this.vocal(t, 293.66, 4 * this.bar * 0.8, 'ah', 0.6);
        this.vocal(t, 440.00, 4 * this.bar * 0.8, 'u', 0.3);

        // Fade out master at the end
        const endTime = t + 4 * this.bar;
        this.masterGain.gain.setValueAtTime(0.75, endTime - 3);
        this.masterGain.gain.linearRampToValueAtTime(0, endTime);

        // Loop: restart after song ends
        const songLen = (endTime - t0) * 1000 + 2000;
        const loopTimer = setTimeout(() => {
            if (this.playing) {
                this.scheduleSong();
            }
        }, songLen);
        this.songTimers.push(loopTimer);
    }

    /* ========== Controls ========== */

    play() {
        this.init();
        if (this.playing) return;
        this.playing = true;

        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }

        // Fade in
        const now = this.ctx.currentTime;
        this.masterGain.gain.setValueAtTime(0, now);
        this.masterGain.gain.linearRampToValueAtTime(0.75, now + 2);

        this.scheduleSong();
    }

    pause() {
        if (!this.playing) return;
        this.playing = false;

        const now = this.ctx.currentTime;
        this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
        this.masterGain.gain.linearRampToValueAtTime(0, now + 1.5);

        this.songTimers.forEach(t => clearTimeout(t));
        this.songTimers = [];

        // Close and recreate context on next play for clean state
        setTimeout(() => {
            if (!this.playing && this.ctx) {
                this.ctx.close();
                this.ctx = null;
                this.masterGain = null;
                this.compressor = null;
                this.reverbNode = null;
            }
        }, 2000);
    }

    toggle() {
        if (this.playing) {
            this.pause();
        } else {
            this.play();
        }
        return this.playing;
    }
}

/* ========== UI: Floating music button ========== */
document.addEventListener('DOMContentLoaded', () => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const song = new TOSSong();

    const btn = document.createElement('button');
    btn.className = 'tos-music-btn';
    btn.setAttribute('aria-label', 'Play Digital Dawn - TOS Network Song');
    btn.title = 'Digital Dawn';
    btn.innerHTML = `
        <svg class="music-icon music-off" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 18V5l12-2v13"/>
            <circle cx="6" cy="18" r="3"/>
            <circle cx="18" cy="16" r="3"/>
        </svg>
        <svg class="music-icon music-on" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display:none">
            <path d="M9 18V5l12-2v13"/>
            <circle cx="6" cy="18" r="3"/>
            <circle cx="18" cy="16" r="3"/>
            <path d="M22 8c1.5 1 1.5 3 0 4" opacity="0.6"/>
            <path d="M24 6c2.5 2 2.5 6 0 8" opacity="0.4"/>
        </svg>
    `;

    btn.addEventListener('click', () => {
        const isPlaying = song.toggle();
        btn.classList.toggle('is-playing', isPlaying);
        btn.querySelector('.music-off').style.display = isPlaying ? 'none' : 'block';
        btn.querySelector('.music-on').style.display = isPlaying ? 'block' : 'none';
    });

    document.body.appendChild(btn);
});
