# Audio Assets Directory

As specified in the project requirements, all audio feedback (beeps, confirmation chimes, warning buzzers, and sweep tones) is synthesized programmatically at runtime using the Web Audio API (see `js/audio.js`).

This ensures:
1. Zero external network latency and instant audio feedback.
2. 100% offline functionality.
3. No missing or broken audio file dependencies.
4. Full mathematical precision in tone frequencies and non-fatiguing envelopes.
