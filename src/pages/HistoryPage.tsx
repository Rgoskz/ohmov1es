import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Film } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { AppLayout } from '@/components/AppLayout';
import { Input } from '@/components/ui/input';
import { StarRating } from '@/components/StarRating';
import type { Tables } from '@/integrations/supabase/types';

type Movie = Tables<'movies'>;
type Review = Tables<'reviews'>;

const HistoryPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [movies, setMovies] = useState<(Movie & { review?: Review })[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const { data: moviesData } = await supabase
        .from('movies')
        .select('*')
        .eq('user_id', user.id)
        .eq('watched', true)
        .order('watched_at', { ascending: false });

      if (moviesData?.length) {
        const { data: reviewsData } = await supabase
          .from('reviews')
          .select('*')
          .eq('user_id', user.id)
          .in('movie_id', moviesData.map(m => m.id));

        const reviewMap = new Map((reviewsData || []).map(r => [r.movie_id, r]));
        setMovies(moviesData.map(m => ({ ...m, review: reviewMap.get(m.id) })));
      } else {
        setMovies([]);
      }
      setLoading(false);
    };
    fetch();
  }, [user]);

  const filtered = movies.filter(m =>
    m.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="font-heading text-xl font-bold text-foreground mb-1">Assistidos</h1>
        <p className="text-xs text-muted-foreground font-body mb-6">{movies.length} filmes assistidos</p>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 bg-secondary/50" />
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <Film className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground font-body">Nenhum filme assistido ainda</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((movie, i) => (
              <motion.div
                key={movie.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => navigate(`/movies/${movie.id}`)}
                className="glass rounded-lg p-4 flex items-center gap-4 cursor-pointer hover:glow transition-all"
              >
                <div className="flex-1 min-w-0">
                  <h3 className="font-heading text-sm font-bold text-foreground truncate">{movie.title}</h3>
                  <p className="text-xs text-muted-foreground font-body">
                    {movie.year || '—'} · {movie.watched_at ? new Date(movie.watched_at).toLocaleDateString('pt-BR') : ''}
                  </p>
                </div>
                {movie.review?.rating && <StarRating rating={movie.review.rating} size={14} />}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default HistoryPage;
