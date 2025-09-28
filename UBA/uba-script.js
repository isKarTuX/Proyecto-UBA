/*
========================================
UNIVERSIDAD DE BUENOS AIRES - SCRIPT.JS
========================================
Este archivo contiene todas las funcionalidades interactivas
y animaciones para la página principal de la UBA.
*/

// ========================================
// VARIABLES GLOBALES Y CONFIGURACIÓN
// ========================================
const config = {
    // Tiempos de animación
    animationDuration: 300,
    slideInterval: 5000,
    
    // Breakpoints (deben coincidir con CSS)
    breakpoints: {
        mobile: 768,
        tablet: 1024,
        desktop: 1200
    }
};

// Estado global de la aplicación
const appState = {
    isMenuOpen: false,
    currentSlide: 0,
    isScrolling: false
};

// ========================================
// UTILIDADES
// ========================================
/**
 * Debounce función para optimizar eventos que se disparan frecuentemente
 * @param {Function} func - Función a ejecutar
 * @param {number} wait - Tiempo de espera en ms
 * @param {boolean} immediate - Si ejecutar inmediatamente
 */
function debounce(func, wait, immediate) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            timeout = null;
            if (!immediate) func(...args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func(...args);
    };
}

/**
 * Detectar el tamaño de pantalla actual
 * @returns {string} - 'mobile', 'tablet', o 'desktop'
 */
function getScreenSize() {
    const width = window.innerWidth;
    if (width < config.breakpoints.mobile) return 'mobile';
    if (width < config.breakpoints.tablet) return 'tablet';
    return 'desktop';
}

/**
 * Animación suave para scroll
 * @param {Element} element - Elemento al que hacer scroll
 * @param {number} duration - Duración de la animación
 */
function smoothScrollTo(element, duration = 800) {
    const targetPosition = element.offsetTop - 80; // 80px para el header
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;
    let startTime = null;

    function animation(currentTime) {
        if (startTime === null) startTime = currentTime;
        const timeElapsed = currentTime - startTime;
        const run = ease(timeElapsed, startPosition, distance, duration);
        window.scrollTo(0, run);
        if (timeElapsed < duration) requestAnimationFrame(animation);
    }

    function ease(t, b, c, d) {
        t /= d / 2;
        if (t < 1) return c / 2 * t * t + b;
        t--;
        return -c / 2 * (t * (t - 2) - 1) + b;
    }

    requestAnimationFrame(animation);
}

// ========================================
// MANEJO DEL MENÚ
// ========================================
class MenuManager {
    constructor() {
        this.menuToggle = document.getElementById('menu-toggle');
        this.mobileToggle = document.getElementById('mobile-toggle');
        this.menuClose = document.getElementById('menu-close');
        this.fullMenu = document.getElementById('full-menu');
        this.body = document.body;
        
        this.init();
    }

    init() {
        this.bindEvents();
    }

    bindEvents() {
        // Botón de menú principal
        if (this.menuToggle) {
            this.menuToggle.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleMenu();
            });
        }

        // Botón de menú móvil
        if (this.mobileToggle) {
            this.mobileToggle.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleMenu();
            });
        }

        // Botón de cerrar menú
        if (this.menuClose) {
            this.menuClose.addEventListener('click', (e) => {
                e.preventDefault();
                this.closeMenu();
            });
        }

        // Cerrar menú con ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && appState.isMenuOpen) {
                this.closeMenu();
            }
        });

        // Cerrar menú al hacer click fuera
        if (this.fullMenu) {
            this.fullMenu.addEventListener('click', (e) => {
                if (e.target === this.fullMenu) {
                    this.closeMenu();
                }
            });
        }
    }

    toggleMenu() {
        if (appState.isMenuOpen) {
            this.closeMenu();
        } else {
            this.openMenu();
        }
    }

    openMenu() {
        if (this.fullMenu) {
            this.fullMenu.classList.add('active');
            this.body.style.overflow = 'hidden'; // Prevenir scroll del body
            appState.isMenuOpen = true;
            
            // Animación de entrada
            this.animateMenuItems();
        }
    }

    closeMenu() {
        if (this.fullMenu) {
            this.fullMenu.classList.remove('active');
            this.body.style.overflow = ''; // Restaurar scroll del body
            appState.isMenuOpen = false;
        }
    }

    animateMenuItems() {
        const menuItems = this.fullMenu.querySelectorAll('.menu-item');
        menuItems.forEach((item, index) => {
            item.style.opacity = '0';
            item.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                item.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                item.style.opacity = '1';
                item.style.transform = 'translateY(0)';
            }, index * 50);
        });
    }
}


// ========================================
// SLIDER DE NOTICIAS
// ========================================
class NewsSlider {
    constructor() {
        this.slider = document.querySelector('.news-slider');
        this.slides = document.querySelectorAll('.news-slide');
        this.currentSlide = 0;
        this.totalSlides = this.slides.length;
        this.isPlaying = true;
        
        if (this.totalSlides > 0) {
            this.init();
        }
    }

    init() {
        this.createControls();
        this.bindEvents();
        this.startAutoSlide();
    }

    createControls() {
        if (this.totalSlides <= 1) return;

        const controlsContainer = document.createElement('div');
        controlsContainer.className = 'slider-controls';
        
        // Botón anterior
        const prevButton = document.createElement('button');
        prevButton.className = 'slider-btn slider-prev';
        prevButton.innerHTML = '<i class="bi bi-chevron-left"></i>';
        prevButton.setAttribute('aria-label', 'Noticia anterior');
        
        // Botón siguiente
        const nextButton = document.createElement('button');
        nextButton.className = 'slider-btn slider-next';
        nextButton.innerHTML = '<i class="bi bi-chevron-right"></i>';
        nextButton.setAttribute('aria-label', 'Siguiente noticia');
        
        // Indicadores
        const indicators = document.createElement('div');
        indicators.className = 'slider-indicators';
        
        for (let i = 0; i < this.totalSlides; i++) {
            const indicator = document.createElement('button');
            indicator.className = 'slider-indicator';
            indicator.setAttribute('aria-label', `Ir a noticia ${i + 1}`);
            if (i === 0) indicator.classList.add('active');
            indicators.appendChild(indicator);
        }
        
        controlsContainer.appendChild(prevButton);
        controlsContainer.appendChild(nextButton);
        controlsContainer.appendChild(indicators);
        
        this.slider.appendChild(controlsContainer);
        
        // Guardar referencias
        this.prevButton = prevButton;
        this.nextButton = nextButton;
        this.indicators = indicators.querySelectorAll('.slider-indicator');
    }

    bindEvents() {
        if (this.prevButton) {
            this.prevButton.addEventListener('click', () => this.previousSlide());
        }
        
        if (this.nextButton) {
            this.nextButton.addEventListener('click', () => this.nextSlide());
        }
        
        if (this.indicators) {
            this.indicators.forEach((indicator, index) => {
                indicator.addEventListener('click', () => this.goToSlide(index));
            });
        }
        
        // Pausar al pasar el mouse
        this.slider.addEventListener('mouseenter', () => this.pauseAutoSlide());
        this.slider.addEventListener('mouseleave', () => this.resumeAutoSlide());
        
        // Controles de teclado
        this.slider.addEventListener('keydown', (e) => {
            switch (e.key) {
                case 'ArrowLeft':
                    this.previousSlide();
                    break;
                case 'ArrowRight':
                    this.nextSlide();
                    break;
            }
        });
    }

    goToSlide(slideIndex) {
        if (slideIndex === this.currentSlide) return;
        
        // Remover clase active de slide actual
        this.slides[this.currentSlide].classList.remove('active');
        if (this.indicators[this.currentSlide]) {
            this.indicators[this.currentSlide].classList.remove('active');
        }
        
        // Agregar clase active al nuevo slide
        this.currentSlide = slideIndex;
        this.slides[this.currentSlide].classList.add('active');
        if (this.indicators[this.currentSlide]) {
            this.indicators[this.currentSlide].classList.add('active');
        }
    }

    nextSlide() {
        const nextIndex = (this.currentSlide + 1) % this.totalSlides;
        this.goToSlide(nextIndex);
    }

    previousSlide() {
        const prevIndex = this.currentSlide === 0 ? this.totalSlides - 1 : this.currentSlide - 1;
        this.goToSlide(prevIndex);
    }

    startAutoSlide() {
        if (this.totalSlides <= 1) return;
        
        this.autoSlideInterval = setInterval(() => {
            if (this.isPlaying) {
                this.nextSlide();
            }
        }, config.slideInterval);
    }

    pauseAutoSlide() {
        this.isPlaying = false;
    }

    resumeAutoSlide() {
        this.isPlaying = true;
    }

    stopAutoSlide() {
        if (this.autoSlideInterval) {
            clearInterval(this.autoSlideInterval);
        }
    }
}

// ========================================
// EFECTOS DE SCROLL - SIMPLIFICADO
// ========================================
class ScrollEffects {
    constructor() {
        // Solo mantenemos elementos básicos sin animaciones complejas
        this.init();
    }

    init() {
        // Funcionalidad mínima sin efectos de header
    }
}

// ========================================
// LAZY LOADING DE IMÁGENES - SIMPLIFICADO
// ========================================
class LazyImageLoader {
    constructor() {
        // Funcionalidad básica sin animaciones complejas
        this.loadAllImages();
    }

    loadAllImages() {
        const images = document.querySelectorAll('img[data-src]');
        images.forEach(img => {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
        });
    }
}

// ========================================
// SISTEMA DE NOTIFICACIONES - SIMPLIFICADO
// ========================================
class NotificationSystem {
    constructor() {
        // Sistema simplificado sin UI compleja
    }

    show(message, type = 'info') {
        // Solo console.log para debug
        console.log(`${type.toUpperCase()}: ${message}`);
    }
}

// ========================================
// INICIALIZACIÓN DE LA APLICACIÓN
// ========================================
class UBAApp {
    constructor() {
        this.menuManager = null;
        this.newsSlider = null;
        this.scrollEffects = null;
        this.lazyLoader = null;
        this.notifications = null;
        this.isInitialized = false;
    }

    async init() {
        try {
            // Mostrar loading
            this.showLoading();
            
            // Esperar a que el DOM esté listo
            if (document.readyState === 'loading') {
                await new Promise(resolve => {
                    document.addEventListener('DOMContentLoaded', resolve);
                });
            }
            
            // Inicializar componentes
            this.initializeComponents();
            
            // Ocultar loading
            this.hideLoading();
            
            this.isInitialized = true;
            console.log('UBA App inicializada correctamente');
            
        } catch (error) {
            console.error('Error al inicializar la aplicación:', error);
            this.showError('Error al cargar la aplicación. Por favor, recarga la página.');
        }
    }

    initializeComponents() {
        // Inicializar sistema de notificaciones
        this.notifications = new NotificationSystem();
        
        // Inicializar menú
        this.menuManager = new MenuManager();
        
        // Inicializar slider de noticias
        this.newsSlider = new NewsSlider();
        
        // Inicializar efectos de scroll simplificados
        this.scrollEffects = new ScrollEffects();
        
        // Inicializar lazy loading
        this.lazyLoader = new LazyImageLoader();
        
        // Agregar eventos globales
        this.bindGlobalEvents();
    }

    bindGlobalEvents() {
        // Manejo básico de errores
        window.addEventListener('error', (event) => {
            console.error('Error global:', event.error);
        });

        // Manejo básico de resize
        window.addEventListener('resize', debounce(() => {
            // Funcionalidad mínima de resize
        }, 250));
    }

    showLoading() {
        const loading = document.createElement('div');
        loading.id = 'loading';
        loading.innerHTML = '<div class="loading-spinner"></div>';
        document.body.appendChild(loading);
    }

    hideLoading() {
        const loading = document.getElementById('loading');
        if (loading) {
            loading.style.opacity = '0';
            setTimeout(() => {
                if (loading.parentNode) {
                    loading.parentNode.removeChild(loading);
                }
            }, 300);
        }
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'init-error';
        errorDiv.innerHTML = `
            <div class="error-content">
                <h3>Error de Carga</h3>
                <p>${message}</p>
                <button onclick="location.reload()">Recargar Página</button>
            </div>
        `;
        document.body.appendChild(errorDiv);
    }
}

// ========================================
// INICIALIZACIÓN GLOBAL
// ========================================
const ubaApp = new UBAApp();

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => ubaApp.init());
} else {
    ubaApp.init();
}
