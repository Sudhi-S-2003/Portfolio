import { useParams } from 'react-router';
import { CaseStudy } from '../features/work/CaseStudy';
import { getProject } from '../features/work/projects';
import NotFound from './NotFound';

export default function CaseStudyPage() {
  const project = getProject(useParams().slug);
  return project ? <CaseStudy project={project} /> : <NotFound />;
}
