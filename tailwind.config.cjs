/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ["class"],
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
  	extend: {
  		keyframes: {
  			'caret-blink': {
  				'0%,70%,100%': {
  					opacity: '1'
  				},
  				'20%,50%': {
  					opacity: '0'
  				}
  			},
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			}
  		},
  		animation: {
  			'caret-blink': 'caret-blink 1.2s ease-out infinite',
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out'
  		},
  		colors: {
  			primary: {
  				DEFAULT: '#000000',
  				foreground: '#FFFFFF'
  			},
  			background: '#FFFFFF',
  			foreground: '#000000',
  			card: {
  				DEFAULT: '#FFFFFF',
  				foreground: '#000000'
  			},
  			border: '#E5E5E5',
  			muted: {
  				DEFAULT: '#F5F5F5',
  				foreground: '#666666'
  			},
  			accent: {
  				DEFAULT: '#F5F5F5',
  				foreground: '#000000'
  			},
  			destructive: {
  				DEFAULT: '#EE4D2D',
  				foreground: '#FFFFFF'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		letterSpacing: {
  			tighter: '-0.5px',
  			tight: '-0.25px',
  			normal: '0px',
  			wide: '0.25px',
  			wider: '0.5px',
  			widest: '0.75px'
  		},
  		fontFamily: {
  			sans: ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Text', 'Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'],
  			display: ['SF Pro Display', '-apple-system', 'BlinkMacSystemFont', 'Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'],
  			text: ['SF Pro Text', '-apple-system', 'BlinkMacSystemFont', 'Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif']
  		},
  		borderRadius: {
  			none: '0',
  			sm: '4px',
  			DEFAULT: '8px',
  			md: '10px',
  			lg: '14px',
  			xl: '18px',
  			'2xl': '24px',
  			full: '9999px'
  		},
  		zIndex: {
  			'50': '50',
  			'99': '99'
  		},
  		fontSize: {
  			// iOS Typography Scale
  			'largeTitle': ['24px', { lineHeight: '1.1', letterSpacing: '0.26px', fontWeight: '700' }],
  			'title1': ['20px', { lineHeight: '1.2', letterSpacing: '0.25px', fontWeight: '600' }],
  			'title2': ['15px', { lineHeight: '1.3', letterSpacing: '0.25px', fontWeight: '600' }],
  			'title3': ['14px', { lineHeight: '1.3', letterSpacing: '0.27px', fontWeight: '600' }],
  			'headline': ['12px', { lineHeight: '1.3', letterSpacing: '-0.29px', fontWeight: '600' }],
  			'body': ['12px', { lineHeight: '1.47', letterSpacing: '-0.29px', fontWeight: '400' }],
  			'callout': ['11px', { lineHeight: '1.3', letterSpacing: '-0.22px', fontWeight: '400' }],
  			'subhead': ['11px', { lineHeight: '1.3', letterSpacing: '-0.17px', fontWeight: '400' }],
  			'footnote': ['9px', { lineHeight: '1.3', letterSpacing: '-0.06px', fontWeight: '400' }],
  			'caption1': ['8px', { lineHeight: '1.3', letterSpacing: '0', fontWeight: '400' }],
  			'caption2': ['8px', { lineHeight: '1.3', letterSpacing: '0.05px', fontWeight: '400' }]
  		},
  		boxShadow: {
  			sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  			DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  			md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  			lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  			xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
  		},
  		colors: {
  			primary: {
  				DEFAULT: '#000000',
  				foreground: '#FFFFFF'
  			},
  			background: '#FFFFFF',
  			foreground: '#000000',
  			card: {
  				DEFAULT: '#FFFFFF',
  				foreground: '#000000'
  			},
  			border: '#E5E5E5',
  			muted: {
  				DEFAULT: '#F5F5F5',
  				foreground: '#666666'
  			},
  			accent: {
  				DEFAULT: '#F5F5F5',
  				foreground: '#000000'
  			},
  			destructive: {
  				DEFAULT: '#EE4D2D',
  				foreground: '#FFFFFF'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			},
  			'apple-blue': '#007AFF',
  			'apple-red': '#FF3B30',
  			'apple-green': '#34C759',
  			'apple-yellow': '#FFCC00',
  			'apple-orange': '#FF9500',
  			'apple-purple': '#AF52DE',
  			'apple-pink': '#FF2D55',
  			'apple-gray': {
  				100: '#F2F2F7',
  				200: '#E5E5EA',
  				300: '#D1D1D6',
  				400: '#C7C7CC',
  				500: '#AEAEB2',
  				600: '#8E8E93',
  				700: '#636366',
  				800: '#48484A',
  				900: '#3A3A3C'
  			}
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
};