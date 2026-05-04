import React from 'react';
import { createRoot } from 'react-dom/client';
import { Arranque } from './arranque';
import '../estilos/index.css';

const elementoRaiz = document.getElementById('raiz');
if (!elementoRaiz) throw new Error('No se encontro el elemento raiz');

createRoot(elementoRaiz).render(
  <React.StrictMode>
    <Arranque />
  </React.StrictMode>,
);
