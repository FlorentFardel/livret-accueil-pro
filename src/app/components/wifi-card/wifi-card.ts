import { Component, computed, input, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';

/**
 * Composant de présentation affichant les identifiants Wi-Fi.
 * Utilise les Signals.
 */
@Component({
  selector: 'app-wifi-card',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatCardModule],
  templateUrl: './wifi-card.html', // <-- Nom simplifié
  styleUrl: './wifi-card.scss'   // <-- Nom simplifié
})
export class WifiCardComponent {
  networkName = input.required<string>();
  networkPassword = input.required<string>();

  isPasswordVisible = signal<boolean>(false);

  toggleButtonText = computed(() => this.isPasswordVisible() ? 'Masquer' : 'Afficher');
  toggleIcon = computed(() => this.isPasswordVisible() ? 'visibility_off' : 'visibility');

  toggleVisibility(): void {
    this.isPasswordVisible.update(visible => !visible);
  }

  async copyToClipboard(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.networkPassword());
    } catch (err) {
      console.error('Échec de la copie', err);
    }
  }
}