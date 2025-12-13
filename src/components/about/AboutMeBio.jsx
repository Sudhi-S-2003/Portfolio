import { useContext, memo } from 'react';
import AboutMeContext from '../../context/AboutMeContext';
import profileImage from '../../images/sudhi.png';

const AboutMeBio = () => {
	const context = useContext(AboutMeContext);

	if (!context || !Array.isArray(context.aboutMe)) {
		console.error('AboutMeContext is missing or invalid');
		return null;
	}

	const { aboutMe } = context;

	return (
		<section
			className="mt-10 sm:mt-20 flex flex-col sm:flex-row gap-10 items-start"
			aria-labelledby="about-me-title"
		>
			{/* Profile Image */}
			<figure className="w-full sm:w-1/4 flex justify-center sm:justify-start">
				<img
					src={profileImage}
					alt="Profile"
					loading="lazy"
					decoding="async"
					className="
						w-48
						sm:w-64
						md:w-72
						rounded-xl
						object-cover
						shadow-lg
						border
						border-gray-200
						dark:border-gray-700
					"
				/>
			</figure>

			{/* Bio Content */}
			<div className="w-full sm:w-3/4 text-left">
				<h2
					id="about-me-title"
					className="sr-only"
				>
					About Me
				</h2>

				{aboutMe.length === 0 ? (
					<p className="text-gray-500 dark:text-gray-400 text-lg">
						No bio information available.
					</p>
				) : (
					aboutMe.map(({ id, bio }) => (
						<p
							key={id}
							className="
								mb-4
								text-lg
								leading-relaxed
								text-ternary-dark
								dark:text-ternary-light
							"
						>
							{bio}
						</p>
					))
				)}
			</div>
		</section>
	);
};

export default memo(AboutMeBio);
