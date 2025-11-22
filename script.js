// 1. CONFIGURACIÓN DEL MENÚ
// Aquí puedes editar precios y productos fácilmente
const menuData = [
    {
        category: "Panchos",
        items: [
            { id: 1, name: "Pancho Simple", price: 2500, desc: "Clásico" },
            { id: 2, name: "Pancho Doble", price: 3500, desc: "Doble salchicha" },
            { id: 3, name: "Pancho con Poncho", price: 4000, desc: "Especialidad de la casa" }
        ]
    },
    {
        category: "Hamburguesas",
        items: [
            { id: 4, name: "Hamburguesa Simple", price: 7500, desc: "Jamón, queso, huevo, lechuga, tomate, 1 medallón XXL" },
            { id: 5, name: "Hamburguesa Doble", price: 9000, desc: "Jamón, queso, huevo, lechuga, tomate, 2 medallones XXL" }
        ]
    },
    {
        category: "Especialidades",
        items: [
            { id: 6, name: "Choripán Especial", price: 8000, desc: "Chorizo sin piel, lechuga, tomate, ají opcional" },
            { id: 7, name: "Lomo Completo", price: 12000, desc: "320gr carne, mozzarella, jamón, huevo, tomate, lechuga" },
            { id: 8, name: "Sándwich Vegetariano", price: 6000, desc: "Pan árabe, tomate, lechuga, queso, huevo" }
        ]
    }
];

const PHONE_NUMBER = "5492622272680"; // Tu número de WhatsApp extraído del PDF

// 2. LÓGICA DEL CARRITO
let cart = [];

// Renderizar el menú al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('menu-container');
    
    menuData.forEach(cat => {
        // Crear título de categoría
        const catTitle = document.createElement('h2');
        catTitle.className = 'category-title';
        catTitle.textContent = cat.category;
        container.appendChild(catTitle);

        // Crear tarjetas de productos
        cat.items.forEach(prod => {
            const card = document.createElement('div');
            card.className = 'product-card';
            card.innerHTML = `
                <div class="product-info">
                    <h3>${prod.name}</h3>
                    <p class="product-desc">${prod.desc}</p>
                    <p class="product-price">$${prod.price}</p>
                </div>
                <button class="btn-add" onclick="addToCart(${prod.id})">Agregar</button>
            `;
            container.appendChild(card);
        });
    });
});

// Agregar al carrito
function addToCart(id) {
    // Buscar producto en todas las categorías
    let product;
    menuData.forEach(cat => {
        const found = cat.items.find(i => i.id === id);
        if (found) product = found;
    });

    if (product) {
        cart.push(product);
        updateCartUI();
    }
}

// Eliminar del carrito (por índice)
function removeFromCart(index) {
    cart.splice(index, 1);
    updateCartUI();
    renderOrderItems(); // Actualizar vista del modal si está abierto
}

// Actualizar la interfaz del carrito flotante
function updateCartUI() {
    const cartSticky = document.getElementById('cart-sticky');
    const countSpan = document.getElementById('cart-count');
    const totalSpan = document.getElementById('cart-total');

    if (cart.length > 0) {
        cartSticky.classList.remove('hidden');
        const total = cart.reduce((sum, item) => sum + item.price, 0);
        countSpan.textContent = `${cart.length} item(s)`;
        totalSpan.textContent = `$${total}`;
    } else {
        cartSticky.classList.add('hidden');
    }
}

// Abrir Modal de Checkout
function openCheckoutModal() {
    const modal = document.getElementById('checkout-modal');
    modal.classList.remove('hidden');
    renderOrderItems();
}

// Cerrar Modal
function closeCheckoutModal() {
    document.getElementById('checkout-modal').classList.add('hidden');
}

// Mostrar items en el modal
function renderOrderItems() {
    const container = document.getElementById('order-items');
    const totalSpan = document.getElementById('modal-total');
    container.innerHTML = '';

    let total = 0;
    cart.forEach((item, index) => {
        total += item.price;
        const div = document.createElement('div');
        div.className = 'order-item-row';
        div.innerHTML = `
            <span>${item.name}</span>
            <div>
                <span>$${item.price}</span>
                <span class="btn-remove" onclick="removeFromCart(${index})">x</span>
            </div>
        `;
        container.appendChild(div);
    });

    totalSpan.textContent = `$${total}`;
}

// 3. ENVIAR A WHATSAPP
function finalizeOrder(event) {
    event.preventDefault();

    const name = document.getElementById('customer-name').value;
    const address = document.getElementById('customer-address').value;
    const payment = document.getElementById('payment-method').value;
    
    if (cart.length === 0) return alert("El carrito está vacío");

    // Construir el mensaje
    let message = `*NUEVO PEDIDO - SANCHO PLANCHA* %0A`;
    message += `👤 *Cliente:* ${name} %0A`;
    message += `📍 *Dirección:* ${address} %0A`;
    message += `💳 *Pago:* ${payment} %0A%0A`;
    message += `*DETALLE:* %0A`;

    let total = 0;
    // Agrupar items iguales para que se vea más ordenado (ej: 2x Pancho)
    const summary = {};
    cart.forEach(item => {
        summary[item.name] = (summary[item.name] || 0) + 1;
        total += item.price;
    });

    for (const [item, qty] of Object.entries(summary)) {
        message += `- ${qty}x ${item} %0A`;
    }

    message += `%0A💰 *TOTAL: $${total}*`;

    // Abrir WhatsApp
    const url = `https://wa.me/${PHONE_NUMBER}?text=${message}`;
    window.open(url, '_blank');
}