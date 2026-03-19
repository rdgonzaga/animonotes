import { Toaster as SonnerToaster } from 'sonner';

export { toast } from 'sonner';

export function Toaster() {
  return (
    <SonnerToaster
      theme="system"
      position="bottom-right"
      richColors
      closeButton
    />
  );
}
