import { motion, useInView } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import FadeUp from '../animations/FadeUp';

const skills = [
	{ name: 'JavaScript (ES6+)', level: 90 },
	{ name: 'React.js', level: 88 },
	{ name: 'Node.js', level: 85 },
	{ name: 'MongoDB', level: 87 },
	{ name: 'Express.js', level: 86 },
	{ name: 'TypeScript', level: 75 },
	{ name: 'Python', level: 80 },
	{ name: 'Django', level: 78 },
	{ name: 'MySQL', level: 82 },
	{ name: 'Tailwind CSS', level: 90 },
	{ name: 'Redux', level: 80 },
	{ name: 'RESTful APIs', level: 88 },
];

const Skills = () => {
	return (
		<section className="py-20 sm:py-28 relative">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<FadeUp>
					<div className="text-center mb-16">
						<h2 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
							Technical Skills
						</h2>
						<p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
							Technologies and tools I use to build scalable, production-ready applications
						</p>
					</div>
				</FadeUp>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
					{skills.map((skill, index) => (
						<SkillBar key={skill.name} skill={skill} index={index} />
					))}
				</div>
			</div>
		</section>
	);
};

const SkillBar = ({ skill, index }) => {
	const ref = useRef(null);
	const isInView = useInView(ref, { once: true, margin: '-50px' });
	const [count, setCount] = useState(0);

	useEffect(() => {
		if (isInView) {
			const duration = 2000;
			const steps = 60;
			const increment = skill.level / steps;
			const stepDuration = duration / steps;

			let currentStep = 0;
			const timer = setInterval(() => {
				currentStep++;
				const newCount = Math.min(increment * currentStep, skill.level);
				setCount(Math.round(newCount));

				if (currentStep >= steps) {
					clearInterval(timer);
				}
			}, stepDuration);

			return () => clearInterval(timer);
		}
	}, [isInView, skill.level]);

	return (
		<motion.div
			ref={ref}
			initial={{ opacity: 0, y: 20 }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true }}
			transition={{ duration: 0.5, delay: index * 0.1 }}
			className="group bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg hover:shadow-2xl border border-gray-200 dark:border-gray-700 transition-all duration-300"
		>
			<div className="flex justify-between items-center mb-3">
				<span className="font-semibold text-gray-900 dark:text-white text-lg">
					{skill.name}
				</span>
				<span className="font-bold text-indigo-600 dark:text-indigo-400 text-lg">
					{count}%
				</span>
			</div>
			<div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-3 overflow-hidden shadow-inner">
				<motion.div
					initial={{ width: 0 }}
					animate={isInView ? { width: `${skill.level}%` } : { width: 0 }}
					transition={{ duration: 2, ease: 'easeOut', delay: index * 0.1 }}
					className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full shadow-lg relative overflow-hidden"
				>
					<motion.div
						animate={{
							backgroundPosition: ['0%', '100%'],
						}}
						transition={{
							duration: 2,
							repeat: Infinity,
							repeatType: 'reverse',
						}}
						className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
						style={{ backgroundSize: '200% 100%' }}
					/>
				</motion.div>
			</div>
		</motion.div>
	);
};

export default Skills;
