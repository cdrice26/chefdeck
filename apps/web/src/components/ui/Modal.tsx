'use client';

import { createPortal } from 'react-dom';

interface ModalProps {
  children: React.ReactNode;
  className?: string;
  usePortal?: boolean;
}

/**
 * Modal component.
 *
 * Renders content in a modal overlay. When `usePortal` is true the modal content
 * is rendered into `document.body` via a React portal which helps with stacking
 * context and z-index issues. When `usePortal` is false the modal is rendered
 * inline (useful for server-rendered or nested layout scenarios).
 *
 * Props:
 * - `children` (React.ReactNode): Content to display inside the modal.
 * - `className` (string, optional): Additional Tailwind or utility classes applied to the modal container.
 * - `usePortal` (boolean, optional): If true, render modal using a portal (default: false).
 *
 * Notes:
 * - The modal includes a semi-opaque backdrop element and centers the content.
 * - The component is intentionally presentational; it does not include focus
 *   traps or keyboard handling (these should be added by a wrapper if needed).
 *
 * @param {ModalProps} props - Component properties.
 * @returns {JSX.Element} The modal UI, rendered inline or in a portal.
 */
const Modal = ({ children, className = '', usePortal = false }: ModalProps) =>
  usePortal ? (
    createPortal(
      <div className="fixed inset-0 flex items-center justify-center backdrop-blur-md">
        <div className="fixed inset-0 bg-black opacity-50 my-[50px]" />
        <div
          className={`p-4 rounded shadow-lg flex flex-col gap-2 ${className} relative overflow-y-auto`}
        >
          {children}
        </div>
      </div>,
      document.body
    )
  ) : (
    <div className="absolute sm:relative sm:h-full inset-0 flex items-center justify-center backdrop-blur-md">
      <div className="absolute inset-0 bg-black opacity-50" />
      <div
        className={`p-4 pb-20 sm:pb-4 rounded shadow-lg flex flex-col gap-2 ${className} relative overflow-y-auto`}
      >
        {children}
      </div>
    </div>
  );

export default Modal;
