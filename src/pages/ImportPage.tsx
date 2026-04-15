import { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';

const ImportPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const [fileName, setFileName] = useState('');

  const parseCSV = (text: string) => {
    const lines = text.split('\n').filter(l => l.trim());
    if (lines.length < 2) return [];
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    return lines.slice(1).map(line => {
      const values = line.match(/(".*?"|[^,]+)/g)?.map(v => v.replace(/"/g, '').trim()) || [];
      const obj: Record<string, string> = {};
      headers.forEach((h, i) => { obj[h] = values[i] || ''; });
      return obj;
    });
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setFileName(file.name);
    setImporting(true);
    setProgress(0);
    setDone(false);

    const text = await file.text();
    const rows = parseCSV(text);

    const batchSize = 20;
    let imported = 0;

    for (let i = 0; i < rows.length; i += batchSize) {
      const batch = rows.slice(i, i + batchSize);
      const movies = batch.map(row => ({
        user_id: user.id,
        title: row.name || row.title || 'Sem título',
        year: row.year ? parseInt(row.year) : null,
        watched: !!(row.rating || row.watcheddate || row.watched_date),
        watched_at: row.watcheddate || row.watched_date || null,
      }));

      await supabase.from('movies').insert(movies);
      imported += batch.length;
      setProgress(Math.round((imported / rows.length) * 100));
    }

    setDone(true);
    setImporting(false);
    toast({ title: `${imported} filmes importados!` });
  };

  return (
    <AppLayout>
      <div className="max-w-lg mx-auto">
        <h1 className="font-heading text-xl font-bold text-foreground mb-1">Importar do Letterboxd</h1>
        <p className="text-xs text-muted-foreground font-body mb-8">
          Exporte seus dados do Letterboxd como CSV e faça o upload aqui.
        </p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-xl p-8"
        >
          {done ? (
            <div className="text-center">
              <CheckCircle className="h-12 w-12 text-star mx-auto mb-4" />
              <p className="font-heading text-sm font-bold text-foreground">Importação concluída!</p>
              <p className="text-xs text-muted-foreground font-body mt-1">{fileName}</p>
            </div>
          ) : importing ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-primary" />
                <span className="text-sm text-foreground font-body">{fileName}</span>
              </div>
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-muted-foreground font-body text-center">{progress}%</p>
            </div>
          ) : (
            <label className="flex flex-col items-center gap-4 cursor-pointer">
              <Upload className="h-10 w-10 text-muted-foreground" />
              <div className="text-center">
                <p className="font-heading text-sm font-bold text-foreground">Arraste ou clique para enviar</p>
                <p className="text-xs text-muted-foreground font-body mt-1">Aceita arquivos .csv</p>
              </div>
              <input type="file" accept=".csv" onChange={handleFile} className="hidden" />
              <Button variant="outline" size="sm" asChild>
                <span>Selecionar arquivo</span>
              </Button>
            </label>
          )}
        </motion.div>
      </div>
    </AppLayout>
  );
};

export default ImportPage;
