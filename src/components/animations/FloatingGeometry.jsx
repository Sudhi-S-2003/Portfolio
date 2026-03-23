import { motion } from 'framer-motion';

const FloatingGeometry = () => {
	return (
		<div className="absolute inset-0 -z-10 pointer-events-none">
			<motion.span
				className="absolute left-20 top-24 block h-20 w-20 rounded-full bg-indigo-500/25 blur-2xl"
				animate={{ y: [0, -12, 0], opacity: [0.45, 0.75, 0.45] }}
				transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
			/>
			<motion.span
				className="absolute right-20 top-1/3 block h-24 w-24 rounded-full bg-purple-500/25 blur-2xl"
				animate={{ y: [0, 10, 0], opacity: [0.4, 0.7, 0.4] }}
				transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
			/>
			<motion.span
				className="absolute left-1/2 bottom-20 block h-16 w-16 -translate-x-1/2 rounded-full bg-pink-500/25 blur-2xl"
				animate={{ y: [0, -8, 0], opacity: [0.4, 0.65, 0.4] }}
				transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
			/>
		</div>
	);
};

export default FloatingGeometry;
