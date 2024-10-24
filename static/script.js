const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const container = document.querySelector('.container');
const themeToggle = document.querySelector('.theme-toggle');
const themeIcon = document.querySelector('.theme-icon');
const themeText = document.querySelector('.theme-text');
const dynamicText = document.getElementById('dynamic-text');

// change colour
themeToggle.addEventListener('click', () => {
    container.classList.toggle('dark-mode');
    themeToggle.classList.toggle('dark');
    
    if (container.classList.contains('dark-mode')) {
        themeIcon.textContent = '🌙';
        themeText.textContent = 'Dark Mode';
    } else {
        themeIcon.textContent = '🌞';
        themeText.textContent = 'Light Mode';
    }
});
// this for the bouncy balls thing
function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resize();
window.addEventListener('resize', resize);

class Particle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 2;
        this.vy = (Math.random() - 0.5) * 2;
        this.radius = 4;
    }

    update() {
        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
        
        this.x += this.vx;
        this.y += this.vy;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#000';
        ctx.fill();
        ctx.closePath();
    }
}

const particleCount = 50;
const particles = [];
for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach(particle => {
        particle.update();
        particle.draw();
    });

    particles.forEach((p1, i) => {
        particles.slice(i + 1).forEach(p2 => {
            const dx = p1.x - p2.x;
            const dy = p1.y - p2.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 150) {
                ctx.beginPath();
                ctx.moveTo(p1.x, p1.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.strokeStyle = `rgba(0, 0, 0, ${1 - distance/150})`;
                ctx.lineWidth = 1;
                ctx.stroke();
            }
        });
    });

    requestAnimationFrame(animate);
}

animate();

// type and delete thing
const texts = ['for dznv.', 'for alf.', 'now.'];
let currentTextIndex = 0;
let currentCharIndex = 0;
let isDeleting = false;

function type() {
    const currentText = texts[currentTextIndex];
    if (isDeleting) {
        dynamicText.textContent = currentText.substring(0, currentCharIndex - 1);
        currentCharIndex--;
    } else {
        dynamicText.textContent = currentText.substring(0, currentCharIndex + 1);
        currentCharIndex++;
    }

    if (!isDeleting && currentCharIndex === currentText.length) {
        setTimeout(() => isDeleting = true, 1000);
    } else if (isDeleting && currentCharIndex === 0) {
        isDeleting = false;
        currentTextIndex = (currentTextIndex + 1) % texts.length;
    }

    setTimeout(type, isDeleting ? 100 : 200);
}

type();
