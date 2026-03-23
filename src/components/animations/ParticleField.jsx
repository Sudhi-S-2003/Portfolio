import { motion } from 'framer-motion';

const ParticleField = () => {
	return (
		<div className="fixed inset-0 -z-10 pointer-events-none">
			<motion.div
				className="absolute inset-0 bg-[radial-gradient(circle_at_20%_25%,rgba(99,102,241,0.16)_0,transparent_30%),radial-gradient(circle_at_80%_70%,rgba(168,85,247,0.14)_0,transparent_34%),radial-gradient(circle_at_50%_50%,rgba(236,72,153,0.10)_0,transparent_38%)]"
				animate={{ opacity: [0.55, 0.75, 0.55] }}
				transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
			/>
		</div>
	);
};

export default ParticleField;
