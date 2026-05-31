declare module 'sonner' {
  import * as React from 'react';

  export function toast(message: string, opts?: any): void;

  export namespace toast {
    function success(message: string, opts?: any): void;
    function error(message: string, opts?: any): void;
    function loading(message: string, opts?: any): void;
  }

  export const Toaster: React.FC<{ position?: string }>;

  export default { toast, Toaster };
}
