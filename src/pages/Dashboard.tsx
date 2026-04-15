import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Film, Eye, Upload, Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { AppLayout } from '@/components/AppLayout';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ watchlist: 0, watched: 0, reviews: 0 });
  const [profile, setProfile] = useState<{ display_name: string | null }>({ display_name: null });

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      const [watchlist, watched, reviews, profileRes] = await Promise.all([
        supabase.from('movies').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('watched', false),
        supabase.from('movies').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('watched', true),
        supabase.from('reviews').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('profiles').select('display_name').eq('user_id', user.id).single(),
      ]);

      setStats({
        watchlist: watchlist.count ?? 0,
        watched: watched.count ?? 0,
        reviews: reviews.count ?? 0,
      });
      if (profileRes.data) setProfile(profileRes.data);
    };

    fetchData();
  }, [user]);

  const cards = [
    {
      icon: Film,
      label: 'Quero Ver',
      value: stats.watchlist,
      to: '/movies',
      color: 'text-primary',
    },
    {
      icon: Eye,
      label: 'Assistidos',
      value: stats.watched,
      to: '/history',
      color: 'text-star',
    },
    {
      icon: Star,
      label: 'Reviews',
      value: stats.reviews,
      to: '/history',
      color: 'text-primary',
    },
  ];

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-heading text-2xl font-bold text-foreground mb-1">
            Olá, {profile.display_name || 'cinéfilo'} 👋
          </h1>
          <p className="text-sm text-muted-foreground font-body mb-8">
            Aqui está seu resumo.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {cards.map((card, i) => (
            <motion.button
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              onClick={() => navigate(card.to)}
              className="glass rounded-xl p-6 text-left hover:glow transition-all group"
            >
              <card.icon className={`h-5 w-5 ${card.color} mb-3`} />
              <p className="font-heading text-3xl font-bold text-foreground">{card.value}</p>
              <p className="text-xs text-muted-foreground font-body mt-1">{card.label}</p>
            </motion.button>
          ))}
        </div>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          onClick={() => navigate('/import')}
          className="glass rounded-xl p-5 flex items-center gap-4 w-full hover:glow transition-all"
        >
          <Upload className="h-5 w-5 text-primary" />
          <div className="text-left">
            <p className="font-heading text-sm font-bold text-foreground">Importar do Letterboxd</p>
            <p className="text-xs text-muted-foreground font-body">Upload seu CSV exportado</p>
          </div>
        </motion.button>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
