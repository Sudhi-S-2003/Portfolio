import { Navigate, useSearchParams } from 'react-router';

/** Links from the old site (/service/chat?sid=…) open the same conversation on the contact page. */
export default function ServiceChatRedirect() {
  const sid = useSearchParams()[0].get('sid');
  return <Navigate to={sid ? `/contact?sid=${encodeURIComponent(sid)}` : '/contact'} replace />;
}
