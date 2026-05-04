import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';

const construirCliente = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: (cantidad, error) => {
          const codigo = (error as { estado?: number })?.estado;
          if (codigo === 401 || codigo === 403 || codigo === 404) return false;
          return cantidad < 2;
        },
        staleTime: 30_000,
        refetchOnWindowFocus: false,
      },
    },
  });

export const ProveedorConsultas = ({ children }: { children: ReactNode }) => {
  const [cliente] = useState(construirCliente);
  return <QueryClientProvider client={cliente}>{children}</QueryClientProvider>;
};
