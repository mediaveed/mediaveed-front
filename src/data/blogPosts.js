const blogModules = import.meta.glob('../content/mediaveed/blog/*.md', {
  eager: true,
  as: 'raw',
});

const slugify = (filePath) => {
  const fileName = filePath.split('/').pop() || 'article';
  return fileName.replace(/\.md$/, '').replace(/_/g, '-');
};

const titleCase = (value) =>
  value
    .split(/[-_]/)
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
    .join(' ');

const parseMarkdown = (raw) => {
  const lines = raw.split(/\r?\n/);
  const body = [];
  let title = '';
  let buffer = [];

  const flush = () => {
    if (buffer.length > 0) {
      body.push(buffer.join(' ').trim());
      buffer = [];
    }
  };

  lines.forEach((line) => {
    if (line.startsWith('# ')) {
      flush();
      if (!title) {
        title = line.replace(/^#\s*/, '').trim();
      } else {
        body.push(line.replace(/^#\s*/, '').trim());
      }
      return;
    }
    if (!line.trim()) {
      flush();
      return;
    }
    buffer.push(line.trim());
  });

  flush();

  return {
    title: title || 'MediaVeed Update',
    body: body.length ? body : ['Full article provided in the content pack.'],
  };
};

const generateDate = (index) => {
  const base = new Date(2025, 0, 1);
  base.setDate(base.getDate() + index);
  return base.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const blogEntries = Object.entries(blogModules)
  .map(([path, content]) => {
    const slug = slugify(path);
    const { title, body } = parseMarkdown(content);
    const summary = body[0] || 'MediaVeed update.';
    return {
      slug,
      title,
      summary,
      body,
    };
  })
  .sort((a, b) => a.slug.localeCompare(b.slug));

const enrichedEntries = blogEntries.map((entry, index) => ({
  ...entry,
  date: generateDate(index),
  tag: index % 2 === 0 ? 'Product' : 'Engineering',
}));

export const featureStory = enrichedEntries[0]
  ? {
      title: enrichedEntries[0].title,
      date: enrichedEntries[0].date,
      excerpt: enrichedEntries[0].summary,
    }
  : {
      title: 'Inside MediaVeed Labs',
      date: 'Jan 2025',
      summary: 'Latest updates from the MediaVeed team.',
      excerpt: 'Latest updates from the MediaVeed team.',
    };

export const blogPosts = enrichedEntries.map((entry) => ({
  slug: entry.slug,
  title: entry.title,
  date: entry.date,
  tag: entry.tag,
  summary: entry.summary,
}));

export const blogDetailsContent = enrichedEntries.reduce(
  (acc, entry) => ({
    ...acc,
    [entry.slug]: {
      title: entry.title,
      body: entry.body,
    },
  }),
  {},
);
