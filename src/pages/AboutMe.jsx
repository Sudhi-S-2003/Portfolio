import AboutMeBio from '../components/about/AboutMeBio';
import Skills from '../components/sections/Skills';
import { AboutMeProvider } from '../context/AboutMeContext';
import FadeUp from '../components/animations/FadeUp';

const About = () => {
	return (
		<AboutMeProvider>
			<div className="min-h-screen bg-white dark:bg-gray-900">
				<div className="pt-24">
					<FadeUp>
						<AboutMeBio />
					</FadeUp>
				</div>
				<div className="bg-gray-50 dark:bg-gray-800">
					<Skills />
				</div>
			</div>
		</AboutMeProvider>
	);
};

export default About;
