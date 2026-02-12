import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * Captura errores en el árbol de componentes y muestra una UI de respaldo.
 * Cumple con la regla: "UI must NOT crash; show fallback states".
 */
export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-unahur-dark text-white flex flex-col items-center justify-center p-6 text-center">
          <h2 className="text-2xl font-bold text-unahur-orange">Ups, algo salió mal</h2>
          <p className="mt-2 text-gray-400">La aplicación encontró un error inesperado.</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 px-4 py-2 bg-unahur-purple rounded-lg hover:bg-unahur-purple/80 transition-colors"
          >
            Recargar aplicación
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
