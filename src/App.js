import { AnimatePresence } from 'framer-motion';
import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop';
import AppFooter from './components/shared/AppFooter';
import AppHeader from './components/shared/AppHeader';
import './css/App.css';
import UseScrollToTop from './hooks/useScrollToTop';
import useSmoothScroll from './hooks/useSmoothScroll';
import { motion } from 'framer-motion';

const About = lazy(() => import('./pages/AboutMe'));
const Contact = lazy(() => import('./pages/Contact.jsx'));
const Home = lazy(() => import('./pages/Home'));
const Projects = lazy(() => import('./pages/Projects'));
const ProjectSingle = lazy(() => import('./pages/ProjectSingle.jsx'));

const LoadingFallback = () => (
	<div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			className="text-center"
		>
			<motion.div
				animate={{ rotate: 360 }}
				transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
				className="w-16 h-16 border-4 border-indigo-200 dark:border-indigo-800 border-t-indigo-600 dark:border-t-indigo-400 rounded-full mx-auto mb-4"
			/>
			<p className="text-gray-600 dark:text-gray-400">Loading...</p>
		</motion.div>
	</div>
);

function App() {
	useSmoothScroll();

	return (
		<AnimatePresence mode="wait">
			<div className="bg-white dark:bg-gray-900 transition-colors duration-300 min-h-screen">
				<Router>
					<ScrollToTop />
					<AppHeader />
					<Suspense fallback={<LoadingFallback />}>
						<Routes>
							<Route path="/" element={<Home />} />
							<Route path="projects" element={<Projects />} />
							<Route
								path="projects/single-project"
								element={<ProjectSingle />}
							/>
							<Route path="about" element={<About />} />
							<Route path="contact" element={<Contact />} />
						</Routes>
					</Suspense>
					<AppFooter />
				</Router>
				<UseScrollToTop />
			</div>
		</AnimatePresence>
	);
}

export default App;
