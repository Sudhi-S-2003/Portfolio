/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [
		'./src/**/*.{js,jsx,ts,tsx}',
		'./public/index.html',
	],
	darkMode: 'class',
	theme: {
		extend: {
			colors: {
				'primary-light': '#F7F8FC',
				'secondary-light': '#FFFFFF',
				'ternary-light': '#f6f7f8',
				'primary-dark': '#0D2438',
				'secondary-dark': '#102D44',
				'ternary-dark': '#1E3851',
			},
			container: {
				center: true,
				padding: {
					DEFAULT: '1rem',
					sm: '2rem',
					lg: '4rem',
					xl: '5rem',
					'2xl': '6rem',
				},
			},
			fontFamily: {
				sans: ['GeneralSans-Variable', 'system-ui', 'sans-serif'],
			},
			animation: {
				'fade-in': 'fadeIn 0.5s ease-in-out',
				'slide-up': 'slideUp 0.5s ease-out',
				'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
			},
			keyframes: {
				fadeIn: {
					'0%': { opacity: '0' },
					'100%': { opacity: '1' },
				},
				slideUp: {
					'0%': { transform: 'translateY(20px)', opacity: '0' },
					'100%': { transform: 'translateY(0)', opacity: '1' },
				},
			},
			backdropBlur: {
				xs: '2px',
			},
			boxShadow: {
				'glow': '0 0 20px rgba(99, 102, 241, 0.3)',
				'glow-lg': '0 0 40px rgba(99, 102, 241, 0.4)',
				'glow-purple': '0 0 20px rgba(168, 85, 247, 0.3)',
			},
			backgroundImage: {
				'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
				'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
			},
		},
	},
	plugins: [
		require('@tailwindcss/forms'),
	],
	corePlugins: {
		preflight: true,
	},
	safelist: [
		'backdrop-blur-xl',
		'backdrop-blur-2xl',
		'bg-white/70',
		'bg-white/80',
		'bg-white/90',
		'bg-white/95',
		'bg-gray-900/70',
		'bg-gray-900/80',
		'bg-gray-900/90',
		'bg-gray-900/95',
		'bg-gray-100/80',
		'bg-gray-800/80',
		'border-gray-200/50',
		'border-gray-200/80',
		'border-gray-700/50',
		'border-gray-700/80',
	],
};
