interface ModalProps {
  children: React.ReactNode;
  className?: string;
}

const Modal = ({ children, className = '' }: ModalProps) => {
  return (
    <div className='absolute inset-0 flex items-center justify-center backdrop-blur-md'>
      <div className='absolute inset-0 bg-black opacity-50' />
      <div
        className={`p-4 rounded shadow-lg flex flex-col gap-2 ${className} relative`}
      >
        {children}
      </div>
    </div>
  );
};

export default Modal;
