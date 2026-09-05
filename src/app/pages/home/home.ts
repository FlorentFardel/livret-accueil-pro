import { Component, inject, signal, Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';

// Imports des modules Material Design pour l'UI
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';

// Import de l'éditeur WYSIWYG Ngx-Quill
import { QuillEditorComponent } from 'ngx-quill';

// Enregistrement des configurations personnalisées pour l'éditeur Quill (Tailles, Alignement, Polices)
import Quill from 'quill';

// Config de la taille de police
const SizeStyle = Quill.import('attributors/style/size') as any;
SizeStyle.whitelist = ['12px', '14px', '16px', '18px', '20px', '24px', '28px', '32px'];
Quill.register(SizeStyle, true);

// Config de l'alignement de texte
const AlignStyle = Quill.import('attributors/style/align') as any;
Quill.register(AlignStyle, true);

// Config des polices de caractères disponibles
const FontStyle = Quill.import('attributors/style/font') as any;
FontStyle.whitelist = ['Roboto', 'Montserrat', 'Playfair Display', 'Dancing Script', 'Oswald'];
Quill.register(FontStyle, true);

// Imports des services et modèles de l'application
import { GuideService } from '../../services/guide';
import { HomeConfig } from '../../models/guide';
import { AuthService } from '../../services/auth';

/**
 * Pipe Angular permettant d'injecter du HTML sécurisé dans le DOM.
 * Évite les attaques XSS tout en autorisant l'affichage du HTML généré par l'éditeur Quill.
 * 
 * @example
 * ```html
 * <div [innerHTML]="myContent | safeHtml"></div>
 * ```
 */
@Pipe({
  name: 'safeHtml',
  standalone: true
})
export class SafeHtmlPipe implements PipeTransform {
  /**
   * Service d'assainissement du DOM injecté.
   * @private
   */
  private sanitizer = inject(DomSanitizer);

  /**
   * Transforme une chaîne HTML brute en valeur de confiance pour le navigateur.
   * 
   * @param {string} value - Le contenu HTML brut à assainir.
   * @returns {SafeHtml} Le contenu HTML sécurisé.
   */
  transform(value: string) {
    return this.sanitizer.bypassSecurityTrustHtml(value || '');
  }
}

/**
 * Composant principal de la page d'accueil (`HomeComponent`).
 * Gère l'affichage dynamique des informations du logement ainsi que leur édition
 * en mode administrateur.
 */
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    RouterLink, 
    MatButtonModule, 
    MatIconModule, 
    MatCardModule, 
    MatInputModule, 
    MatFormFieldModule, 
    FormsModule, 
    QuillEditorComponent,
    SafeHtmlPipe
  ],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class HomeComponent {
  
  /**
   * Service de gestion des données du livret d'accueil.
   * @private
   */
  private guideService = inject(GuideService);

  /**
   * Service de gestion de l'authentification.
   * @private
   */
  private auth = inject(AuthService);

  /**
   * Signal indiquant si l'utilisateur courant possède le rôle administrateur.
   * @type {Signal<boolean>}
   */
  isAdmin = this.auth.isAdmin;

  /**
   * Signal contenant la configuration actuelle de la page d'accueil récupérée depuis Firebase.
   * @type {Signal<HomeConfig>}
   */
  config = this.guideService.homeConfig;

  /**
   * Signal gérant l'état d'ouverture du formulaire d'édition.
   * @type {WritableSignal<boolean>}
   */
  isEditing = signal(false);

  /**
   * Signal stockant les modifications temporaires du formulaire en cours d'édition.
   * @type {WritableSignal<HomeConfig>}
   */
  editForm = signal<HomeConfig>({ ...this.config() });

  /**
   * Configuration des modules et de la barre d'outils de l'éditeur de texte enrichi Quill.
   * @type {object}
   * @readonly
   */
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

  /**
   * Ouvre la fenêtre d'édition et initialise le formulaire avec les valeurs actuelles de la configuration.
   * 
   * @returns {void}
   */
  openEdit(): void {
    this.editForm.set({ ...this.config() });
    this.isEditing.set(true);
  }

  /**
   * Sauvegarde les modifications saisies dans le formulaire, met à jour Firebase 
   * via le service et ferme le mode d'édition.
   * 
   * @returns {void}
   */
  saveEdit(): void {
    this.guideService.updateHomeConfig(this.editForm());
    this.isEditing.set(false);
  }

  /**
   * Déconnecte l'administrateur courant et ferme le panneau d'édition si celui-ci était ouvert.
   * 
   * @returns {void}
   */
  logout(): void {
    this.auth.logout();
    this.isEditing.set(false);
  }
}