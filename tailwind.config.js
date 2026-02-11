/** @type {import('tailwindcss').Config} */
export default {
	darkMode: ["class"],
	content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
	theme: {
    	extend: {
    		borderRadius: {
    			lg: 'var(--radius)',
    			md: 'calc(var(--radius) - 2px)',
    			sm: 'calc(var(--radius) - 4px)'
    		},
    		colors: {
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
    			brand: {
    				DEFAULT: 'hsl(var(--brand))',
    				foreground: 'hsl(var(--brand-foreground))',
    				muted: 'hsl(var(--brand-muted))',
    				ring: 'hsl(var(--brand-ring))',
    				outline: 'hsl(var(--brand-outline))',
    			},
    			chart: {
    				'1': 'hsl(var(--chart-1))',
    				'2': 'hsl(var(--chart-2))',
    				'3': 'hsl(var(--chart-3))',
    				'4': 'hsl(var(--chart-4))',
    				'5': 'hsl(var(--chart-5))'
    			},
          // Expose dark palette and greys for direct utility usage
          dark: {
            10: 'hsl(var(--dark-10))',
            15: 'hsl(var(--dark-15))',
            20: 'hsl(var(--dark-20))',
            25: 'hsl(var(--dark-25))',
            30: 'hsl(var(--dark-30))',
            35: 'hsl(var(--dark-35))',
            40: 'hsl(var(--dark-40))',
          },
          grey: {
            50: 'hsl(var(--grey-50))',
            60: 'hsl(var(--grey-60))',
            70: 'hsl(var(--grey-70))',
            80: 'hsl(var(--grey-80))',
            90: 'hsl(var(--grey-90))',
            95: 'hsl(var(--grey-95))',
            97: 'hsl(var(--grey-97))',
            99: 'hsl(var(--grey-99))',
          }
    		}
    	}
    },
	plugins: [require("tailwindcss-animate")],
};
