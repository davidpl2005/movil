import { Component, OnInit } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent implements OnInit {
  showSplash = true;

  ngOnInit(): void {
    window.setTimeout(() => {
      this.showSplash = false;
    }, 2450);
  }
}
