import { NavLink } from 'react-router-dom';

interface ProgramDef {
  slug: string;
  label: string;
  color: string;
  icon: string; // caminho svg relativo em /src/assets/brands
  to: string;
}

// slug 'latam' renomeado para 'latampass' para alinhar com rotas (/milhas/latampass)
const programs: ProgramDef[] = [
  { slug: 'livelo',     label: 'Livelo',     color: '#C61AA5', icon: '/src/assets/brands/livelo.svg', to: '/milhas/livelo' },
  { slug: 'latampass',  label: 'LATAM Pass', color: '#981424', icon: '/src/assets/brands/latam.svg', to: '/milhas/latampass' },
  { slug: 'azul',       label: 'Azul',       color: '#0094d6', icon: '/src/assets/brands/azul.svg', to: '/milhas/azul' }
];

export function ProgramTabs() {
  return (
    <div className="flex justify-center gap-4 py-4" role="tablist" aria-label="Programas de milhas (atalhos)">
      {programs.map(p => (
        <NavLink
          key={p.slug}
          to={p.to}
          role="tab"
          aria-label={`Atalho ${p.label}`}
          className={({ isActive }) => [
            'group flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
            isActive ? 'ring-2 ring-white/50' : 'hover:opacity-90'
          ].join(' ')}
          style={({ isActive }) => ({ background: isActiveColor(p.color), opacity: isActive ? 1 : undefined }) as any}
        >
          <img src={p.icon} alt="" aria-hidden="true" className="h-5 w-5" />
          <span className="tracking-wide" style={{ color: readableText(p.color) }}>{p.label}</span>
        </NavLink>
      ))}
    </div>
  );
}

function isActiveColor(color: string) {
  return color;
}

// heurística simples para texto branco ou escuro
function readableText(bg: string) {
  try {
    const c = bg.replace('#','');
    const r = parseInt(c.substring(0,2),16);
    const g = parseInt(c.substring(2,4),16);
    const b = parseInt(c.substring(4,6),16);
    const luminance = (0.299*r + 0.587*g + 0.114*b)/255;
    return luminance > 0.6 ? '#082f49' : '#fff';
  } catch {
    return '#fff';
  }
}

export { programs as mileagePrograms };
