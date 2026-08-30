const EDITABLE_NOTE_TARGETS = "textarea, input, select, a, [contenteditable]:not([contenteditable='false']), button:not([data-note-drag-handle])";

/** @param {{ button: number, isPrimary: boolean, spacePressed: boolean, target: Element }} input */
export function canStartNoteDrag({ button, isPrimary, spacePressed, target }) {
  return button === 0 && isPrimary && !spacePressed && !target.closest(EDITABLE_NOTE_TARGETS);
}

/**
 * Convert screen movement into board coordinates so grabbing any edge never
 * snaps the note to the pointer, including when the board is zoomed.
 * @param {{ originX: number, originY: number, startX: number, startY: number, zoom: number }} drag
 * @param {number} clientX
 * @param {number} clientY
 */
export function getNoteDragPosition(drag, clientX, clientY) {
  return {
    x: Math.max(22, drag.originX + (clientX - drag.startX) / drag.zoom),
    y: Math.max(52, drag.originY + (clientY - drag.startY) / drag.zoom),
  };
}
