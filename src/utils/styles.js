/**
 * Shared UI style constants for HUD and overlay components.
 * Provides a consistent glassmorphism design system.
 * @module styles
 */

/** Glassmorphism panel style for HUD elements. */
export const glassPanel = {
  backgroundColor: 'rgba(10, 10, 20, 0.6)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  padding: '14px 18px',
  borderRadius: '12px',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  boxShadow: '0 4px 24px rgba(0, 0, 0, 0.4)',
};

/** Small uppercase label style used for HUD headings. */
export const labelStyle = {
  fontSize: '0.65rem',
  color: 'rgba(255, 255, 255, 0.5)',
  letterSpacing: '2px',
  textTransform: 'uppercase',
  fontFamily: "'Inter', sans-serif",
};

/** Button style matching glassmorphism theme. */
export const buttonStyle = {
  backgroundColor: 'rgba(10, 10, 20, 0.6)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  color: 'rgba(255, 255, 255, 0.7)',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  padding: '10px 18px',
  borderRadius: '10px',
  cursor: 'pointer',
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: '0.75rem',
  letterSpacing: '1px',
  transition: 'all 0.2s ease',
  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
};

/** Monospace value display style (e.g., reputation number). */
export const monoValueStyle = {
  fontSize: '1.6rem',
  fontWeight: 700,
  color: '#fff',
  fontFamily: "'JetBrains Mono', monospace",
};

/** Accent colors used across the game UI. */
export const ACCENT_COLORS = {
  green: '#33ff88',
  yellow: '#ffbb33',
  red: '#ff3344',
  cyan: '#00ffaa',
  blue: '#4488ff',
  gold: '#ffd700',
};
