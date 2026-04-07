'use client';

import { useEffect, useRef } from 'react';

interface ShortcutHandlers {
  onUndo: () => void;
  onRedo: () => void;
}

export function useKeyboardShortcuts(
  fabricCanvas: React.MutableRefObject<any>,
  ready: boolean,
  handlers: ShortcutHandlers
) {
  const clipboardRef = useRef<any>(null);

  useEffect(() => {
    if (!ready) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const canvas = fabricCanvas.current;
      if (!canvas) return;

      // Don't intercept when editing text
      if (canvas.getActiveObject()?.isEditing) return;

      const ctrl = e.ctrlKey || e.metaKey;

      // Ctrl+Z / Cmd+Z = Undo
      if (ctrl && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handlers.onUndo();
        return;
      }

      // Ctrl+Y / Cmd+Shift+Z = Redo
      if (ctrl && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        handlers.onRedo();
        return;
      }

      // Ctrl+C = Copy
      if (ctrl && e.key === 'c') {
        const active = canvas.getActiveObject();
        if (active) {
          e.preventDefault();
          active.clone((cloned: any) => {
            clipboardRef.current = cloned;
          }, ['name', 'locked', 'selectable', 'evented']);
        }
        return;
      }

      // Ctrl+V = Paste
      if (ctrl && e.key === 'v') {
        if (clipboardRef.current) {
          e.preventDefault();
          clipboardRef.current.clone((cloned: any) => {
            cloned.set({
              left: (cloned.left || 0) + 15,
              top: (cloned.top || 0) + 15,
              evented: true,
              selectable: true,
              name: cloned.name ? `${cloned.name} 복사` : '복사된 요소',
            });
            canvas.add(cloned);
            canvas.setActiveObject(cloned);
            canvas.renderAll();
            canvas.fire('object:modified', { target: cloned });
          }, ['name', 'locked', 'selectable', 'evented']);
        }
        return;
      }

      // Ctrl+D = Duplicate
      if (ctrl && e.key === 'd') {
        const active = canvas.getActiveObject();
        if (active) {
          e.preventDefault();
          active.clone((cloned: any) => {
            cloned.set({
              left: (cloned.left || 0) + 10,
              top: (cloned.top || 0) + 10,
              evented: true,
              selectable: true,
              name: cloned.name ? `${cloned.name} 복사` : '복제',
            });
            canvas.add(cloned);
            canvas.setActiveObject(cloned);
            canvas.renderAll();
            canvas.fire('object:modified', { target: cloned });
          }, ['name', 'locked', 'selectable', 'evented']);
        }
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

      // Arrow keys = Nudge selected object
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        const active = canvas.getActiveObject();
        if (active && active.selectable !== false) {
          e.preventDefault();
          const step = e.shiftKey ? 10 : 1;
          switch (e.key) {
            case 'ArrowUp': active.set('top', (active.top || 0) - step); break;
            case 'ArrowDown': active.set('top', (active.top || 0) + step); break;
            case 'ArrowLeft': active.set('left', (active.left || 0) - step); break;
            case 'ArrowRight': active.set('left', (active.left || 0) + step); break;
          }
          active.setCoords();
          canvas.renderAll();
          canvas.fire('object:modified', { target: active });
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
