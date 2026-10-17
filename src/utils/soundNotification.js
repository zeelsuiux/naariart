// Web Audio API chime synthesizer for crisp in-app notifications
let audioCtx = null;

export const playNotificationChime = (type = 'success') => {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;

    if (!audioCtx || audioCtx.state === 'suspended') {
      audioCtx = new AudioContextClass();
    }

    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const now = audioCtx.currentTime;

    if (type === 'message') {
      // Gentle double-ping for message
      const osc1 = audioCtx.createOscillator();
      const osc2 = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      gainNode.connect(audioCtx.destination);
      gainNode.gain.setValueAtTime(0.2, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, now); // D5
      osc1.frequency.exponentialRampToValueAtTime(880, now + 0.15); // A5
      osc1.connect(gainNode);

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(880, now + 0.16); // A5
      osc2.frequency.exponentialRampToValueAtTime(1174.66, now + 0.45); // D6
      osc2.connect(gainNode);

      osc1.start(now);
      osc1.stop(now + 0.2);
      osc2.start(now + 0.15);
      osc2.stop(now + 0.5);
    } else if (type === 'error') {
      // Low dual tone
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      gainNode.connect(audioCtx.destination);
      gainNode.gain.setValueAtTime(0.25, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(200, now + 0.35);
      osc.connect(gainNode);

      osc.start(now);
      osc.stop(now + 0.4);
    } else {
      // Bright pleasant two-tone chime for activity / action success
      const osc1 = audioCtx.createOscillator();
      const osc2 = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      gain.connect(audioCtx.destination);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(523.25, now); // C5
      osc1.frequency.setValueAtTime(659.25, now + 0.12); // E5
      osc1.connect(gain);

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(783.99, now + 0.24); // G5
      osc2.frequency.exponentialRampToValueAtTime(1046.5, now + 0.5); // C6
      osc2.connect(gain);

      osc1.start(now);
      osc1.stop(now + 0.25);
      osc2.start(now + 0.24);
      osc2.stop(now + 0.55);
    }
  } catch (err) {
    console.warn('Audio chime warning:', err);
  }
};
