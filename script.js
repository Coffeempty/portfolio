// Smooth scrolling for nav links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

// ==========================================
// THEME TOGGLE
// ==========================================

const themeToggle = document.getElementById('theme-toggle');
const html = document.documentElement;

// Set default theme
let currentStoredTheme = 'dark';

// Try to get saved theme (might not work in some environments)
try {
    currentStoredTheme = localStorage.getItem('theme') || 'dark';
} catch (e) {
    console.log('LocalStorage not available, using default theme');
}

html.setAttribute('data-theme', currentStoredTheme);

themeToggle.addEventListener('click', function() {
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    html.setAttribute('data-theme', newTheme);
    
    // Try to save theme preference
    try {
        localStorage.setItem('theme', newTheme);
    } catch (e) {
        console.log('Cannot save theme preference');
    }
    
    // Add rotation animation
    this.style.transform = 'rotate(360deg)';
    setTimeout(() => {
        this.style.transform = '';
    }, 300);
    
    console.log('Theme switched to: ' + newTheme);
});

// ==========================================
// DYNAMIC MULTILINGUAL NAME TYPING EFFECT
// ==========================================

const names = [
    { text: 'Mehul Totala', lang: 'en' },
    { text: 'メフール・トタラ', lang: 'jp' },
    { text: 'मेहुल तोतला', lang: 'hi' }
    // { text: 'メフール', lang: 'jp-short' },
    // { text: 'Mehul', lang: 'en-short' },
    // { text: 'मेहुल', lang: 'hi-short' }
];

let currentNameIndex = 0;
let currentCharIndex = 0;
let isDeleting = false;
let typingDelay = 100;

const nameElement = document.querySelector('.name-cycle');

function typeNameEffect() {
    if (!nameElement) return;
    
    const currentName = names[currentNameIndex];
    
    if (isDeleting) {
        // Delete character
        currentCharIndex--;
        nameElement.textContent = currentName.text.substring(0, currentCharIndex);
        typingDelay = 30; // Faster deletion
        
        // When fully deleted
        if (currentCharIndex === 0) {
            isDeleting = false;
            currentNameIndex = (currentNameIndex + 1) % names.length; // Move to next name
            typingDelay = 200; // Pause before typing next name
        }
    } else {
        // Type character
        currentCharIndex++;
        nameElement.textContent = currentName.text.substring(0, currentCharIndex);
        typingDelay = 80; // Natural typing speed
        
        // When fully typed
        if (currentCharIndex === currentName.text.length) {
            isDeleting = true;
            typingDelay = 1500; // Pause to read (1.5 seconds)
        }
    }
    
    setTimeout(typeNameEffect, typingDelay);
}

// Start the dynamic typing effect immediately
if (nameElement) {
    nameElement.textContent = ''; // Clear initial text
    setTimeout(typeNameEffect, 800); // Start after brief delay
}

// ==========================================
// JAPANESE SECTION LABELS
// ==========================================

// Add Japanese translations to section headers
const sectionTranslations = {
    'about_me.txt': '私について',
    'skills.sh --list': 'スキル',
    'projects.json': 'プロジェクト',
    'talents.sh --list': '才能',
    'contact.sh': '連絡先'
};

document.querySelectorAll('h2').forEach(h2 => {
    const text = h2.textContent.trim();
    if (sectionTranslations[text]) {
        h2.setAttribute('data-jp', sectionTranslations[text]);
    }
});

// ==========================================
// SMOOTH SCROLL INDICATOR
// ==========================================

let lastScrollTop = 0;
const scrollIndicator = document.createElement('div');
scrollIndicator.style.cssText = `
    position: fixed;
    top: 8px;
    left: 0;
    height: 3px;
    background: linear-gradient(90deg, var(--accent-red), var(--accent-gold));
    z-index: 999;
    transition: width 0.1s ease;
`;
document.body.appendChild(scrollIndicator);

window.addEventListener('scroll', () => {
    const scrollPercent = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
    scrollIndicator.style.width = scrollPercent + '%';
    
    lastScrollTop = window.scrollY;
});

// ==========================================
// PARALLAX EFFECT FOR SECTIONS (DISABLED - WAS CAUSING SCROLL ISSUES)
// ==========================================

// Removed parallax to fix scrolling performance

// ==========================================
// CARD TILT EFFECT (Japanese aesthetic)
// ==========================================

const cards = document.querySelectorAll('.project-card, .skill-category, .talent-card');

cards.forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.transition = 'all 0.1s ease';
    });
    
    card.addEventListener('mousemove', function(e) {
        const rect = this.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = (y - centerY) / 20;
        const rotateY = (centerX - x) / 20;
        
        this.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
    });
    
    card.addEventListener('mouseleave', function() {
        this.style.transition = 'all 0.3s ease';
        this.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
    });
});

// ==========================================
// CONSOLE EASTER EGG
// ==========================================

console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #d84315; font-family: monospace;');
console.log('%c  Welcome to my portfolio             ', 'color: #d84315; font-weight: bold; font-family: monospace;');
console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #d84315; font-family: monospace;');
console.log('%c  Inspecting the code? Nice!          ', 'color: #2d2d2d; font-family: monospace;');
console.log('%c  Email: mehultotala21@gmail.com      ', 'color: #c5a572; font-family: monospace;');
console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #d84315; font-family: monospace;');

// ==========================================
// KEYBOARD SHORTCUTS
// ==========================================

document.addEventListener('keydown', function(e) {
    // Press 'h' to go home
    if (e.key === 'h' && !e.ctrlKey && !e.metaKey) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    // Press 'j' to scroll down
    if (e.key === 'j') {
        window.scrollBy({ top: 100, behavior: 'smooth' });
    }
    
    // Press 'k' to scroll up
    if (e.key === 'k') {
        window.scrollBy({ top: -100, behavior: 'smooth' });
    }
});

// ==========================================
// JAPANESE SEASONAL PARTICLES (Optional)
// ==========================================

function createParticles() {
    const particles = ['◆', '✦', '◇', '○'];
    
    setInterval(() => {
        const particle = document.createElement('div');
        particle.textContent = particles[Math.floor(Math.random() * particles.length)];
        particle.style.cssText = `
            position: fixed;
            left: ${Math.random() * 100}%;
            top: -20px;
            color: var(--accent-gold);
            opacity: 0.15;
            font-size: ${Math.random() * 20 + 10}px;
            pointer-events: none;
            z-index: 1;
            animation: fall ${Math.random() * 10 + 10}s linear;
        `;
        
        document.body.appendChild(particle);
        
        setTimeout(() => particle.remove(), 15000);
    }, 3000);
}

// Add fall animation
const style = document.createElement('style');
style.textContent = `
    @keyframes fall {
        to {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Uncomment to enable particles
// createParticles();

// ==========================================
// INTERACTIVE PORTFOLIO COMMANDS
// ==========================================

window.portfolio = {
    info: function() {
        console.log('%c╔══════════════════════════════════════╗', 'color: #d84315;');
        console.log('%c║  Mehul Totala                        ║', 'color: #d84315;');
        console.log('%c║  VJTI Mumbai | Production Engg      ║', 'color: #2d2d2d;');
        console.log('%c║  SRA Core Member | ML/RL Enthusiast ║', 'color: #2d2d2d;');
        console.log('%c╚══════════════════════════════════════╝', 'color: #d84315;');
        return 'Portfolio loaded successfully';
    },
    
    skills: function() {
        console.log('%cTechnical Skills:', 'color: #d84315; font-weight: bold;');
        console.log('  ML/DL: PyTorch, TensorFlow');
        console.log('  RL: PPO, SAC, GRPO');
        console.log('  Languages: Python, C++');
        return 'Check the skills section for details';
    },
    
    contact: function() {
        console.log('%cContact Information:', 'color: #d84315; font-weight: bold;');
        console.log('  Email: mehultotala21@gmail.com');
        console.log('  GitHub: github.com/mehultotala');
        console.log('  LinkedIn: linkedin.com/in/mehul-totala');
        return 'Lets connect';
    },
    
    theme: function() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        console.log('%cCurrent Theme: ' + currentTheme, 'color: #c5a572; font-weight: bold;');
        console.log('  Use the toggle button to switch themes');
        return 'Theme: ' + currentTheme;
    }
};

console.log('%cTry these commands:', 'color: #c5a572; font-weight: bold;');
console.log('%c   portfolio.info()', 'color: #6b6b6b;');
console.log('%c   portfolio.skills()', 'color: #6b6b6b;');
console.log('%c   portfolio.contact()', 'color: #6b6b6b;');
console.log('%c   portfolio.theme()', 'color: #6b6b6b;');

// ==========================================
// PAGE LOAD ANIMATION
// ==========================================

window.addEventListener('load', () => {
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 1.5s ease';
        document.body.style.opacity = '1';
    }, 100);
});