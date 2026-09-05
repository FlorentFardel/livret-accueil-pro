import { Component, inject, input, computed, signal, Pipe, PipeTransform } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Location } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

import { QuillEditorComponent } from 'ngx-quill';

import { GuideService } from '../../services/guide';
import { AuthService } from '../../services/auth';
import { SubSubCategory } from '../../models/guide';

@Pipe({
  name: 'safeHtml',
  standalone: true
})
export class SafeHtmlPipe implements PipeTransform {
  private sanitizer = inject(DomSanitizer);
  transform(value: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(value || '');
  }
}

@Component({
  selector: 'app-subcategory-detail',
  standalone: true,
  imports: [
    FormsModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    QuillEditorComponent,
    SafeHtmlPipe
  ],
  templateUrl: './subcategory-detail.html',
  styleUrl: './subcategory-detail.scss'
})
export class SubcategoryDetailComponent {
  id = input<string>();

  private guideService = inject(GuideService);
  private auth = inject(AuthService);
  private location = inject(Location);

  isAdmin = this.auth.isAdmin;

  categoryData = computed(() => {
    const currentId = this.id();
    if (!currentId) return null;

    const allCategories = this.guideService.categories();
    for (const cat of allCategories) {
      const foundSub = cat.subCategories?.find(s => s.id === currentId);
      if (foundSub) {
        return { category: cat, subCategory: foundSub };
      }
    }
    return null;
  });

  selectedSubSub = signal<SubSubCategory | null>(null);

  showSubSubForm = signal<boolean>(false);
  subSubForm = signal<Partial<SubSubCategory>>({});
  isUploading = signal<boolean>(false);

  readonly editorConfig = {
    toolbar: [
      [{ 'font': ['Roboto', 'Montserrat', 'Playfair Display', 'Dancing Script', 'Oswald'] }],
      ['bold', 'italic', 'underline'],
      [{ 'size': ['12px', '14px', '16px', '18px', '20px', '24px', '28px', '32px'] }],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'align': [] }],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      ['clean']
    ]
  };

  selectSubSub(ss: SubSubCategory): void {
    this.selectedSubSub.set(ss);
  }

  clearSelectedSubSub(): void {
    this.selectedSubSub.set(null);
  }

  goBack(): void {
    if (this.selectedSubSub()) {
      this.clearSelectedSubSub();
    } else {
      this.location.back();
    }
  }

  openPdf(pdfUrl?: string): void {
    if (!pdfUrl) return;

    if (pdfUrl.startsWith('data:application/pdf')) {
      try {
        const base64Data = pdfUrl.split(',')[1];
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/pdf' });
        const blobUrl = URL.createObjectURL(blob);
        
        window.open(blobUrl, '_blank');
      } catch (error) {
        console.error('Erreur lors de l’ouverture du PDF Base64 :', error);
      }
    } else {
      window.open(pdfUrl, '_blank');
    }
  }

  openSubSubCategoryForm(subSub?: SubSubCategory): void {
    this.subSubForm.set(subSub ? { ...subSub } : { instructions: '' });
    this.showSubSubForm.set(true);
  }

  saveSubSubCategory(): void {
    const data = this.categoryData();
    if (!this.subSubForm().title?.trim() || !data) return;

    const catId = data.category.id;
    const subId = data.subCategory.id;

    if (this.subSubForm().id) {
      this.guideService.updateSubSubCategory(catId, subId, this.subSubForm() as SubSubCategory);
    } else {
      this.guideService.addSubSubCategory(catId, subId, this.subSubForm() as SubSubCategory);
    }

    this.showSubSubForm.set(false);
  }

  deleteSubSubCategory(subSubId: string): void {
    const data = this.categoryData();
    if (!data) return;

    if (confirm('Supprimer ce sous-élément ?')) {
      this.guideService.deleteSubSubCategory(data.category.id, data.subCategory.id, subSubId);
      if (this.selectedSubSub()?.id === subSubId) {
        this.clearSelectedSubSub();
      }
    }
  }

  async onFileSelected(event: Event, targetField: 'subSubIcon' | 'subSubImage' | 'subSubPdf'): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    this.isUploading.set(true);

    try {
      const folder = file.type.includes('pdf') ? 'pdfs' : 'images';
      const uploadedStorageUrl = await this.guideService.uploadFile(file, folder);

      switch (targetField) {
        case 'subSubIcon': this.subSubForm.update(s => ({ ...s, icon: uploadedStorageUrl })); break;
        case 'subSubImage': this.subSubForm.update(s => ({ ...s, imageUrl: uploadedStorageUrl })); break;
        case 'subSubPdf': this.subSubForm.update(s => ({ ...s, pdfUrl: uploadedStorageUrl })); break;
      }
    } catch (error) {
      console.error('Erreur lors du traitement du fichier :', error);
    } finally {
      this.isUploading.set(false);
    }
  }
}