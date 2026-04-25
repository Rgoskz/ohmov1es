const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

const WEBHOOK_URL = 'https://sakzq1.app.n8n.cloud/webhook/tmdb';

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
        // ignore empty body
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

    // The n8n webhook may return either a TMDB-shaped payload directly,
    // or an array wrapper. Normalize both.
    const data = Array.isArray(raw) ? raw[0] : raw;
    const results: any[] = data?.results || data?.movies || [];

    // Optional embedded genre map: { genres: [{id,name}] } or { genre_map: {...} }
    let genreMap = new Map<number, string>();
    if (Array.isArray(data?.genres)) {
      genreMap = new Map(data.genres.map((g: any) => [g.id, g.name]));
    } else if (data?.genre_map && typeof data.genre_map === 'object') {
      genreMap = new Map(
        Object.entries(data.genre_map).map(([k, v]) => [Number(k), String(v)])
      );
    }

    const resolvePoster = (rawUrl: string | null | undefined) => {
      if (!rawUrl) return '/placeholder.svg';
      return String(rawUrl);
    };

    const movies = results.map((m: any) => ({
      tmdb_id: m.id ?? m.tmdb_id,
      title: m.title ?? m.name ?? '',
      year: m.release_date ? parseInt(String(m.release_date).substring(0, 4), 10) : null,
      poster_url: resolvePoster(m.poster_url),
      overview: m.overview || '',
      rating: m.vote_average ?? m.rating ?? 0,
      genres: Array.isArray(m.genres)
        ? m.genres.map((g: any) => (typeof g === 'string' ? g : g?.name)).filter(Boolean)
        : (m.genre_ids || [])
            .map((id: number) => genreMap.get(id))
            .filter(Boolean),
    }));

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
