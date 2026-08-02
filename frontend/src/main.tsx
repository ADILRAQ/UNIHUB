import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import queryClient from './queryClient';
import { ToastProvider } from './components/ui/Toast';
import './styles/tokens.css';
import './styles/reset.css';
import './styles/components.css';
import './styles/layout.css';
import './styles/utilities.css';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <App />
      </ToastProvider>
    </QueryClientProvider>
  </StrictMode>,
);
