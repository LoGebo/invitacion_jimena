// Date plan activities for Jimena's birthday
export interface PlanActivity {
  id: string;
  title: string;
  description: string;
  icon: string;
  time: string;
  position: [number, number, number]; // Position on 3D map
  color: string;
  type: 'info' | 'movie' | 'map' | 'gift';
  extraData?: {
    mapUrl?: string;
    movies?: { id: string; title: string; poster: string }[];
  };
}

export const DATE_PLAN: PlanActivity[] = [
  {
    id: 'food',
    title: 'Comida',
    description: "Carl's Jr Vegetariano 🍔",
    icon: '🍔',
    time: '7:30 PM',
    position: [0, 0, 5],
    color: '#E8C87D',
    type: 'map',
    extraData: {
      mapUrl: 'https://www.google.com/maps/place/Carl\'s+Jr./@25.6760006,-100.3519529,17z/data=!3m1!4b1!4m6!3m5!1s0x8662bd99dce9da77:0x3d661a687572b120!8m2!3d25.6760006!4d-100.3519529!16s%2Fg%2F1pp2txdnb?entry=ttu&g_ep=EgoyMDI2MDExOS4wIKXMDSoASAFQAw%3D%3D',
    },
  },
  {
    id: 'movie',
    title: 'Cine',
    description: '¡Película que tú elijas! 🍿',
    icon: '🎬',
    time: '8:20 PM',
    position: [-4, 0, 2],
    color: '#5B9BD5',
    type: 'movie',
    extraData: {
      movies: [
        { id: 'movie1', title: 'Interstellar', poster: 'https://moviepostermexico.com/cdn/shop/products/interstellar_ver2_xxlg_2027x.jpg?v=1571092367' },
        { id: 'movie2', title: 'Inception', poster: 'https://moviepostermexico.com/cdn/shop/products/inception_ver3_xxlg_1024x1024@2x.jpg?v=1574871222' },
        { id: 'movie3', title: 'Orgullo y Prejuicio', poster: 'https://pics.filmaffinity.com/Orgullo_y_prejuicio-766739677-mmed.jpg' },
        { id: 'movie4', title: 'Star Wars', poster: 'https://m.media-amazon.com/images/I/71NhfAhG5VL.jpg' },
        { id: 'movie5', title: 'Your Name', poster: 'https://es.web.img2.acsta.net/pictures/17/02/08/13/45/536055.jpg' },
        { id: 'movie6', title: 'Spirited Away', poster: 'https://m.media-amazon.com/images/M/MV5BNTEyNmEwOWUtYzkyOC00ZTQ4LTllZmUtMjk0Y2YwOGUzYjRiXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg' },
        { id: 'movie7', title: 'Ratatouille', poster: 'https://lumiere-a.akamaihd.net/v1/images/p_ratatouille_19736_0814231f.jpeg' },
        { id: 'movie8', title: 'El Aprendiz de Brujo', poster: 'https://pics.filmaffinity.com/El_aprendiz_de_brujo-956507706-large.jpg' },
      ],
    },
  },
  {
    id: 'dessert',
    title: 'Postre',
    description: 'Pastelito de cumpleaños (rollo de mango) 🎂',
    icon: '🎂',
    time: '9:30 PM',
    position: [3, 0, -3],
    color: '#D4A5A5',
    type: 'info',
  },
  {
    id: 'gift',
    title: 'Regalo',
    description: 'Surprise lol 🎁',
    icon: '🎁',
    time: '10:00 PM',
    position: [5, 0, 2],
    color: '#A8C69F',
    type: 'gift',
  },
  {
    id: 'end',
    title: '¡Fin!',
    description: 'T dejo en tu casa espero que a salvo 💙',
    icon: '💙',
    time: '?',
    position: [-3, 0, -4],
    color: '#E8E0F0',
    type: 'info',
  },
];

// Path connecting all stations (for visual trail)
export const PLAN_PATH: [number, number, number][] = DATE_PLAN.map(a => a.position);
