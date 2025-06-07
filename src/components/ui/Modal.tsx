interface ModalProps {
  children: React.ReactNode;
  className?: string;
}

const Modal = ({ children, className = '' }: ModalProps) => {
  return (
    <div className='absolute inset-0 flex items-center justify-center backdrop-blur-md z-50'>
      <div
        className={`p-4 rounded shadow-lg flex items-center justify-center flex-col gap-2 ${className}`}
      >
        {children}
      </div>
    </div>
  );
};

export default Modal;
