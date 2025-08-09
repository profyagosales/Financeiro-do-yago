import React from 'react';

type Props = { children: React.ReactNode };

type State = { hasError: boolean };

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any, info: any) {
    console.error('ErrorBoundary caught', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 text-center space-y-2">
          <h1 className="text-2xl font-bold">Ops! Algo deu errado.</h1>
          <p className="text-muted-foreground">Tente atualizar a página.</p>
        </div>
      );
    }
    return this.props.children;
  }
}
