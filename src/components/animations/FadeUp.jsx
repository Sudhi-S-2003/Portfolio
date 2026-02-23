import { motion } from 'framer-motion';

const FadeUp = ({ children, delay = 0, duration = 0.6, className = '' }) => {
	return (
		<motion.div
			initial={{ opacity: 0, y: 40 }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true, margin: '-100px' }}
			transition={{ duration, delay, ease: 'easeOut' }}
			className={className}
		>
			{children}
		</motion.div>
	);
};

export default FadeUp;
