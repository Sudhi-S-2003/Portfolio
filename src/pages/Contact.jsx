import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
// import ContactDetails from '../components/contact/ContactDetails';
import ContactForm from '../components/contact/ContactForm';

const Contact = () => {
	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{
				ease: 'easeInOut',
				duration: 0.5,
				delay: 0.1,
			}}
			className="container mx-auto flex flex-col-reverse lg:flex-row gap-8 pt-28 sm:pt-32 lg:pt-36 pb-8"
		>
			<ContactForm />
			{/* <ContactDetails /> */}
		</motion.div>
	);
};

export default Contact;
