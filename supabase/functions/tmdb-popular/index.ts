import { corsHeaders } from '@supabase/supabase-js/cors';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const token = Deno.env.get('TMDB_API_TOKEN');
    if (!token) {
      throw new Error('TMDB_API_TOKEN is not configured');
    }

    const url = new URL(req.url);
    const page = url.searchParams.get('page') || '1';
    const language = url.searchParams.get('language') || 'en-US';

    const response = await fetch(
      `https://api.themoviedb.org/3/movie/popular?language=${language}&page=${page}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          accept: 'application/json',
        },
      }
    );

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`TMDB API error [${response.status}]: ${text}`);
    }

    const data = await response.json();

    // Fetch genre list to map IDs to names
    const genreRes = await fetch(
      `https://api.themoviedb.org/3/genre/movie/list?language=${language}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          accept: 'application/json',
        },
      }
    );
    const genreData = await genreRes.json();
    const genreMap = new Map<number, string>(
      (genreData.genres || []).map((g: { id: number; name: string }) => [g.id, g.name])
    );

    const movies = (data.results || []).map((m: any) => ({
      tmdb_id: m.id,
      title: m.title,
      year: m.release_date ? parseInt(m.release_date.substring(0, 4), 10) : null,
      poster_url: m.poster_path
        ? `https://image.tmdb.org/t/p/w500${m.poster_path}`
        : '/placeholder.svg',
      overview: m.overview || '',
      rating: m.vote_average || 0,
      genres: (m.genre_ids || [])
        .map((id: number) => genreMap.get(id))
        .filter(Boolean),
    }));

    return new Response(JSON.stringify({ movies }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('tmdb-popular error:', message);
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
