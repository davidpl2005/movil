import { Component } from '@angular/core';
import { AuthService } from '../core/services/auth.service';

@Component({
  standalone: false,
  selector: 'app-tabs',
  templateUrl: './tabs.page.html'
})
export class TabsPage {
  constructor(private authService: AuthService) {}

  logout() {
    this.authService.logout();
  }
}

