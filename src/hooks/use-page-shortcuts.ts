import { useEffect } from 'react';

type Shortcut = {
  keys: string[];
  callback: () => void;
};

export function usePageShortcuts(shortcuts: Shortcut[]) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const shortcut = shortcuts.find((s) => {
        return (
          s.keys.every((key) => event[key.toLowerCase() + 'Key']) &&
          s.keys.includes(event.key)
        );
      });

      if (shortcut) {
        event.preventDefault();
        shortcut.callback();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [shortcuts]);
}
