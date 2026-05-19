import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';

const GENRE_MAP: Record<number, string> = {
  28: 'Ação', 12: 'Aventura', 16: 'Animação', 35: 'Comédia', 80: 'Crime',
  99: 'Documentário', 18: 'Drama', 10751: 'Família', 14: 'Fantasia',
  36: 'História', 27: 'Terror', 10402: 'Música', 9648: 'Mistério',
  10749: 'Romance', 878: 'Ficção Científica', 10770: 'Cinema TV',
  53: 'Thriller', 10752: 'Guerra', 37: 'Faroeste',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const token = Deno.env.get('TMDB_API_TOKEN');
    if (!token) throw new Error('TMDB_API_TOKEN not configured');

    let page = '1';
    let language = 'pt-BR';

    const url = new URL(req.url);
    if (url.searchParams.get('page')) page = url.searchParams.get('page')!;
    if (url.searchParams.get('language')) language = url.searchParams.get('language')!;

    if (req.method === 'POST') {
      try {
        const body = await req.json();
        if (body?.page) page = String(body.page);
        if (body?.language) language = String(body.language);
      } catch { /* empty body ok */ }
    }

    const tmdbUrl = `https://api.themoviedb.org/3/movie/popular?language=${encodeURIComponent(language)}&page=${encodeURIComponent(page)}`;

    const response = await fetch(tmdbUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        accept: 'application/json',
      },
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`TMDB error [${response.status}]: ${text}`);
    }

    const data = await response.json();
    const results: any[] = data?.results || [];

    const movies = results.map((m: any) => ({
      tmdb_id: m.id,
      title: m.title ?? m.name ?? '',
      year: m.release_date ? parseInt(String(m.release_date).substring(0, 4), 10) : null,
      poster_url: m.poster_path ? `${TMDB_IMAGE_BASE}${m.poster_path}` : '/placeholder.svg',
      overview: m.overview || '',
      rating: m.vote_average ?? 0,
      genres: (m.genre_ids || []).map((id: number) => GENRE_MAP[id]).filter(Boolean),
    }));

    return new Response(
      JSON.stringify({
        movies,
        page: data?.page ?? Number(page),
        total_pages: data?.total_pages ?? 1,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
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
