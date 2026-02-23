import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiSend, FiUser, FiMail, FiBriefcase, FiMessageSquare } from 'react-icons/fi';
import { useState } from 'react';

const selectOptions = [
	'MERN Stack Developer',
	'Full Stack Developer',
	'Front End Developer',
	'Back End Developer',
	'Web Developer',
	'System Architect',
];

const HireMeModal = ({ onClose, onRequest }) => {
	const [formData, setFormData] = useState({
		name: '',
		email: '',
		subject: '',
		message: '',
	});

	const handleSubmit = (e) => {
		e.preventDefault();
		// Handle form submission here
		console.log('Form submitted:', formData);
		onRequest();
	};

	const handleChange = (e) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value,
		});
	};

	return (
		<AnimatePresence>
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				exit={{ opacity: 0 }}
				onClick={onClose}
				className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
			>
				{/* Modal Content */}
				<motion.div
					initial={{ opacity: 0, scale: 0.9, y: 20 }}
					animate={{ opacity: 1, scale: 1, y: 0 }}
					exit={{ opacity: 0, scale: 0.9, y: 20 }}
					transition={{ type: 'spring', duration: 0.5 }}
					onClick={(e) => e.stopPropagation()}
					className="relative w-full max-w-2xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700"
				>
					{/* Header */}
					<div className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-6 py-5">
						<div className="flex items-center justify-between">
							<div>
								<h2 className="text-2xl font-bold text-white mb-1">
									Let's Work Together
								</h2>
								<p className="text-indigo-100 text-sm">
									Tell me about your project and I'll get back to you
								</p>
							</div>
							<motion.button
								whileHover={{ scale: 1.1, rotate: 90 }}
								whileTap={{ scale: 0.9 }}
								onClick={onClose}
								className="p-2 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors"
								aria-label="Close Modal"
							>
								<FiX className="w-6 h-6" />
							</motion.button>
						</div>
					</div>

					{/* Form */}
					<form onSubmit={handleSubmit} className="p-6 space-y-5">
						{/* Name Field */}
						<div>
							<label
								htmlFor="name"
								className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
							>
								<FiUser className="inline w-4 h-4 mr-2" />
								Your Name
							</label>
							<input
								id="name"
								name="name"
								type="text"
								required
								value={formData.name}
								onChange={handleChange}
								placeholder="John Doe"
								className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
								aria-label="Name"
							/>
						</div>

						{/* Email Field */}
						<div>
							<label
								htmlFor="email"
								className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
							>
								<FiMail className="inline w-4 h-4 mr-2" />
								Email Address
							</label>
							<input
								id="email"
								name="email"
								type="email"
								required
								value={formData.email}
								onChange={handleChange}
								placeholder="john@example.com"
								className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
								aria-label="Email"
							/>
						</div>

						{/* Project Type */}
						<div>
							<label
								htmlFor="subject"
								className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
							>
								<FiBriefcase className="inline w-4 h-4 mr-2" />
								Project Type
							</label>
							<select
								id="subject"
								name="subject"
								required
								value={formData.subject}
								onChange={handleChange}
								className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all cursor-pointer"
								aria-label="Project Category"
							>
								<option value="">Select a project type</option>
								{selectOptions.map((option) => (
									<option key={option} value={option}>
										{option}
									</option>
								))}
							</select>
						</div>

						{/* Message Field */}
						<div>
							<label
								htmlFor="message"
								className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
							>
								<FiMessageSquare className="inline w-4 h-4 mr-2" />
								Project Details
							</label>
							<textarea
								id="message"
								name="message"
								rows="5"
								required
								value={formData.message}
								onChange={handleChange}
								placeholder="Tell me about your project, timeline, and requirements..."
								className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
								aria-label="Project Details"
							/>
						</div>

						{/* Buttons */}
						<div className="flex flex-col sm:flex-row gap-3 pt-4">
							<motion.button
								type="submit"
								whileHover={{ scale: 1.02, y: -2 }}
								whileTap={{ scale: 0.98 }}
								className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
								aria-label="Send Request"
							>
								<FiSend className="w-5 h-5" />
								<span>Send Request</span>
							</motion.button>
							<motion.button
								type="button"
								whileHover={{ scale: 1.02 }}
								whileTap={{ scale: 0.98 }}
								onClick={onClose}
								className="px-6 py-3.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
								aria-label="Close Modal"
							>
								Cancel
							</motion.button>
						</div>
					</form>
				</motion.div>
			</motion.div>
		</AnimatePresence>
	);
};

export default HireMeModal;
