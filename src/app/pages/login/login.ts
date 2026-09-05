import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    FormsModule, 
    MatCardModule, 
    MatInputModule, 
    MatButtonModule, 
    MatIconModule
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class LoginComponent {
  
  // ==========================================
  // 1. INJECTIONS
  // ==========================================
  private auth = inject(AuthService);
  private router = inject(Router);

  // ==========================================
  // 2. ÉTATS DU FORMULAIRE (SIGNALS)
  // ==========================================
  
  /** Valeur saisie par l'utilisateur */
  password = signal('');
  
  /** Message d'erreur affiché si le mot de passe est faux */
  errorMsg = signal('');
  
  /** Gère la visibilité du mot de passe (œil masqué/visible) */
  hidePassword = signal(true);

  // ==========================================
  // 3. MÉTHODES
  // ==========================================

  /**
   * Tente de connecter l'utilisateur lors de la validation du formulaire.
   * Redirige vers l'accueil en cas de succès, sinon affiche une erreur.
   */
  async onSubmit(): Promise<void> {
    // 1. On efface l'ancienne erreur (si elle existait) pour la nouvelle tentative
    this.errorMsg.set('');

    // 2. On attend la réponse du service d'authentification
    const success = await this.auth.login(this.password());
    
    if (success) {
      // 3a. Succès : retour à la page d'accueil
      this.router.navigate(['/']); 
    } else {
      // 3b. Échec : on affiche le message d'erreur
      this.errorMsg.set('Mot de passe incorrect');
    }
  }
}
