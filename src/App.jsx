import { useState, useMemo, useEffect } from 'react';
import './App.css';
import Layout from './components/layout';
import Home from './pages/home';
import Features from './pages/features';
import HowItWorks from './pages/howItWorks';
import Supported from './pages/supported';
import Blog from './pages/blog';
import BlogDetails from './pages/blogDetails';
import HighlightGenerator from './pages/highlightGenerator';
import RecentHighlights from './features/highlight/pages/RecentHighlights';
import About from './pages/about';
import Contact from './pages/contact';
import FAQ from './pages/faq';
import Legal from './pages/legal';
import Metadata from './pages/metadata';
import { trackNavigation, trackPageView } from './utils/analytics.js';

const resolvePageMeta = (pageKey) => {
  if (!pageKey) {
    return { path: '/', title: 'Home' };
  }

  if (pageKey.startsWith('blog:')) {
    const slug = pageKey.split(':')[1] || 'details';
    return { path: `/blog/${slug}`, title: `Blog — ${slug}` };
  }

  const labelMap = {
    home: 'Home',
    features: 'Features',
    'how-it-works': 'How It Works',
    supported: 'Supported Platforms',
    blog: 'Blog',
    'highlight-tool': 'Highlight Generator',
    'highlight-admin': 'Highlight Admin',
    about: 'About',
    faq: 'FAQ',
    contact: 'Contact',
    legal: 'Legal Center',
    metadata: 'Metadata Templates',
  };

  return {
    path: pageKey === 'home' ? '/' : `/${pageKey}`,
    title: labelMap[pageKey] || pageKey,
  };
};

function App() {
  const [currentPage, setCurrentPage] = useState('home');

  const content = useMemo(() => {
    if (currentPage.startsWith('blog:')) {
      const slug = currentPage.split(':')[1];
      return <BlogDetails slug={slug} onBack={() => setCurrentPage('blog')} />;
    }

    switch (currentPage) {
      case 'features':
        return <Features />;
      case 'how-it-works':
        return <HowItWorks />;
      case 'supported':
        return <Supported />;
      case 'blog':
        return <Blog onNavigate={(slug) => setCurrentPage(`blog:${slug}`)} />;
      case 'highlight-tool':
        return <HighlightGenerator />;
      case 'highlight-admin':
        return <RecentHighlights />;
      case 'about':
        return <About />;
      case 'contact':
        return <Contact />;
      case 'faq':
        return <FAQ />;
      case 'legal':
        return <Legal />;
      case 'metadata':
        return <Metadata />;
      default:
        return <Home onNavigate={setCurrentPage} />;
    }
  }, [currentPage]);

  useEffect(() => {
    const handleNavigate = (event) => {
      const targetPage = event.detail;
      if (typeof targetPage === 'string') {
        setCurrentPage(targetPage);
        trackNavigation(targetPage, { source: 'mediaveed:navigate' });
      }
    };

    window.addEventListener('mediaveed:navigate', handleNavigate);
    return () => window.removeEventListener('mediaveed:navigate', handleNavigate);
  }, []);

  useEffect(() => {
    const { path, title } = resolvePageMeta(currentPage);
    trackPageView(path, `MediaVeed | ${title}`);
  }, [currentPage]);

  return (
    <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
      {content}
    </Layout>
  );
}

export default App;
