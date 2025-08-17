import plugin from 'tailwindcss/plugin';

// Paleta APP (Sprint Finish Finanças)
const APP = {
  home:  '#22c3ff',
  fin:   '#6eca00',
  invest:'#6366f1',
  milhas:'#ec4899',
  desejos:'#f97316',
  mercado:'#facc15',
  metas:'#0ea5e9',
};

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
	safelist: [
		'text-white',
		'ring-[color:var(--clr)]',
		'bg-[color:var(--clr)/10]',
		'text-[color:var(--clr)]'
	],
  theme: {
	container: {
  		padding: '1rem',
  		center: true
  	},
  		extend: {
				colors: {
					APP, // nova chave padronizada (bg-app-fin etc via plugin)
					slateDark: '#1f2937',
					text: {
						DEFAULT: '#1f2937'
					},
				// legacy key 'app' mantida para compatibilidade até remoção completa
				app: {
					home: '#38BDF8',
					financas: '#84CC16',
					invest: '#6366F1',
					milhas: '#EC4899',
					desejos: '#F97316',
					mercado: '#FACC15',
					metas: '#0EA5E9'
				},
				surface: '#F1F3F7',
				border: 'rgba(0,0,0,.05)',
                        fy: {
                                bg: '#014D46',
                                primary: '#009579',
                                coral: '#FF4F5A',
                                amber: '#F6BE23',
                                blue: '#1E88E5',
                                surface: '#FFFFFF'
                        },
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
                        chart: {
                                '1': 'hsl(var(--chart-1))',
                                '2': 'hsl(var(--chart-2))',
                                '3': 'hsl(var(--chart-3))',
                                '4': 'hsl(var(--chart-4))',
                                '5': 'hsl(var(--chart-5))'
                        },
                        vibrant: {
                                pink: '#FF007F',
                                orange: '#FF8A00',
                                cyan: '#00E5FF',
                                lime: '#7FFF00',
                                purple: '#9D00FF'
                        }
                },
		fontFamily: {
			sans: [
				'InterVariable', 'Inter', 'system-ui', 'sans-serif'
			],
  			numeric: [
  				'Lexend',
  				'Inter',
  				'sans-serif'
  			]
  		},
  		borderRadius: {
  			card: '28px',
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		boxShadow: {
  			card: '0 8px 20px rgba(0,0,0,0.08)'
  		},
  		backgroundImage: {
  			'fy-header': 'linear-gradient(135deg,#00695C 0%,#014D46 100%)'
  		},
  		keyframes: {
  			pop: {
  				'0%': {
  					transform: 'scale(.96)',
  					opacity: 0
  				},
  				'100%': {
  					transform: 'scale(1)',
  					opacity: 1
  				}
  			},
  			shimmer: {
  				'0%': {
  					backgroundPosition: '-468px 0'
  				},
  				'100%': {
  					backgroundPosition: '468px 0'
  				}
  			}
  		},
  		animation: {
  			pop: 'pop .25s ease-out',
  			shimmer: 'shimmer 1.2s linear infinite'
  		}
  	}
  },
	plugins: [
		plugin(function({ matchUtilities, theme, addBase }) {
			// utilidade bg-app-<key>
			matchUtilities(
				{
					'bg-app': (value) => ({ backgroundColor: value })
				},
				{ values: Object.fromEntries(Object.entries(APP).map(([k,v]) => [k, v])) }
			);
			// util ring-app-<key>
			matchUtilities(
				{
					'ring-app': (value) => ({ '--ring-color': value })
				},
				{ values: Object.fromEntries(Object.entries(APP).map(([k,v]) => [k, v])) }
			);
			// base: texto padrão
			addBase({ 'html, body': { color: theme('colors.slateDark') } });
		})
	],
}