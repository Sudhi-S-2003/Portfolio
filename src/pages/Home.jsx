import { Link } from 'react-router-dom';
import AppBanner from '../components/shared/AppBanner';
import ProjectsGrid from '../components/projects/ProjectsGrid';
import { ProjectsProvider } from '../context/ProjectsContext';
import Skills from '../components/sections/Skills';
import FadeUp from '../components/animations/FadeUp';
import { motion } from 'framer-motion';
import useHireMeChat from '../hooks/useHireMeChat.jsx';

const Home = () => {
	const { openHireMeChat } = useHireMeChat();

	return (
		<div className="min-h-screen">
			<AppBanner />

			<div className="bg-white dark:bg-gray-900">
				<Skills />
			</div>

			<div className="bg-gray-50 dark:bg-gray-800">
				<ProjectsProvider>
					<ProjectsGrid />
				</ProjectsProvider>

				<FadeUp>
					<div className="pb-20 flex flex-wrap justify-center gap-4">
						<Link to="/projects">
							<motion.button
								whileHover={{ scale: 1.05, y: -2 }}
								whileTap={{ scale: 0.95 }}
								className="flex items-center px-8 py-4 rounded-xl shadow-xl hover:shadow-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:ring-2 focus:ring-indigo-500 text-white text-lg font-semibold transition-all duration-300"
								aria-label="More Projects"
							>
								View All Projects
								<svg
									className="ml-2 w-5 h-5"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M17 8l4 4m0 0l-4 4m4-4H3"
									/>
								</svg>
							</motion.button>
						</Link>
						<motion.button
							type="button"
							whileHover={{ scale: 1.05, y: -2 }}
							whileTap={{ scale: 0.95 }}
							onClick={openHireMeChat}
							className="flex items-center px-8 py-4 rounded-xl shadow-xl hover:shadow-2xl bg-white dark:bg-gray-900 border border-indigo-400 dark:border-indigo-600 text-indigo-700 dark:text-indigo-300 text-lg font-semibold transition-all duration-300"
							aria-label="Hire Me Chat"
						>
							Hire Me
						</motion.button>
					</div>
				</FadeUp>
			</div>
		</div>
	);
};

export default Home;
