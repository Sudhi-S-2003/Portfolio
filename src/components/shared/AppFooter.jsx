import {
	FiGithub, FiLinkedin
} from 'react-icons/fi';
import { motion } from 'framer-motion';
import AppFooterCopyright from './AppFooterCopyright';

const socialLinks = [

	{
		id: 1,
		icon: <FiGithub />,
		url: 'https://github.com/Sudhi-S-2003',
	},{
		id: 2,
		icon: <FiLinkedin />,
		url: 'https://www.linkedin.com/',
	}
	
];

const AppFooter = () => {
	return (
		<footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
				{/* Footer social links */}
				<div className="flex flex-col justify-center items-center mb-12">
					<p className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-8">
						Let's Connect
					</p>
					<ul className="flex gap-6">
						{socialLinks.map((link) => (
							<motion.a
								key={link.id}
								whileHover={{ scale: 1.15, y: -3 }}
								whileTap={{ scale: 0.9 }}
								href={link.url}
								target="_blank"
								rel="noopener noreferrer"
								className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all duration-300 border border-gray-200 dark:border-gray-700"
							>
								<i className="text-2xl sm:text-3xl">
									{link.icon}
								</i>
							</motion.a>
						))}
					</ul>
				</div>

				<AppFooterCopyright />
			</div>
		</footer>
	);
};

export default AppFooter;
