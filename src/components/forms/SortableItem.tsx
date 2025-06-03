'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SortableItemProps {
  id: string;
  children: React.ReactNode;
}

/**
 * SortableItem component is used to create a sortable item in a list.
 * It uses the useSortable hook from @dnd-kit to manage the drag-and-drop functionality.
 * The item changes its appearance when being dragged, including opacity, background color, border, cursor style, and z-index.
 * @param { id, children } - The id of the sortable item and the children to render inside it.
 * @returns {JSX.Element} - A sortable item that can be dragged and dropped.
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
    opacity: isDragging ? 0.5 : 1, // Change opacity when dragging
    backgroundColor: isDragging ? '#f0f0f0' : 'transparent', // Change background color when dragging
    border: isDragging ? '1px dashed #ccc' : 'none', // Optional: add a border
    cursor: isDragging ? 'grabbing' : 'grab', // Change cursor style
    zIndex: isDragging ? 1000 : 'auto' // Bring to front when dragging
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className='flex flex-row items-center gap-2'
    >
      <div {...listeners} className='cursor-move mr-2 select-none'>
        &#x2630; {/* Drag handle icon */}
      </div>
      {children}
    </div>
  );
};

export default SortableItem;
