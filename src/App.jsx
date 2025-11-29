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
      default:
        return <Home onNavigate={setCurrentPage} />;
    }
  }, [currentPage]);

  useEffect(() => {
    const handleNavigate = (event) => {
      const targetPage = event.detail;
      if (typeof targetPage === 'string') {
        setCurrentPage(targetPage);
      }
    };

    window.addEventListener('mediaveed:navigate', handleNavigate);
    return () => window.removeEventListener('mediaveed:navigate', handleNavigate);
  }, []);

  return (
    <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
      {content}
    </Layout>
  );
}

export default App;
