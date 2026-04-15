import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Plus, Eye, Film } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { AppLayout } from '@/components/AppLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { StarRating } from '@/components/StarRating';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import type { Tables } from '@/integrations/supabase/types';

type Movie = Tables<'movies'>;

const MoviesPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [watchedModal, setWatchedModal] = useState<Movie | null>(null);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [addModal, setAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newYear, setNewYear] = useState('');

  const fetchMovies = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('movies')
      .select('*')
      .eq('user_id', user.id)
      .eq('watched', false)
      .order('added_at', { ascending: false });
    setMovies(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchMovies(); }, [user]);

  const filtered = movies.filter(m =>
    m.title.toLowerCase().includes(search.toLowerCase()) ||
    (m.genres && m.genres.some(g => g.toLowerCase().includes(search.toLowerCase())))
  );

  const markWatched = async () => {
    if (!watchedModal || !user) return;
    await supabase.from('movies').update({ watched: true, watched_at: new Date().toISOString() }).eq('id', watchedModal.id);
    if (rating > 0) {
      await supabase.from('reviews').insert({
        user_id: user.id,
        movie_id: watchedModal.id,
        rating,
        review_text: reviewText || null,
      });
    }
    toast({ title: 'Marcado como assistido!' });
    setWatchedModal(null);
    setRating(0);
    setReviewText('');
    fetchMovies();
  };

  const addMovie = async () => {
    if (!user || !newTitle.trim()) return;
    await supabase.from('movies').insert({
      user_id: user.id,
      title: newTitle.trim(),
      year: newYear ? parseInt(newYear) : null,
    });
    setAddModal(false);
    setNewTitle('');
    setNewYear('');
    fetchMovies();
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-heading text-xl font-bold text-foreground">Quero Ver</h1>
            <p className="text-xs text-muted-foreground font-body">{movies.length} filmes na lista</p>
          </div>
          <Button size="sm" onClick={() => setAddModal(true)}>
            <Plus className="h-4 w-4 mr-1" /> Adicionar
          </Button>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por título ou gênero..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-secondary/50"
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <Film className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground font-body">Nenhum filme encontrado</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map((movie, i) => (
              <motion.div
                key={movie.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="glass rounded-lg p-4 group hover:glow transition-all cursor-pointer"
                onClick={() => navigate(`/movies/${movie.id}`)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-heading text-sm font-bold text-foreground truncate">{movie.title}</h3>
                    <p className="text-xs text-muted-foreground font-body mt-0.5">
                      {movie.year || '—'} {movie.genres?.length ? `· ${movie.genres[0]}` : ''}
                    </p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); setWatchedModal(movie); }}
                    className="ml-2 p-1.5 rounded-md hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
                    title="Marcar como assistido"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <Dialog open={!!watchedModal} onOpenChange={() => setWatchedModal(null)}>
          <DialogContent className="glass border-border">
            <DialogHeader>
              <DialogTitle className="font-heading">Marcar como assistido</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-foreground font-body">{watchedModal?.title}</p>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-muted-foreground font-body mb-2 block">Nota</label>
                <StarRating rating={rating} onChange={setRating} />
              </div>
              <Textarea
                placeholder="Escreva sua review (opcional)..."
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                className="bg-secondary/50"
              />
              <Button onClick={markWatched} className="w-full">Confirmar</Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={addModal} onOpenChange={setAddModal}>
          <DialogContent className="glass border-border">
            <DialogHeader>
              <DialogTitle className="font-heading">Adicionar filme</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input placeholder="Título do filme" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} className="bg-secondary/50" />
              <Input placeholder="Ano (opcional)" value={newYear} onChange={(e) => setNewYear(e.target.value)} className="bg-secondary/50" />
              <Button onClick={addMovie} className="w-full">Adicionar à lista</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
};

export default MoviesPage;
