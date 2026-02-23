import { useContext, memo } from 'react';
import AboutMeContext from '../../context/AboutMeContext';
import profileImage from '../../images/sudhi.png';
import FadeUp from '../animations/FadeUp';
import { motion } from 'framer-motion';

const AboutMeBio = () => {
	const context = useContext(AboutMeContext);

	if (!context || !Array.isArray(context.aboutMe)) {
		console.error('AboutMeContext is missing or invalid');
		return null;
	}

	const { aboutMe } = context;

	return (
		<section
			className="py-20 sm:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row gap-12 items-start"
			aria-labelledby="about-me-title"
		>
			{/* Profile Image */}
			<FadeUp delay={0.2}>
				<figure className="w-full sm:w-1/4 flex justify-center sm:justify-start">
					<motion.div
						whileHover={{ scale: 1.05 }}
						transition={{ type: 'spring', stiffness: 300 }}
						className="relative"
					>
						<div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl blur-xl opacity-30 dark:opacity-20" />
						<img
							src={profileImage}
							alt="Sudhi S - Full Stack Developer"
							loading="lazy"
							decoding="async"
							className="
								relative
								w-48
								sm:w-64
								md:w-72
								rounded-xl
								object-cover
								shadow-2xl
								border-2
								border-gray-200
								dark:border-gray-700
							"
						/>
					</motion.div>
				</figure>
			</FadeUp>

			{/* Bio Content */}
			<FadeUp delay={0.3} className="w-full sm:w-3/4 text-left">
				<h2
					id="about-me-title"
					className="mb-8 text-4xl sm:text-5xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent"
				>
					About Me
				</h2>

				{aboutMe.length === 0 ? (
					<p className="text-gray-500 dark:text-gray-400 text-lg">
						No bio information available.
					</p>
				) : (
					<div className="space-y-6">
						{aboutMe.map(({ id, bio }, index) => (
							<motion.p
								key={id}
								initial={{ opacity: 0, y: 20 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true }}
								transition={{ duration: 0.6, delay: index * 0.2 }}
								className="text-lg sm:text-xl leading-relaxed text-gray-700 dark:text-gray-300"
							>
								{bio}
							</motion.p>
						))}
					</div>
				)}

				{/* Key Highlights */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.6, delay: 0.6 }}
					className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-6"
				>
					<div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 p-6 rounded-2xl border border-indigo-200 dark:border-indigo-800 shadow-lg hover:shadow-xl transition-shadow">
						<h3 className="font-bold text-lg text-indigo-700 dark:text-indigo-400 mb-3">
							🎯 Current Focus
						</h3>
						<p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed">
							ONDC Network Development • Microservices • Performance Optimization
						</p>
					</div>
					<div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 p-6 rounded-2xl border border-indigo-200 dark:border-indigo-800 shadow-lg hover:shadow-xl transition-shadow">
						<h3 className="font-bold text-lg text-indigo-700 dark:text-indigo-400 mb-3">
							🚀 Expertise
						</h3>
						<p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed">
							Scalable Systems • Security • Cloud Deployments • Real-time Applications
						</p>
					</div>
				</motion.div>
			</FadeUp>
		</section>
	);
};

export default memo(AboutMeBio);
