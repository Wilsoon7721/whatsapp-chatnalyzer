import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ORIGIN = 'https://wilsoon.dev/apps/whatsapp-chatnalyzer';

// The app is also served at whatsapp-chatnalyzer.vercel.app, and every route shares one
// index.html, so the canonical URL can't be written into the HTML. It is set per route here,
// pointing at the wilsoon.dev copy, which is the one that should be indexed.
function Canonical() {
  const { pathname } = useLocation();

  useEffect(() => {
    let link = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = document.createElement('link');
      link.rel = 'canonical';
      document.head.appendChild(link);
    }
    link.href = pathname === '/' ? ORIGIN : `${ORIGIN}${pathname.replace(/\/$/, '')}`;
  }, [pathname]);

  return null;
}

export default Canonical;
