import { motion } from 'framer-motion';

const StaggerContainer = ({ children, className = '', staggerDelay = 0.1 }) => {
	const containerVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: {
				staggerChildren: staggerDelay,
			},
		},
	};

	const itemVariants = {
		hidden: { opacity: 0, y: 20 },
		visible: { opacity: 1, y: 0 },
	};

	return (
		<motion.div
			variants={containerVariants}
			initial="hidden"
			whileInView="visible"
			viewport={{ once: true, margin: '-50px' }}
			className={className}
		>
			{Array.isArray(children)
				? children.map((child, index) => (
						<motion.div key={index} variants={itemVariants}>
							{child}
						</motion.div>
				  ))
				: children}
		</motion.div>
	);
};

export default StaggerContainer;
