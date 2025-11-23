'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SortableItemProps {
  id: string;
  children: React.ReactNode;
}

/**
 * SortableItem component.
 *
 * A draggable list item powered by @dnd-kit. Provides a small drag handle and
 * applies visual styling while the item is being dragged (opacity, cursor,
 * border, z-index, etc.). Intended to wrap arbitrary children that represent
 * the item's content.
 *
 * @component
 * @param {SortableItemProps} props - Component props.
 * @param {string} props.id - Unique identifier used by dnd-kit for sorting.
 * @param {React.ReactNode} props.children - Content rendered inside the sortable item.
 * @returns {JSX.Element} The rendered draggable item element.
 *
 * @example
 * // <SortableItem id="item-1">Item content</SortableItem>
 */
const SortableItem = ({ id, children }: SortableItemProps) => {
  // Use the useSortable hook to make this item sortable
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    backgroundColor: isDragging ? '#f0f0f0' : 'transparent',
    border: isDragging ? '1px dashed #ccc' : 'none',
    cursor: isDragging ? 'grabbing' : 'grab',
    zIndex: isDragging ? 1000 : 'auto'
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="flex flex-row items-center gap-2"
    >
      <div {...listeners} className="cursor-move mr-2 select-none">
        &#x2630; {/* Drag handle icon */}
      </div>
      {children}
    </div>
  );
};

export default SortableItem;
