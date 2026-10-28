import cafeImg from '../assets/images/model_cafe_selfie_1793159131949.jpg';
import gymImg from '../assets/images/model_gym_casual_1793159144992.jpg';
import cozyImg from '../assets/images/model_cozy_home_1793159159023.jpg';
import beachImg from '../assets/images/model_beach_sunset_1793159171363.jpg';

export interface VaultPhoto {
  id: string;
  category: 'cafe' | 'gym' | 'cozy' | 'beach';
  title: string;
  url: string;
  isExclusive: boolean;
  blurLevel?: number;
  caption: string;
  watermark: string;
}

export const CASUAL_PHOTOS: Record<string, VaultPhoto> = {
  cafe: {
    id: 'photo-cafe',
    category: 'cafe',
    title: 'Café de la mañana',
    url: cafeImg,
    isExclusive: false,
    caption: 'Tomándome un matcha latte bien frío antes de salir ☕ ¿Tú ya tomaste café?',
    watermark: 'AURA_SECURE_VALERIA_#992',
  },
  gym: {
    id: 'photo-gym',
    category: 'gym',
    title: 'Post-entreno casual',
    url: gymImg,
    isExclusive: false,
    caption: 'Muerta pero feliz después de pierna hoy 💪 ¿Hiciste ejercicio?',
    watermark: 'AURA_SECURE_VALERIA_#992',
  },
  cozy: {
    id: 'photo-cozy',
    category: 'cozy',
    title: 'Tarde de sofá y relax',
    url: cozyImg,
    isExclusive: false,
    caption: 'Tarde fría y yo aquí en mantita viendo pelis... me hace falta compañía 🤍',
    watermark: 'AURA_SECURE_VALERIA_#992',
  },
  beach: {
    id: 'photo-beach',
    category: 'beach',
    title: 'Atardecer en la playa',
    url: beachImg,
    isExclusive: false,
    caption: 'Caminando por la orilla al atardecer, mi momento favorito del día 🌅',
    watermark: 'AURA_SECURE_VALERIA_#992',
  },
};

export const VIP_TEASERS = [
  {
    id: 'vip-set-1',
    title: 'Sesión Íntima & Exclusiva de Lencería de Seda',
    description: 'Set completo de 24 fotos en alta resolución + 2 videos exclusivos en 4K.',
    blurUrl: cozyImg,
    price: '$19.99/mes',
    tags: ['Ultra HD', 'Sin censura', 'Acceso VIP'],
  },
  {
    id: 'vip-set-2',
    title: 'Detrás de Cámaras & Videollamada 1 a 1',
    description: 'Acceso directo a chat prioritario sin intermediarios + notas de voz personalizadas.',
    blurUrl: beachImg,
    price: '$34.99/mes',
    tags: ['DM Directo', 'Audios Exclusivos', 'Videollamada'],
  },
];
