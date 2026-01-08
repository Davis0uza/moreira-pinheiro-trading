/**
 * NOTA TÉCNICA DE SETUP:
 * - Este projeto requer Node.js atualizado (v22+ ou v24 recomendado).
 * - Se ocorrerem erros com o Vite no ambiente Windows, utilize:
 *   'node node_modules/vite/bin/vite.js' para garantir a execução correta do binário.
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import './i18n'; // Initialize i18n
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);