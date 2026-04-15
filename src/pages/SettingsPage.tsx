import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

const GENRES = ['Ação', 'Comédia', 'Drama', 'Terror', 'Ficção Científica', 'Romance', 'Thriller', 'Animação', 'Documentário'];

const SettingsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [displayName, setDisplayName] = useState('');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from('profiles').select('*').eq('user_id', user.id).single().then(({ data }) => {
      if (data) {
        setDisplayName(data.display_name || '');
        setSelectedGenres(data.favorite_genres || []);
      }
    });
  }, [user]);

  const toggleGenre = (g: string) => {
    setSelectedGenres(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g]);
  };

  const save = async () => {
    if (!user) return;
    setSaving(true);
    await supabase.from('profiles').update({
      display_name: displayName,
      favorite_genres: selectedGenres,
    }).eq('user_id', user.id);
    toast({ title: 'Perfil atualizado!' });
    setSaving(false);
  };

  return (
    <AppLayout>
      <div className="max-w-lg mx-auto">
        <h1 className="font-heading text-xl font-bold text-foreground mb-1">Configurações</h1>
        <p className="text-xs text-muted-foreground font-body mb-8">Gerencie seu perfil</p>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-xl p-6 space-y-6">
          <div>
            <label className="text-xs text-muted-foreground font-body mb-2 block">Email</label>
            <Input value={user?.email || ''} disabled className="bg-secondary/50 opacity-60" />
          </div>

          <div>
            <label className="text-xs text-muted-foreground font-body mb-2 block">Nome de exibição</label>
            <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="bg-secondary/50" />
          </div>

          <div>
            <label className="text-xs text-muted-foreground font-body mb-2 block">Gêneros favoritos</label>
            <div className="flex flex-wrap gap-2">
              {GENRES.map(g => (
                <button
                  key={g}
                  onClick={() => toggleGenre(g)}
                  className={`text-xs px-3 py-1.5 rounded-full font-body transition-all ${
                    selectedGenres.includes(g)
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          <Button onClick={save} disabled={saving} className="w-full">
            {saving ? 'Salvando...' : 'Salvar'}
          </Button>
        </motion.div>
      </div>
    </AppLayout>
  );
};

export default SettingsPage;
