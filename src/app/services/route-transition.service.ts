import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import * as THREE from 'three';

@Injectable({
  providedIn: 'root'
})
export class RouteTransitionService {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private particles!: THREE.Points;
  private animating = false;

  private transitionStateSubject = new BehaviorSubject<'none' | 'start' | 'end'>('none');
  public transitionState$ = this.transitionStateSubject.asObservable();

  private initialized = false;

  constructor(private ngZone: NgZone) {
    this.scene = new THREE.Scene();
    // Inicializamos con valores temporales, se actualizarán en attachRenderer
    this.camera = new THREE.PerspectiveCamera(50, 1, 0.1, 1000);
    this.camera.position.z = 15; // Aumentamos la distancia para mejor visibilidad
    // El renderer se inicializará en el cliente
    this.renderer = null as any;
  }

  private initialize(width: number, height: number): void {
    if (this.initialized || typeof window === 'undefined' || typeof document === 'undefined') return;
    
    this.renderer = new THREE.WebGLRenderer({ alpha: true });
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.setupParticles();
    this.setupRenderer(width, height);
    this.initialized = true;
  }

  private setupRenderer(width: number, height: number): void {
    this.renderer.setSize(width, height);
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.setPixelRatio(typeof window !== 'undefined' ? window.devicePixelRatio : 1);
    this.renderer.domElement.style.position = 'absolute';
    this.renderer.domElement.style.top = '0';
    this.renderer.domElement.style.left = '0';
    this.renderer.domElement.style.width = '100%';
    this.renderer.domElement.style.height = '100%';
    this.renderer.domElement.style.zIndex = '1';
    this.renderer.domElement.style.pointerEvents = 'none';
  }

  private setupParticles(): void {
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    const particleCount = 2000;
    const arms = 5; // Número de brazos de la estrella
    const particlesPerArm = particleCount / arms;

    for (let arm = 0; arm < arms; arm++) {
      const angle = (arm / arms) * Math.PI * 2;
      for (let i = 0; i < particlesPerArm; i++) {
        // Distancia desde el centro (distribución no lineal)
        const distance = Math.pow(Math.random(), 0.5) * 15;
        // Ángulo con variación para crear el brazo
        const particleAngle = angle + (Math.random() - 0.5) * 0.5;
        
        // Posición en coordenadas polares a cartesianas
        vertices.push(
          Math.cos(particleAngle) * distance * 0.7, // * 0.7 para hacer la estrella más ancha
          Math.sin(particleAngle) * distance,
          (Math.random() - 0.5) * 2 // Profundidad ligera para efecto 3D
        );
      }
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));

    const sprite = new THREE.TextureLoader().load(
      'data:image/png;base64,' + btoa(
        Array.from({ length: 8 }, (_, y) =>
          Array.from({ length: 8 }, (_, x) => {
            const dx = x - 3.5;
            const dy = y - 3.5;
            return Math.sqrt(dx * dx + dy * dy) <= 3 ? String.fromCharCode(255) : String.fromCharCode(0);
          }).join('')
        ).join('')
      )
    );

    const material = new THREE.PointsMaterial({
      size: 0.25,
      color: 0x4f46e5, // Color índigo más brillante
      transparent: true,
      blending: THREE.AdditiveBlending,
      opacity: 0,
      map: sprite,
      alphaTest: 0.1,
      sizeAttenuation: true,
      depthTest: false, // Desactivar prueba de profundidad para asegurar visibilidad
      depthWrite: false // Desactivar escritura de profundidad
    });

    this.particles = new THREE.Points(geometry, material);
    this.scene.add(this.particles);
  }

  public startTransition(direction: 'in' | 'out'): void {
    if (this.animating || !this.initialized || typeof window === 'undefined') return;

    this.animating = true;
    this.particles.visible = true;
    const duration = 800; // Duración más corta para una transición más rápida
    const startTime = Date.now();

    // Resetear la escala al inicio
    this.particles.scale.set(0.01, 0.01, 0.01);

    const animate = () => {
      const elapsedTime = Date.now() - startTime;
      const progress = Math.min(elapsedTime / duration, 1);

      // Función de easing para movimiento más dinámico
      const eased = 1 - Math.pow(1 - progress, 3);

      // Actualizar opacidad y escala
      const scale = eased;
      (this.particles.material as THREE.PointsMaterial).opacity = scale;
      
      this.particles.scale.set(
        scale * 1.5,
        scale * 1.5,
        scale * 1.5
      );

      // Rotar partículas con velocidad constante
      this.particles.rotation.y += 0.03;
      this.particles.rotation.z += 0.015;

      // Renderizar escena
      this.renderer.render(this.scene, this.camera);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        this.particles.visible = false;
        this.animating = false;
      }
    };

    // Ejecutar animación fuera de la zona de Angular
    this.ngZone.runOutsideAngular(() => {
      animate();
    });
  }

  public attachRenderer(container: HTMLElement): void {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;
    
    this.initialize(container.clientWidth, container.clientHeight);
    if (!this.initialized) return;
    container.appendChild(this.renderer.domElement);
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.camera.aspect = container.clientWidth / container.clientHeight;
    this.camera.updateProjectionMatrix();
  }

  public detachRenderer(): void {
    if (this.initialized && this.renderer && this.renderer.domElement && this.renderer.domElement.parentElement) {
      this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
    }
  }

  public resize(width: number, height: number): void {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  public cleanUp(): void {
    if (!this.initialized) return;
    
    if (this.particles) {
      this.scene.remove(this.particles);
      this.particles.geometry.dispose();
      (this.particles.material as THREE.PointsMaterial).dispose();
    }
    
    if (this.renderer) {
      this.renderer.dispose();
    }
    
    this.initialized = false;
  }
}