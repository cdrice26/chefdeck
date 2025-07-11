'use client';

import { createPortal } from 'react-dom';

interface ModalProps {
  children: React.ReactNode;
  className?: string;
  usePortal?: boolean;
}

const Modal = ({ children, className = '', usePortal = false }: ModalProps) =>
  usePortal ? (
    createPortal(
      <div className='fixed inset-0 flex items-center justify-center backdrop-blur-md'>
        <div className='fixed inset-0 bg-black opacity-50 my-[50px]' />
        <div
          className={`p-4 rounded shadow-lg flex flex-col gap-2 ${className} relative overflow-y-auto`}
        >
          {children}
        </div>
      </div>,
      document.body
    )
  ) : (
    <div className='absolute sm:relative sm:h-full inset-0 flex items-center justify-center backdrop-blur-md'>
      <div className='absolute inset-0 bg-black opacity-50' />
      <div
        className={`p-4 pb-20 sm:pb-4 rounded shadow-lg flex flex-col gap-2 ${className} relative overflow-y-auto`}
      >
        {children}
      </div>
    </div>
  );

export default Modal;
