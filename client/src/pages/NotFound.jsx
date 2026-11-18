import { Link } from 'react-router-dom';

export default function NotFound() {
  return <div className="not-found"><div className="not-found-code">404</div><h1>Page not found</h1><p>We couldn’t find the page you were looking for.</p><Link className="btn btn-primary" to="/dashboard">Back to workspace</Link></div>;
}
