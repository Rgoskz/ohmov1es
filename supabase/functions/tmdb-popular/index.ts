const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

const WEBHOOK_URL = 'https://sakzq1.app.n8n.cloud/webhook/tmdb';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';

// Standard TMDB genre map (pt-BR)
const GENRE_MAP: Record<number, string> = {
  28: 'Ação',
  12: 'Aventura',
  16: 'Animação',
  35: 'Comédia',
  80: 'Crime',
  99: 'Documentário',
  18: 'Drama',
  10751: 'Família',
  14: 'Fantasia',
  36: 'História',
  27: 'Terror',
  10402: 'Música',
  9648: 'Mistério',
  10749: 'Romance',
  878: 'Ficção Científica',
  10770: 'Cinema TV',
  53: 'Thriller',
  10752: 'Guerra',
  37: 'Faroeste',
};

const buildPosterUrl = (m: any): string => {
  if (m.poster_url && typeof m.poster_url === 'string' && m.poster_url.startsWith('http')) {
    return m.poster_url;
  }
  if (m.poster_path && typeof m.poster_path === 'string') {
    return `${TMDB_IMAGE_BASE}${m.poster_path}`;
  }
  return '/placeholder.svg';
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    let page = url.searchParams.get('page') || '1';
    let language = url.searchParams.get('language') || 'pt-BR';

    if (req.method === 'POST') {
      try {
        const body = await req.json();
        if (body?.page) page = String(body.page);
        if (body?.language) language = String(body.language);
      } catch {
        // empty body is fine
      }
    }

    const webhookUrl = `${WEBHOOK_URL}?language=${encodeURIComponent(language)}&page=${encodeURIComponent(page)}`;

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { accept: 'application/json' },
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Webhook error [${response.status}]: ${text}`);
    }

    const raw = await response.json();
    const data = Array.isArray(raw) ? raw[0] : raw;
    const results: any[] = data?.results || data?.movies || [];

    // Merge any custom genre map from the webhook with the default TMDB map
    const genreMap = new Map<number, string>(Object.entries(GENRE_MAP).map(([k, v]) => [Number(k), v]));
    if (Array.isArray(data?.genres)) {
      for (const g of data.genres) {
        if (g?.id && g?.name) genreMap.set(Number(g.id), String(g.name));
      }
    } else if (data?.genre_map && typeof data.genre_map === 'object') {
      for (const [k, v] of Object.entries(data.genre_map)) {
        genreMap.set(Number(k), String(v));
      }
    }

    const movies = results.map((m: any) => {
      const genres = Array.isArray(m.genres) && m.genres.length
        ? m.genres.map((g: any) => (typeof g === 'string' ? g : g?.name)).filter(Boolean)
        : (m.genre_ids || [])
            .map((id: number) => genreMap.get(Number(id)))
            .filter(Boolean);

      return {
        tmdb_id: m.id ?? m.tmdb_id,
        title: m.title ?? m.name ?? '',
        year: m.release_date ? parseInt(String(m.release_date).substring(0, 4), 10) : null,
        poster_url: buildPosterUrl(m),
        overview: m.overview || '',
        rating: m.vote_average ?? m.rating ?? 0,
        genres,
      };
    });

    return new Response(
      JSON.stringify({
        movies,
        page: data?.page ?? Number(page),
        total_pages: data?.total_pages ?? 1,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('tmdb-popular error:', message);
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
