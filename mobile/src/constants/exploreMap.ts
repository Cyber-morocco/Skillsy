import { ROOT_CATEGORIES } from './categories';

export const DISTANCE_OPTIONS = [1, 2, 5, 10, 15, 25, 50, 100];

export const CATEGORY_OPTIONS = ROOT_CATEGORIES.map(cat => ({
  id: cat.id,
  label: cat.name.nl,
  icon: cat.icon
}));
