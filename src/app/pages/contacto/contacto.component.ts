import { Component } from '@angular/core';

@Component({
  selector: 'app-contacto',
  imports: [],
  templateUrl: './contacto.component.html',
  styleUrl: './contacto.component.css'
})
export class ContactoComponent {
  
  constructor() {
    
  }

  onSubmit(formData: any): void {
    console.log('Datos del formulario:', formData);
    alert('¡Mensaje enviado!');
  }
}
