import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { AppLayout } from '@/components/AppLayout';
import { StarRating } from '@/components/StarRating';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import type { Tables } from '@/integrations/supabase/types';

type Movie = Tables<'movies'>;
type Review = Tables<'reviews'>;

const MovieDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [review, setReview] = useState<Review | null>(null);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user || !id) return;
    const fetch = async () => {
      const { data: m } = await supabase.from('movies').select('*').eq('id', id).eq('user_id', user.id).single();
      setMovie(m);
      if (m) {
        const { data: r } = await supabase.from('reviews').select('*').eq('movie_id', m.id).eq('user_id', user.id).maybeSingle();
        if (r) {
          setReview(r);
          setRating(r.rating || 0);
          setReviewText(r.review_text || '');
        }
      }
    };
    fetch();
  }, [user, id]);

  const saveReview = async () => {
    if (!user || !movie) return;
    setSaving(true);
    if (review) {
      await supabase.from('reviews').update({ rating, review_text: reviewText || null }).eq('id', review.id);
    } else {
      await supabase.from('reviews').insert({ user_id: user.id, movie_id: movie.id, rating, review_text: reviewText || null });
    }
    toast({ title: 'Review salva!' });
    setSaving(false);
  };

  const deleteMovie = async () => {
    if (!movie) return;
    await supabase.from('movies').delete().eq('id', movie.id);
    toast({ title: 'Filme removido' });
    navigate(-1);
  };

  if (!movie) {
    return (
      <AppLayout>
        <div className="flex justify-center py-12">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
          <ArrowLeft className="h-4 w-4" /> Voltar
        </button>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-xl p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="font-heading text-xl font-bold text-foreground">{movie.title}</h1>
              <p className="text-xs text-muted-foreground font-body mt-1">
                {movie.year || '—'} {movie.genres?.length ? `· ${movie.genres.join(', ')}` : ''}
              </p>
            </div>
            <span className={`text-xs font-body px-2 py-1 rounded-md ${movie.watched ? 'bg-star/10 text-star' : 'bg-primary/10 text-primary'}`}>
              {movie.watched ? 'Assistido' : 'Watchlist'}
            </span>
          </div>

          {movie.overview && (
            <p className="text-sm text-muted-foreground font-body mb-6 leading-relaxed">{movie.overview}</p>
          )}

          <div className="border-t border-border pt-6 space-y-4">
            <h2 className="font-heading text-sm font-bold text-foreground">Review</h2>
            <StarRating rating={rating} onChange={setRating} />
            <Textarea
              placeholder="O que achou do filme?"
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              className="bg-secondary/50"
            />
            <div className="flex gap-2">
              <Button onClick={saveReview} disabled={saving || rating === 0} className="flex-1">
                {saving ? 'Salvando...' : 'Salvar review'}
              </Button>
              <Button variant="outline" onClick={deleteMovie} className="text-destructive hover:bg-destructive/10">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AppLayout>
  );
};

export default MovieDetailPage;
