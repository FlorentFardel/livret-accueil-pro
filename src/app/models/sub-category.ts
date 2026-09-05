import { LinkItem } from './link-item';
import { SubSubCategory } from './sub-sub-category';

export interface SubCategory {
  id: string;
  title: string;
  icon?: string;
  instructions?: string;
  links?: LinkItem[];
  imageUrl?: string;
  pdfUrl?: string;
  subSubCategories?: SubSubCategory[];
}