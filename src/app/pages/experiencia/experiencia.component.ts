import { Component } from '@angular/core';
import { PuntuacionComponent } from '../../components/puntuacion/puntuacion.component';

interface Experiencia {
  titulo: string;
  descripcion: string;
  puntuacion: number;
  autor: string;
  fecha: string;
}

@Component({
  selector: 'app-experiencia',
  imports: [
    PuntuacionComponent
  ],
  templateUrl: './experiencia.component.html',
  styleUrl: './experiencia.component.css'
})
export class ExperienciaComponent {
  experiencias: Experiencia[] = [
    {
      titulo: 'Desarrollo de software innovador',
      descripcion: 'Participó en la creación de una aplicación móvil que revolucionó la forma en que las personas interactúan con la tecnología.',
      puntuacion: 5,
      autor: 'Ana Rodríguez',
      fecha: '2023-09-02'
    },
    {
      titulo: 'Liderazgo de equipo en proyecto desafiante',
      descripcion: 'Tuve la oportunidad de liderar un equipo de trabajo en un proyecto complejo, logrando superar obstáculos y alcanzar los objetivos propuestos.',
      puntuacion: 4,
      autor: 'Carlos López',
      fecha: '2023-08-28'
    },
    {
      titulo: 'Implementación de estrategias de marketing exitosas',
      descripcion: 'Desarrolló e implementó estrategias de marketing que aumentaron el reconocimiento de la marca y las ventas de la empresa.',
      puntuacion: 5,
      autor: 'Sofía Martínez',
      fecha: '2023-07-15'
    },
    {
      titulo: 'Atención al cliente excepcional',
      descripcion: 'Brindó un servicio de atención al cliente de alta calidad, resolviendo problemas y superando las expectativas de los clientes.',
      puntuacion: 4,
      autor: 'Pedro Sánchez',
      fecha: '2023-06-20'
    },
    {
      titulo: 'Gestión de proyectos eficiente',
      descripcion: 'Gestionó proyectos de manera eficiente, cumpliendo con los plazos y presupuestos establecidos, y garantizando la calidad de los resultados.',
      puntuacion: 5,
      autor: 'Laura Gómez',
      fecha: '2023-05-10'
    },
    {
      titulo: 'Desarrollo de habilidades de comunicación',
      descripcion: 'Mejoró mis habilidades de comunicación tanto oral como escrita, lo que me permitió establecer relaciones sólidas con compañeros y clientes.',
      puntuacion: 4,
      autor: 'Javier Pórez',
      fecha: '2023-04-05'
    },
    {
      titulo: 'Resolución de problemas complejos',
      descripcion: 'Demostró mi capacidad para resolver problemas complejos de manera creativa y efectiva, encontrando soluciones innovadoras.',
      puntuacion: 5,
      autor: 'Isabel Díaz',
      fecha: '2023-03-12'
    },
    {
      titulo: 'Trabajo en equipo colaborativo',
      descripcion: 'Participó en equipos de trabajo multidisciplinarios, aportando mis conocimientos y habilidades para lograr objetivos comunes.',
      puntuacion: 4,
      autor: 'Miguel Fernández',
      fecha: '2023-02-18'
    },
    {
      titulo: 'Adaptación a entornos laborales dinámicos',
      descripcion: 'Me adaptó rápidamente a los cambios y desafíos de entornos laborales dinámicos, demostrando flexibilidad y capacidad de aprendizaje.',
      puntuacion: 5,
      autor: 'Elena García',
      fecha: '2023-01-25'
    },
    {
      titulo: 'Contribución a la mejora continua',
      descripcion: 'Contribuí a la mejora continua de procesos y productos, aportando ideas y sugerencias para optimizar el trabajo.',
      puntuacion: 4,
      autor: 'David Rodríguez',
      fecha: '2022-12-08'
    },
    {
      titulo: 'Logro de metas ambiciosas',
      descripcion: 'Logró metas ambiciosas que parecían inalcanzables, demostrando mi determinación y compromiso con el óxito.',
      puntuacion: 5,
      autor: 'Sara Martínez',
      fecha: '2022-11-15'
    },
    {
      titulo: 'Desarrollo de liderazgo',
      descripcion: 'Desarrolló mis habilidades de liderazgo, inspirando y motivando a otros a alcanzar su máximo potencial.',
      puntuacion: 4,
      autor: 'Álvaro López',
      fecha: '2022-10-22'
    },
    {
      titulo: 'Innovación y creatividad',
      descripcion: 'Aportó ideas innovadoras y soluciones creativas a los desafíos que se presentaron, generando valor para la empresa.',
      puntuacion: 5,
      autor: 'Carmen Sánchez',
      fecha: '2022-09-29'
    },
    {
      titulo: 'Ética profesional intachable',
      descripcion: 'Mantuve una ética profesional intachable en todas mis acciones y decisiones, generando confianza y respeto en el entorno laboral.',
      puntuacion: 4,
      autor: 'Roberto Pórez',
      fecha: '2022-08-05'
    },
    {
      titulo: 'Impacto positivo en la comunidad',
      descripcion: 'Contribuí a proyectos y iniciativas que tuvieron un impacto positivo en la comunidad, demostrando mi compromiso social.',
      puntuacion: 5,
      autor: 'Raquel Díaz',
      fecha: '2022-07-12'
    }
  ];

  onRatingChange(rating: number) {
    console.log('Nueva puntuación:', rating);
    // Aquí puedes guardar la puntuación en tu backend
  }

}
