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
// DYNAMIC MULTILINGUAL NAME TYPING EFFECT
// ==========================================

const names = [
    { text: 'Mehul Totala', lang: 'en' },
    { text: 'メフール・トタラ', lang: 'jp' },
    { text: 'मेहुल तोतला', lang: 'hi' }
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
        currentCharIndex--;
        nameElement.textContent = currentName.text.substring(0, currentCharIndex);
        typingDelay = 30;
        
        if (currentCharIndex === 0) {
            isDeleting = false;
            currentNameIndex = (currentNameIndex + 1) % names.length;
            typingDelay = 200;
        }
    } else {
        currentCharIndex++;
        nameElement.textContent = currentName.text.substring(0, currentCharIndex);
        typingDelay = 80;
        
        if (currentCharIndex === currentName.text.length) {
            isDeleting = true;
            typingDelay = 1500;
        }
    }
    
    setTimeout(typeNameEffect, typingDelay);
}

if (nameElement) {
    nameElement.textContent = '';
    setTimeout(typeNameEffect, 800);
}

// ==========================================
// MOUSE GLOW EFFECT
// ==========================================

let mouseGlow = document.createElement('div');
mouseGlow.style.cssText = `
    position: fixed;
    width: 600px;
    height: 600px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(255, 107, 74, 0.08) 0%, transparent 70%);
    pointer-events: none;
    z-index: 9999;
    transform: translate(-50%, -50%);
    transition: opacity 0.3s ease;
    opacity: 0;
`;
document.body.appendChild(mouseGlow);

document.addEventListener('mousemove', (e) => {
    mouseGlow.style.left = e.clientX + 'px';
    mouseGlow.style.top = e.clientY + 'px';
    mouseGlow.style.opacity = '1';
});

document.addEventListener('mouseleave', () => {
    mouseGlow.style.opacity = '0';
});

// ==========================================
// ENHANCED CARD INTERACTIONS
// ==========================================

const cards = document.querySelectorAll('.glass-card, .neuro-card');

cards.forEach(card => {
    card.addEventListener('mousemove', function(e) {
        const rect = this.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = (y - centerY) / 30;
        const rotateY = (centerX - x) / 30;
        
        this.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
    });
    
    card.addEventListener('mouseleave', function() {
        this.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
    });
});

// ==========================================
// INTERSECTION OBSERVER FOR FADE-IN
// ==========================================

const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

document.querySelectorAll('section').forEach(section => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(50px)';
    section.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
    observer.observe(section);
});

// ==========================================
// PARALLAX SCROLLING EFFECT
// ==========================================

window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const parallaxElements = document.querySelectorAll('.profile-image-container, .about-image, .talent-image');
    
    parallaxElements.forEach(el => {
        const speed = 0.5;
        el.style.transform = `translateY(${scrolled * speed * 0.1}px)`;
    });
});

// ==========================================
// CONSOLE EASTER EGG
// ==========================================

console.log('%c┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓', 'color: #ff6b4a; font-family: monospace;');
console.log('%c┃  Welcome to my portfolio             ┃', 'color: #ff6b4a; font-weight: bold; font-family: monospace;');
console.log('%c┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛', 'color: #ff6b4a; font-family: monospace;');
console.log('%c  Inspecting the code? Nice!          ', 'color: #e8e6e3; font-family: monospace;');
console.log('%c  Email: mehultotala21@gmail.com      ', 'color: #ecc97e; font-family: monospace;');

// ==========================================
// KEYBOARD SHORTCUTS
// ==========================================

document.addEventListener('keydown', function(e) {
    if (e.key === 'h' && !e.ctrlKey && !e.metaKey) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    if (e.key === 'j') {
        window.scrollBy({ top: 150, behavior: 'smooth' });
    }
    
    if (e.key === 'k') {
        window.scrollBy({ top: -150, behavior: 'smooth' });
    }
});

// ==========================================
// BLOG FUNCTIONALITY
// ==========================================

const blogPosts = [
    {
        id: 1,
        title: "Surviving Somewhere in Between",
        date: "January 9, 2026",
        excerpt: "a non ai writing piece that may or may not interest you"
    }
];

function renderBlogPosts() {
    const blogContainer = document.querySelector('.blog-posts');

    if (!blogContainer) return;

    blogContainer.innerHTML = '';

    blogPosts.forEach(post => {
        const blogPostElement = document.createElement('div');
        blogPostElement.className = 'blog-post glass-card';

        blogPostElement.innerHTML = `
            <h3>${post.title}</h3>
            <span class="date">${post.date}</span>
            <p>${post.excerpt}</p>
        `;

        blogPostElement.addEventListener('click', () => {
            if(post.id === 1) {
                window.location.href = 'blog_posts/surviving-between-polymath.html';
            } else {
                window.location.href = 'blog.html';
            }
        });

        blogContainer.appendChild(blogPostElement);
    });
}

document.addEventListener('DOMContentLoaded', renderBlogPosts);

// ==========================================
// INTERACTIVE PORTFOLIO COMMANDS
// ==========================================

window.portfolio = {
    info: function() {
        console.log('%c╔═══════════════════════════════════════╗', 'color: #ff6b4a;');
        console.log('%c║  Mehul Totala                        ║', 'color: #ff6b4a;');
        console.log('%c║  VJTI Mumbai | Production Engg      ║', 'color: #e8e6e3;');
        console.log('%c║  SRA Core Member | ML/RL Enthusiast ║', 'color: #e8e6e3;');
        console.log('%c╚═══════════════════════════════════════╝', 'color: #ff6b4a;');
        return 'Portfolio loaded successfully';
    },

    skills: function() {
        console.log('%cTechnical Skills:', 'color: #ff6b4a; font-weight: bold;');
        console.log('  ML/DL: PyTorch, TensorFlow');
        console.log('  RL: PPO, SAC, GRPO');
        console.log('  Languages: Python, C++');
        return 'Check the skills section for details';
    },

    contact: function() {
        console.log('%cContact Information:', 'color: #ff6b4a; font-weight: bold;');
        console.log('  Email: mehultotala21@gmail.com');
        console.log('  GitHub: github.com/Coffeempty');
        console.log('  LinkedIn: linkedin.com/in/mehultotala');
        return "Let's connect";
    },

    blogs: function() {
        console.log('%cBlog Posts:', 'color: #ff6b4a; font-weight: bold;');
        blogPosts.forEach(post => {
            console.log(`  ${post.title} - ${post.date}`);
        });
        return 'Check the blogs section for details';
    }
};

console.log('%cTry these commands:', 'color: #ecc97e; font-weight: bold;');
console.log('%c   portfolio.info()', 'color: #a8a8a8;');
console.log('%c   portfolio.skills()', 'color: #a8a8a8;');
console.log('%c   portfolio.contact()', 'color: #a8a8a8;');
console.log('%c   portfolio.blogs()', 'color: #a8a8a8;');

// ==========================================
// PAGE LOAD ANIMATION
// ==========================================

window.addEventListener('load', () => {
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 1.2s ease';
        document.body.style.opacity = '1';
    }, 100);
});

// ==========================================
// DYNAMIC YEAR IN FOOTER
// ==========================================

const currentYear = new Date().getFullYear();
const footerYear = document.querySelector('footer p');
if (footerYear && footerYear.textContent.includes('2025')) {
    footerYear.innerHTML = footerYear.innerHTML.replace('2025', currentYear);
}