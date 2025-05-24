// Global Variables
let cart = JSON.parse(localStorage.getItem('brewBeanCart')) || [];
let isCartOpen = false;

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
    initializeCart();
    initializeForms();
    initializeScrollEffects();
    initializeAnimations();
    updateCartDisplay();
});

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
    const cartDropdown = document.getElementById('cart-dropdown');
    
    if (cartButton && cartDropdown) {
        cartButton.addEventListener('click', function(e) {
            e.stopPropagation();
            toggleCart();
        });
        
        // Close cart when clicking outside
        document.addEventListener('click', function(event) {
            if (!cartDropdown.contains(event.target) && !cartButton.contains(event.target)) {
                closeCart();
            }
        });
    }
}

function toggleCart() {
    const cartDropdown = document.getElementById('cart-dropdown');
    if (cartDropdown) {
        isCartOpen = !isCartOpen;
        cartDropdown.classList.toggle('show', isCartOpen);
    }
}

function closeCart() {
    const cartDropdown = document.getElementById('cart-dropdown');
    if (cartDropdown) {
        isCartOpen = false;
        cartDropdown.classList.remove('show');
    }
}

// Enhanced addToCart function
function addToCart(button) {
    const menuItem = button.closest('.menu-item');
    if (!menuItem) {
        console.error('Menu item not found');
        return;
    }
    
    // Extract product information from data attributes and DOM elements
    const name = menuItem.getAttribute('data-name') || menuItem.querySelector('h4')?.textContent || 'Unknown Product';
    const priceText = menuItem.getAttribute('data-price') || menuItem.querySelector('.price')?.textContent || '0';
    const price = parseFloat(priceText.replace('$', ''));
    const category = menuItem.getAttribute('data-category') || 'Unknown Category';
    const image = menuItem.querySelector('.item-image img')?.src || '/placeholder.svg?height=100&width=100';
    
    const product = {
        id: Date.now() + Math.random(), // Simple ID generation
        name: name,
        price: price,
        image: image,
        category: category,
        quantity: 1
    };
    
    // Check if item already exists in cart
    const existingItem = cart.find(item => item.name === product.name);
    
    if (existingItem) {
        existingItem.quantity += 1;
        showCartNotification(`${product.name} quantity updated! (${existingItem.quantity})`);
    } else {
        cart.push(product);
        showCartNotification(`${product.name} added to cart!`);
    }
    
    saveCart();
    updateCartDisplay();
    
    // Add visual feedback to button
    button.style.transform = 'scale(0.9)';
    button.style.background = '#27ae60';
    setTimeout(() => {
        button.style.transform = '';
        button.style.background = '';
    }, 200);
}

function removeFromCart(productId) {
    const itemIndex = cart.findIndex(item => item.id === productId);
    if (itemIndex > -1) {
        const itemName = cart[itemIndex].name;
        cart.splice(itemIndex, 1);
        saveCart();
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
            saveCart();
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
    saveCart();
    updateCartDisplay();
    showCartNotification('Cart cleared!', 'warning');
}

function updateCartDisplay() {
    const cartCount = document.getElementById('cart-count');
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    const cartFooter = document.getElementById('cart-footer');
    
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
                        <img src="${item.image}" alt="${item.name}" loading="lazy">
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
                                    <img src="${item.image}" alt="${item.name}">
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
                            
                            <div id="delivery-address" class="delivery-section" style="display: none;">
                                <h4>Delivery Address</h4>
                                <div class="form-group">
                                    <label for="address">Street Address *</label>
                                    <input type="text" id="address" name="address">
                                </div>
                                <div class="form-row">
                                    <div class="form-group">
                                        <label for="city">City *</label>
                                        <input type="text" id="city" name="city">
                                    </div>
                                    <div class="form-group">
                                        <label for="zipCode">ZIP Code *</label>
                                        <input type="text" id="zipCode" name="zipCode">
                                    </div>
                                </div>
                            </div>
                            
                            <h4>Payment Method</h4>
                            <div class="payment-methods">
                                <label class="radio-option">
                                    <input type="radio" name="paymentMethod" value="card" checked>
                                    <span>Credit/Debit Card</span>
                                </label>
                                <label class="radio-option">
                                    <input type="radio" name="paymentMethod" value="cash">
                                    <span>Cash (Pickup Only)</span>
                                </label>
                            </div>
                            
                            <div id="card-details" class="card-section">
                                <div class="form-group">
                                    <label for="cardNumber">Card Number *</label>
                                    <input type="text" id="cardNumber" name="cardNumber" placeholder="1234 5678 9012 3456" maxlength="19">
                                </div>
                                <div class="form-row">
                                    <div class="form-group">
                                        <label for="expiryDate">Expiry Date *</label>
                                        <input type="text" id="expiryDate" name="expiryDate" placeholder="MM/YY" maxlength="5">
                                    </div>
                                    <div class="form-group">
                                        <label for="cvv">CVV *</label>
                                        <input type="text" id="cvv" name="cvv" placeholder="123" maxlength="4">
                                    </div>
                                </div>
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
    
    // Add event listeners for dynamic form behavior
    setupCheckoutFormListeners();
    
    // Show modal with animation
    setTimeout(() => {
        modal.classList.add('show');
    }, 10);
}

function setupCheckoutFormListeners() {
    // Order type change
    const orderTypeInputs = document.querySelectorAll('input[name="orderType"]');
    const deliverySection = document.getElementById('delivery-address');
    const deliveryInputs = deliverySection.querySelectorAll('input');
    
    orderTypeInputs.forEach(input => {
        input.addEventListener('change', function() {
            if (this.value === 'delivery') {
                deliverySection.style.display = 'block';
                deliveryInputs.forEach(input => input.required = true);
            } else {
                deliverySection.style.display = 'none';
                deliveryInputs.forEach(input => input.required = false);
            }
            updateCheckoutTotal();
        });
    });
    
    // Payment method change
    const paymentInputs = document.querySelectorAll('input[name="paymentMethod"]');
    const cardSection = document.getElementById('card-details');
    const cardInputs = cardSection.querySelectorAll('input');
    
    paymentInputs.forEach(input => {
        input.addEventListener('change', function() {
            if (this.value === 'card') {
                cardSection.style.display = 'block';
                cardInputs.forEach(input => input.required = true);
            } else {
                cardSection.style.display = 'none';
                cardInputs.forEach(input => input.required = false);
            }
        });
    });
    
    // Card number formatting
    const cardNumberInput = document.getElementById('cardNumber');
    if (cardNumberInput) {
        cardNumberInput.addEventListener('input', function() {
            let value = this.value.replace(/\s/g, '').replace(/[^0-9]/gi, '');
            let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
            this.value = formattedValue;
        });
    }
    
    // Expiry date formatting
    const expiryInput = document.getElementById('expiryDate');
    if (expiryInput) {
        expiryInput.addEventListener('input', function() {
            let value = this.value.replace(/\D/g, '');
            if (value.length >= 2) {
                value = value.substring(0, 2) + '/' + value.substring(2, 4);
            }
            this.value = value;
        });
    }
    
    // CVV formatting
    const cvvInput = document.getElementById('cvv');
    if (cvvInput) {
        cvvInput.addEventListener('input', function() {
            this.value = this.value.replace(/\D/g, '');
        });
    }
}

function updateCheckoutTotal() {
    const orderType = document.querySelector('input[name="orderType"]:checked')?.value;
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryFee = orderType === 'delivery' ? 3.99 : 0;
    const tax = (subtotal + deliveryFee) * 0.08;
    const total = subtotal + deliveryFee + tax;
    
    // Update the button text
    const orderButton = document.querySelector('.btn-primary');
    if (orderButton) {
        orderButton.textContent = `Place Order - $${total.toFixed(2)}`;
    }
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
    
    // Basic validation
    if (!validateCheckoutForm(orderData)) {
        return;
    }
    
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
        saveCart();
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

function validateCheckoutForm(data) {
    const requiredFields = ['firstName', 'lastName', 'email', 'phone'];
    
    // Add conditional required fields
    if (data.orderType === 'delivery') {
        requiredFields.push('address', 'city', 'zipCode');
    }
    
    if (data.paymentMethod === 'card') {
        requiredFields.push('cardNumber', 'expiryDate', 'cvv');
    }
    
    for (const field of requiredFields) {
        if (!data[field] || data[field].trim() === '') {
            showNotification(`Please fill in the ${field.replace(/([A-Z])/g, ' $1').toLowerCase()} field.`, 'error');
            return false;
        }
    }
    
    // Email validation
    if (data.email && !validateEmail(data.email)) {
        showNotification('Please enter a valid email address.', 'error');
        return false;
    }
    
    return true;
}

function showOrderConfirmation(order) {
    const modal = document.createElement('div');
    modal.id = 'confirmation-modal';
    modal.innerHTML = `
        <div class="modal-overlay">
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
                        <p><strong>Payment:</strong> ${order.customer.paymentMethod === 'card' ? 'Card' : 'Cash'}</p>
                        ${order.customer.orderType === 'pickup' ? 
                            '<p><strong>Pickup Time:</strong> 15-20 minutes</p>' : 
                            '<p><strong>Delivery Time:</strong> 30-45 minutes</p>'
                        }
                    </div>
                    
                    <div class="order-summary-small">
                        <h4>Order Summary</h4>
                        ${order.items.map(item => `
                            <div class="summary-item">
                                <span>${item.quantity}x ${item.name}</span>
                                <span>$${(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                        `).join('')}
                        <div class="summary-total">
                            <strong>Total: $${order.totals.total}</strong>
                        </div>
                    </div>
                </div>
                
                <div class="confirmation-footer">
                    <p>We'll send you updates via email at ${order.customer.email}</p>
                    <button class="btn-primary" onclick="closeConfirmationModal()">Continue Shopping</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    setTimeout(() => {
        modal.classList.add('show');
    }, 10);
    
    // Auto close after 10 seconds
    setTimeout(() => {
        closeConfirmationModal();
    }, 10000);
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

function saveCart() {
    localStorage.setItem('brewBeanCart', JSON.stringify(cart));
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
    
    // Simulate form submission (replace with actual API call)
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
    
    // Simulate subscription (replace with actual API call)
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
            animation: slideInRight 0.3s ease-out;
        }
        
        /* Enhanced Cart Styles */
        .cart-item {
            display: flex;
            gap: 0.75rem;
            padding: 1rem 0;
            border-bottom: 1px solid #eee;
            align-items: flex-start;
        }
        
        .cart-item:last-child {
            border-bottom: none;
        }
        
        .cart-item-image img {
            width: 50px;
            height: 50px;
            object-fit: cover;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        
        .cart-item-details {
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
        }
        
        .cart-item-info h4 {
            font-size: 0.95rem;
            margin: 0;
            color: #333;
            font-weight: 600;
        }
        
        .item-category {
            font-size: 0.75rem;
            color: #8B4513;
            margin: 0;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .item-price {
            font-size: 0.8rem;
            color: #666;
            margin: 0;
        }
        
        .cart-item-controls {
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            gap: 0.5rem;
        }
        
        .quantity-controls {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            background: #f8f4f0;
            border-radius: 20px;
            padding: 0.25rem;
        }
        
        .qty-btn {
            background: #8B4513;
            color: white;
            border: none;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            cursor: pointer;
            font-size: 0.8rem;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s ease;
        }
        
        .qty-btn:hover {
            background: #6d3410;
            transform: scale(1.1);
        }
        
        .quantity {
            font-weight: 600;
            color: #8B4513;
            min-width: 20px;
            text-align: center;
            font-size: 0.9rem;
        }
        
        .item-total {
            font-weight: 700;
            color: #8B4513;
            font-size: 0.9rem;
        }
        
        .remove-item {
            background: #e74c3c;
            color: white;
            border: none;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s ease;
        }
        
        .remove-item:hover {
            background: #c0392b;
            transform: scale(1.1);
        }
        
        .empty-cart {
            text-align: center;
            padding: 2rem 1rem;
            color: #999;
        }
        
        .empty-cart p {
            margin: 0 0 0.5rem 0;
            font-size: 1rem;
        }
        
        .empty-cart small {
            font-size: 0.8rem;
            color: #bbb;
        }
        
        /* Checkout Modal Styles */
        #checkout-modal, #confirmation-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 10000;
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s ease;
        }
        
        #checkout-modal.show, #confirmation-modal.show {
            opacity: 1;
            visibility: visible;
        }
        
        #checkout-modal.closing, #confirmation-modal.closing {
            opacity: 0;
            visibility: hidden;
        }
        
        .modal-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 1rem;
        }
        
        .modal-content {
            background: white;
            border-radius: 15px;
            max-width: 800px;
            width: 100%;
            max-height: 90vh;
            overflow-y: auto;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
            transform: scale(0.9);
            transition: transform 0.3s ease;
        }
        
        #checkout-modal.show .modal-content,
        #confirmation-modal.show .modal-content {
            transform: scale(1);
        }
        
        .modal-header {
            padding: 1.5rem;
            border-bottom: 1px solid #eee;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .modal-header h2 {
            margin: 0;
            color: #8B4513;
        }
        
        .close-modal {
            background: none;
            border: none;
            font-size: 1.5rem;
            cursor: pointer;
            color: #999;
            width: 30px;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            transition: all 0.2s ease;
        }
        
        .close-modal:hover {
            background: #f0f0f0;
            color: #333;
        }
        
        .modal-body {
            padding: 1.5rem;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 2rem;
        }
        
        .order-summary {
            background: #f8f4f0;
            padding: 1.5rem;
            border-radius: 10px;
        }
        
        .order-summary h3 {
            margin: 0 0 1rem 0;
            color: #8B4513;
        }
        
        .order-items {
            margin-bottom: 1rem;
        }
        
        .order-item {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding: 0.5rem 0;
            border-bottom: 1px solid #ddd;
        }
        
        .order-item:last-child {
            border-bottom: none;
        }
        
        .order-item img {
            width: 40px;
            height: 40px;
            object-fit: cover;
            border-radius: 5px;
        }
        
        .order-item-details {
            flex: 1;
        }
        
        .item-name {
            display: block;
            font-weight: 600;
            color: #333;
            font-size: 0.9rem;
        }
        
        .item-quantity {
            display: block;
            font-size: 0.8rem;
            color: #666;
        }
        
        .order-totals {
            border-top: 1px solid #ddd;
            padding-top: 1rem;
        }
        
        .total-line {
            display: flex;
            justify-content: space-between;
            margin-bottom: 0.5rem;
            font-size: 0.9rem;
        }
        
        .final-total {
            font-weight: 700;
            font-size: 1.1rem;
            color: #8B4513;
            border-top: 1px solid #ddd;
            padding-top: 0.5rem;
            margin-top: 0.5rem;
        }
        
        .customer-info h3, .customer-info h4 {
            color: #8B4513;
            margin: 0 0 1rem 0;
        }
        
        .form-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
        }
        
        .form-group {
            margin-bottom: 1rem;
        }
        
        .form-group label {
            display: block;
            margin-bottom: 0.5rem;
            font-weight: 600;
            color: #333;
            font-size: 0.9rem;
        }
        
        .form-group input,
        .form-group textarea {
            width: 100%;
            padding: 0.75rem;
            border: 2px solid #ddd;
            border-radius: 8px;
            font-size: 0.9rem;
            transition: border-color 0.3s ease;
        }
        
        .form-group input:focus,
        .form-group textarea:focus {
            outline: none;
            border-color: #8B4513;
        }
        
        .order-type, .payment-methods {
            display: flex;
            gap: 1rem;
            margin-bottom: 1rem;
        }
        
        .radio-option {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            cursor: pointer;
            padding: 0.75rem 1rem;
            border: 2px solid #ddd;
            border-radius: 8px;
            transition: all 0.3s ease;
            flex: 1;
        }
        
        .radio-option:hover {
            border-color: #8B4513;
            background: #f8f4f0;
        }
        
        .radio-option input[type="radio"] {
            margin: 0;
        }
        
        .radio-option input[type="radio"]:checked + span {
            color: #8B4513;
            font-weight: 600;
        }
        
        .delivery-section, .card-section {
            margin-top: 1rem;
            padding: 1rem;
            background: #f8f4f0;
            border-radius: 8px;
        }
        
        .modal-footer {
            padding: 1.5rem;
            border-top: 1px solid #eee;
            display: flex;
            justify-content: flex-end;
            gap: 1rem;
        }
        
        .btn-primary, .btn-secondary {
            padding: 0.75rem 1.5rem;
            border: none;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .btn-primary {
            background: #8B4513;
            color: white;
        }
        
        .btn-primary:hover {
            background: #6d3410;
        }
        
        .btn-primary:disabled {
            background: #ccc;
            cursor: not-allowed;
        }
        
        .btn-secondary {
            background: #f0f0f0;
            color: #333;
        }
        
        .btn-secondary:hover {
            background: #e0e0e0;
        }
        
        /* Confirmation Modal Styles */
        .confirmation-content {
            text-align: center;
            max-width: 500px;
        }
        
        .confirmation-header {
            padding: 2rem;
        }
        
        .success-icon {
            width: 60px;
            height: 60px;
            background: #27ae60;
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 2rem;
            font-weight: bold;
            margin: 0 auto 1rem;
        }
        
        .confirmation-details {
            padding: 0 2rem;
            text-align: left;
        }
        
        .order-info {
            background: #f8f4f0;
            padding: 1rem;
            border-radius: 8px;
            margin-bottom: 1rem;
        }
        
        .order-summary-small {
            background: #fff;
            border: 1px solid #ddd;
            padding: 1rem;
            border-radius: 8px;
        }
        
        .summary-item {
            display: flex;
            justify-content: space-between;
            margin-bottom: 0.5rem;
            font-size: 0.9rem;
        }
        
        .summary-total {
            border-top: 1px solid #ddd;
            padding-top: 0.5rem;
            margin-top: 0.5rem;
            text-align: center;
        }
        
        .confirmation-footer {
            padding: 2rem;
        }
        
        /* Mobile Responsive */
        @media (max-width: 768px) {
            .modal-body {
                grid-template-columns: 1fr;
                gap: 1rem;
            }
            
            .form-row {
                grid-template-columns: 1fr;
            }
            
            .order-type, .payment-methods {
                flex-direction: column;
            }
            
            .modal-footer {
                flex-direction: column;
            }
            
            .cart-item-controls {
                align-items: flex-start;
            }
        }
    `;
    document.head.appendChild(style);
}

// Utility Functions
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    const bgColor = type === 'success' ? '#27ae60' : type === 'error' ? '#e74c3c' : '#8B4513';
    
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${bgColor};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 5px;
        z-index: 10000;
        animation: slideInRight 0.3s ease-out;
        max-width: 300px;
        word-wrap: break-word;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 4000);
}

// Error handling
window.addEventListener('error', function(e) {
    console.error('JavaScript error:', e.error);
});

// Performance monitoring
window.addEventListener('load', function() {
    const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
    console.log(`Page loaded in ${loadTime}ms`);
});

// Accessibility improvements
document.addEventListener('keydown', function(e) {
    // Close cart with Escape key
    if (e.key === 'Escape' && isCartOpen) {
        closeCart();
    }
    
    // Close modals with Escape key
    if (e.key === 'Escape') {
        const checkoutModal = document.getElementById('checkout-modal');
        const confirmationModal = document.getElementById('confirmation-modal');
        
        if (checkoutModal) {
            closeCheckoutModal();
        }
        
        if (confirmationModal) {
            closeConfirmationModal();
        }
    }
    
    // Close mobile menu with Escape key
    if (e.key === 'Escape') {
        const hamburger = document.getElementById('hamburger');
        const navMenu = document.getElementById('nav-menu');
        if (hamburger && navMenu && navMenu.classList.contains('active')) {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        }
    }
});

// Export functions for testing or external use
window.BrewBean = {
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    toggleCart,
    proceedToCheckout,
    showNotification
};
