import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  isLightTheme = false;

  ngOnInit(): void {
    const savedTheme = localStorage.getItem('theme');
    this.isLightTheme = savedTheme === 'light';
    document.body.classList.toggle('light-theme', this.isLightTheme);
  }

  toggleTheme(): void {
    this.isLightTheme = !this.isLightTheme;
    document.body.classList.toggle('light-theme', this.isLightTheme);
    localStorage.setItem('theme', this.isLightTheme ? 'light' : 'dark');
  }
}