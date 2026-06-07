import React from 'react';

/**
 * Centered and simplified footer component.
 */
export default function Footer() {
  return (
    <footer className="w-full py-8 border-t border-brand-border mt-auto flex items-center justify-center">
      <p className="text-xs tracking-widest text-brand-textDim uppercase font-mono">
        &copy; 2026 OpsPilot
      </p>
    </footer>
  );
}
