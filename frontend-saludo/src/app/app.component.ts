import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { getAccessToken, logout } from './auth';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  template: `
    <main class="page">
      <section class="card">
        <h1>Aplicacion de Prueba Saludo</h1>
        <p class="subtitle">Frontend conectado con backend-saludo</p>

        <div class="buttons">
          <button type="button" (click)="cargarSaludo()">GET /api/saludo</button>
          <button type="button" (click)="cargarNombre()">GET /api/nombre</button>
          <button type="button" (click)="cargarApellido()">GET /api/apellido</button>
          <button type="button" class="accent" (click)="cargarTodo()">Cargar mensaje completo</button>
          <button type="button" (click)="cerrarSesion()">Cerrar sesion</button>
        </div>

        <div class="result">
          <p><strong>Saludo:</strong> {{ saludo || '-' }}</p>
          <p><strong>Nombre:</strong> {{ nombre || '-' }}</p>
          <p><strong>Apellido:</strong> {{ apellido || '-' }}</p>
        </div>

        <h2 class="message">{{ mensajeFinal || 'Haz clic en los botones para consumir las APIs' }}</h2>
      </section>
    </main>
  `
})
export class AppComponent {
  private readonly baseUrl = this.detectarBaseUrl();

  saludo = '';
  nombre = '';
  apellido = '';
  mensajeFinal = '';

  constructor(private readonly http: HttpClient) {}

  cargarSaludo(): void {
    this.http.get(`${this.baseUrl}/saludo`, {
      responseType: 'text',
      headers: this.authHeaders()
    }).subscribe((value) => {
      this.saludo = value;
      this.actualizarMensaje();
    });
  }

  cargarNombre(): void {
    this.http.get(`${this.baseUrl}/nombre`, {
      responseType: 'text',
      headers: this.authHeaders()
    }).subscribe((value) => {
      this.nombre = value;
      this.actualizarMensaje();
    });
  }

  cargarApellido(): void {
    this.http.get(`${this.baseUrl}/apellido`, {
      responseType: 'text',
      headers: this.authHeaders()
    }).subscribe((value) => {
      this.apellido = value;
      this.actualizarMensaje();
    });
  }

  cargarTodo(): void {
    this.cargarSaludo();
    this.cargarNombre();
    this.cargarApellido();
  }

  private actualizarMensaje(): void {
    const partes = [this.saludo, this.nombre, this.apellido].filter(Boolean);
    this.mensajeFinal = partes.join(' ').trim();
  }

  private detectarBaseUrl(): string {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') {
      return 'http://localhost:8081/api';
    }
    return '/api-saludo';
  }

  cerrarSesion(): void {
    logout().catch((err) => console.error(err));
  }

  private authHeaders(): HttpHeaders {
    const token = getAccessToken();
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }
}
