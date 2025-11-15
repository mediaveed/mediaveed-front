import React from 'react';
import './home.css';
import { Container } from 'react-bootstrap';

const featureStory = {
  title: 'Inside MediaVeed Labs: How We Keep Downloads Light-Speed',
  date: 'January 2025',
  excerpt:
    'From edge caching to smart format prioritisation, we constantly tweak the pipeline so your MP4s arrive in seconds, even when platforms throttle traffic.',
};

 const blogPosts = [
  {
    slug: 'creator-workflows-mp3',
    title: '5 Creator Workflows Powered by Instant MP3s',
    date: 'Jan 20, 2025',
    tag: 'Creator Tips',
    summary:
      'Turn inspiration into action. Discover how podcasters, vloggers, and DJs use MediaVeed to build sample packs, remixes, and voice-over assets overnight.',
  },
  {
    slug: 'hls-dash-speed',
    title: 'Why HLS & DASH Make Downloads Slow (and what we do about it)',
    date: 'Jan 12, 2025',
    tag: 'Engineering',
    summary:
      'We break down the streaming protocols modern sites rely on, and explain the tricks—format ladders, chunk stitching, and caching—that keep your queue moving.',
  },
  {
    slug: 'mediaveed-roadmap-2025',
    title: 'Roadmap: Platforms & Power Features Coming in 2025',
    date: 'Jan 2, 2025',
    tag: 'Product',
    summary:
      'Threads, Facebook Reels, long-form audio extraction, and collaborative playlists are all on our radar. Here is a transparent look at what we are shipping.',
  },
];

// const insights = [
//   {
//     metric: '92%',
//     label: 'Downloads finish under 2 minutes',
//   },
//   {
//     metric: '65 TB',
//     label: 'Traffic accelerated through MediaVeed last month',
//   },
//   {
//     metric: '4.9/5',
//     label: 'Average user satisfaction across channels',
//   },
// ];

const Blog = ({ onNavigate }) => (
  <section className="blog-page">
    <article className="features-hero">
      <div>
        <p className="info-eyebrow">MediaVeed Blog</p>
        <h1>{featureStory.title}</h1>
        <p className="blog-hero__date">{featureStory.date}</p>
        <p className="blog-hero__summary">{featureStory.excerpt}</p>
        <button className="blog-hero__cta">Read Story →</button>
      </div>
      <div className="blog-hero__art" aria-hidden="true">
        <div className="spark spark-1" />
        <div className="spark spark-2" />
        <div className="spark spark-3" />
      </div>
    </article>
    <Container>
    {/* <div className="blog-insights">
      {insights.map((item) => (
        <div key={item.metric} className="blog-insight-card">
          <span>{item.metric}</span>
          <p>{item.label}</p>
        </div>
      ))}
    </div> */}

      <div className="blog-grid">
        {blogPosts.map((post) => (
          <article key={post.title} className="blog-card">
            <span className="blog-card__tag">{post.tag}</span>
            <h3>{post.title}</h3>
            <p className="blog-card__meta">{post.date}</p>
            <p>{post.summary}</p>
            <button
              className="blog-card__cta"
              onClick={() => onNavigate && onNavigate(post.slug)}
            >
              Continue reading
            </button>
          </article>
        ))}
      </div>
    </Container>
  </section>
);

export default Blog;
