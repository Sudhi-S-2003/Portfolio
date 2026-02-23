import { motion, useMotionValue, useSpring } from 'framer-motion';
import { useState } from 'react';

const ProjectSingle = ({ title, category, image }) => {
	const [isHovered, setIsHovered] = useState(false);
	const x = useMotionValue(0);
	const y = useMotionValue(0);
	const rotateX = useSpring(useMotionValue(0));
	const rotateY = useSpring(useMotionValue(0));

	const handleMouseMove = (e) => {
		const rect = e.currentTarget.getBoundingClientRect();
		const centerX = rect.left + rect.width / 2;
		const centerY = rect.top + rect.height / 2;
		const mouseX = e.clientX - centerX;
		const mouseY = e.clientY - centerY;

		const rotateXValue = (mouseY / (rect.height / 2)) * -10;
		const rotateYValue = (mouseX / (rect.width / 2)) * 10;

		rotateX.set(rotateXValue);
		rotateY.set(rotateYValue);
		x.set(mouseX * 0.1);
		y.set(mouseY * 0.1);
	};

	const handleMouseLeave = () => {
		rotateX.set(0);
		rotateY.set(0);
		x.set(0);
		y.set(0);
		setIsHovered(false);
	};

	return (
		<motion.div
			initial={{ opacity: 0, y: 30 }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true, margin: '-50px' }}
			transition={{
				ease: 'easeOut',
				duration: 0.6,
			}}
		>
			<motion.div
				onMouseEnter={() => setIsHovered(true)}
				onMouseMove={handleMouseMove}
				onMouseLeave={handleMouseLeave}
				style={{
					rotateX,
					rotateY,
					transformStyle: 'preserve-3d',
				}}
				whileHover={{ scale: 1.05, z: 50 }}
				transition={{ type: 'spring', stiffness: 300, damping: 20 }}
				className="rounded-2xl shadow-xl hover:shadow-2xl cursor-pointer mb-10 sm:mb-0 bg-white dark:bg-gray-800 overflow-hidden group border border-gray-200 dark:border-gray-700 transition-all duration-300"
			>
				<div className="relative overflow-hidden">
					<motion.img
						src={image}
						className="rounded-t-xl border-none w-full h-48 object-cover"
						alt={title}
						style={{ x, y }}
						animate={isHovered ? { scale: 1.15 } : { scale: 1 }}
						transition={{ duration: 0.4, ease: 'easeOut' }}
					/>
					<motion.div
						initial={{ opacity: 0 }}
						animate={isHovered ? { opacity: 1 } : { opacity: 0 }}
						className="absolute inset-0 bg-gradient-to-t from-indigo-600/80 to-transparent flex items-end justify-center pb-4"
					>
						<motion.span
							initial={{ y: 20, opacity: 0 }}
							animate={isHovered ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 }}
							className="text-white font-semibold"
						>
							View Details →
						</motion.span>
					</motion.div>
				</div>
				<div className="text-center px-6 py-6">
					<p className="font-bold text-xl md:text-2xl text-gray-900 dark:text-white mb-3 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
						{title}
					</p>
					<span className="inline-block text-sm font-medium text-gray-600 dark:text-gray-400 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-gray-700 dark:to-gray-700 px-4 py-2 rounded-full border border-gray-200 dark:border-gray-600">
						{category}
					</span>
				</div>
			</motion.div>
		</motion.div>
	);
};

export default ProjectSingle;
