/**
 * Shared UI style constants for HUD and overlay components.
 * Provides a consistent frosted white glassmorphism design system.
 * @module styles
 */

/** Frosted white glassmorphism panel style for HUD elements. */
export const glassPanel = {
  backgroundColor: 'rgba(255, 255, 255, 0.72)',
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  padding: '14px 18px',
  borderRadius: '12px',
  border: '1px solid rgba(0, 0, 0, 0.08)',
  boxShadow: '0 4px 24px rgba(0, 0, 0, 0.08)',
};

/** Small uppercase label style used for HUD headings. */
export const labelStyle = {
  fontSize: '0.65rem',
  color: 'rgba(30, 41, 59, 0.6)',
  letterSpacing: '2px',
  textTransform: 'uppercase',
  fontFamily: "'Inter', sans-serif",
};

/** Button style matching frosted white theme. */
export const buttonStyle = {
  backgroundColor: 'rgba(255, 255, 255, 0.75)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  color: '#334155',
  border: '1px solid rgba(0, 0, 0, 0.1)',
  padding: '10px 18px',
  borderRadius: '10px',
  cursor: 'pointer',
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: '0.75rem',
  letterSpacing: '1px',
  transition: 'all 0.2s ease',
  boxShadow: '0 2px 12px rgba(0, 0, 0, 0.06)',
};

/** Monospace value display style (e.g., reputation number). */
export const monoValueStyle = {
  fontSize: '1.6rem',
  fontWeight: 700,
  color: '#1e293b',
  fontFamily: "'JetBrains Mono', monospace",
};

/** Accent colors used across the game UI. */
export const ACCENT_COLORS = {
  green: '#16a34a',
  yellow: '#ca8a04',
  red: '#dc2626',
  cyan: '#0891b2',
  blue: '#2563eb',
  gold: '#b45309',
};
