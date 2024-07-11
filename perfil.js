document.addEventListener("DOMContentLoaded", function () {
    const user = JSON.parse(localStorage.getItem('loggedInUser'));
    if (!user) {
        window.location.href = 'index.html';
    } else {
        loadNavbar(user);
        loadAccountStatus();
        loadPendingOrders();
        document.getElementById('order-history-tab').addEventListener('click', loadOrderHistory);
        document.getElementById('recurring-orders-tab').addEventListener('click', loadRecurringOrders);
    }
});

function loadNavbar(user) {
    const navbar = `
        <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
            <a class="navbar-brand" href="#">El Comilón</a>
            <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav">
                    <li class="nav-item">
                        <a class="nav-link" href="menu.html">Menú</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="perfil.html">Perfil</a>
                    </li>
                </ul>
                <ul class="navbar-nav ml-auto">
                    <li class="nav-item">
                        <span class="navbar-text">Hola, ${user.username}</span>
                    </li>
                    <li class="nav-item">
                        <button class="btn btn-outline-light ml-2" onclick="logout()">Logout</button>
                    </li>
                </ul>
            </div>
        </nav>
    `;
    document.getElementById('navbar').innerHTML = navbar;
}

function logout() {
    localStorage.removeItem('loggedInUser');
    window.location.href = 'index.html';
}

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
}

function loadPendingOrders() {
    const user = JSON.parse(localStorage.getItem('loggedInUser'));
    if (!user) {
        alert('Por favor, inicie sesión para ver sus pedidos pendientes.');
        return;
    }

    let pedidos = JSON.parse(localStorage.getItem('pedidos')) || [];
    const pendingOrders = pedidos.filter(order => order.user === user.username && order.status === 'pending');
    const pendingOrdersContainer = document.getElementById('pending-orders-container');
    pendingOrdersContainer.innerHTML = ''; // Limpiar contenido anterior

    if (pendingOrders.length === 0) {
        pendingOrdersContainer.innerHTML = '<p>No tiene pedidos pendientes.</p>';
        return;
    }

    pendingOrders.forEach(order => {
        const orderDiv = document.createElement('div');
        orderDiv.className = 'order-item';
        orderDiv.innerHTML = `
            <h5>Pedido ${order.id}</h5>
            <p>Fecha: ${new Date(order.date).toLocaleString()}</p>
            <p>Fecha de entrega: ${order.deliveryDate} ${order.deliveryTime}</p>
            <p>Estado: ${order.status}</p>
            <ul>
                ${order.items.map(item => `<li>${item.cantidad} x ${getPlatoName(item.id)}</li>`).join('')}
            </ul>
            <button onclick="cancelOrder(${order.id})" class="btn btn-danger">Cancelar Pedido</button>
        `;
        pendingOrdersContainer.appendChild(orderDiv);
    });
}

function loadOrderHistory() {
    const user = JSON.parse(localStorage.getItem('loggedInUser'));
    if (!user) {
        alert('Por favor, inicie sesión para ver su historial de pedidos.');
        return;
    }

    let pedidos = JSON.parse(localStorage.getItem('pedidos')) || [];
    const userOrders = pedidos.filter(order => order.user === user.username);
    const orderHistoryContainer = document.getElementById('order-history-container');
    orderHistoryContainer.innerHTML = ''; // Limpiar contenido anterior

    if (userOrders.length === 0) {
        orderHistoryContainer.innerHTML = '<p>No tiene pedidos.</p>';
        return;
    }

    userOrders.forEach(order => {
        const orderDiv = document.createElement('div');
        orderDiv.className = 'order-item';
        orderDiv.innerHTML = `
            <h5>Pedido ${order.id}</h5>
            <p>Fecha: ${new Date(order.date).toLocaleString()}</p>
            <p>Fecha de entrega: ${order.deliveryDate} ${order.deliveryTime}</p>
            <p>Estado: ${order.status}</p>
            <ul>
                ${order.items.map(item => `<li>${item.cantidad} x ${getPlatoName(item.id)}</li>`).join('')}
            </ul>
        `;
        orderHistoryContainer.appendChild(orderDiv);
    });
}

function loadRecurringOrders() {
    const user = JSON.parse(localStorage.getItem('loggedInUser'));
    if (!user) {
        alert('Por favor, inicie sesión para ver sus pedidos recurrentes.');
        return;
    }

    let recurringOrders = JSON.parse(localStorage.getItem('recurringOrders')) || [];
    const userRecurringOrders = recurringOrders.filter(order => order.user === user.username);
    const recurringOrdersContainer = document.getElementById('recurring-orders-container');
    recurringOrdersContainer.innerHTML = ''; // Limpiar contenido anterior

    if (userRecurringOrders.length === 0) {
        recurringOrdersContainer.innerHTML = '<p>No tiene pedidos recurrentes.</p>';
        return;
    }

    userRecurringOrders.forEach(order => {
        const orderDiv = document.createElement('div');
        orderDiv.className = 'order-item';
        orderDiv.innerHTML = `
            <h5>Pedido ${order.id}</h5>
            <p>Fecha: ${new Date(order.date).toLocaleString()}</p>
            <p>Fecha de entrega: ${order.deliveryDate} ${order.deliveryTime}</p>
            <p>Estado: ${order.status}</p>
            <p>Recurrencia: ${order.recurrence}</p>
            <ul>
                ${order.items.map(item => `<li>${item.cantidad} x ${getPlatoName(item.id)}</li>`).join('')}
            </ul>
            <button onclick="cancelRecurringOrder(${order.id})" class="btn btn-danger">Cancelar Pedido Recurrente</button>
        `;
        recurringOrdersContainer.appendChild(orderDiv);
    });
}

function getPlatoName(platoId) {
    const platos = JSON.parse(localStorage.getItem('platos')) || [];
    const plato = platos.find(p => p.id === platoId);
    return plato ? plato.nombre : 'Desconocido';
}

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
        loadPendingOrders(); // Recargar los pedidos pendientes
    } else {
        alert('No se puede cancelar este pedido.');
    }
}

function cancelRecurringOrder(orderId) {
    const user = JSON.parse(localStorage.getItem('loggedInUser'));
    if (!user) {
        alert('Por favor, inicie sesión para cancelar pedidos recurrentes.');
        return;
    }

    let recurringOrders = JSON.parse(localStorage.getItem('recurringOrders')) || [];
    recurringOrders = recurringOrders.filter(order => order.id !== orderId || order.user !== user.username);
    localStorage.setItem('recurringOrders', JSON.stringify(recurringOrders));
    alert('Pedido recurrente cancelado con éxito.');
    loadRecurringOrders(); // Recargar los pedidos recurrentes
}

function logout() {
    localStorage.removeItem('loggedInUser');
    window.location.href = 'index.html';
}

function handleViewCartClick() {
    const user = JSON.parse(localStorage.getItem('loggedInUser'));
    if (user) {
        $('#cartModal').modal('show');
        viewCart();
    } else {
        $('#loginOrRegisterModal').modal('show');
    }
}

function viewCart() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    Promise.all([
        fetch('data/platos.json').then(response => response.json()),
        fetch('data/proveedores.json').then(response => response.json())
    ]).then(([platos, proveedores]) => {
        const cartContainer = document.getElementById('cart-items');
        cartContainer.innerHTML = ''; // Limpiar el contenido antes de agregar nuevos elementos
        cart.forEach(cartItem => {
            const plato = platos.find(p => p.id === cartItem.id);
            const proveedor = proveedores.find(prov => prov.id === plato.proveedorId);
            const ingredientes = cartItem.ingredientes.join(', ');
            const platoDiv = document.createElement('div');
            platoDiv.className = 'cart-item';
            platoDiv.innerHTML = `
                <h3>${plato.nombre}</h3>
                <p>Ingredientes: ${ingredientes}</p>
                <p>Proveedor: ${proveedor.nombre}</p>
                <p>Precio: $${plato.precio.toFixed(2)}</p>
                <p>Cantidad: ${cartItem.cantidad}</p>
                <button onclick="removeFromCart(${plato.id})" class="btn btn-danger">Eliminar</button>
            `;
            cartContainer.appendChild(platoDiv);
        });
    }).catch(error => console.error('Error:', error));
}

function removeFromCart(platoId) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart = cart.filter(item => item.id !== platoId);
    localStorage.setItem('cart', JSON.stringify(cart));
    viewCart();
}
