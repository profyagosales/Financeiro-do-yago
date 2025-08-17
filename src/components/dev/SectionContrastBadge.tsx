import React from 'react';

import { useSectionChroming } from '@/components/layout/SectionChroming';

const BadgeInner: React.FC = () => {
	const { section, contrastRatio, lowContrast } = useSectionChroming();
	return (
		<div
			className={`rounded-md px-2 py-1 shadow-sm backdrop-blur border ${lowContrast ? 'bg-rose-500/30 border-rose-400/50 text-white' : 'bg-emerald-500/30 border-emerald-400/50 text-white'}`}
			title={`Seção: ${section} — contraste ${contrastRatio.toFixed(2)}${lowContrast ? ' (baixo)' : ''}`}
		>
			{section} {contrastRatio.toFixed(2)}{lowContrast ? '⚠️' : '✓'}
		</div>
	);
};

export const SectionContrastBadge: React.FC = () => {
	if (import.meta.env.PROD) return null;
	return (
		<div className="fixed bottom-3 right-3 z-[60] select-none text-xs font-medium">
			{/* Se usado fora do provider, o hook lançará: ignoramos exibindo nada via error boundary global */}
			<BadgeErrorBoundary>
				<BadgeInner />
			</BadgeErrorBoundary>
		</div>
	);
};

class BadgeErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
	state = { hasError: false };
	static getDerivedStateFromError() { return { hasError: true }; }
	componentDidCatch() { /* silencia erro fora de provider */ }
	render() { return this.state.hasError ? null : this.props.children; }
}

export default SectionContrastBadge;
