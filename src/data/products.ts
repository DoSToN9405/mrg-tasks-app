export interface Product {
  id: string;
  name: string;
  category: 'merch' | 'digital' | 'premium';
  price: number;
  starsPrice: number;
  description: string;
  image: string;
  badge?: string;
}

export const PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Telegram Premium 12 мес.',
    category: 'digital',
    price: 2490,
    starsPrice: 1250,
    description: 'Годовая подписка Telegram Premium: расширенные лимиты, эмодзи-статусы и без рекламы.',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&h=300&q=80',
    badge: 'ХИТ',
  },
  {
    id: 'prod-2',
    name: 'Худи "Telegram Developer"',
    category: 'merch',
    price: 4990,
    starsPrice: 2500,
    description: 'Премиальный оверсайз худи из плотного хлопка с вышивкой бумажного самолетика.',
    image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=400&h=300&q=80',
    badge: 'NEW',
  },
  {
    id: 'prod-3',
    name: 'Telegram Stars Пакет 2500 ⭐',
    category: 'digital',
    price: 3990,
    starsPrice: 2000,
    description: 'Звёзды для поддержки авторов, оплаты платного контента и ботов в Telegram.',
    image: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=400&h=300&q=80',
    badge: 'ВЫГОДА',
  },
  {
    id: 'prod-4',
    name: 'Кружка "Bug-Free Code"',
    category: 'merch',
    price: 1190,
    starsPrice: 600,
    description: 'Керамическая матовая кружка 450мл с сохранением тепла кофе до 3 часов.',
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=400&h=300&q=80',
  },
  {
    id: 'prod-5',
    name: 'Доступ в закрытый VIP клуб',
    category: 'premium',
    price: 7990,
    starsPrice: 4000,
    description: 'Инсайды, закрытые нетворкинги и приватные созвоны с ведущими разработчиками Web3 и TMA.',
    image: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=400&h=300&q=80',
    badge: 'EXCLUSIVE',
  },
  {
    id: 'prod-6',
    name: 'Фирменный стикерпак TMA',
    category: 'merch',
    price: 490,
    starsPrice: 250,
    description: 'Набор виниловых влагостойких стикеров для ноутбука и смартфона.',
    image: 'https://images.unsplash.com/photo-1572375992501-4b0892d50c69?auto=format&fit=crop&w=400&h=300&q=80',
  },
];
