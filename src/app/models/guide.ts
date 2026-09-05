export interface CustomLink {
  url: string;
  label: string;
}

export interface MediaLinks {
  imageUrl?: string;
  pdfUrl?: string;
  link?: string;
  linkText?: string;
  links?: CustomLink[];
  icon?: string;
}

export interface SubSubCategory extends MediaLinks {
  id: string;
  title: string;
  instructions: string;
}

export interface SubCategory extends MediaLinks {
  id: string;
  title: string;
  icon: string;
  instructions: string;
  subSubCategories?: SubSubCategory[];
}

export interface Category extends MediaLinks {
  id: string;
  name: string;
  icon: string;
  subCategories: SubCategory[];
}

export interface HomeConfig {
  houseName: string;
  introText: string;
  wifiNetwork: string;
  wifiPassword: string;
}