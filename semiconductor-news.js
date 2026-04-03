const liveNewsSources = [
  {
    badge: 'Intel',
    sourceLabel: 'Intel Newsroom',
    rssUrl: 'https://newsroom.intel.com/feed/',
    includeTerms: ['ai', 'foundry', 'manufacturing', 'semiconductor', 'chip', 'chips', 'processor', 'xeon', 'arc', '18a', 'fab', 'packaging', 'data center'],
    excludeTerms: ['people officer', 'financial results', 'supplier award']
  },
  {
    badge: 'NVIDIA',
    sourceLabel: 'NVIDIA Blog',
    rssUrl: 'https://blogs.nvidia.com/feed/',
    includeTerms: ['ai factory', 'manufacturing', 'industrial', 'robotics', 'omniverse', 'jetson', 'nvlink', 'gpu', 'data center', 'infrastructure', 'power', 'kubernetes', 'physical ai', 'digital twin', 'factory'],
    excludeTerms: ['geforce now', 'gaming', 'game ', 'rtx ai garage']
  },
  {
    badge: 'Samsung',
    sourceLabel: 'Samsung Global Newsroom',
    rssUrl: 'https://news.samsung.com/global/feed/',
    includeTerms: ['semiconductor', 'memory', 'hbm', 'dram', 'nand', 'foundry', 'fab', 'wafer', 'packaging', 'logic', 'chip', 'chips', 'ai memory', 'process node'],
    excludeTerms: ['gaming monitor', 'bts', 'microwave', 'art tv', 'travel moments', 'ringtone', 'privacy concerns']
  }
];

const entityMap = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' '
};

function decodeHtmlEntities(value) {
  return String(value || '')
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCharCode(parseInt(code, 16)))
    .replace(/&([a-z]+);/gi, (match, name) => entityMap[name.toLowerCase()] || match);
}

function stripHtml(value) {
  return decodeHtmlEntities(value)
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractTag(block, tagName) {
  const pattern = new RegExp(`<${tagName}\\b[^>]*>([\\s\\S]*?)<\/${tagName}>`, 'i');
  const match = block.match(pattern);
  return match ? match[1].trim() : '';
}

function extractItems(xml) {
  return xml.match(/<item\b[\s\S]*?<\/item>/gi) || [];
}

function parseRssItems(xml) {
  return extractItems(xml).map(itemXml => ({
    title: stripHtml(extractTag(itemXml, 'title')),
    description: extractTag(itemXml, 'description'),
    content: extractTag(itemXml, 'content:encoded') || extractTag(itemXml, 'content'),
    link: stripHtml(extractTag(itemXml, 'link')),
    pubDate: stripHtml(extractTag(itemXml, 'pubDate')),
    categories: Array.from(itemXml.matchAll(/<category\b[^>]*>([\s\S]*?)<\/category>/gi)).map(match => stripHtml(match[1]))
  }));
}

function formatNewsDate(value) {
  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return value || 'Current';
  }

  return parsed.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

function truncateText(value, maxLength) {
  if (value.length <= maxLength) {
    return value;
  }

  const clipped = value.slice(0, maxLength);
  const lastSpace = clipped.lastIndexOf(' ');
  return (lastSpace > 80 ? clipped.slice(0, lastSpace) : clipped).trim() + '...';
}

function cleanSummary(value) {
  const text = stripHtml(value)
    .replace(/The post .* appeared first on .*\.?$/i, '')
    .replace(/What\s+New:\s*/i, '')
    .replace(/NEWS\s+HIGHLIGHTS:\s*/i, '')
    .trim();

  return truncateText(text, 220);
}

function categorizeLiveItem(source, itemText) {
  if (/packaging|chiplet|interposer|substrate/.test(itemText)) {
    return 'Advanced Packaging';
  }

  if (/foundry|fab|wafer|process node|18a|manufacturing/.test(itemText)) {
    return 'Manufacturing';
  }

  if (/memory|hbm|dram|nand/.test(itemText)) {
    return 'Memory';
  }

  if (/power|energy|grid|cooling/.test(itemText)) {
    return 'AI Infrastructure';
  }

  if (/robotics|digital twin|omniverse|industrial/.test(itemText)) {
    return 'Industrial Compute';
  }

  if (/ai|gpu|xeon|processor|chip|chips|data center|nvlink/.test(itemText)) {
    return 'AI Silicon';
  }

  return source.badge === 'Samsung' ? 'Memory & Foundry' : 'Semiconductor Watch';
}

function scoreLiveItem(source, item) {
  const text = [
    item.title,
    stripHtml(item.description),
    stripHtml(item.content),
    Array.isArray(item.categories) ? item.categories.join(' ') : ''
  ].join(' ').toLowerCase();

  let score = 0;

  source.includeTerms.forEach(term => {
    if (text.includes(term)) {
      score += term.includes(' ') ? 3 : 2;
    }
  });

  source.excludeTerms.forEach(term => {
    if (text.includes(term)) {
      score -= 5;
    }
  });

  return score;
}

function normalizeLiveItem(source, item) {
  const score = scoreLiveItem(source, item);

  if (score < 2) {
    return null;
  }

  const title = item.title;
  const summary = cleanSummary(item.description || item.content || title);
  const searchableText = [title, summary, Array.isArray(item.categories) ? item.categories.join(' ') : ''].join(' ').toLowerCase();
  const publishedAt = new Date(item.pubDate);

  return {
    badge: source.badge,
    category: categorizeLiveItem(source, searchableText),
    date: formatNewsDate(item.pubDate),
    title,
    summary,
    sourceLabel: source.sourceLabel,
    sourceUrl: item.link,
    timestamp: Number.isNaN(publishedAt.getTime()) ? 0 : publishedAt.getTime(),
    score
  };
}

async function fetchLiveSource(source) {
  const response = await fetch(source.rssUrl, {
    headers: {
      'user-agent': 'Mozilla/5.0 Vercel Function'
    }
  });

  if (!response.ok) {
    throw new Error(`RSS request failed for ${source.badge}`);
  }

  const xml = await response.text();

  return parseRssItems(xml)
    .map(item => normalizeLiveItem(source, item))
    .filter(Boolean);
}

function buildLiveNewsFeed(items) {
  const dedupedItems = [];
  const seenKeys = new Set();
  const perSourceCounts = {};

  items
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }

      return right.timestamp - left.timestamp;
    })
    .forEach(item => {
      const dedupeKey = (item.sourceUrl || item.title).toLowerCase();

      if (seenKeys.has(dedupeKey)) {
        return;
      }

      const currentCount = perSourceCounts[item.badge] || 0;
      if (currentCount >= 2 || dedupedItems.length >= 6) {
        return;
      }

      seenKeys.add(dedupeKey);
      perSourceCounts[item.badge] = currentCount + 1;
      dedupedItems.push(item);
    });

  if (dedupedItems.length < 3) {
    throw new Error('Insufficient live feed coverage.');
  }

  const latestTimestamp = Math.max(...dedupedItems.map(item => item.timestamp || 0));
  const latestDate = latestTimestamp ? formatNewsDate(new Date(latestTimestamp).toISOString()) : 'Current';

  return {
    isLive: true,
    updatedAt: latestDate,
    featured: {
      eyebrow: 'Live Semiconductor Watch',
      title: 'Official newsroom sync across Intel, NVIDIA, and Samsung.',
      description: 'This feed updates from first-party sources and filters for AI silicon, manufacturing, memory, packaging, and industrial compute topics.'
    },
    chips: [
      {
        icon: 'fa-satellite-dish',
        title: 'Official Sources',
        text: 'Live headlines are pulled from Intel, NVIDIA, and Samsung newsroom RSS feeds.'
      },
      {
        icon: 'fa-filter',
        title: 'Relevance Filter',
        text: 'Gaming, consumer lifestyle, and unrelated corporate posts are screened out before rendering.'
      },
      {
        icon: 'fa-database',
        title: 'Fallback Safe',
        text: 'If live sync is unavailable, the section falls back to your local curated portfolio feed.'
      }
    ],
    items: dedupedItems.map(({ timestamp, score, ...item }) => item)
  };
}

module.exports = async function handler(request, response) {
  if (request.method && request.method !== 'GET') {
    response.setHeader('Allow', 'GET');
    response.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate=3600');

  try {
    const settled = await Promise.allSettled(liveNewsSources.map(source => fetchLiveSource(source)));
    const items = settled
      .filter(result => result.status === 'fulfilled')
      .flatMap(result => result.value);

    const feed = buildLiveNewsFeed(items);
    response.status(200).json(feed);
  } catch (error) {
    response.status(502).json({
      error: 'Unable to build live semiconductor feed.'
    });
  }
};
