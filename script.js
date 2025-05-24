// Brew & Bean - Interactive JavaScript

// DOM Elements
const navbar = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('nav-menu');
const contactForm = document.getElementById('contact-form');
const newsletterForm = document.querySelector('.newsletter-form');
const ctaButton = document.querySelector('.cta-button');

// Mobile Navigation Toggle
function toggleMobileMenu() {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
    document.body.classList.toggle('menu-open');
}

// Smooth Scrolling Function
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        const offsetTop = section.offsetTop - 80; // Account for fixed navbar
        window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
        });
    }
    
    // Close mobile menu if open
    if (navMenu.classList.contains('active')) {
        toggleMobileMenu();
    }
}

// Navbar Scroll Effect
function handleNavbarScroll() {
    if (window.scrollY > 100) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
}

// Active Navigation Link Highlighting
function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    let current = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop - 120;
        const sectionHeight = section.clientHeight;
        
        if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
}

// Contact Form Handling
function handleContactForm(e) {
    e.preventDefault();
    
    const formData = new FormData(contactForm);
    const data = {
        name: formData.get('name'),
        email: formData.get('email'),
        subject: formData.get('subject'),
        message: formData.get('message')
    };
    
    // Show loading state
    const submitButton = contactForm.querySelector('.submit-button');
    const originalText = submitButton.textContent;
    submitButton.textContent = 'Sending...';
    submitButton.disabled = true;
    
    // Simulate form submission (replace with actual API call)
    setTimeout(() => {
        // Reset form
        contactForm.reset();
        
        // Show success message
        showNotification('Thank you! Your message has been sent successfully.', 'success');
        
        // Reset button
        submitButton.textContent = originalText;
        submitButton.disabled = false;
    }, 2000);
}

// Newsletter Form Handling
function handleNewsletterForm(e) {
    e.preventDefault();
    
    const emailInput = newsletterForm.querySelector('input[type="email"]');
    const email = emailInput.value;
    
    if (email) {
        // Show loading state
        const submitButton = newsletterForm.querySelector('button');
        const originalText = submitButton.textContent;
        submitButton.textContent = 'Subscribing...';
        submitButton.disabled = true;
        
        // Simulate subscription (replace with actual API call)
        setTimeout(() => {
            emailInput.value = '';
            showNotification('Successfully subscribed to our newsletter!', 'success');
            
            // Reset button
            submitButton.textContent = originalText;
            submitButton.disabled = false;
        }, 1500);
    }
}

// Notification System
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        padding: 16px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 1000;
        max-width: 400px;
        animation: slideIn 0.3s ease-out;
    `;
    
    // Add animation styles
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            .notification-content {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 12px;
            }
            .notification-close {
                background: none;
                border: none;
                color: white;
                font-size: 20px;
                cursor: pointer;
                padding: 0;
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .notification-close:hover {
                opacity: 0.8;
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// Gallery Image Modal
function createImageModal() {
    const galleryItems = document.querySelectorAll('.gallery-item');
    
    galleryItems.forEach(item => {
        item.addEventListener('click', () => {
            const img = item.querySelector('img');
            const title = item.querySelector('h4').textContent;
            
            // Create modal
            const modal = document.createElement('div');
            modal.className = 'image-modal';
            modal.innerHTML = `
                <div class="modal-backdrop" onclick="this.parentElement.remove()">
                    <div class="modal-content" onclick="event.stopPropagation()">
                        <img src="${img.src}" alt="${img.alt}">
                        <h3>${title}</h3>
                        <button class="modal-close" onclick="this.closest('.image-modal').remove()">×</button>
                    </div>
                </div>
            `;
            
            // Add modal styles
            modal.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 2000;
            `;
            
            // Add modal CSS if not exists
            if (!document.querySelector('#modal-styles')) {
                const style = document.createElement('style');
                style.id = 'modal-styles';
                style.textContent = `
                    .modal-backdrop {
                        width: 100%;
                        height: 100%;
                        background: rgba(0, 0, 0, 0.8);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        padding: 20px;
                    }
                    .modal-content {
                        background: white;
                        border-radius: 12px;
                        padding: 20px;
                        max-width: 90vw;
                        max-height: 90vh;
                        position: relative;
                        text-align: center;
                    }
                    .modal-content img {
                        max-width: 100%;
                        max-height: 70vh;
                        object-fit: contain;
                        border-radius: 8px;
                    }
                    .modal-content h3 {
                        margin: 16px 0 0 0;
                        color: #333;
                    }
                    .modal-close {
                        position: absolute;
                        top: 10px;
                        right: 15px;
                        background: none;
                        border: none;
                        font-size: 24px;
                        cursor: pointer;
                        color: #666;
                        width: 30px;
                        height: 30px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    }
                    .modal-close:hover {
                        color: #333;
                    }
                `;
                document.head.appendChild(style);
            }
            
            document.body.appendChild(modal);
        });
    });
}

// Scroll Animations
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    const animateElements = document.querySelectorAll('.coffee-card, .menu-category, .gallery-item, .stat');
    animateElements.forEach(el => {
        observer.observe(el);
    });
    
    // Add animation styles
    if (!document.querySelector('#scroll-animation-styles')) {
        const style = document.createElement('style');
        style.id = 'scroll-animation-styles';
        style.textContent = `
            .coffee-card, .menu-category, .gallery-item, .stat {
                opacity: 0;
                transform: translateY(30px);
                transition: opacity 0.6s ease, transform 0.6s ease;
            }
            .coffee-card.animate-in, .menu-category.animate-in, .gallery-item.animate-in, .stat.animate-in {
                opacity: 1;
                transform: translateY(0);
            }
            .coffee-card {
                transition-delay: 0.1s;
            }
            .coffee-card:nth-child(2) {
                transition-delay: 0.2s;
            }
            .coffee-card:nth-child(3) {
                transition-delay: 0.3s;
            }
            .coffee-card:nth-child(4) {
                transition-delay: 0.4s;
            }
        `;
        document.head.appendChild(style);
    }
}

// Stats Counter Animation
function animateStats() {
    const stats = document.querySelectorAll('.stat h4');
    
    stats.forEach(stat => {
        const target = parseInt(stat.textContent.replace(/\D/g, ''));
        const suffix = stat.textContent.replace(/\d/g, '');
        let current = 0;
        const increment = target / 50;
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            stat.textContent = Math.floor(current) + suffix;
        }, 40);
    });
}

// Initialize stats animation when in view
function initStatsAnimation() {
    const statsSection = document.querySelector('.stats');
    if (statsSection) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateStats();
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        
        observer.observe(statsSection);
    }
}

// Add CSS for mobile menu and navbar effects
function addDynamicStyles() {
    if (!document.querySelector('#dynamic-styles')) {
        const style = document.createElement('style');
        style.id = 'dynamic-styles';
        style.textContent = `
            /* Mobile Menu Styles */
            .hamburger {
                display: none;
                flex-direction: column;
                cursor: pointer;
                padding: 4px;
            }
            
            .hamburger .bar {
                width: 25px;
                height: 3px;
                background-color: #333;
                margin: 3px 0;
                transition: 0.3s;
            }
            
            .hamburger.active .bar:nth-child(1) {
                transform: rotate(-45deg) translate(-5px, 6px);
            }
            
            .hamburger.active .bar:nth-child(2) {
                opacity: 0;
            }
            
            .hamburger.active .bar:nth-child(3) {
                transform: rotate(45deg) translate(-5px, -6px);
            }
            
            /* Navbar Scroll Effect */
            .navbar.scrolled {
                background: rgba(255, 255, 255, 0.95);
                backdrop-filter: blur(10px);
                box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
            }
            
            /* Active Nav Link */
            .nav-link.active {
                color: #8B4513;
                font-weight: 600;
            }
            
            /* Mobile Responsive */
            @media (max-width: 768px) {
                .hamburger {
                    display: flex;
                }
                
                .nav-menu {
                    position: fixed;
                    left: -100%;
                    top: 70px;
                    flex-direction: column;
                    background-color: white;
                    width: 100%;
                    text-align: center;
                    transition: 0.3s;
                    box-shadow: 0 10px 27px rgba(0, 0, 0, 0.05);
                    z-index: 1000;
                }
                
                .nav-menu.active {
                    left: 0;
                }
                
                .nav-menu li {
                    margin: 15px 0;
                }
                
                .nav-link {
                    font-size: 18px;
                    padding: 10px 0;
                    display: block;
                }
                
                body.menu-open {
                    overflow: hidden;
                }
            }
            
            /* Smooth transitions */
            * {
                scroll-behavior: smooth;
            }
        `;
        document.head.appendChild(style);
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    // Add dynamic styles
    addDynamicStyles();
    
    // Mobile menu toggle
    if (hamburger) {
        hamburger.addEventListener('click', toggleMobileMenu);
    }
    
    // Navigation links smooth scrolling
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            scrollToSection(targetId);
        });
    });
    
    // Footer links smooth scrolling
    document.querySelectorAll('footer a[href^="#"]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            scrollToSection(targetId);
        });
    });
    
    // Contact form submission
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactForm);
    }
    
    // Newsletter form submission
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', handleNewsletterForm);
    }
    
    // Scroll events
    window.addEventListener('scroll', function() {
        handleNavbarScroll();
        updateActiveNavLink();
    });
    
    // Initialize features
    createImageModal();
    initScrollAnimations();
    initStatsAnimation();
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', function(e) {
        if (!navMenu.contains(e.target) && !hamburger.contains(e.target)) {
            if (navMenu.classList.contains('active')) {
                toggleMobileMenu();
            }
        }
    });
    
    // Handle window resize
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768 && navMenu.classList.contains('active')) {
            toggleMobileMenu();
        }
    });
});

// Make scrollToSection globally available for inline onclick handlers
window.scrollToSection = scrollToSection;

// Additional utility functions
const BrewAndBean = {
    // Utility to add items to a future shopping cart
    addToCart: function(itemName, price) {
        console.log(`Added ${itemName} ($${price}) to cart`);
        showNotification(`${itemName} added to cart!`, 'success');
    },
    
    // Utility to handle coffee card interactions
    initCoffeeCards: function() {
        document.querySelectorAll('.coffee-card').forEach(card => {
            card.addEventListener('click', function() {
                const coffeeName = this.querySelector('h3').textContent;
                const price = this.querySelector('.price').textContent;
                console.log(`Clicked on ${coffeeName} - ${price}`);
                // Could add to cart or show details modal
            });
        });
    },
    
    // Utility for menu item interactions
    initMenuItems: function() {
        document.querySelectorAll('.menu-item').forEach(item => {
            item.addEventListener('click', function() {
                const itemName = this.querySelector('h4').textContent;
                const price = this.querySelector('.price').textContent;
                BrewAndBean.addToCart(itemName, price);
            });
        });
    }
};

// Initialize additional features when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    BrewAndBean.initCoffeeCards();
    BrewAndBean.initMenuItems();
});

console.log('Brew & Bean JavaScript loaded successfully! ☕');
