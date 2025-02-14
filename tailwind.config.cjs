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
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
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
			tertiary: {
				DEFAULT: 'hsl(var(--tertiary))',
			},
			mainbutton: {
				DEFAULT: 'hsl(var(--mainbutton))'
			},
  			darkgray: 'hsl(var(--darkgray))',
  			border: 'hsl(var(--border))',
  			header: '#181818',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			},
  			line: '#04DD00',
  			fadewhite: '#FFFFFF61',
  			orangefocus: '#DE473C', // EC441E
			icon: {
				blue: {
					foreground: 'rgb(33,150,243)',
					background: 'rgba(33,150,243,0.1)'
				},
				red: {
					foreground: 'rgb(244,67,54)',
					background: 'rgba(244,67,54,0.1)'
				},
				yellow: {
					foreground: 'rgb(252,200,0)',
					background: 'rgba(252,200,0,0.1)'
				},
				orange: {
					foreground: 'rgb(255,152,0)',
					background: 'rgba(255,152,0,0.1)'
				},
				green: {
					foreground: 'rgb(76,175,80)',
					background: 'rgba(76,175,80,0.1)'
				},
				pink: {
					foreground: 'rgb(175,82,222)',
					background: 'rgba(175,82,222,0.1)'
				}
			}
  		},
  		fontFamily: {
  			'sfpro-rounded': 'SF Pro Rounded',
  			'inter': 'Inter'
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		zIndex: {
  			'50': '50',
  			'99': '99'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
};
