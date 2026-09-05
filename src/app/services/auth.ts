import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  
  // ==========================================
  // 1. ÉTATS ET CONFIGURATION
  // ==========================================

  /** 
   * État global d'authentification. 
   * Signal réactif : toute l'application saura instantanément si l'admin est connecté ou non.
   */
  readonly isAdmin = signal<boolean>(false);

  /** 
   * Le "Sel" (Salt) : un mot ajouté au mot de passe avant le mixage.
   * Ça empêche les hackers d'utiliser des dictionnaires de mots de passe pré-calculés.
   */
  private readonly SALT = 'Roubaix2026!';
  
  /** 
   * L'empreinte (Hash) indéchiffrable de ton mot de passe.
   * C'est le résultat du mot de passe + sel, passé dans le mixeur SHA-256.
   */
  private readonly ADMIN_HASH = '280ab92b0d7100b97bdc570d310f585139ef8e9f3165689ff8703088b18bd26e'; 


  // ==========================================
  // 2. MÉTHODES D'AUTHENTIFICATION
  // ==========================================

  /**
   * Tente de connecter l'administrateur en vérifiant son mot de passe.
   * Utilise l'API Web Crypto native pour un hachage asynchrone ultra-rapide et sécurisé.
   * 
   * @param password Le mot de passe tapé par l'utilisateur
   * @returns true si le mot de passe est correct, false sinon
   */
  async login(password: string): Promise<boolean> {
    // 1. On sale le mot de passe (Mot de passe + Sel)
    const saltedPassword = password + this.SALT;
    
    // 2. On transforme le texte en données brutes (tableau d'octets)
    const msgBuffer = new TextEncoder().encode(saltedPassword);
    
    // 3. On passe les données brutes dans le mixeur cryptographique (SHA-256)
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    
    // 4. On convertit le résultat (Buffer) en une chaîne de texte hexadécimale lisible (l'empreinte)
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // 💡 ASTUCE DE DEV : Garde ce log pour générer tes futures empreintes, 
    // mais pense à l'enlever ou le commenter quand ton app sera en production !
    console.log("Ton empreinte SHA-256 est :", hashHex);

    // 5. On compare l'empreinte calculée avec celle stockée en dur
    if (hashHex === this.ADMIN_HASH) {
      this.isAdmin.set(true); // Succès : on ouvre les droits
      return true;
    }
    
    return false; // Échec : mot de passe incorrect
  }

  /**
   * Déconnecte l'administrateur en retirant ses droits.
   */
  logout(): void {
    this.isAdmin.set(false);
  }
}