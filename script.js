// Global Variables - Using memory storage instead of localStorage
let cart = [];
let isCartOpen = false;

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
    initializeCart();
    initializeForms();
    initializeScrollEffects();
    initializeAnimations();
    updateCartDisplay();
    
    // Create cart elements if they don't exist
    ensureCartElements();
});

// Ensure cart elements exist in the DOM
function ensureCartElements() {
    // Check if cart count element exists, if not create it
    if (!document.getElementById('cart-count')) {
        const cartButton = document.querySelector('.cart-button');
        if (cartButton && !cartButton.querySelector('#cart-count')) {
            const countElement = document.createElement('span');
            countElement.id = 'cart-count';
            countElement.className = 'cart-count';
            countElement.style.cssText = `
                position: absolute;
                top: -8px;
                right: -8px;
                background: #e74c3c;
                color: white;
                border-radius: 50%;
                min-width: 20px;
                height: 20px;
                display: none;
                align-items: center;
                justify-content: center;
                font-size: 0.8rem;
                font-weight: bold;
            `;
            cartButton.appendChild(countElement);
        }
    }
    
    // Check if cart dropdown exists, if not create it
    if (!document.getElementById('cart-dropdown')) {
        const cartButton = document.querySelector('.cart-button');
        if (cartButton) {
            const dropdown = document.createElement('div');
            dropdown.id = 'cart-dropdown';
            dropdown.className = 'cart-dropdown';
            dropdown.innerHTML = `
                <div class="cart-header">
                    <h3>Shopping Cart</h3>
                    <button onclick="clearCart()" class="clear-cart-btn">Clear All</button>
                </div>
                <div id="cart-items" class="cart-items"></div>
                <div id="cart-footer" class="cart-footer" style="display: none;">
                    <div class="cart-total-section">
                        <div class="cart-total">
                            Total: $<span id="cart-total">0.00</span>
                        </div>
                        <button onclick="proceedToCheckout()" class="checkout-btn">Proceed to Checkout</button>
                    </div>
                </div>
            `;
            
            // Position the dropdown
            dropdown.style.cssText = `
                position: absolute;
                top: 100%;
                right: 0;
                background: white;
                border: 1px solid #ddd;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                width: 350px;
                max-height: 400px;
                overflow-y: auto;
                z-index: 1000;
                display: none;
            `;
            
            // Insert after cart button
            cartButton.parentNode.insertBefore(dropdown, cartButton.nextSibling);
        }
    }
}

// Navigation Functions
function initializeNavigation() {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');
    const navbar = document.getElementById('navbar');
    
    // Mobile menu toggle
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
        
        // Close mobile menu when clicking on a link
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
        
        // Close mobile menu when clicking outside
        document.addEventListener('click', function(event) {
            if (!hamburger.contains(event.target) && !navMenu.contains(event.target)) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            }
        });
    }
    
    // Navbar scroll effect
    if (navbar) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }
}

// Cart Functions
function initializeCart() {
    const cartButton = document.querySelector('.cart-button');
    
    if (cartButton) {
        cartButton.addEventListener('click', function(e) {
            e.stopPropagation();
            toggleCart();
        });
        
        // Close cart when clicking outside
        document.addEventListener('click', function(event) {
            const cartDropdown = document.getElementById('cart-dropdown');
            if (cartDropdown && !cartDropdown.contains(event.target) && !cartButton.contains(event.target)) {
                closeCart();
            }
        });
    }
}

function toggleCart() {
    const cartDropdown = document.getElementById('cart-dropdown');
    if (cartDropdown) {
        isCartOpen = !isCartOpen;
        if (isCartOpen) {
            cartDropdown.style.display = 'block';
            cartDropdown.classList.add('show');
        } else {
            cartDropdown.style.display = 'none';
            cartDropdown.classList.remove('show');
        }
    }
}

function closeCart() {
    const cartDropdown = document.getElementById('cart-dropdown');
    if (cartDropdown) {
        isCartOpen = false;
        cartDropdown.style.display = 'none';
        cartDropdown.classList.remove('show');
    }
}

// Enhanced addToCart function - Fixed to work with any button
function addToCart(button) {
    console.log('Add to cart clicked', button);
    
    let menuItem = button.closest('.menu-item');
    
    // If not found, try other common selectors
    if (!menuItem) {
        menuItem = button.closest('.product-item') || 
                   button.closest('.coffee-card') || 
                   button.closest('[data-name]') ||
                   button.parentElement;
    }
    
    if (!menuItem) {
        console.error('Menu item container not found');
        // Try to extract info from button itself or nearby elements
        const name = button.getAttribute('data-name') || 
                     button.textContent.includes('Add') ? 'Unknown Product' : button.textContent;
        addProductToCart({
            name: name,
            price: 5.99, // Default price
            image: '/api/placeholder/100/100',
            category: 'Coffee'
        });
        return;
    }
    
    // Extract product information with multiple fallback strategies
    const name = menuItem.getAttribute('data-name') || 
                 menuItem.querySelector('h4, h3, .product-name, .item-name')?.textContent?.trim() || 
                 menuItem.querySelector('img')?.alt || 
                 'Unknown Product';
    
    const priceElement = menuItem.querySelector('.price, .product-price, [data-price]');
    let price = 0;
    if (priceElement) {
        const priceText = priceElement.getAttribute('data-price') || priceElement.textContent;
        price = parseFloat(priceText.replace(/[^0-9.]/g, '')) || 5.99;
    } else {
        price = parseFloat(menuItem.getAttribute('data-price')) || 5.99;
    }
    
    const category = menuItem.getAttribute('data-category') || 
                     menuItem.className.includes('coffee') ? 'Coffee' : 
                     menuItem.className.includes('food') ? 'Food' : 'Product';
    
    const imageElement = menuItem.querySelector('img');
    const image = imageElement ? imageElement.src : '/api/placeholder/100/100';
    
    const product = {
        name: name,
        price: price,
        image: image,
        category: category
    };
    
    console.log('Adding product:', product);
    addProductToCart(product);
}

// Separate function to handle the actual cart addition
function addProductToCart(product) {
    const productWithId = {
        ...product,
        id: Date.now() + Math.random(), // Simple ID generation
        quantity: 1
    };
    
    // Check if item already exists in cart
    const existingItem = cart.find(item => item.name === product.name && item.price === product.price);
    
    if (existingItem) {
        existingItem.quantity += 1;
        showCartNotification(`${product.name} quantity updated! (${existingItem.quantity})`);
    } else {
        cart.push(productWithId);
        showCartNotification(`${product.name} added to cart!`);
    }
    
    updateCartDisplay();
    console.log('Current cart:', cart);
}

function removeFromCart(productId) {
    const itemIndex = cart.findIndex(item => item.id === productId);
    if (itemIndex > -1) {
        const itemName = cart[itemIndex].name;
        cart.splice(itemIndex, 1);
        updateCartDisplay();
        showCartNotification(`${itemName} removed from cart!`, 'warning');
    }
}

function updateQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(productId);
        } else {
            updateCartDisplay();
            showCartNotification(`${item.name} quantity updated!`);
        }
    }
}

function clearCart() {
    if (cart.length === 0) {
        showCartNotification('Cart is already empty!', 'info');
        return;
    }
    
    cart = [];
    updateCartDisplay();
    showCartNotification('Cart cleared!', 'warning');
}

function updateCartDisplay() {
    const cartCount = document.getElementById('cart-count');
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    const cartFooter = document.getElementById('cart-footer');
    
    console.log('Updating cart display, cart length:', cart.length);
    
    // Update cart count
    if (cartCount) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
        cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
    }
    
    // Update cart items
    if (cartItems) {
        if (cart.length === 0) {
            cartItems.innerHTML = `
                <div class="empty-cart">
                    <p>Your cart is empty</p>
                    <small>Add some delicious items from our menu!</small>
                </div>
            `;
            if (cartFooter) cartFooter.style.display = 'none';
        } else {
            cartItems.innerHTML = cart.map(item => `
                <div class="cart-item" data-id="${item.id}">
                    <div class="cart-item-image">
                        <img src="${item.image}" alt="${item.name}" loading="lazy" onerror="this.src='/api/placeholder/50/50'">
                    </div>
                    <div class="cart-item-details">
                        <div class="cart-item-info">
                            <h4>${item.name}</h4>
                            <p class="item-category">${item.category}</p>
                            <p class="item-price">$${item.price.toFixed(2)} each</p>
                        </div>
                        <div class="cart-item-controls">
                            <div class="quantity-controls">
                                <button onclick="updateQuantity(${item.id}, -1)" class="qty-btn minus" title="Decrease quantity">-</button>
                                <span class="quantity">${item.quantity}</span>
                                <button onclick="updateQuantity(${item.id}, 1)" class="qty-btn plus" title="Increase quantity">+</button>
                            </div>
                            <div class="item-total">$${(item.price * item.quantity).toFixed(2)}</div>
                            <button onclick="removeFromCart(${item.id})" class="remove-item" title="Remove from cart">
                                <svg width="12" height="12" fill="currentColor" viewBox="0 0 16 16">
                                    <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            `).join('');
            
            if (cartFooter) cartFooter.style.display = 'block';
        }
    }
    
    // Update cart total
    if (cartTotal) {
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        cartTotal.textContent = total.toFixed(2);
    }
}

function proceedToCheckout() {
    if (cart.length === 0) {
        showCartNotification('Your cart is empty! Add some items first.', 'warning');
        return;
    }
    
    closeCart();
    showCheckoutModal();
}

function showCheckoutModal() {
    // Remove existing modal if any
    const existingModal = document.getElementById('checkout-modal');
    if (existingModal) {
        existingModal.remove();
    }
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = total * 0.08; // 8% tax
    const finalTotal = total + tax;
    
    const modal = document.createElement('div');
    modal.id = 'checkout-modal';
    modal.innerHTML = `
        <div class="modal-overlay" onclick="closeCheckoutModal()">
            <div class="modal-content" onclick="event.stopPropagation()">
                <div class="modal-header">
                    <h2>Checkout</h2>
                    <button class="close-modal" onclick="closeCheckoutModal()">×</button>
                </div>
                
                <div class="modal-body">
                    <!-- Order Summary -->
                    <div class="order-summary">
                        <h3>Order Summary</h3>
                        <div class="order-items">
                            ${cart.map(item => `
                                <div class="order-item">
                                    <img src="${item.image}" alt="${item.name}" onerror="this.src='/api/placeholder/40/40'">
                                    <div class="order-item-details">
                                        <span class="item-name">${item.name}</span>
                                        <span class="item-quantity">Qty: ${item.quantity}</span>
                                    </div>
                                    <span class="item-total">$${(item.price * item.quantity).toFixed(2)}</span>
                                </div>
                            `).join('')}
                        </div>
                        <div class="order-totals">
                            <div class="total-line">
                                <span>Subtotal:</span>
                                <span>$${total.toFixed(2)}</span>
                            </div>
                            <div class="total-line">
                                <span>Tax (8%):</span>
                                <span>$${tax.toFixed(2)}</span>
                            </div>
                            <div class="total-line final-total">
                                <span>Total:</span>
                                <span>$${finalTotal.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Customer Information -->
                    <div class="customer-info">
                        <h3>Customer Information</h3>
                        <form id="checkout-form">
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="firstName">First Name *</label>
                                    <input type="text" id="firstName" name="firstName" required>
                                </div>
                                <div class="form-group">
                                    <label for="lastName">Last Name *</label>
                                    <input type="text" id="lastName" name="lastName" required>
                                </div>
                            </div>
                            <div class="form-group">
                                <label for="email">Email *</label>
                                <input type="email" id="email" name="email" required>
                            </div>
                            <div class="form-group">
                                <label for="phone">Phone Number *</label>
                                <input type="tel" id="phone" name="phone" required>
                            </div>
                            
                            <h4>Order Type</h4>
                            <div class="order-type">
                                <label class="radio-option">
                                    <input type="radio" name="orderType" value="pickup" checked>
                                    <span>Pickup</span>
                                </label>
                                <label class="radio-option">
                                    <input type="radio" name="orderType" value="delivery">
                                    <span>Delivery (+$3.99)</span>
                                </label>
                            </div>
                            
                            <div class="form-group">
                                <label for="specialInstructions">Special Instructions</label>
                                <textarea id="specialInstructions" name="specialInstructions" rows="3" placeholder="Any special requests or notes..."></textarea>
                            </div>
                        </form>
                    </div>
                </div>
                
                <div class="modal-footer">
                    <button type="button" class="btn-secondary" onclick="closeCheckoutModal()">Cancel</button>
                    <button type="button" class="btn-primary" onclick="processOrder()">
                        Place Order - $${finalTotal.toFixed(2)}
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Show modal with animation
    setTimeout(() => {
        modal.classList.add('show');
    }, 10);
}

function closeCheckoutModal() {
    const modal = document.getElementById('checkout-modal');
    if (modal) {
        modal.classList.add('closing');
        setTimeout(() => {
            modal.remove();
        }, 300);
    }
}

function processOrder() {
    const form = document.getElementById('checkout-form');
    const formData = new FormData(form);
    const orderData = Object.fromEntries(formData);
    
    // Show loading state
    const orderButton = document.querySelector('.btn-primary');
    const originalText = orderButton.textContent;
    orderButton.textContent = 'Processing...';
    orderButton.disabled = true;
    
    // Calculate final totals
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryFee = orderData.orderType === 'delivery' ? 3.99 : 0;
    const tax = (subtotal + deliveryFee) * 0.08;
    const total = subtotal + deliveryFee + tax;
    
    // Create order object
    const order = {
        id: 'ORD-' + Date.now(),
        items: [...cart],
        customer: orderData,
        totals: {
            subtotal: subtotal.toFixed(2),
            deliveryFee: deliveryFee.toFixed(2),
            tax: tax.toFixed(2),
            total: total.toFixed(2)
        },
        timestamp: new Date().toISOString(),
        status: 'confirmed'
    };
    
    // Simulate order processing
    setTimeout(() => {
        // Clear cart
        cart = [];
        updateCartDisplay();
        
        // Close modal
        closeCheckoutModal();
        
        // Show success message
        showOrderConfirmation(order);
        
        // Reset button
        orderButton.textContent = originalText;
        orderButton.disabled = false;
    }, 2000);
}

function showOrderConfirmation(order) {
    const modal = document.createElement('div');
    modal.id = 'confirmation-modal';
    modal.innerHTML = `
        <div class="modal-overlay" onclick="closeConfirmationModal()">
            <div class="modal-content confirmation-content">
                <div class="confirmation-header">
                    <div class="success-icon">✓</div>
                    <h2>Order Confirmed!</h2>
                    <p>Thank you for your order, ${order.customer.firstName}!</p>
                </div>
                
                <div class="confirmation-details">
                    <div class="order-info">
                        <h3>Order #${order.id}</h3>
                        <p><strong>Order Type:</strong> ${order.customer.orderType === 'pickup' ? 'Pickup' : 'Delivery'}</p>
                        <p><strong>Total:</strong> $${order.totals.total}</p>
                        ${order.customer.orderType === 'pickup' ? 
                            '<p><strong>Pickup Time:</strong> 15-20 minutes</p>' : 
                            '<p><strong>Delivery Time:</strong> 30-45 minutes</p>'
                        }
                    </div>
                </div>
                
                <div class="confirmation-footer">
                    <button class="btn-primary" onclick="closeConfirmationModal()">Continue Shopping</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    setTimeout(() => {
        modal.classList.add('show');
    }, 10);
    
    // Auto close after 8 seconds
    setTimeout(() => {
        closeConfirmationModal();
    }, 8000);
}

function closeConfirmationModal() {
    const modal = document.getElementById('confirmation-modal');
    if (modal) {
        modal.classList.add('closing');
        setTimeout(() => {
            modal.remove();
        }, 300);
    }
}

function showCartNotification(message, type = 'success') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.cart-notification');
    existingNotifications.forEach(notification => notification.remove());
    
    const colors = {
        success: '#27ae60',
        warning: '#f39c12',
        error: '#e74c3c',
        info: '#3498db'
    };
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'cart-notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${colors[type] || colors.success};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        z-index: 10000;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        animation: slideInRight 0.3s ease-out;
        max-width: 300px;
        font-weight: 500;
    `;
    
    document.body.appendChild(notification);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Form Functions
function initializeForms() {
    // Contact form
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactForm);
    }
    
    // Newsletter forms
    const newsletterForms = document.querySelectorAll('.newsletter-form, .newsletter-form-large');
    newsletterForms.forEach(form => {
        form.addEventListener('submit', handleNewsletterForm);
    });
    
    // Add real-time validation
    const inputs = document.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
        input.addEventListener('blur', validateField);
        input.addEventListener('input', clearFieldError);
    });
}

function handleContactForm(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    
    // Basic validation
    if (!validateContactForm(data)) {
        return;
    }
    
    // Show loading state
    const submitButton = e.target.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    submitButton.textContent = 'Sending...';
    submitButton.disabled = true;
    
    // Simulate form submission
    setTimeout(() => {
        showNotification('Thank you for your message! We\'ll get back to you soon.', 'success');
        e.target.reset();
        submitButton.textContent = originalText;
        submitButton.disabled = false;
    }, 2000);
}

function handleNewsletterForm(e) {
    e.preventDefault();
    
    const email = e.target.querySelector('input[type="email"]').value;
    
    if (!validateEmail(email)) {
        showNotification('Please enter a valid email address.', 'error');
        return;
    }
    
    // Show loading state
    const submitButton = e.target.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    submitButton.textContent = 'Subscribing...';
    submitButton.disabled = true;
    
    // Simulate subscription
    setTimeout(() => {
        showNotification('Successfully subscribed to our newsletter!', 'success');
        e.target.reset();
        submitButton.textContent = originalText;
        submitButton.disabled = false;
    }, 1500);
}

function validateContactForm(data) {
    let isValid = true;
    
    // Required fields
    const requiredFields = ['name', 'email', 'subject', 'message'];
    requiredFields.forEach(field => {
        if (!data[field] || data[field].trim() === '') {
            showFieldError(field, 'This field is required');
            isValid = false;
        }
    });
    
    // Email validation
    if (data.email && !validateEmail(data.email)) {
        showFieldError('email', 'Please enter a valid email address');
        isValid = false;
    }
    
    return isValid;
}

function validateField(e) {
    const field = e.target;
    const value = field.value.trim();
    
    // Clear previous errors
    clearFieldError(e);
    
    // Required field validation
    if (field.hasAttribute('required') && !value) {
        showFieldError(field.name, 'This field is required');
        return false;
    }
    
    // Email validation
    if (field.type === 'email' && value && !validateEmail(value)) {
        showFieldError(field.name, 'Please enter a valid email address');
        return false;
    }
    
    return true;
}

function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function showFieldError(fieldName, message) {
    const field = document.querySelector(`[name="${fieldName}"]`);
    if (field) {
        field.style.borderColor = '#e74c3c';
        
        // Remove existing error message
        const existingError = field.parentNode.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }
        
        // Add error message
        const errorElement = document.createElement('span');
        errorElement.className = 'field-error';
        errorElement.textContent = message;
        errorElement.style.cssText = 'color: #e74c3c; font-size: 0.8rem; margin-top: 0.25rem; display: block;';
        field.parentNode.appendChild(errorElement);
    }
}

function clearFieldError(e) {
    const field = e.target;
    field.style.borderColor = '';
    
    const errorElement = field.parentNode.querySelector('.field-error');
    if (errorElement) {
        errorElement.remove();
    }
}

// Scroll Effects
function initializeScrollEffects() {
    // Smooth scrolling for anchor links
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                const offsetTop = targetElement.offsetTop - 100; // Account for fixed navbar
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Intersection Observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in-up');
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    const animateElements = document.querySelectorAll('.coffee-card, .blog-card, .service-card, .contact-item, .menu-item');
    animateElements.forEach(el => observer.observe(el));
}

// Animations
function initializeAnimations() {
    // Add CSS for animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes slideOutRight {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
        
        .cart-notification {
            animation: slideInRight 0.3
