import { Route, Routes } from 'react-router';
import { PROJECT_SLUGS } from './features/work/projects';
import About from './pages/About';
import CaseStudyPage from './pages/CaseStudyPage';
import Contact from './pages/Contact';
import Home from './pages/Home';
import NotFound from './pages/NotFound';
import ServiceChatRedirect from './pages/ServiceChatRedirect';
import Work from './pages/Work';

/** Every page that is written to static HTML at build time. */
export const PRERENDER_PATHS = [
  '/',
  '/work',
  ...PROJECT_SLUGS.map((slug) => `/work/${slug}`),
  '/about',
  '/contact',
  '/404',
];

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/work" element={<Work />} />
      <Route path="/work/:slug" element={<CaseStudyPage />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/service/chat" element={<ServiceChatRedirect />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
