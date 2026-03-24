import { Component, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-navbar-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar-home.component.html',
  styleUrls: ['./navbar-home.component.css']
})
export class NavbarHomeComponent {
  isMenuOpen = false;

  constructor(private renderer: Renderer2, private router: Router) {
    // Cerrar menú automáticamente al navegar
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => this.closeMenu());
  }

  /** Alterna el menú móvil */
  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
    this.updateBodyClass();
  }

  /** Cierra el menú */
  closeMenu(): void {
    this.isMenuOpen = false;
    this.updateBodyClass();
  }

  /** Actualiza la clase 'menu-open' en <body> */
  private updateBodyClass(): void {
    if (this.isMenuOpen) {
      this.renderer.addClass(document.body, 'menu-open');
    } else {
      this.renderer.removeClass(document.body, 'menu-open');
    }
  }
}