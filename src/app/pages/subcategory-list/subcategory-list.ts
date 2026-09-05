import { Component, inject, input, computed, signal, Pipe, PipeTransform } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

import { QuillEditorComponent } from 'ngx-quill';

import { GuideService } from '../../services/guide';
import { AuthService } from '../../services/auth';
import { SubCategory, CustomLink } from '../../models/guide';

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
  selector: 'app-subcategory-list',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    QuillEditorComponent,
    SafeHtmlPipe
  ],
  templateUrl: './subcategory-list.html',
  styleUrl: './subcategory-list.scss'
})
export class SubcategoryListComponent {
  categoryId = input<string>();

  private guideService = inject(GuideService);
  private auth = inject(AuthService);
  private router = inject(Router);

  isAdmin = this.auth.isAdmin;

  category = computed(() => {
    const id = this.categoryId();
    return id ? this.guideService.categories().find(c => c.id === id) || null : null;
  });

  showForm = signal<boolean>(false);
  subForm = signal<Partial<SubCategory>>({});
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

  goBack(): void {
    this.router.navigate(['/guide']);
  }

  openForm(sub?: SubCategory): void {
    this.subForm.set(sub ? { ...sub, links: sub.links ? [...sub.links] : [] } : { instructions: '', links: [] });
    this.showForm.set(true);
  }

  saveSubCategory(): void {
    const cat = this.category();
    const form = this.subForm();
    if (!form.title?.trim() || !cat) return;

    if (form.id) {
      this.guideService.updateSubCategory(cat.id, form as SubCategory);
    } else {
      this.guideService.addSubCategory(cat.id, form as SubCategory);
    }

    this.showForm.set(false);
  }

  deleteSubCategory(subId: string): void {
    const cat = this.category();
    if (cat && confirm('Supprimer cet élément ?')) {
      this.guideService.deleteSubCategory(cat.id, subId);
    }
  }

  addSubLink(): void {
    const current = this.subForm().links || [];
    this.subForm.update(s => ({ ...s, links: [...current, { label: '', url: '' }] }));
  }

  removeSubLink(index: number): void {
    const current = [...(this.subForm().links || [])];
    current.splice(index, 1);
    this.subForm.update(s => ({ ...s, links: current }));
  }

  updateSubLink(index: number, field: keyof CustomLink, value: string): void {
    const current = [...(this.subForm().links || [])];
    if (current[index]) {
      current[index] = { ...current[index], [field]: value };
      this.subForm.update(s => ({ ...s, links: current }));
    }
  }

  async onFileSelected(event: Event, targetField: 'subIcon' | 'subImage' | 'subPdf'): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (!input.files?.[0]) return;

    const file = input.files[0];
    this.isUploading.set(true);

    try {
      const folder = file.type.includes('pdf') ? 'pdfs' : 'images';
      const url = await this.guideService.uploadFile(file, folder);

      switch (targetField) {
        case 'subIcon': this.subForm.update(s => ({ ...s, icon: url })); break;
        case 'subImage': this.subForm.update(s => ({ ...s, imageUrl: url })); break;
        case 'subPdf': this.subForm.update(s => ({ ...s, pdfUrl: url })); break;
      }
    } finally {
      this.isUploading.set(false);
    }
  }
}