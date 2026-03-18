// 1. CONFIGURACIÓN DEL MENÚ
const menuData = [
    {
        category: "Panchos", // IMPORTANTE: Mantener este nombre exacto para la lógica de las papas
        items: [
            { id: 1, name: "Pancho Simple", price: 3000, desc: "Clásico" },
            { id: 2, name: "Pancho Doble", price: 4000, desc: "Doble salchicha" },
            { id: 3, name: "Pancho con Poncho", price: 5000, desc: "Especialidad de la casa" }
        ]
    },
    {
        category: "Hamburguesas",
        items: [
            { id: 4, name: "Hamburguesa Simple", price: 9000, desc: "Jamón, queso, huevo, lechuga, tomate, 1 medallón XXL" },
            { id: 5, name: "Hamburguesa Doble", price: 10000, desc: "Jamón, queso, huevo, lechuga, tomate, 2 medallones XXL" }
        ]
    },
    {
        category: "Especialidades",
        items: [
            { id: 6, name: "Choripán", price: 9000, desc: "Chorizo sin piel, lechuga, tomate, ají opcional" },
            { id: 7, name: "Choripán Especial", price: 10000, desc: "Chorizo sin piel, jamón, queso, huevo, lechuga, tomate, ají opcional" },
            { id: 8, name: "Lomo Completo", price: 14000, desc: "320gr carne, queso, jamón, huevo, tomate, lechuga" },
            { id: 9, name: "Sándwich Vegetariano", price: 6500, desc: "Pan árabe, tomate, lechuga, queso, huevo" }
        ]
    }
];

const PHONE_NUMBER = "5492622272680";

// Variables globales
let cart = [];
let currentProductSelection = null; // Para guardar temporalmente qué producto se está personalizando

// --- INICIALIZACIÓN ---
document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('menu-container');
    
    menuData.forEach(cat => {
        const catTitle = document.createElement('h2');
        catTitle.className = 'category-title';
        catTitle.textContent = cat.category;
        container.appendChild(catTitle);

        cat.items.forEach(prod => {
            // Guardamos la categoría dentro del objeto producto para usarla luego
            prod.categoryName = cat.category; 
            
            const card = document.createElement('div');
            card.className = 'product-card';
            card.innerHTML = `
                <div class="product-info">
                    <h3>${prod.name}</h3>
                    <p class="product-desc">${prod.desc}</p>
                    <p class="product-price">$${prod.price}</p>
                </div>
                <button class="btn-add" onclick="openOptionsModal(${prod.id})">Agregar</button>
            `;
            container.appendChild(card);
        });
    });
});

// --- LÓGICA DE OPCIONES Y ADEREZOS ---

function openOptionsModal(id) {
    // Buscar el producto seleccionado
    let product;
    menuData.forEach(cat => {
        const found = cat.items.find(i => i.id === id);
        if (found) product = found;
    });

    if (!product) return;

    currentProductSelection = product; // Guardar producto actual
    
    // Actualizar títulos del modal
    document.getElementById('options-product-name').textContent = product.name;
    document.getElementById('options-modal').classList.remove('hidden');

    // Generar lista de checkboxes
    const listContainer = document.getElementById('condiments-list');
    listContainer.innerHTML = '';

    // Aderezos Base
    const baseCondiments = ["Mayonesa", "Ketchup", "Salsa Golf", "Mostaza", "Ají Picante"];
    
    baseCondiments.forEach(cond => {
        createCheckbox(listContainer, cond);
    });

    // Lógica condicional: Solo si es Pancho agregamos Papas
    if (product.categoryName === "Panchos") {
        createCheckbox(listContainer, "Lluvia de Papas");
    }
}

function createCheckbox(container, labelText) {
    const label = document.createElement('label');
    label.className = 'option-label';
    label.innerHTML = `
        <input type="checkbox" value="${labelText}"> ${labelText}
    `;
    container.appendChild(label);
}

function closeOptionsModal() {
    document.getElementById('options-modal').classList.add('hidden');
    currentProductSelection = null;
}

function confirmAddToCart() {
    if (!currentProductSelection) return;

    // Recolectar opciones marcadas
    const checkboxes = document.querySelectorAll('#options-form input:checked');
    const selectedOptions = Array.from(checkboxes).map(cb => cb.value);

    // Crear objeto para el carrito (Producto + sus opciones específicas)
    const cartItem = {
        ...currentProductSelection,
        selectedOptions: selectedOptions,
        internalId: Date.now() // ID único por si piden 2 panchos iguales pero con distintos gustos
    };

    cart.push(cartItem);
    updateCartUI();
    closeOptionsModal();
}

// --- GESTIÓN DEL CARRITO ---

function removeFromCart(index) {
    cart.splice(index, 1);
    updateCartUI();
    renderOrderItems(); 
}

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

function openCheckoutModal() {
    const modal = document.getElementById('checkout-modal');
    modal.classList.remove('hidden');
    renderOrderItems();
}

function closeCheckoutModal() {
    document.getElementById('checkout-modal').classList.add('hidden');
}

function renderOrderItems() {
    const container = document.getElementById('order-items');
    const totalSpan = document.getElementById('modal-total');
    container.innerHTML = '';

    let total = 0;
    cart.forEach((item, index) => {
        total += item.price;
        
        // Formatear texto de opciones (ej: "+ Mayo, Ketchup")
        const optionsText = item.selectedOptions.length > 0 
            ? `+ ${item.selectedOptions.join(', ')}` 
            : 'Sin aderezos';

        const div = document.createElement('div');
        div.className = 'order-item-row';
        div.innerHTML = `
            <div style="flex-grow:1">
                <strong>${item.name}</strong>
                <div class="cart-item-details">${optionsText}</div>
            </div>
            <div style="min-width: 80px; text-align: right;">
                <span>$${item.price}</span>
                <span class="btn-remove" onclick="removeFromCart(${index})">x</span>
            </div>
        `;
        container.appendChild(div);
    });

    totalSpan.textContent = `$${total}`;
}

// --- FINALIZAR PEDIDO (WHATSAPP) ---

function finalizeOrder(event) {
    event.preventDefault();

    const name = document.getElementById('customer-name').value;
    const address = document.getElementById('customer-address').value;
    const payment = document.getElementById('payment-method').value;
    
    if (cart.length === 0) return alert("El carrito está vacío");

    let message = `*NUEVO PEDIDO - SANCHO PLANCHA* %0A`;
    message += `👤 *Cliente:* ${name} %0A`;
    message += `📍 *Dirección:* ${address} %0A`;
    message += `💳 *Pago:* ${payment} %0A%0A`;
    message += `*DETALLE DEL PEDIDO:* %0A----------------%0A`;

    let total = 0;
    
    // Listar item por item porque cada uno puede tener aderezos distintos
    cart.forEach(item => {
        total += item.price;
        message += `🌭 *${item.name}* ($${item.price})%0A`;
        
        if (item.selectedOptions.length > 0) {
             message += `   _Aderezos: ${item.selectedOptions.join(', ')}_ %0A`;
        } else {
             message += `   _Sin aderezos_ %0A`;
        }
        message += `%0A`;
    });

    message += `----------------%0A`;
    message += `💰 *TOTAL A PAGAR: $${total}*`;

    const url = `https://wa.me/${PHONE_NUMBER}?text=${message}`;
    window.open(url, '_blank');
}