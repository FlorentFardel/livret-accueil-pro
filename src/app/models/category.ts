import { SubCategory } from './sub-category';

export interface Category {
  id: string;
  name: string;
  icon: string;
  subCategories: SubCategory[];
}