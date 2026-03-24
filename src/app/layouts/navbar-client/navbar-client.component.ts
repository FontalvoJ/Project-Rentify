import { Component, Renderer2, OnInit } from '@angular/core';;
import { AuthService } from '../../services/auth/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar-client',
  imports: [CommonModule],
  templateUrl: './navbar-client.component.html',
  styleUrl: './navbar-client.component.css'
})
export class NavbarClientComponent implements OnInit {

  name: string | null = null;
  isMenuOpen = false;

  constructor(
    private renderer: Renderer2,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.name = this.authService.getUserName();
  }

  logout(): void {
    this.authService.logout();
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;

    if (this.isMenuOpen) {
      this.renderer.addClass(document.body, 'menu-open');
    } else {
      this.renderer.removeClass(document.body, 'menu-open');
    }
  }
}
