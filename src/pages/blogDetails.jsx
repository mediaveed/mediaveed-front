import React from 'react';
import './home.css';
import { blogPosts } from './blog';

const blogDetailsContent = {
  'creator-workflows-mp3': {
    title: '5 Creator Workflows Powered by Instant MP3s',
    body: [
      'Creators are remix scientists. Overnight, MediaVeed enables sample-hungry DJs to spin viral snippets into new soundtracks.',
      'Voiceover artists repurpose speeches into crisp voice cuts, while vloggers strip background tracks to remix reels and Shorts.',
      'We highlight five real workflows—from podcast highlight reels to TikTok mashups—that thrive because an MP3 is one click away.',
    ],
  },
  'hls-dash-speed': {
    title: 'Why HLS & DASH Make Downloads Slow (and what we do about it)',
    body: [
      'Modern video sites serve multi-chunk playlists (HLS & DASH). This is great for adaptive streaming, but painful for raw downloads.',
      'MediaVeed stitches fragments with format ladders that favor mp4/m4a first and gracefully fall back to webm when needed.',
      'This deep dive explains chunk caching, concurrency tuning, and how MediaVeed squeezes more speed out of the same network pipe.',
    ],
  },
  'mediaveed-roadmap-2025': {
    title: 'Roadmap: Platforms & Power Features Coming in 2025',
    body: [
      'Our 2025 rollout includes Facebook Reels, Threads, and longer-form audio extraction tailored for podcasters.',
      'We are also investing in collaborative playlists with shareable download queues for teams and studios.',
      'This roadmap shares timelines, beta programs, and the customer stories influencing the product backlog.',
    ],
  },
};

const BlogDetails = ({ slug, onBack }) => {
  const post = blogDetailsContent[slug];
  const summary = blogPosts.find((p) => p.slug === slug);

  if (!post) {
    return (
      <section className="blog-details">
        <div className="info-card">
          <h1>Story not found</h1>
          <p>The article you are looking for has been archived.</p>
          <button className="blog-card__cta" onClick={onBack}>Return to blog</button>
        </div>
      </section>
    );
  }

  return (
    <section className="blog-details">
      <button className="blog-back" onClick={onBack}>← Back to blog</button>
      <p className="info-eyebrow">{summary?.tag}</p>
      <h1 className="info-title">{post.title}</h1>
      <p className="blog-card__meta">{summary?.date}</p>

      <div className="blog-details-body">
        {post.body.map((paragraph, idx) => (
          <p key={idx}>{paragraph}</p>
        ))}
      </div>
    </section>
  );
};

export default BlogDetails;
