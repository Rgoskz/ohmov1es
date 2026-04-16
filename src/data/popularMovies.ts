export interface PopularMovie {
  tmdb_id: number;
  title: string;
  year: number;
  poster_url: string;
  backdrop_url?: string;
  overview: string;
  genres: string[];
  rating: number;
}

// Mock data — estrutura compatível com TMDB API para fácil migração futura
export const popularMovies: PopularMovie[] = [
  {
    tmdb_id: 278,
    title: 'The Shawshank Redemption',
    year: 1994,
    poster_url: 'https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg',
    backdrop_url: 'https://image.tmdb.org/t/p/w1280/kXfqcdQKsToO0OUXHcrrNCHDBzO.jpg',
    overview: 'Condenado por um crime que não cometeu, Andy Dufresne é mandado para uma prisão de segurança máxima.',
    genres: ['Drama', 'Crime'],
    rating: 8.7,
  },
  {
    tmdb_id: 238,
    title: 'The Godfather',
    year: 1972,
    poster_url: 'https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsRolD1fZdja1.jpg',
    overview: 'A história épica da família mafiosa Corleone na Nova York dos anos 1940.',
    genres: ['Drama', 'Crime'],
    rating: 8.7,
  },
  {
    tmdb_id: 155,
    title: 'The Dark Knight',
    year: 2008,
    poster_url: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
    overview: 'Batman enfrenta o Coringa, um criminoso anárquico que mergulha Gotham no caos.',
    genres: ['Ação', 'Crime', 'Drama'],
    rating: 8.5,
  },
  {
    tmdb_id: 27205,
    title: 'Inception',
    year: 2010,
    poster_url: 'https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg',
    overview: 'Um ladrão que rouba segredos corporativos através do uso de tecnologia de compartilhamento de sonhos.',
    genres: ['Ação', 'Ficção Científica', 'Aventura'],
    rating: 8.4,
  },
  {
    tmdb_id: 680,
    title: 'Pulp Fiction',
    year: 1994,
    poster_url: 'https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg',
    overview: 'As vidas de dois assassinos da máfia, um boxeador e um casal de bandidos se entrelaçam.',
    genres: ['Crime', 'Drama'],
    rating: 8.5,
  },
  {
    tmdb_id: 13,
    title: 'Forrest Gump',
    year: 1994,
    poster_url: 'https://image.tmdb.org/t/p/w500/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg',
    overview: 'A história de um homem com QI baixo que testemunha vários eventos históricos do século XX.',
    genres: ['Drama', 'Romance'],
    rating: 8.5,
  },
  {
    tmdb_id: 603,
    title: 'The Matrix',
    year: 1999,
    poster_url: 'https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg',
    overview: 'Um hacker descobre a verdade chocante sobre a realidade e seu papel na guerra contra os controladores.',
    genres: ['Ação', 'Ficção Científica'],
    rating: 8.2,
  },
  {
    tmdb_id: 24428,
    title: 'The Avengers',
    year: 2012,
    poster_url: 'https://image.tmdb.org/t/p/w500/RYMX2wcKCBAr24UyPD7xwmjaTn.jpg',
    overview: 'Os super-heróis mais poderosos da Terra se unem para enfrentar uma ameaça global.',
    genres: ['Ação', 'Aventura', 'Ficção Científica'],
    rating: 7.7,
  },
  {
    tmdb_id: 157336,
    title: 'Interstellar',
    year: 2014,
    poster_url: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
    overview: 'Uma equipe de exploradores viaja através de um buraco de minhoca em busca de um novo lar para a humanidade.',
    genres: ['Aventura', 'Drama', 'Ficção Científica'],
    rating: 8.4,
  },
  {
    tmdb_id: 496243,
    title: 'Parasite',
    year: 2019,
    poster_url: 'https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg',
    overview: 'Toda a família de Ki-taek está desempregada quando uma oportunidade lucrativa surge.',
    genres: ['Drama', 'Thriller', 'Comédia'],
    rating: 8.5,
  },
  {
    tmdb_id: 372058,
    title: 'Your Name',
    year: 2016,
    poster_url: 'https://image.tmdb.org/t/p/w500/q719jXXEzOoYaps6babgKnONONX.jpg',
    overview: 'Dois adolescentes descobrem que estão estranhamente conectados quando começam a trocar de corpos.',
    genres: ['Animação', 'Romance', 'Drama'],
    rating: 8.5,
  },
  {
    tmdb_id: 423108,
    title: 'The Conjuring: The Devil Made Me Do It',
    year: 2021,
    poster_url: 'https://image.tmdb.org/t/p/w500/xbSuFiJbbBWCkyCCKIMfuDCA4yV.jpg',
    overview: 'Os investigadores paranormais Ed e Lorraine Warren enfrentam um caso aterrorizante de possessão.',
    genres: ['Terror', 'Mistério', 'Thriller'],
    rating: 7.4,
  },
];
