import { toast, Toaster } from 'react-hot-toast';

const notify = (message, type = 'info') => {
  switch (type) {
    case 'success':
      toast.success(message);
      break;
    case 'error':
      toast.error(message);
      break;
    case 'info':
    default:
      toast(message, { icon: 'ℹ️' });
  }
};


function Notify() {
  return <Toaster />;
}

export { notify, Notify };
