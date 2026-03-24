import { Component, Renderer2, OnInit } from '@angular/core';;
import { AuthService } from '../../services/auth/auth.service';
import { CommonModule } from '@angular/common';



@Component({
  selector: 'app-navbar-admin',
  imports: [CommonModule],
  templateUrl: './navbar-admin.component.html',
  styleUrl: './navbar-admin.component.css'
})
export class NavbarAdminComponent implements OnInit {

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
