// Global Variables
let cart = [];
let isCartOpen = false;

// Safe storage wrapper to handle environments without localStorage
const storage = {
    getItem: function(key) {
        try {
            if (typeof localStorage !== 'undefined') {
                return localStorage.getItem(key);
            }
        } catch (e) {
            console.warn('localStorage not available, using memory storage');
        }
        return null;
    },
    setItem: function(key, value) {
        try {
            if (typeof localStorage !== 'undefined') {
                localStorage.setItem(key, value);
            }
        } catch (e) {
            console.warn('localStorage not available, data will not persist');
        }
    }
};

// Initialize cart from storage or empty array
try {
    const savedCart = storage.getItem('brewBeanCart');
    cart = savedCart ? JSON.parse(savedCart) : [];
} catch (e) {
    console.warn('Could not load cart from storage:', e);
    cart = [];
}

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
        showCartNotification('Error: Could not add item to cart', 'error');
        return;
    }
    
    // Extract product information from data attributes and DOM elements
    const name = menuItem.getAttribute('data-name') || menuItem.querySelector('h4')?.textContent || 'Unknown Product';
    const priceText = menuItem.getAttribute('data-price') || menuItem.querySelector('.price')?.textContent || '0';
    const price = parseFloat(priceText.replace(/[^0-9.]/g, '')) || 0; // More robust price parsing
    const category = menuItem.getAttribute('data-category') || 'Unknown Category';
    const image = menuItem.querySelector('.item-image img')?.src || '/placeholder.svg?height=100&width=100';
    
    if (price === 0) {
        console.warn('Price could not be determined for item:', name);
        showCartNotification('Error: Price not found for this item', 'error');
        return;
    }
    
    const product = {
        id: Date.now() + Math.random(), // Simple ID generation
        name: name,
        price: price,
        image: image,
        category: category,
        quantity: 1
    };
    
    // Check if item already exists in cart
    const existingItem = cart.find(item => item.name === product.name && item.price === product.price);
    
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
                            <p class="item-price">P${item.price.toFixed(2)} each</p>
                        </div>
                        <div class="cart-item-controls">
                            <div class="quantity-controls">
                                <button onclick="updateQuantity(${item.id}, -1)" class="qty-btn minus" title="Decrease quantity">-</button>
                                <span class="quantity">${item.quantity}</span>
                                <button onclick="updateQuantity(${item.id}, 1)" class="qty-btn plus" title="Increase quantity">+</button>
                            </div>
                            <div class="item-total">P${(item.price * item.quantity).toFixed(2)}</div>
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
                                    <span class="item-total">P${(item.price * item.quantity).toFixed(2)}</span>
                                </div>
                            `).join('')}
                        </div>
                        <div class="order-totals">
                            <div class="total-line">
                                <span>Subtotal:</span>
                                <span>P${total.toFixed(2)}</span>
                            </div>
                            <div class="total-line">
                                <span>Tax (8%):</span>
                                <span>P${tax.toFixed(2)}</span>
                            </div>
                            <div class="total-line final-total">
                                <span>Total:</span>
                                <span>P${finalTotal.toFixed(2)}</span>
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
                                    <span>Delivery (+P54.99)</span>
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
                        Place Order - P${finalTotal.toFixed(2)}
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
    const deliveryInputs = deliverySection ? deliverySection.querySelectorAll('input') : [];
    
    orderTypeInputs.forEach(input => {
        input.addEventListener('change', function() {
            if (deliverySection) {
                if (this.value === 'delivery') {
                    deliverySection.style.display = 'block';
                    deliveryInputs.forEach(input => input.required = true);
                } else {
                    deliverySection.style.display = 'none';
                    deliveryInputs.forEach(input => input.required = false);
                }
            }
            updateCheckoutTotal();
        });
    });
    
    // Payment method change
    const paymentInputs = document.querySelectorAll('input[name="paymentMethod"]');
    const cardSection = document.getElementById('card-details');
    const cardInputs = cardSection ? cardSection.querySelectorAll('input') : [];
    
    paymentInputs.forEach(input => {
        input.addEventListener('change', function() {
            if (cardSection) {
                if (this.value === 'card') {
                    cardSection.style.display = 'block';
                    cardInputs.forEach(input => input.required = true);
                } else {
                    cardSection.style.display = 'none';
                    cardInputs.forEach(input => input.required = false);
                }
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
    const deliveryFee = orderType === 'delivery' ? 54.99 : 0; // Updated delivery fee in BWP
    const tax = (subtotal + deliveryFee) * 0.08;
    const total = subtotal + deliveryFee + tax;
    
    // Update the button text
    const orderButton = document.querySelector('.btn-primary');
    if (orderButton) {
        orderButton.textContent = `Place Order - P${total.toFixed(2)}`;
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
    try {
        const form = document.getElementById('checkout-form');
        if (!form) {
            throw new Error('Checkout form not found');
        }
        
        const formData = new FormData(form);
        const orderData = Object.fromEntries(formData);
        
        console.log('Processing order with data:', orderData); // Debug log
        
        // Basic validation
        if (!validateCheckoutForm(orderData)) {
            return;
        }
        
        // Show loading state
        const orderButton = document.querySelector('.btn-primary');
        if (!orderButton) {
            throw new Error('Order button not found');
        }
        
        const originalText = orderButton.textContent;
        orderButton.textContent = 'Processing...';
        orderButton.disabled = true;
        
        // Calculate final totals
        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const deliveryFee = orderData.orderType === 'delivery' ? 54.99 : 0;
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
        
        console.log('Order created:', order); // Debug log
        
        // Simulate order processing
        setTimeout(() => {
            try {
                // Clear cart
                cart = [];
                saveCart();
                updateCartDisplay();
                
                // Close modal
                closeCheckoutModal();
                
                // Show success message
                showOrderConfirmation(order);
                
                console.log('Order processed successfully'); // Debug log
            } catch (error) {
                console.error('Error in order processing callback:', error);
                showCartNotification('Error processing order. Please try again.', 'error');
            } finally {
                // Reset button
                orderButton.textContent = originalText;
                orderButton.disabled = false;
            }
        }, 2000);
        
    } catch (error) {
        console.error('Error in processOrder:', error);
        showCartNotification('Error processing order. Please try again.', 'error');
        
        // Reset button if it exists
        const orderButton = document.querySelector('.btn-primary');
        if (orderButton) {
            orderButton.disabled = false;
            if (orderButton.textContent === 'Processing...') {
                orderButton.textContent = 'Place Order';
            }
        }
    }
}

function validateCheckoutForm(data) {
    try {
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
                const fieldLabel = field.replace(/([A-Z])/g, ' $1').toLowerCase();
                showCartNotification(`Please fill in the ${fieldLabel} field.`, 'error');
                return false;
            }
        }
        
        // Email validation
        if (data.email && !validateEmail(data.email)) {
            showCartNotification('Please enter a valid email address.', 'error');
            return false;
        }
        
        // Card validation for card payments
        if (data.paymentMethod === 'card') {
            if (data.cardNumber && data.cardNumber.replace(/\s/g, '').length < 13) {
                showCartNotification('Please enter a valid card number.', 'error');
                return false;
            }
            
            if (data.expiryDate && !/^\d{2}\/\d{2}$/.test(data.expiryDate)) {
                showCartNotification('Please enter a valid expiry date (MM/YY).', 'error');
                return false;
            }
            
            if (data.cvv && (data.cvv.length < 3 || data.cvv.length > 4)) {
                showCartNotification('Please enter a valid CVV.', 'error');
                return false;
            }
        }
        
        return true;
    } catch (error) {
        console.error('Error validating form:', error);
        showCartNotification('Error validating form data.', 'error');
        return false;
    }
}

function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
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
                                <span>P${(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                        `).join('')}
                        <div class="summary-total">
                            <strong>Total: P${order.totals.total}</strong>
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
    try {
        storage.setItem('brewBeanCart', JSON.stringify(cart));
    } catch (error) {
        console.warn('Could not save cart:', error);
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
