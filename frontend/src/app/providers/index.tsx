import React from 'react';
import { ErrorBoundary } from './error-boundary';
import { ThemeProvider } from './theme-provider';

/**
 * HOC para envolver la aplicación con todos los Providers necesarios.
 * Siguiendo el estándar FSD: app/providers
 */
export const withProviders = (component: () => React.ReactNode) => () => (
    <React.StrictMode>
        <ErrorBoundary>
            <ThemeProvider>
                {component()}
            </ThemeProvider>
        </ErrorBoundary>
    </React.StrictMode>
);
