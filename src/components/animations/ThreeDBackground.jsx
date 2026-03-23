import { motion } from 'framer-motion';

const ThreeDBackground = () => {
	return (
		<div className="fixed inset-0 -z-10">
			<motion.div
				className="absolute inset-0 bg-gradient-to-br from-indigo-500/8 via-purple-500/8 to-pink-500/8"
				animate={{ opacity: [0.45, 0.7, 0.45], scale: [1, 1.03, 1] }}
				transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
			/>
		</div>
	);
};

export default ThreeDBackground;
