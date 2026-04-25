const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

// Allowed TMDB image sizes (whitelist for safety)
const ALLOWED_SIZES = new Set([
  'w92', 'w154', 'w185', 'w300', 'w342', 'w500', 'w780', 'w1280', 'original',
]);

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    // Expected: /functions/v1/tmdb-image?path=/abc.jpg&size=w500
    const size = url.searchParams.get('size') || 'w500';
    let path = url.searchParams.get('path') || '';

    if (!ALLOWED_SIZES.has(size)) {
      return new Response(JSON.stringify({ error: 'Invalid size' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Sanitize: only allow /xxxxx.jpg|png|webp paths
    if (!/^\/?[A-Za-z0-9_-]+\.(jpg|jpeg|png|webp)$/i.test(path)) {
      return new Response(JSON.stringify({ error: 'Invalid path' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!path.startsWith('/')) path = `/${path}`;

    const upstream = `https://image.tmdb.org/t/p/${size}${path}`;
    const res = await fetch(upstream);

    if (!res.ok) {
      return new Response(JSON.stringify({ error: `Upstream ${res.status}` }), {
        status: res.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const contentType = res.headers.get('content-type') || 'image/jpeg';
    const body = await res.arrayBuffer();

    return new Response(body, {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, immutable',
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
