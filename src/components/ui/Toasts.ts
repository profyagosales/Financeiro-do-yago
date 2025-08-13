import { createElement } from 'react';

import { CheckCircle2, XCircle } from 'lucide-react';
import toast, { Toaster, type ToastOptions } from 'react-hot-toast';

const baseOptions: ToastOptions = {
  position: 'top-right',
  style: {
    background: 'hsl(var(--background))',
    color: 'hsl(var(--foreground))',
    border: '1px solid hsl(var(--border))',
  },
};

export const toastSuccess = (message: string, options?: ToastOptions) =>
  toast.success(message, {
    icon: createElement(CheckCircle2, { className: 'text-green-600' }),
    ...baseOptions,
    ...options,
  });

export const toastError = (message: string, options?: ToastOptions) =>
  toast.error(message, {
    icon: createElement(XCircle, { className: 'text-red-600' }),
    ...baseOptions,
    ...options,
  });

export { Toaster };
