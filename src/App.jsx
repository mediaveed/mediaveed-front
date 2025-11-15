import { useState, useMemo } from 'react';
import './App.css';
import Layout from './components/layout';
import Home from './pages/home';
import Features from './pages/features';
import HowItWorks from './pages/howItWorks';
import Supported from './pages/supported';
import Blog from './pages/blog';
import BlogDetails from './pages/blogDetails';

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
      default:
        return <Home />;
    }
  }, [currentPage]);

  return (
    <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
      {content}
    </Layout>
  );
}

export default App;
