// Configuración de la fecha del evento (Año, Mes (0-11), Día, Hora, Minutos)
const eventDate = new Date("April 11, 2026 15:30:00").getTime();

// Función para setear el VH real en móviles (evitar que la barra del navegador corte el diseño)
function calculateVH() {
    let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
}

calculateVH();
window.addEventListener('resize', calculateVH);
window.addEventListener('orientationchange', calculateVH);

function updateCountdown() {
    const now = new Date().getTime();
    const distance = eventDate - now;

    // Cálculos de tiempo
    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    // Actualizar el DOM con ceros a la izquierda
    document.getElementById("days").innerText = days.toString().padStart(2, '0');
    document.getElementById("hours").innerText = hours.toString().padStart(2, '0');
    document.getElementById("minutes").innerText = minutes.toString().padStart(2, '0');
    document.getElementById("seconds").innerText = seconds.toString().padStart(2, '0');

    // Si la cuenta regresiva termina
    if (distance < 0) {
        clearInterval(countdownInterval);
        document.querySelector(".countdown").innerHTML = "<h3>¡El evento ha comenzado!</h3>";
    }
}

// Iniciar el intervalo
const countdownInterval = setInterval(updateCountdown, 1000);
updateCountdown();

// Mostrar contenido al terminar el video
const video = document.getElementById("bgVideo");
const content = document.querySelector(".content");

function adjustContentWidth() {
    // Ya que el video ahora usa object-fit: cover, el contenido debe usar todo el espacio de la ventana
    // para asegurar que la invitación se vea grande y centrada en móviles.
    content.style.width = '100%';
    content.style.height = '100%';
    console.log("Ajuste de contenido a pantalla completa");
}

let isRevealed = false;

function revealContent() {
    if (isRevealed) return;
    isRevealed = true;
    adjustContentWidth();
    content.classList.add("show");
    
    // Pausar el video en el último frame y asegurar que no se reinicie
    video.pause();
    video.currentTime = video.duration - 0.1; // Mantener el último frame visible
    
    // Ocultar botón de sonido si aún existe
    const unmuteBtn = document.getElementById("unmuteBtn");
    if (unmuteBtn) unmuteBtn.style.display = "none";
    
    console.log("Contenido revelado");
}

video.addEventListener("ended", revealContent);

// Chequeo de seguridad: si falta menos de 0.3s para terminar, revelamos.
// Esto ayuda en navegadores donde 'ended' a veces no dispara.
video.addEventListener("timeupdate", () => {
    if (video.currentTime > 0 && video.duration > 0) {
        if (video.duration - video.currentTime < 0.3) {
            revealContent();
        }
    }
});

window.addEventListener("resize", () => {
    if (isRevealed) {
        adjustContentWidth();
    }
});

video.addEventListener("loadedmetadata", adjustContentWidth);

// Manejo del Modal RSVP
const rsvpBtn = document.getElementById("rsvpBtn");
const rsvpModal = document.getElementById("rsvpModal");
const closeModal = document.getElementById("closeModal");
const rsvpForm = document.getElementById("rsvpForm");

if (rsvpBtn) {
    rsvpBtn.addEventListener("click", () => {
        // Resetear vista en caso de que ya se haya enviado antes
        rsvpForm.style.display = "block";
        document.getElementById("rsvpSuccess").style.display = "none";
        rsvpModal.classList.add("show");
    });
}

if (closeModal) {
    closeModal.addEventListener("click", () => {
        rsvpModal.classList.remove("show");
    });
}

// Cerrar modal al hacer clic fuera de la tarjeta
window.addEventListener("click", (e) => {
    if (e.target === rsvpModal) {
        rsvpModal.classList.remove("show");
    }
});

// Manejo del Formulario
if (rsvpForm) {
    rsvpForm.addEventListener("submit", (e) => {
        e.preventDefault();
        
        const formData = new FormData(rsvpForm);
        const name = formData.get("name");
        const guests = formData.get("guests");
        const prediction = formData.get("prediction");
        
        const submitBtn = rsvpForm.querySelector(".submit-btn");
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = "Registrando...";

        // URL del Google Apps Script
        const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxQ6PcJuwXmGmoTyfVUQgF1yjNCuOHhxEoX1RTZv1k0BBc4NNXM96Y2yrBRrmHlWYmJ_A/exec";

        fetch(SCRIPT_URL, {
            method: "POST",
            mode: "no-cors", // Necesario para Google Apps Script
            cache: "no-cache",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name: name,
                guests: guests,
                prediction: prediction
            })
        })
        .then(() => {
            // Ocultar modal actual y mostrar mensaje de éxito "bonito"
            rsvpForm.style.display = "none";
            const successDiv = document.getElementById("rsvpSuccess");
            const successText = document.getElementById("successText");
            
            successText.innerText = `¡Gracias ${name}! Tu asistencia y tu voto por "${prediction}" han sido registrados correctamente.`;
            successDiv.style.display = "block";
            
            rsvpForm.reset();
        })
        .catch((error) => {
            console.error("Error:", error);
            alert("Hubo un problema al registrar tu asistencia. Por favor, inténtalo de nuevo.");
        })
        .finally(() => {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        });
    });
}

// Efecto sutil de movimiento al mover el mouse sobre la tarjeta (Parallax)
const card = document.querySelector(".glass-card");
document.addEventListener("mousemove", (e) => {
    const xAxis = (window.innerWidth / 2 - e.pageX) / 50;
    const yAxis = (window.innerHeight / 2 - e.pageY) / 50;
    card.style.transform = `rotateY(${xAxis}deg) rotateX(${yAxis}deg)`;
});

// Resetear rotación al salir
document.addEventListener("mouseleave", () => {
    card.style.transform = `rotateY(0deg) rotateX(0deg)`;
    card.style.transition = "transform 0.5s ease";
});

// Lógica del botón de sonido
const unmuteBtn = document.getElementById("unmuteBtn");
if (unmuteBtn) {
    unmuteBtn.addEventListener("click", () => {
        video.muted = false;
        video.play(); // Aseguramos que siga reproduciendo
        unmuteBtn.style.display = "none";
    });
}

// Intentar reproducir automáticamente para navegadores estrictos (solo si no ha terminado)
window.addEventListener("click", () => {
    if (video.paused && !isRevealed) {
        video.play();
    }
}, { once: true });
