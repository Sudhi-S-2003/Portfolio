import useThemeSwitcher from '../../hooks/useThemeSwitcher';
import { FiArrowDownCircle, FiGithub, FiLinkedin, FiMail } from 'react-icons/fi';
import developerLight from '../../images/developer.svg';
import developerDark from '../../images/developer-dark.svg';
import { motion } from 'framer-motion';
import ThreeDBackground from '../animations/ThreeDBackground';
import Hero3DScene from '../animations/Hero3DScene';
import FadeUp from '../animations/FadeUp';

const AppBanner = () => {
	const [activeTheme] = useThemeSwitcher();

	const socialLinks = [
		{ icon: FiGithub, href: 'https://github.com/Sudhi-S-2003', label: 'GitHub' },
		{ icon: FiLinkedin, href: 'https://linkedin.com/in/sudhi-s', label: 'LinkedIn' },
		{ icon: FiMail, href: 'mailto:sudhiselampa19@email.com', label: 'Email' },
	];

	return (
		<section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 sm:pt-24">
			<ThreeDBackground />
			<Hero3DScene />
			
			{/* Gradient Orbs */}
			<div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" />
			<div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
			
			<div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
				<div className="grid lg:grid-cols-2 gap-12 items-center">
					{/* Left Content */}
					<div className="text-center lg:text-left">
						<FadeUp delay={0.1}>
							<motion.div
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.6, delay: 0.2 }}
								className="mb-6"
							>
								<span className="inline-block px-4 py-2 bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-sm font-semibold shadow-sm">
									✨ Full Stack Developer
								</span>
							</motion.div>
						</FadeUp>

						<FadeUp delay={0.2}>
							<h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold mb-6 leading-tight">
								<span className="text-gray-900 dark:text-white">Hi, I'm </span>
								<span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
									Sudhi S
								</span>
							</h1>
						</FadeUp>

						<FadeUp delay={0.3}>
							<p className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
								Building scalable web applications
							</p>
							<p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 mb-10 max-w-2xl mx-auto lg:mx-0">
								MERN Stack Specialist • ONDC Developer • System Architect
							</p>
						</FadeUp>

						<FadeUp delay={0.4}>
							<div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center">
								<motion.a
									whileHover={{ scale: 1.05, y: -2 }}
									whileTap={{ scale: 0.95 }}
									download="Sudhi-Resume.pdf"
									href="/files/Sudhi-Resume.pdf"
									className="group flex items-center justify-center px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-lg font-semibold rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 w-full sm:w-auto"
									aria-label="Download Resume"
								>
									<FiArrowDownCircle className="mr-2 h-5 w-5 group-hover:translate-y-1 transition-transform" />
									<span>Download CV</span>
								</motion.a>

								<div className="flex gap-3">
									{socialLinks.map(({ icon: Icon, href, label }, index) => (
										<motion.a
											key={label}
											initial={{ opacity: 0, scale: 0 }}
											animate={{ opacity: 1, scale: 1 }}
											transition={{ delay: 0.5 + index * 0.1 }}
											whileHover={{ scale: 1.15, y: -3 }}
											whileTap={{ scale: 0.9 }}
											href={href}
											target="_blank"
											rel="noopener noreferrer"
											className="p-3.5 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all duration-300 border border-gray-200 dark:border-gray-700"
											aria-label={label}
										>
											<Icon className="h-5 w-5" />
										</motion.a>
									))}
								</div>
							</div>
						</FadeUp>
					</div>

					{/* Right Image */}
					<FadeUp delay={0.3} className="hidden lg:block">
						<motion.div
							initial={{ opacity: 0, scale: 0.8 }}
							animate={{ opacity: 1, scale: 1 }}
							transition={{ duration: 0.8, delay: 0.4 }}
							className="relative"
						>
							<div className="absolute inset-0 bg-gradient-to-br from-indigo-400/30 to-purple-400/30 rounded-3xl blur-3xl transform rotate-6" />
							<div className="relative bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 rounded-3xl p-8 shadow-2xl">
								<img
									src={activeTheme === 'dark' ? developerLight : developerDark}
									alt="Developer"
									className="w-full h-auto drop-shadow-2xl"
								/>
							</div>
						</motion.div>
					</FadeUp>
				</div>
			</div>
		</section>
	);
};

export default AppBanner;
