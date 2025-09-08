import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-puntuacion',
  imports: [],
  templateUrl: './puntuacion.component.html',
  styleUrl: './puntuacion.component.css'
})
export class PuntuacionComponent {
  @Input() rating: number = 0; // Puntuación inicial
  @Output() ratingChange = new EventEmitter<number>();

  rate(value: number) {
    this.rating = value;
    this.ratingChange.emit(this.rating); // Emite el nuevo valor
  }
}
