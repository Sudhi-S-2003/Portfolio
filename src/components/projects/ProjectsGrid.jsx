import { useContext } from 'react';
import { FiSearch } from 'react-icons/fi';
import { motion } from 'framer-motion';
import ProjectSingle from './ProjectSingle';
import { ProjectsContext } from '../../context/ProjectsContext';
import ProjectsFilter from './ProjectsFilter';
import FadeUp from '../animations/FadeUp';

const ProjectsGrid = () => {
	const {
		projects,
		searchProject,
		setSearchProject,
		searchProjectsByTitle,
		selectProject,
		setSelectProject,
		selectProjectsByCategory,
	} = useContext(ProjectsContext);

	const displayProjects = selectProject
		? selectProjectsByCategory
		: searchProject
		? searchProjectsByTitle
		: projects;

	return (
		<section className="py-20 sm:py-28 relative">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<FadeUp>
					<div className="text-center mb-16">
						<h2 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
							Featured Projects
						</h2>
						<p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
							Showcasing my work in building scalable, production-ready applications
						</p>
					</div>
				</FadeUp>

				<FadeUp delay={0.2}>
					<div className="max-w-4xl mx-auto mb-12">
						<h3 className="text-center text-gray-700 dark:text-gray-300 text-lg sm:text-xl mb-6 font-medium">
							Search projects by title or filter by category
						</h3>
						<div className="flex flex-col sm:flex-row justify-between gap-4 bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
							<div className="flex gap-3 flex-1">
								<span className="hidden sm:flex items-center bg-gray-100 dark:bg-gray-700 p-3 rounded-xl">
									<FiSearch className="text-gray-600 dark:text-gray-400 w-5 h-5" />
								</span>
								<input
									onChange={(e) => setSearchProject(e.target.value)}
									value={searchProject}
									className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl text-sm sm:text-base bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
									type="search"
									placeholder="Search Projects..."
									aria-label="Search Projects"
								/>
							</div>
							<ProjectsFilter setSelectProject={setSelectProject} />
						</div>
					</div>
				</FadeUp>

				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
				{displayProjects.length > 0 ? (
					displayProjects.map((project, index) => (
						<motion.div
							key={project.id}
							initial={{ opacity: 0, y: 30 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true, margin: '-50px' }}
							transition={{ duration: 0.6, delay: index * 0.1 }}
						>
							<ProjectSingle
								title={project.title}
								category={project.category}
								image={project.img}
							/>
						</motion.div>
					))
				) : (
					<div className="col-span-full text-center py-16">
						<p className="text-gray-500 dark:text-gray-400 text-lg font-medium">
							No projects found. Try a different search term or filter.
						</p>
					</div>
				)}
				</div>
			</div>
		</section>
	);
};

export default ProjectsGrid;
