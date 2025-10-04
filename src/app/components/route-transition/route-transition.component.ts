import { Component, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { RouteTransitionService } from '../../services/route-transition.service';
import { Router, NavigationStart, NavigationEnd, Event } from '@angular/router';

@Component({
  selector: 'app-route-transition',
  template: '<div #container class="route-transition-container"></div>',
  styles: [`
    .route-transition-container {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 100;
      background: transparent;
    }
    :host {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 100;
    }
  `],
  standalone: true
})
export class RouteTransitionComponent implements OnInit, OnDestroy {
  private resizeObserver!: ResizeObserver;

  constructor(
    private routeTransition: RouteTransitionService,
    private router: Router,
    private elementRef: ElementRef
  ) {
    // setupResizeObserver se llamará en ngOnInit para asegurar que estamos en el navegador
  }

  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      this.routeTransition.attachRenderer(this.elementRef.nativeElement.querySelector('.route-transition-container'));
      this.setupResizeObserver();
      this.setupRouterEvents();
    }
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
    this.routeTransition.cleanUp();
    this.routeTransition.detachRenderer();
  }

  private setupRouterEvents(): void {
    this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationStart) {
        // Iniciamos la animación al comenzar la navegación
        this.routeTransition.startTransition('in');
      }
    });
  }

  private setupResizeObserver(): void {
    if (typeof window === 'undefined' || !('ResizeObserver' in window)) return;

    this.resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        this.routeTransition.resize(width, height);
      }
    });

    // Observar el contenedor después de que el componente se inicialice
    setTimeout(() => {
      const container = this.elementRef.nativeElement.querySelector('.route-transition-container');
      if (container) {
        this.resizeObserver.observe(container);
      }
    });
  }
}