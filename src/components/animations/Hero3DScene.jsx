import { motion } from 'framer-motion';

const Hero3DScene = () => {
	return (
		<div className="absolute inset-0 -z-10 opacity-40 dark:opacity-20 pointer-events-none">
			<motion.div
				className="absolute -top-20 left-1/4 h-72 w-72 rounded-full bg-indigo-500/25 blur-3xl"
				animate={{ y: [0, -16, 0], x: [0, 12, 0] }}
				transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
			/>
			<motion.div
				className="absolute bottom-10 right-1/4 h-80 w-80 rounded-full bg-purple-500/25 blur-3xl"
				animate={{ y: [0, 16, 0], x: [0, -14, 0] }}
				transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
			/>
		</div>
	);
};

export default Hero3DScene;
