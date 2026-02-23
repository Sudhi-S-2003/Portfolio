import { useState, useEffect } from 'react';
import { FiMenu, FiMoon, FiSun, FiX } from 'react-icons/fi';
import { Link, useLocation } from 'react-router-dom';
import useThemeSwitcher from '../../hooks/useThemeSwitcher';
import HireMeModal from '../HireMeModal';
import { motion, AnimatePresence } from 'framer-motion';

const links = [
    {
        id: 1,
        name: 'Projects',
        url: '/projects',
    },
    {
        id: 2,
        name: 'About Me',
        url: '/about',
    },
    {
        id: 3,
        name: 'Contact Me',
        url: '/contact',
    },
];

const AppHeader = () => {
    const [showMenu, setShowMenu] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [activeTheme, setTheme] = useThemeSwitcher();
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const toggleMenu = () => {
        setShowMenu(!showMenu);
    };

    const showHireMeModal = () => {
        setShowModal(!showModal);
    };

    const isActive = (path) => location.pathname === path;

    return (
        <>
            <motion.nav
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                id="nav"
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
                    scrolled
                        ? 'backdrop-blur-2xl bg-white/90 dark:bg-gray-900/90 shadow-xl border-b border-gray-200/80 dark:border-gray-700/80'
                        : 'backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 shadow-md border-b border-gray-200/50 dark:border-gray-700/50'
                }`}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        {/* Logo */}
                        <Link to="/" className="flex items-center space-x-3 group relative z-10">
                            <motion.div
                                whileHover={{ scale: 1.1, rotate: 5 }}
                                whileTap={{ scale: 0.95 }}
                                className="relative"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-xl blur-md opacity-50 group-hover:opacity-75 transition-opacity" />
                                <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center shadow-2xl group-hover:shadow-indigo-500/50 transition-shadow">
                                    <span className="text-white font-bold text-2xl">S</span>
                                </div>
                            </motion.div>
                            <div className="flex flex-col">
                                <span className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 via-indigo-900 to-purple-900 dark:from-white dark:via-indigo-200 dark:to-purple-200 bg-clip-text text-transparent leading-tight">
                                    udhi S
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium -mt-1">
                                    Full Stack Developer
                                </span>
                            </div>
                        </Link>

                        {/* Desktop Navigation */}
                        <nav className="hidden md:flex items-center space-x-2 bg-gray-100/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full px-2 py-2 border border-gray-200/50 dark:border-gray-700/50">
                            {links.map((link) => {
                                const active = isActive(link.url);
                                return (
                                    <Link
                                        key={link.id}
                                        to={link.url}
                                        className="relative px-5 py-2.5 text-sm font-semibold rounded-full transition-all duration-300 cursor-pointer"
                                    >
                                        {active && (
                                            <motion.div
                                                layoutId="activeTab"
                                                className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full shadow-lg pointer-events-none z-0"
                                                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                                            />
                                        )}
                                        <span
                                            className={`relative z-10 transition-colors duration-300 ${
                                                active
                                                    ? 'text-white'
                                                    : 'text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400'
                                            }`}
                                        >
                                            {link.name}
                                        </span>
                                    </Link>
                                );
                            })}
                        </nav>

                        {/* Right side buttons */}
                        <div className="flex items-center space-x-3">
                            {/* Hire Me Button - Desktop */}
                            <motion.button
                                whileHover={{ scale: 1.05, y: -2 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={showHireMeModal}
                                className="hidden md:flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white text-sm font-semibold rounded-xl shadow-lg hover:shadow-2xl hover:shadow-indigo-500/50 transition-all duration-300 relative overflow-hidden group"
                                aria-label="Hire Me Button"
                            >
                                <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                                <span className="relative z-10 flex items-center gap-2">
                                    <span>Hire Me</span>
                                    <svg
                                        className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M13 7l5 5m0 0l-5 5m5-5H6"
                                        />
                                    </svg>
                                </span>
                            </motion.button>

                            {/* Theme Switcher */}
                            <motion.button
                                whileHover={{ scale: 1.1, rotate: 15 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setTheme(activeTheme)}
                                aria-label="Theme Switcher"
                                className="p-3 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 text-gray-700 dark:text-gray-300 hover:from-indigo-100 hover:to-purple-100 dark:hover:from-indigo-900/30 dark:hover:to-purple-900/30 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200/50 dark:border-gray-600/50"
                            >
                                {activeTheme === 'dark' ? (
                                    <FiSun className="w-5 h-5" />
                                ) : (
                                    <FiMoon className="w-5 h-5" />
                                )}
                            </motion.button>

                            {/* Mobile Menu Button */}
                            <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={toggleMenu}
                                type="button"
                                className="md:hidden p-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors shadow-md"
                                aria-label="Hamburger Menu"
                            >
                                <AnimatePresence mode="wait">
                                    {showMenu ? (
                                        <motion.div
                                            key="close"
                                            initial={{ rotate: -90, opacity: 0 }}
                                            animate={{ rotate: 0, opacity: 1 }}
                                            exit={{ rotate: 90, opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <FiX className="w-6 h-6" />
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="menu"
                                            initial={{ rotate: 90, opacity: 0 }}
                                            animate={{ rotate: 0, opacity: 1 }}
                                            exit={{ rotate: -90, opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <FiMenu className="w-6 h-6" />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.button>
                        </div>
                    </div>

                    {/* Mobile Menu */}
                    <AnimatePresence>
                        {showMenu && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3 }}
                                className="md:hidden overflow-hidden border-t border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl"
                            >
                                <div className="px-4 py-6 space-y-3">
                                    {links.map((link, index) => {
                                        const active = isActive(link.url);
                                        return (
                                            <motion.div
                                                key={link.id}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.1 }}
                                            >
                                                <Link
                                                    to={link.url}
                                                    onClick={() => setShowMenu(false)}
                                                    className={`block px-5 py-3.5 rounded-xl font-semibold transition-all duration-300 ${
                                                        active
                                                            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                                                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-indigo-600 dark:hover:text-indigo-400'
                                                    }`}
                                                >
                                                    {link.name}
                                                </Link>
                                            </motion.div>
                                        );
                                    })}
                                    <motion.button
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => {
                                            showHireMeModal();
                                            setShowMenu(false);
                                        }}
                                        className="w-full mt-4 px-6 py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white text-base font-semibold rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300"
                                        aria-label="Hire Me Button"
                                    >
                                        Hire Me
                                    </motion.button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.nav>

            {/* Hire me modal - Now outside the nav tag! */}
            <AnimatePresence>
                {showModal && (
                    <HireMeModal
                        onClose={showHireMeModal}
                        onRequest={showHireMeModal}
                    />
                )}
            </AnimatePresence>
        </>
    );
};

export default AppHeader;