'use client';

import { useEffect } from 'react';

interface ShortcutHandlers {
  onUndo: () => void;
  onRedo: () => void;
}

export function useKeyboardShortcuts(
  fabricCanvas: React.MutableRefObject<any>,
  ready: boolean,
  handlers: ShortcutHandlers
) {
  useEffect(() => {
    if (!ready) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const canvas = fabricCanvas.current;
      if (!canvas) return;

      // Don't intercept when editing text
      if (canvas.getActiveObject()?.isEditing) return;

      // Ctrl+Z / Cmd+Z = Undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handlers.onUndo();
        return;
      }

      // Ctrl+Y / Cmd+Shift+Z = Redo
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        handlers.onRedo();
        return;
      }

      // Delete / Backspace = Remove selected object
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const active = canvas.getActiveObject();
        if (active && active.selectable !== false) {
          e.preventDefault();
          canvas.remove(active);
          canvas.discardActiveObject();
          canvas.renderAll();
        }
        return;
      }

      // Escape = Deselect
      if (e.key === 'Escape') {
        canvas.discardActiveObject();
        canvas.renderAll();
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [ready, handlers]);
}
