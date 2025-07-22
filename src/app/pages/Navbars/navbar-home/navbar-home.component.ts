import { Component, Renderer2 } from '@angular/core';

@Component({
  selector: 'app-navbar-home',
  templateUrl: './navbar-home.component.html',
  styleUrls: ['./navbar-home.component.css']
})
export class NavbarHomeComponent {
  isMenuOpen = false;

  constructor(private renderer: Renderer2) { }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;

    // Agregar o quitar clase 'menu-open' al body
    if (this.isMenuOpen) {
      this.renderer.addClass(document.body, 'menu-open');
    } else {
      this.renderer.removeClass(document.body, 'menu-open');
    }
  }
}
