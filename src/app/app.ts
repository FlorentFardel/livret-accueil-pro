
import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router'; // <-- Ajout de RouterLink
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button'; // <-- Ajout de MatButtonModule

@Component({
  selector: 'app-root',
  standalone: true,
  // On déclare ici tous les outils qu'on utilise dans le HTML
  imports: [RouterOutlet, RouterLink, MatToolbarModule, MatIconModule, MatButtonModule], 
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class AppComponent {}