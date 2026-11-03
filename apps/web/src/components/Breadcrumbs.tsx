import { Link, useLocation, useParams } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { moduleByKey } from '../lib/moduleConfig';

interface Crumb { label: string; to: string }

function trail(pathname: string, moduleKey?: string): Crumb[] {
  const crumbs: Crumb[] = [{ label: 'Home', to: '/' }];
  if (pathname === '/') return crumbs;
  if (moduleKey && moduleByKey[moduleKey]) {
    crumbs.push({ label: moduleByKey[moduleKey].title, to: `/module/${moduleKey}` });
  } else if (pathname.startsWith('/help')) {
    crumbs.push({ label: 'Help & FAQ', to: '/help' });
  }
  return crumbs;
}

export default function Breadcrumbs() {
  const { pathname } = useLocation();
  const { moduleKey } = useParams();
  const crumbs = trail(pathname, moduleKey);

  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      <ol>
        {crumbs.map((crumb, index) => {
          const last = index === crumbs.length - 1;
          return (
            <li key={`${crumb.to}-${index}`}>
              {last
                ? <span aria-current="page">{crumb.label}</span>
                : <Link to={crumb.to}>{crumb.label}</Link>}
              {!last && <ChevronRight size={13} aria-hidden className="crumb-sep" />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
