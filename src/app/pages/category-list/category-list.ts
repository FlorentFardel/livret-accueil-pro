import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

import { GuideService } from '../../services/guide';
import { AuthService } from '../../services/auth';
import { Category } from '../../models/guide';

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule
  ],
  templateUrl: './category-list.html',
  styleUrl: './category-list.scss'
})
export class CategoryListComponent {
  private guideService = inject(GuideService);
  private auth = inject(AuthService);
  private router = inject(Router);

  isAdmin = this.auth.isAdmin;
  categories = this.guideService.categories;

  showForm = signal<boolean>(false);
  catForm = signal<Partial<Category>>({});

  selectCategory(cat: Category): void {
    this.router.navigate(['/guide/category', cat.id]);
  }

  openForm(cat?: Category): void {
    this.catForm.set(cat ? { ...cat } : {});
    this.showForm.set(true);
  }

  saveCategory(): void {
    const form = this.catForm();
    if (!form.name?.trim()) return;

    if (form.id) {
      this.guideService.updateCategory(form.id, form.name, form.icon || 'folder');
    } else {
      this.guideService.addCategory(form.name, form.icon || 'folder');
    }

    this.showForm.set(false);
  }

  deleteCategory(catId: string): void {
    if (confirm('Supprimer cette catégorie ?')) {
      this.guideService.deleteCategory(catId);
    }
  }
}