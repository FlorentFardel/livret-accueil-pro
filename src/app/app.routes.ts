import { Routes } from '@angular/router';

export const routes: Routes = [
  // 1. Accueil
  { 
    path: '', 
    loadComponent: () => import('./pages/home/home').then(m => m.HomeComponent) 
  },

  // 2. Page de Connexion / Authentification (Bouton Cadenas)
  { 
    path: 'login', 
    loadComponent: () => import('./pages/login/login').then(m => m.LoginComponent) 
  },
  
  // 3. Livret - Niveau 1 (Catégories)
  { 
    path: 'guide', 
    loadComponent: () => import('./pages/category-list/category-list').then(m => m.CategoryListComponent) 
  },
  
  // 4. Livret - Niveau 2 (Sous-catégories)
  { 
    path: 'guide/category/:categoryId', 
    loadComponent: () => import('./pages/subcategory-list/subcategory-list').then(m => m.SubcategoryListComponent) 
  },
  
  // 5. Livret - Niveau 3 (Détails & sous-éléments)
  { 
    path: 'guide/:id', 
    loadComponent: () => import('./pages/subcategory-detail/subcategory-detail').then(m => m.SubcategoryDetailComponent) 
  },

  // Redirection globale pour les URLs inconnues
  { path: '**', redirectTo: '' }
];