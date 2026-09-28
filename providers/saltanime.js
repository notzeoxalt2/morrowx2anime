/**
 * Morrow Standalone Anime Scraper: SaltAnime
 * Source Site: https://SaltAnime.cx/
 * Real Multi-Language Player Integration (English Dub, Japanese Sub, Hindi, Tamil, Telugu)
 */

const TMDB_API_KEY = "439c478a771f35c05022f9feabcca01c";
const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

async function getTitleFromTmdb(tmdbId, mediaType) {
  try {
    const type = mediaType === "movie" ? "movie" : "tv";
    const res = await fetch(`https://api.themoviedb.org/3/${type}/${tmdbId}?api_key=${TMDB_API_KEY}`);
    if (!res.ok) return null;
    const json = await res.json();
    return json.name || json.title || json.original_name || json.original_title || null;
  } catch {
    return null;
  }
}

async function getStreams(tmdbId, mediaType = "tv", season = 1, episode = 1) {
  try {
    const safeSeason = Number(season) > 0 ? Number(season) : 1;
    const safeEpisode = Number(episode) > 0 ? Number(episode) : 1;
    let queryTitle = null;

    if (/^\d+$/.test(String(tmdbId))) {
      queryTitle = await getTitleFromTmdb(tmdbId, mediaType);
    } else {
      queryTitle = String(tmdbId);
    }

    if (!queryTitle) return [];
    const cleanTitle = queryTitle.trim();

    const searchRes = await fetch(`https://SaltAnime.cx/?s=${encodeURIComponent(cleanTitle)}`, {
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    });
    if (!searchRes.ok) return [];
    const searchHtml = await searchRes.text();
    const seriesMatches = [...searchHtml.matchAll(/href="(https:\/\/SaltAnime\.cx\/(?:series|anime)\/([^"/]+)\/)"/gi)];
    if (!seriesMatches.length) return [];

    const normTitle = cleanTitle.toLowerCase().replace(/[^a-z0-9]/g, '');
    let bestSlug = seriesMatches[0][2];
    for (const m of seriesMatches) {
      const slug = m[2];
      const normSlug = slug.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (normSlug === normTitle) {
        bestSlug = slug;
        break;
      }
    }

    const candidateUrls = [
      `https://SaltAnime.cx/episode/${bestSlug}-${safeSeason}x${safeEpisode}/`,
      `https://SaltAnime.cx/episode/${bestSlug}-1x${safeEpisode}/`,
      `https://SaltAnime.cx/episode/${bestSlug}-episode-${safeEpisode}/`
    ];

    let epHtml = null;
    for (const epUrl of candidateUrls) {
      try {
        const res = await fetch(epUrl, {
          headers: {
            'User-Agent': USER_AGENT,
            'Referer': `https://SaltAnime.cx/series/${bestSlug}/`
          }
        });
        if (res.ok) {
          const text = await res.text();
          if (text.includes('multi-lang-plyr') || text.includes('options-')) {
            epHtml = text;
            break;
          }
        }
      } catch (_) {}
    }

    if (!epHtml) return [];

    const streams = [];
    const plyrMatch = epHtml.match(/multi-lang-plyr\.php\?data=([^"'\s&]+)/);
    if (plyrMatch) {
      try {
        const decoded = atob(plyrMatch[1]);
        const items = JSON.parse(decoded);
        for (const item of items) {
          const lang = item.language || 'English';
          const link = item.link;
          if (!link) continue;

          const isDub = lang.toLowerCase() !== 'japanese';
          const langCode = lang.toLowerCase() === 'english' ? 'en' :
                           lang.toLowerCase() === 'japanese' ? 'ja' :
                           lang.toLowerCase() === 'hindi' ? 'hi' :
                           lang.toLowerCase() === 'tamil' ? 'ta' :
                           lang.toLowerCase() === 'telugu' ? 'te' : 'und';
          const tag = isDub ? `[${lang} Dub]` : `[${lang} Sub]`;
          const langDisplay = isDub ? `ðŸ—£ï¸ ${lang} Dub` : `ðŸ‡¯ðŸ‡µ Japanese Sub`;

          streams.push({
            name: `Multi-Lang ${tag}`,
            title: `SaltAnime â€¢ Multi-Lang Player ${tag} | ${langDisplay}`,
            url: link,
            quality: '1080p',
            language: langCode,
            type: 'hls',
            provider: 'SaltAnime',
            headers: {
              'Referer': 'https://SaltAnime.cx/',
              'User-Agent': USER_AGENT
            }
          });
        }
      } catch (_) {}
    }

    return streams;
  } catch (err) {
    console.error(`[SaltAnime] ${err && err.message ? err.message : err}`);
    return [];
  }
}

module.exports = {
  getStreams
};
globalThis.getStreams = getStreams;

