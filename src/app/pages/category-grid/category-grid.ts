import { Component, EventEmitter, Output, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

import { GuideService } from '../../services/guide';
import { Category } from '../../models/guide';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-category-grid',
  standalone: true,
  imports: [
    RouterLink,
    FormsModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule
  ],
  templateUrl: './category-grid.html',
  styleUrl: './category-grid.scss'
})
export class CategoryGridComponent {
  
  @Output() categorySelected = new EventEmitter<Category>();

  private guideService = inject(GuideService);
  private auth = inject(AuthService);
  
  categories = this.guideService.categories;
  isAdmin = this.auth.isAdmin;

  showCategoryForm = signal<boolean>(false);
  editingCategoryId = signal<string | null>(null);
  newCatName = signal<string>('');
  newCatIcon = signal<string>('folder');
  isUploading = signal<boolean>(false);

  openAddCategory(): void {
    this.editingCategoryId.set(null); 
    this.newCatName.set(''); 
    this.newCatIcon.set('folder'); 
    this.showCategoryForm.set(true);
  }

  openEditCategory(cat: Category, event: Event): void {
    event.stopPropagation();
    this.editingCategoryId.set(cat.id); 
    this.newCatName.set(cat.name); 
    this.newCatIcon.set(cat.icon); 
    this.showCategoryForm.set(true);
  }

  saveCategory(): void {
    if (!this.newCatName().trim()) return;
    if (this.editingCategoryId()) {
      this.guideService.updateCategory(this.editingCategoryId()!, this.newCatName(), this.newCatIcon());
    } else {
      this.guideService.addCategory(this.newCatName(), this.newCatIcon());
    }
    this.showCategoryForm.set(false);
  }

  deleteCategory(id: string, event: Event): void {
    event.stopPropagation(); 
    if (confirm('Supprimer cette catégorie définitivement ?')) {
      this.guideService.deleteCategory(id);
    }
  }

  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    this.isUploading.set(true);

    try {
      const uploadedDataUrl = await this.guideService.uploadFile(file, 'images');
      this.newCatIcon.set(uploadedDataUrl); 
    } catch (error) {
      console.error('Erreur lors de la conversion du fichier :', error);
      alert('Erreur lors du traitement du fichier.');
    } finally {
      this.isUploading.set(false);
    }
  }
}