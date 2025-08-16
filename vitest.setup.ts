import '@testing-library/jest-dom/vitest';
// Silencia avisos de future flags (opt-in) do React Router para testes
// @ts-ignore
globalThis.__reactRouterVersion__ = 'future';
// Provide future flags through process env se necessário (v6.28+ usa context, mas aqui só marcamos)
process.env.REACT_ROUTER_FUTURE_FLAGS = JSON.stringify({
	v7_startTransition: true,
	v7_relativeSplatPath: true,
});
