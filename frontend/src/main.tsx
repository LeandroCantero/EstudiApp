import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { App } from './app/app';
import { withProviders } from './app/providers';
import './index.css';

const AppWithProviders = withProviders(() => (
  <BrowserRouter>
    <App />
  </BrowserRouter>
));

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppWithProviders />
  </React.StrictMode>,
);
