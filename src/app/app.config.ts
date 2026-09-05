import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

// Imports des modules Cloud Firebase (Core, Firestore, Storage)
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { provideStorage, getStorage } from '@angular/fire/storage';

import { routes } from './app.routes';
import { environment } from '../environments/environment';

/**
 * Configuration globale de l'application Angular.
 * Contient l'ensemble des providers requis (Routing, Animations, Firestore, Firebase Storage).
 */
export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    
    // Configuration du routage avec liaison automatique des paramètres d'URL (Component Input Binding)
    provideRouter(routes, withComponentInputBinding()),
    
    provideAnimationsAsync(),
    
    // Initialisation des services Cloud Firebase, Firestore et Storage
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideFirestore(() => getFirestore()),
    provideStorage(() => getStorage())
  ]
};