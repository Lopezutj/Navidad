// Obtener el canvas y contexto
const canvas = document.getElementById('arbolCanvas');
const ctx = canvas.getContext('2d');

// Configurar dimensiones del canvas de forma responsive
function ajustarCanvas() {
    const maxWidth = 800;
    const maxHeight = 600;
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    
    // Ajustar para móviles
    if (windowWidth < 768) {
        canvas.width = Math.min(windowWidth - 40, 500);
        canvas.height = Math.min(windowHeight - 150, 500);
    } else if (windowWidth < 1024) {
        canvas.width = Math.min(windowWidth - 60, 600);
        canvas.height = Math.min(windowHeight - 100, 550);
    } else {
        canvas.width = maxWidth;
        canvas.height = maxHeight;
    }
}

// Llamar al inicio y cuando cambie el tamaño de ventana
ajustarCanvas();
window.addEventListener('resize', () => {
    ajustarCanvas();
    // Limpiar y recrear elementos si es necesario
    lucesArbol = [];
    adornosArbol = [];
    crearLucesArbol();
    crearAdornos();
});

// Variables globales
let animationId;
let coposNieve = [];
let fuegosArtificiales = [];
let particulas = [];
let offsetTexto = 0;
let lucesArbol = [];
let tiempoLuces = 0;
let adornosArbol = [];

// Clase para las partículas de fuegos artificiales
class Particula {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.velocidadX = (Math.random() - 0.5) * 8;
        this.velocidadY = (Math.random() - 0.5) * 8;
        this.gravedad = 0.15;
        this.opacidad = 1;
        this.tamano = Math.random() * 3 + 2;
        this.friccion = 0.98;
    }
    
    actualizar() {
        this.velocidadX *= this.friccion;
        this.velocidadY *= this.friccion;
        this.velocidadY += this.gravedad;
        this.x += this.velocidadX;
        this.y += this.velocidadY;
        this.opacidad -= 0.015;
    }
    
    dibujar() {
        ctx.save();
        ctx.globalAlpha = this.opacidad;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.tamano, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

// Clase para los fuegos artificiales
class FuegoArtificial {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = canvas.height;
        this.targetY = Math.random() * (canvas.height * 0.4) + 50;
        this.velocidadY = -8;
        this.explotado = false;
        this.color = `hsl(${Math.random() * 360}, 100%, 50%)`;
    }
    
    actualizar() {
        if (!this.explotado) {
            this.y += this.velocidadY;
            if (this.y <= this.targetY) {
                this.explotar();
            }
        }
    }
    
    explotar() {
        this.explotado = true;
        const numParticulas = 50;
        for (let i = 0; i < numParticulas; i++) {
            particulas.push(new Particula(this.x, this.y, this.color));
        }
    }
    
    dibujar() {
        if (!this.explotado) {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

// Clase para los copos de nieve
class CopoNieve {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height - canvas.height;
        this.tamano = Math.random() * 3 + 1; // Tamaño entre 1 y 4
        this.velocidad = this.tamano * 0.5; // Los más grandes caen más rápido
        this.velocidadX = Math.random() * 0.5 - 0.25; // Movimiento horizontal
        this.opacidad = Math.random() * 0.5 + 0.5; // Opacidad entre 0.5 y 1
    }
    
    actualizar() {
        this.y += this.velocidad;
        this.x += this.velocidadX;
        
        // Si el copo sale de la pantalla, reiniciarlo arriba
        if (this.y > canvas.height) {
            this.y = -10;
            this.x = Math.random() * canvas.width;
        }
        
        // Si se sale por los lados, reaparecer del otro lado
        if (this.x > canvas.width) {
            this.x = 0;
        } else if (this.x < 0) {
            this.x = canvas.width;
        }
    }
    
    dibujar() {
        ctx.fillStyle = `rgba(255, 255, 255, ${this.opacidad})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.tamano, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Función de inicialización
function init() {
    console.log('Canvas inicializado');
    console.log('Dimensiones:', canvas.width, 'x', canvas.height);
    
    // Configurar y reproducir música
    const audio = document.getElementById('musicaNavidad');
    const toggleBtn = document.getElementById('toggleAudio');
    const audioIcon = document.getElementById('audioIcon');
    const overlayInicio = document.getElementById('overlayInicio');
    const btnIniciar = document.getElementById('btnIniciar');
    
    // Configurar volumen
    audio.volume = 0.3; // Volumen al 30%
    
    // Manejar clic en el botón de inicio
    btnIniciar.addEventListener('click', () => {
        audio.play().then(() => {
            overlayInicio.classList.add('oculto');
            audioIcon.textContent = '🔊';
        }).catch(err => {
            console.log('Error al reproducir:', err);
            alert('No se pudo reproducir el audio. Inténtalo de nuevo.');
        });
    });
    
    // Control de audio con el botón flotante
    toggleBtn.addEventListener('click', () => {
        if (audio.paused) {
            audio.play();
            audioIcon.textContent = '🔊';
        } else {
            audio.pause();
            audioIcon.textContent = '🔇';
        }
    });
    
    // Crear copos de nieve (100 copos)
    for (let i = 0; i < 100; i++) {
        coposNieve.push(new CopoNieve());
    }
    
    // Crear luces del árbol
    crearLucesArbol();
    
    // Crear adornos del árbol
    crearAdornos();
    
    // Crear fuegos artificiales aleatoriamente
    setInterval(() => {
        if (Math.random() < 0.5) {
            fuegosArtificiales.push(new FuegoArtificial());
        }
    }, 800);
    
    // Iniciar la animación
    animar();
}

// Función de animación principal
function animar() {
    // Limpiar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Dibujar nieve en el suelo
    dibujarNieve();
    
    // Dibujar un árbol de Navidad en el centro del canvas
    dibujarArbol(canvas.width / 2, 100, 300);
    
    // Dibujar texto "FELIZ NAVIDAD" flotante
    dibujarTextoFlotante();
    
    // Actualizar y dibujar copos de nieve
    coposNieve.forEach(copo => {
        copo.actualizar();
        copo.dibujar();
    });
    
    // Actualizar y dibujar fuegos artificiales
    for (let i = fuegosArtificiales.length - 1; i >= 0; i--) {
        fuegosArtificiales[i].actualizar();
        fuegosArtificiales[i].dibujar();
        if (fuegosArtificiales[i].explotado) {
            fuegosArtificiales.splice(i, 1);
        }
    }
    
    // Actualizar y dibujar partículas
    for (let i = particulas.length - 1; i >= 0; i--) {
        particulas[i].actualizar();
        particulas[i].dibujar();
        if (particulas[i].opacidad <= 0) {
            particulas.splice(i, 1);
        }
    }
    
    // Continuar la animación
    animationId = requestAnimationFrame(animar);
}

// Función para dibujar una estrella
function dibujarEstrella(cx, cy, radio, puntas, profundidad) {
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.save();
    ctx.translate(cx, cy);
    ctx.moveTo(0, 0 - radio);
    
    for (let i = 0; i < puntas; i++) {
        ctx.rotate(Math.PI / puntas);
        ctx.lineTo(0, 0 - (radio * profundidad));
        ctx.rotate(Math.PI / puntas);
        ctx.lineTo(0, 0 - radio);
    }
    
    ctx.restore();
    ctx.closePath();
    ctx.fill();
    
    // Borde de la estrella
    ctx.strokeStyle = '#FFA500';
    ctx.lineWidth = 2;
    ctx.stroke();
}

// Función para dibujar texto flotante
function dibujarTextoFlotante() {
    // Incrementar el offset para crear movimiento flotante
    offsetTexto += 0.03;
    
    // Calcular desplazamiento vertical (efecto flotante)
    const offsetY = Math.sin(offsetTexto) * 10;
    
    // Configurar el texto
    ctx.save();
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Sombra del texto
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 3;
    ctx.shadowOffsetY = 3;
    
    // Gradiente para el texto
    const gradiente = ctx.createLinearGradient(canvas.width / 2 - 200, 0, canvas.width / 2 + 200, 0);
    gradiente.addColorStop(0, '#FFD700');
    gradiente.addColorStop(0.5, '#FFF');
    gradiente.addColorStop(1, '#FFD700');
    
    ctx.fillStyle = gradiente;
    ctx.fillText('FELIZ NAVIDAD', canvas.width / 2, 450 + offsetY);
    
    // Borde del texto
    ctx.strokeStyle = '#C70039';
    ctx.lineWidth = 3;
    ctx.strokeText('FELIZ NAVIDAD', canvas.width / 2, 450 + offsetY);
    
    ctx.restore();
}

// Iniciar la aplicación
init();

// Función para crear adornos del árbol
function crearAdornos() {
    const centerX = canvas.width / 2;
    const startY = 100;
    
    // Colores variados para las esferas
    const coloresEsferas = [
        { base: '#DC143C', brillo: '#FF6B8A' },  // Rojo
        { base: '#FFD700', brillo: '#FFF4B0' },  // Dorado
        { base: '#0066CC', brillo: '#4D94FF' },  // Azul
        { base: '#CC00CC', brillo: '#FF4DFF' },  // Magenta
        { base: '#FF6600', brillo: '#FFB366' },  // Naranja
        { base: '#00CC66', brillo: '#66FFB3' }   // Verde claro
    ];
    
    // Distribuir esferas en el árbol
    const posicionesEsferas = [
        { y: startY + 40, ancho: 40, cantidad: 2 },
        { y: startY + 90, ancho: 65, cantidad: 3 },
        { y: startY + 140, ancho: 80, cantidad: 3 },
        { y: startY + 200, ancho: 95, cantidad: 4 },
        { y: startY + 240, ancho: 105, cantidad: 4 }
    ];
    
    posicionesEsferas.forEach(nivel => {
        for (let i = 0; i < nivel.cantidad; i++) {
            const espaciado = nivel.ancho * 1.6 / nivel.cantidad;
            const x = centerX + (i - nivel.cantidad / 2 + 0.5) * espaciado;
            const colorIndex = Math.floor(Math.random() * coloresEsferas.length);
            const tamano = 5 + Math.random() * 3;
            
            adornosArbol.push({
                tipo: 'esfera',
                x: x,
                y: nivel.y,
                tamano: tamano,
                colorBase: coloresEsferas[colorIndex].base,
                colorBrillo: coloresEsferas[colorIndex].brillo
            });
        }
    });
}

// Función para dibujar los adornos
function dibujarAdornos() {
    adornosArbol.forEach(adorno => {
        if (adorno.tipo === 'esfera') {
            // Sombra de la esfera
            ctx.save();
            ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
            ctx.shadowBlur = 4;
            ctx.shadowOffsetX = 2;
            ctx.shadowOffsetY = 2;
            
            // Dibujar esfera base
            ctx.fillStyle = adorno.colorBase;
            ctx.beginPath();
            ctx.arc(adorno.x, adorno.y, adorno.tamano, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
            
            // Gradiente para dar efecto 3D
            const gradiente = ctx.createRadialGradient(
                adorno.x - adorno.tamano * 0.3,
                adorno.y - adorno.tamano * 0.3,
                0,
                adorno.x,
                adorno.y,
                adorno.tamano
            );
            gradiente.addColorStop(0, adorno.colorBrillo);
            gradiente.addColorStop(0.7, adorno.colorBase);
            gradiente.addColorStop(1, 'rgba(0, 0, 0, 0.3)');
            
            ctx.fillStyle = gradiente;
            ctx.beginPath();
            ctx.arc(adorno.x, adorno.y, adorno.tamano, 0, Math.PI * 2);
            ctx.fill();
            
            // Brillo superior
            ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.beginPath();
            ctx.arc(
                adorno.x - adorno.tamano * 0.3,
                adorno.y - adorno.tamano * 0.3,
                adorno.tamano * 0.3,
                0,
                Math.PI * 2
            );
            ctx.fill();
        }
    });
}

// Función para crear posiciones de luces en el árbol
function crearLucesArbol() {
    const centerX = canvas.width / 2;
    const startY = 100;
    
    // Luces distribuidas en las tres capas del árbol siguiendo su forma
    const capas = [
        { y: startY + 30, ancho: 40, numLuces: 3 },      // Capa superior
        { y: startY + 90, ancho: 60, numLuces: 4 },      // Capa media
        { y: startY + 150, ancho: 75, numLuces: 5 },
        { y: startY + 210, ancho: 95, numLuces: 6 },     // Capa inferior
        { y: startY + 250, ancho: 105, numLuces: 7 }
    ];
    
    capas.forEach((capa, indexCapa) => {
        for (let i = 0; i < capa.numLuces; i++) {
            // Distribuir las luces con un poco de aleatoriedad para que se vean más naturales
            const espaciado = capa.ancho * 1.8 / capa.numLuces;
            const offsetAleatorio = (Math.random() - 0.5) * 8;
            const x = centerX + (i - capa.numLuces / 2) * espaciado + offsetAleatorio;
            const offsetY = (Math.random() - 0.5) * 6;
            
            lucesArbol.push({
                x: x,
                y: capa.y + offsetY,
                color: ['#FF0000', '#00FF00', '#FFFF00', '#0000FF', '#FF00FF', '#00FFFF'][Math.floor(Math.random() * 6)],
                encendida: false,
                ordenEncendido: indexCapa * 8 + i,
                brillo: 0
            });
        }
    });
}

// Función para dibujar las luces
function dibujarLuces() {
    // Incrementar tiempo para la animación (más lento)
    tiempoLuces += 0.1;
    
    lucesArbol.forEach(luz => {
        // Encender luces de abajo hacia arriba
        if (tiempoLuces > luz.ordenEncendido) {
            luz.encendida = true;
        }
        
        // Si está encendida, alternar brillo
        if (luz.encendida) {
            luz.brillo = 0.5 + Math.sin(tiempoLuces * 0.1 + luz.ordenEncendido) * 0.5;
            
            // Dibujar halo de luz
            ctx.save();
            ctx.globalAlpha = luz.brillo * 0.3;
            ctx.fillStyle = luz.color;
            ctx.beginPath();
            ctx.arc(luz.x, luz.y, 8, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
            
            // Dibujar bombilla
            ctx.save();
            ctx.globalAlpha = luz.brillo;
            ctx.fillStyle = luz.color;
            ctx.beginPath();
            ctx.arc(luz.x, luz.y, 4, 0, Math.PI * 2);
            ctx.fill();
            
            // Punto blanco brillante en el centro
            ctx.fillStyle = 'white';
            ctx.beginPath();
            ctx.arc(luz.x, luz.y, 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    });
    
    // Reiniciar animación cuando todas estén encendidas
    if (tiempoLuces > lucesArbol[lucesArbol.length - 1].ordenEncendido + 50) {
        tiempoLuces = 0;
        lucesArbol.forEach(luz => luz.encendida = false);
    }
}


// Función para dibujar un árbol de Navidad simple
function dibujarArbol(x, y, altura) {
    // Color verde para el árbol
    ctx.fillStyle = '#0d5c0d';
    
    // Primera capa (superior - más pequeña)
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - 60, y + 100);
    ctx.lineTo(x + 60, y + 100);
    ctx.closePath();
    ctx.fill();
    
    // Segunda capa (media)
    ctx.beginPath();
    ctx.moveTo(x, y + 70);
    ctx.lineTo(x - 90, y + 180);
    ctx.lineTo(x + 90, y + 180);
    ctx.closePath();
    ctx.fill();

    // Tercera capa (inferior - más grande)
    ctx.beginPath();
    ctx.moveTo(x, y + 140);
    ctx.lineTo(x - 120, y + 260);
    ctx.lineTo(x + 120, y + 260);
    ctx.closePath();
    ctx.fill();
    
    // Tronco del árbol
    ctx.fillStyle = '#5d4037';
    ctx.fillRect(x - 20, y + 260, 40, 60);
    
    // Dibujar adornos
    dibujarAdornos();
    
    // Dibujar luces de navidad
    dibujarLuces();
    
    // Estrella en la punta
    dibujarEstrella(x, y - 20, 25, 5, 0.5);
}

// Función para dibujar nieve en el suelo
function dibujarNieve() {
    // Nieve acumulada en el suelo
    ctx.fillStyle = '#ffffff';
    
    // Capa principal de nieve (forma ondulada)
    ctx.beginPath();
    ctx.moveTo(0, canvas.height - 80);
    
    // Crear efecto ondulado
    for (let x = 0; x <= canvas.width; x += 40) {
        const y = canvas.height - 80 + Math.sin(x * 0.05) * 10;
        ctx.lineTo(x, y);
    }
    
    ctx.lineTo(canvas.width, canvas.height);
    ctx.lineTo(0, canvas.height);
    ctx.closePath();
    ctx.fill();
    
    // Añadir brillo a la nieve
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.beginPath();
    ctx.moveTo(0, canvas.height - 80);
    
    for (let x = 0; x <= canvas.width; x += 40) {
        const y = canvas.height - 85 + Math.sin(x * 0.05) * 10;
        ctx.lineTo(x, y);
    }
    
    ctx.lineTo(canvas.width, canvas.height - 80);
    ctx.lineTo(0, canvas.height - 80);
    ctx.closePath();
    ctx.fill();
}