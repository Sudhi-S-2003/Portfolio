import { useEffect, useRef } from 'react';

let gsap, ScrollTrigger;
if (typeof window !== 'undefined') {
	try {
		gsap = require('gsap');
		ScrollTrigger = require('gsap/ScrollTrigger').ScrollTrigger;
		gsap.registerPlugin(ScrollTrigger);
	} catch (e) {
		console.warn('GSAP not loaded, animations will use fallback');
	}
}

export const useGSAPFadeIn = (ref, delay = 0) => {
	useEffect(() => {
		if (ref.current && gsap && ScrollTrigger) {
			gsap.fromTo(
				ref.current,
				{ opacity: 0, y: 50 },
				{
					opacity: 1,
					y: 0,
					duration: 1,
					delay,
					ease: 'power3.out',
					scrollTrigger: {
						trigger: ref.current,
						start: 'top 80%',
						toggleActions: 'play none none none',
					},
				}
			);
		}
	}, [ref, delay]);
};

export const useGSAPStagger = (ref, delay = 0) => {
	useEffect(() => {
		if (ref.current && gsap && ScrollTrigger) {
			const children = ref.current.children;
			gsap.fromTo(
				children,
				{ opacity: 0, y: 30, scale: 0.9 },
				{
					opacity: 1,
					y: 0,
					scale: 1,
					duration: 0.8,
					delay,
					stagger: 0.1,
					ease: 'back.out(1.7)',
					scrollTrigger: {
						trigger: ref.current,
						start: 'top 80%',
						toggleActions: 'play none none none',
					},
				}
			);
		}
	}, [ref, delay]);
};

export const GSAPFadeIn = ({ children, delay = 0, className = '' }) => {
	const ref = useRef(null);
	useGSAPFadeIn(ref, delay);

	return (
		<div ref={ref} className={className}>
			{children}
		</div>
	);
};

export const GSAPStagger = ({ children, delay = 0, className = '' }) => {
	const ref = useRef(null);
	useGSAPStagger(ref, delay);

	return (
		<div ref={ref} className={className}>
			{children}
		</div>
	);
};
