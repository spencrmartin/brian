import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBackendStatus } from '@/hooks/useBackendStatus';

/**
 * The 15 squares from loading.svg — 5 columns × 3 rows.
 * Colors preserved from the original SVG, staggered fade-in animation.
 *
 * Original SVG layout:
 *   Row 0: #FF8000  #D5FF00  #FF2F00  #00E1FF  #8A38F5
 *   Row 1: #00E1FF  #8A38F5  #FF8000  #D5FF00  #FF2F00
 *   Row 2: #FF8000  #FF2F00  #D5FF00  #00E1FF  #8A38F5
 */
const SQUARES: { row: number; col: number; color: string; delay: number }[] = [
  // Scattered order for organic loading feel
  { row: 1, col: 2, color: '#FF8000', delay: 0.0 },
  { row: 0, col: 4, color: '#8A38F5', delay: 0.12 },
  { row: 2, col: 0, color: '#FF8000', delay: 0.2 },
  { row: 0, col: 1, color: '#D5FF00', delay: 0.3 },
  { row: 1, col: 4, color: '#FF2F00', delay: 0.4 },
  { row: 2, col: 3, color: '#00E1FF', delay: 0.48 },
  { row: 0, col: 0, color: '#FF8000', delay: 0.56 },
  { row: 1, col: 1, color: '#8A38F5', delay: 0.65 },
  { row: 2, col: 4, color: '#8A38F5', delay: 0.72 },
  { row: 0, col: 3, color: '#00E1FF', delay: 0.8 },
  { row: 1, col: 0, color: '#00E1FF', delay: 0.88 },
  { row: 2, col: 2, color: '#D5FF00', delay: 0.95 },
  { row: 0, col: 2, color: '#FF2F00', delay: 1.05 },
  { row: 1, col: 3, color: '#D5FF00', delay: 1.15 },
  { row: 2, col: 1, color: '#FF2F00', delay: 1.25 },
];

function BrianLogoAnimated() {
  const size = 18;
  const gap = 3;

  return (
    <div
      className="relative"
      style={{
        width: 5 * size + 4 * gap,
        height: 3 * size + 2 * gap,
      }}
    >
      {SQUARES.map(({ row, col, color, delay }, i) => (
        <motion.div
          key={i}
          className="absolute rounded-[2px]"
          style={{
            width: size,
            height: size,
            left: col * (size + gap),
            top: row * (size + gap),
            backgroundColor: color,
          }}
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{
            opacity: [0, 0.95, 0.45, 0.9, 0.5],
            scale: [0.6, 1, 1, 1, 1],
          }}
          transition={{
            delay,
            duration: 2.8,
            repeat: Infinity,
            repeatDelay: 0.4,
            ease: 'easeInOut',
            times: [0, 0.2, 0.5, 0.75, 1],
          }}
        />
      ))}
    </div>
  );
}

/**
 * Alert triangle icon — proper SVG, not an emoji.
 */
function AlertTriangleIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

/**
 * Full-screen overlay that shows backend connection status.
 *
 * - 'connecting' → animated Brian logo grid with colored squares loading in
 * - 'error'      → alert icon + error message + retry button
 * - 'ready'      → fades out and unmounts
 *
 * Background is monochrome to match the app UI; the logo squares are colored.
 */
export function BackendStatus() {
  const { status, errorMessage, retry } = useBackendStatus();
  const [shouldRender, setShouldRender] = useState(true);

  useEffect(() => {
    if (status === 'ready') {
      const timer = setTimeout(() => setShouldRender(false), 600);
      return () => clearTimeout(timer);
    } else {
      setShouldRender(true);
    }
  }, [status]);

  return (
    <AnimatePresence>
      {shouldRender && (
        <motion.div
          key="backend-status-overlay"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#0a0a0a]"
        >
          <div className="relative z-10 flex flex-col items-center gap-8 px-8 text-center">
            {/* ── Connecting State ── */}
            {status === 'connecting' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col items-center gap-8"
              >
                <BrianLogoAnimated />
              </motion.div>
            )}

            {/* ── Error State ── */}
            {status === 'error' && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col items-center gap-5"
              >
                <div className="flex items-center justify-center h-14 w-14 rounded-full border border-white/10 bg-white/[0.03]">
                  <AlertTriangleIcon className="w-6 h-6 text-white/60" />
                </div>

                <div className="flex flex-col items-center gap-1.5">
                  <h2 className="text-base font-medium text-white/80">
                    Failed to Start
                  </h2>
                  <p className="text-sm text-white/40 max-w-sm leading-relaxed">
                    {errorMessage || "Brian's backend could not be reached."}
                  </p>
                </div>

                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={retry}
                  className="mt-1 px-5 py-2 rounded-md bg-white/10 hover:bg-white/[0.15] text-white/80 text-sm font-medium transition-colors focus:outline-none focus:ring-1 focus:ring-white/20"
                >
                  Try Again
                </motion.button>
              </motion.div>
            )}

            {/* ── Ready State ── */}
            {status === 'ready' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.25 }}
                className="flex flex-col items-center gap-3"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-white/70"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default BackendStatus;
