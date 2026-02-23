import { useEffect } from 'react';

const useSmoothScroll = () => {
	useEffect(() => {
		let Lenis;
		try {
			Lenis = require('lenis').default;
		} catch (e) {
			console.warn('Lenis not loaded, using default scroll');
			return;
		}

		const lenis = new Lenis({
			duration: 1.2,
			easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
			direction: 'vertical',
			gestureDirection: 'vertical',
			smooth: true,
			mouseMultiplier: 1,
			smoothTouch: false,
			touchMultiplier: 2,
			infinite: false,
		});

		function raf(time) {
			lenis.raf(time);
			requestAnimationFrame(raf);
		}

		requestAnimationFrame(raf);

		return () => {
			lenis.destroy();
		};
	}, []);
};

export default useSmoothScroll;
