document.addEventListener("DOMContentLoaded", function () {
    checkLoginStatus();
    loadTopPlatos();
});

// Función para verificar el estado de inicio de sesión
function checkLoginStatus() {
    const user = JSON.parse(localStorage.getItem('loggedInUser'));
    if (user) {
        loadNavbar(user);
        if (user.role === 'delivery') {
            loadDeliveryProfile(user);
        }
    } else {
        loadNavbar();
    }
}

// Función para cargar la barra de navegación
function loadNavbar(user = null) {
    const navbar = `
        <nav class="navbar navbar-expand-lg navbar-light bg-light">
            <a class="navbar-brand" href="index.html">El Comilón</a>
            <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav">
                    <li class="nav-item">
                        <a class="nav-link" href="index.html">Inicio</a>
                    </li>
                    ${user ? `<li class="nav-item"><a class="nav-link" href="menu.html">Menú</a></li>` : ''}
                </ul>
                <ul class="navbar-nav ml-auto">
                    ${user ? `
                        <li class="nav-item">
                            <span class="navbar-text">Hola, ${user.username}</span>
                        </li>
                        ${user.role === 'admin' ? `<li class="nav-item"><a class="nav-link" href="admin.html">Reportes</a></li>` : ''}
                        <li class="nav-item">
                            <button class="btn btn-outline-secondary ml-2" onclick="logout()">Logout</button>
                        </li>
                        <li class="nav-item">
                            <button class="btn btn-secondary ml-2" onclick="handleViewCartClick()">Ver Carrito</button>
                        </li>
                    ` : `
                        <li class="nav-item">
                            <button class="btn btn-outline-secondary" data-toggle="modal" data-target="#loginModal">Login</button>
                        </li>
                        <li class="nav-item">
                            <button class="btn btn-outline-secondary ml-2" data-toggle="modal" data-target="#registerModal">Registro</button>
                        </li>
                    `}
                </ul>
            </div>
        </nav>
    `;
    document.getElementById('navbar').innerHTML = navbar;
}

// Función para iniciar sesión
function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const users = JSON.parse(localStorage.getItem('users')) || [];

    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
        localStorage.setItem('loggedInUser', JSON.stringify(user));
        alert('Login exitoso');
        $('#loginModal').modal('hide');
        checkLoginStatus();
    } else {
        alert('Usuario o contraseña incorrectos');
    }
}

// Función para registrar un nuevo usuario
function register() {
    const newUsername = document.getElementById('newUsername').value;
    const newPassword = document.getElementById('newPassword').value;
    const address = document.getElementById('address').value;
    const isDelivery = document.getElementById('isDelivery').checked;
    const users = JSON.parse(localStorage.getItem('users')) || [];

    if (users.find(u => u.username === newUsername)) {
        alert('El usuario ya existe');
    } else {
        const newUser = {
            username: newUsername,
            password: newPassword,
            address: address,
            role: isDelivery ? 'delivery' : 'user'
        };
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        alert('Registro exitoso');
        $('#registerModal').modal('hide');
    }
}

// Función para cargar los tres platos más baratos
function loadTopPlatos() {
    fetch('data/platos.json')
        .then(response => response.json())
        .then(platos => {
            const topPlatos = platos.sort((a, b) => a.precio - b.precio).slice(0, 3);
            const topPlatosContainer = document.getElementById('top-platos');
            topPlatosContainer.innerHTML = ''; // Limpiar el contenido anterior

            topPlatos.forEach(plato => {
                const platoDiv = document.createElement('div');
                platoDiv.className = 'col-md-4 d-flex align-items-stretch'; // Asegura que las cards tengan el mismo tamaño
                platoDiv.innerHTML = `
                    <div class="card mb-4">
                        <img src="${plato.imagen}" class="card-img-top fixed-img" alt="${plato.nombre}">
                        <div class="card-body d-flex flex-column">
                            <h5 class="card-title">${plato.nombre}</h5>
                            <p class="card-text">Ingredientes: ${plato.ingredientes.join(', ')}</p>
                            <p class="card-text">Precio: $${plato.precio.toFixed(2)}</p>
                            <button class="btn btn-primary mt-auto" onclick="orderPlato(${plato.id})">Pedir</button>
                        </div>
                    </div>
                `;
                topPlatosContainer.appendChild(platoDiv);
            });
        })
        .catch(error => console.error('Error al cargar los platos:', error));
}

// Función para añadir un plato al carrito
function orderPlato(platoId) {
    const user = JSON.parse(localStorage.getItem('loggedInUser'));
    if (user) {
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        const itemIndex = cart.findIndex(item => item.id === platoId);
        if (itemIndex > -1) {
            cart[itemIndex].cantidad += 1;
        } else {
            cart.push({ id: platoId, cantidad: 1, ingredientes: [] });
        }
        localStorage.setItem('cart', JSON.stringify(cart));
        window.location.href = 'menu.html';
    } else {
        $('#loginOrRegisterModal').modal('show');
    }
}

// Función para manejar el clic en "Ver Carrito"
function handleViewCartClick() {
    const user = JSON.parse(localStorage.getItem('loggedInUser'));
    if (user) {
        $('#cartModal').modal('show');
        viewCart();
    } else {
        $('#loginOrRegisterModal').modal('show');
    }
}

// Función para ver el carrito
function viewCart() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartContainer = document.getElementById('cart-items');
    cartContainer.innerHTML = '';

    if (cart.length === 0) {
        cartContainer.innerHTML = '<p>El carrito está vacío.</p>';
        return;
    }

    fetch('data/platos.json')
        .then(response => response.json())
        .then(platos => {
            cart.forEach(cartItem => {
                const plato = platos.find(p => p.id === cartItem.id);
                const platoDiv = document.createElement('div');
                platoDiv.className = 'cart-item';
                platoDiv.innerHTML = `
                    <div class="card mb-3">
                        <div class="card-body">
                            <h5 class="card-title">${plato.nombre}</h5>
                            <p class="card-text">Ingredientes: ${cartItem.ingredientes.join(', ')}</p>
                            <p class="card-text">Precio: $${plato.precio.toFixed(2)}</p>
                            <p class="card-text">Cantidad: ${cartItem.cantidad}</p>
                            <button onclick="removeFromCart(${plato.id})" class="btn btn-danger">Eliminar</button>
                        </div>
                    </div>
                `;
                cartContainer.appendChild(platoDiv);
            });
        })
        .catch(error => console.error('Error al cargar los platos:', error));
}

// Función para eliminar un plato del carrito
function removeFromCart(platoId) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart = cart.filter(item => item.id !== platoId);
    localStorage.setItem('cart', JSON.stringify(cart));
    viewCart();
}

// Función para confirmar el pedido
function confirmOrder() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const user = JSON.parse(localStorage.getItem('loggedInUser'));
    if (cart.length === 0) {
        alert('El carrito está vacío.');
        return;
    }

    const deliveryDate = document.getElementById('delivery-date').value;
    const deliveryTime = document.getElementById('delivery-time').value;

    const newOrder = {
        user: user.username,
        address: user.address,
        items: cart,
        status: 'pending',
        date: new Date().toISOString(),
        deliveryDate: deliveryDate,
        deliveryTime: deliveryTime
    };

    let pedidos = JSON.parse(localStorage.getItem('pedidos')) || [];
    pedidos.push(newOrder);
    localStorage.setItem('pedidos', JSON.stringify(pedidos));
    localStorage.removeItem('cart');
    alert('Pedido confirmado');
    $('#cartModal').modal('hide');
}

// Función para cargar el historial de pedidos
function loadOrderHistory() {
    const user = JSON.parse(localStorage.getItem('loggedInUser'));
    if (!user) {
        alert('Por favor, inicie sesión para ver su historial de pedidos.');
        return;
    }

    const pedidos = JSON.parse(localStorage.getItem('pedidos')) || [];
    const userOrders = pedidos.filter(order => order.user === user.username);
    const orderHistoryContainer = document.getElementById('order-history');
    orderHistoryContainer.innerHTML = ''; // Limpiar contenido anterior

    userOrders.forEach(order => {
        const orderDiv = document.createElement('div');
        orderDiv.className = 'order-item';
        orderDiv.innerHTML = `
            <h5>Pedido ${order.id}</h5>
            <p>Fecha: ${new Date(order.date).toLocaleString()}</p>
            <p>Estado: ${order.status}</p>
            <ul>
                ${order.items.map(item => `<li>${item.cantidad} x ${item.nombre}</li>`).join('')}
            </ul>
        `;
        orderHistoryContainer.appendChild(orderDiv);
    });
}

// Función para cargar el estado de la cuenta
function loadAccountStatus() {
    const user = JSON.parse(localStorage.getItem('loggedInUser'));
    if (!user) {
        alert('Por favor, inicie sesión para ver el estado de su cuenta.');
        return;
    }

    const accountStatusContainer = document.getElementById('account-status');
    accountStatusContainer.innerHTML = `
        <h5>Estado de la Cuenta</h5>
        <p>Nombre de usuario: ${user.username}</p>
        <p>Dirección: ${user.address}</p>
        <p>Saldo: $${user.balance || 0.00}</p>
    `;
    loadOrderHistory(); // Mostrar también el historial de pedidos
}

// Función para configurar un pedido recurrente
function configureRecurringOrder(platoId, frecuencia) {
    const user = JSON.parse(localStorage.getItem('loggedInUser'));
    if (!user) {
        alert('Por favor, inicie sesión para configurar pedidos recurrentes.');
        return;
    }

    let recurringOrders = JSON.parse(localStorage.getItem('recurringOrders')) || [];
    recurringOrders.push({ user: user.username, platoId: platoId, frecuencia: frecuencia });
    localStorage.setItem('recurringOrders', JSON.stringify(recurringOrders));
    alert('Pedido recurrente configurado con éxito.');
}

// Función para cancelar un pedido
function cancelOrder(orderId) {
    const user = JSON.parse(localStorage.getItem('loggedInUser'));
    if (!user) {
        alert('Por favor, inicie sesión para cancelar pedidos.');
        return;
    }

    let pedidos = JSON.parse(localStorage.getItem('pedidos')) || [];
    const orderIndex = pedidos.findIndex(order => order.id === orderId && order.user === user.username);
    if (orderIndex > -1 && pedidos[orderIndex].status === 'pending') {
        pedidos[orderIndex].status = 'canceled';
        localStorage.setItem('pedidos', JSON.stringify(pedidos));
        alert('Pedido cancelado con éxito.');
        loadOrderHistory(); // Recargar el historial de pedidos
    } else {
        alert('No se puede cancelar este pedido.');
    }
}

// Función para cargar el perfil del repartidor
function loadDeliveryProfile(user) {
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = `
        <div class="card mx-auto" style="width: 50%;">
            <div class="card-body">
                <h5 class="card-title">Perfil del Repartidor</h5>
                <p class="card-text"><strong>Nombre de usuario:</strong> ${user.username}</p>
                <p class="card-text"><strong>Dirección:</strong> ${user.address}</p>
                <p class="card-text"><strong>Rol:</strong> ${user.role}</p>
            </div>
        </div>
    `;
}

// Función para cerrar sesión
function logout() {
    localStorage.removeItem('loggedInUser');
    window.location.href = 'index.html';
}
