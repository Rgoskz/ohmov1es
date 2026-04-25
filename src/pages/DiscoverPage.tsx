import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Star, Search, TrendingUp, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { AppLayout } from '@/components/AppLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { popularMovies, type PopularMovie } from '@/data/popularMovies';

const DiscoverPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [adding, setAdding] = useState<number | null>(null);
  const [inListIds, setInListIds] = useState<Set<number>>(new Set());
  const movies: PopularMovie[] = popularMovies;

  useEffect(() => {
    if (!user) return;
    supabase
      .from('movies')
      .select('tmdb_id')
      .eq('user_id', user.id)
      .not('tmdb_id', 'is', null)
      .then(({ data }) => {
        if (data) setInListIds(new Set(data.map((m) => m.tmdb_id as number)));
      });
  }, [user]);

  const filtered = movies.filter((m) =>
    m.title.toLowerCase().includes(search.toLowerCase()) ||
    m.genres.some((g) => g.toLowerCase().includes(search.toLowerCase()))
  );

  const addToWatchlist = async (movie: PopularMovie) => {
    if (!user || inListIds.has(movie.tmdb_id)) return;
    setAdding(movie.tmdb_id);

    const { error } = await supabase.from('movies').insert({
      user_id: user.id,
      tmdb_id: movie.tmdb_id,
      title: movie.title,
      year: movie.year,
      poster_url: movie.poster_url,
      overview: movie.overview,
      genres: movie.genres,
    });

    if (error) {
      toast({ title: 'Erro ao adicionar', description: error.message, variant: 'destructive' });
    } else {
      setInListIds((prev) => new Set(prev).add(movie.tmdb_id));
      toast({ title: 'Adicionado à watchlist!', description: movie.title });
    }
    setAdding(null);
  };

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h1 className="font-heading text-xl font-bold text-foreground">Descobrir</h1>
        </div>
        <p className="text-xs text-muted-foreground font-body mb-6">
          Filmes populares — adicione à sua watchlist
        </p>

        <div className="relative mb-8">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por título ou gênero..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-secondary/50"
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filtered.map((movie, i) => (
            <motion.div
              key={movie.tmdb_id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="group relative rounded-lg overflow-hidden bg-card border border-border hover:border-primary/50 transition-all"
            >
              <div className="relative aspect-[2/3] overflow-hidden bg-secondary">
                <img
                  src={movie.poster_url}
                  alt={`Pôster de ${movie.title}`}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder.svg';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-md bg-background/80 backdrop-blur-sm">
                  <Star className="h-3 w-3 fill-primary text-primary" />
                  <span className="text-xs font-body font-semibold text-foreground">
                    {movie.rating.toFixed(1)}
                  </span>
                </div>
                <Button
                  size="sm"
                  onClick={() => addToWatchlist(movie)}
                  disabled={adding === movie.tmdb_id || inListIds.has(movie.tmdb_id)}
                  variant={inListIds.has(movie.tmdb_id) ? 'secondary' : 'default'}
                  className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-100 disabled:group-hover:opacity-100"
                >
                  {inListIds.has(movie.tmdb_id) ? (
                    <>
                      <Check className="h-3.5 w-3.5 mr-1" />
                      Na lista
                    </>
                  ) : (
                    <>
                      <Plus className="h-3.5 w-3.5 mr-1" />
                      {adding === movie.tmdb_id ? 'Adicionando...' : 'Quero ver'}
                    </>
                  )}
                </Button>
              </div>
              <div className="p-2.5">
                <h3 className="font-heading text-xs font-bold text-foreground truncate" title={movie.title}>
                  {movie.title}
                </h3>
                <p className="text-[10px] text-muted-foreground font-body mt-0.5">
                  {movie.year} · {movie.genres[0] || '—'}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-sm text-muted-foreground font-body">Nenhum filme encontrado</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default DiscoverPage;
