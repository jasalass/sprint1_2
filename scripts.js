document.addEventListener("DOMContentLoaded", function () {
    checkLoginStatus();
});

function checkLoginStatus() {
    const user = JSON.parse(localStorage.getItem('loggedInUser'));
    if (user) {
        if (user.role === 'delivery') {
            loadNavbar(user);
            loadDeliveryProfile(user);
        } else {
            loadNavbar(user);
            loadTopPlatos();
        }
    } else {
        loadNavbar();
        loadTopPlatos();
    }
}


function loadNavbar(user = null) {
    const navbar = `
        <nav class="navbar navbar-expand-lg navbar-light bg-light">
            <a class="navbar-brand" href="#">Pedidos de Comida</a>
            <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav">
                    <li class="nav-item">
                        <a class="nav-link" href="menu.html">Menú</a>
                    </li>
                </ul>
                <ul class="navbar-nav ml-auto">
                    ${user ? `
                        <li class="nav-item">
                            <span class="navbar-text">Hola, ${user.username}</span>
                        </li>
                        ${user.role === 'admin' ? `
                            <li class="nav-item">
                                <a class="nav-link" href="admin.html">Reportes</a>
                            </li>
                        ` : ''}
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


function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    fetch('data/usuarios.json')
        .then(response => response.json())
        .then(users => {
            const user = users.find(u => u.username === username && u.password === password);
            if (user) {
                localStorage.setItem('loggedInUser', JSON.stringify(user));
                alert('Login exitoso');
                if (user.role === 'admin') {
                    window.location.href = 'admin.html'; // Redirigir a la página de administración
                } else if (user.role === 'delivery') {
                    window.location.href = 'delivery.html'; // Redirigir a la página de delivery
                } else {
                    window.location.href = 'menu.html'; // Redirigir a la página de menú para usuarios regulares
                }
            } else {
                alert('Usuario o contraseña incorrectos');
            }
        })
        .catch(error => console.error('Error:', error));
}


function register() {
    const newUsername = document.getElementById('newUsername').value;
    const newPassword = document.getElementById('newPassword').value;
    const address = document.getElementById('address').value;
    const isDelivery = document.getElementById('isDelivery').checked;

    fetch('data/usuarios.json')
        .then(response => response.json())
        .then(users => {
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
                localStorage.setItem('usuarios', JSON.stringify(users));
                alert('Registro exitoso');
                $('#registerModal').modal('hide');
            }
        })
        .catch(error => console.error('Error:', error));
}

function loadTopPlatos() {
    fetch('data/platos.json')
        .then(response => response.json())
        .then(platos => {
            const topPlatos = platos.sort((a, b) => a.precio - b.precio).slice(0, 3);
            const topPlatosContainer = document.getElementById('top-platos');
            topPlatos.forEach(plato => {
                const platoDiv = document.createElement('div');
                platoDiv.className = 'col-md-4';
                platoDiv.innerHTML = `
                    <div class="card mb-4">
                        <div class="card-body">
                            <h5 class="card-title">${plato.nombre}</h5>
                            <p class="card-text">Ingredientes: ${plato.ingredientes.join(', ')}</p>
                            <p class="card-text">Precio: $${plato.precio.toFixed(2)}</p>
                            <button class="btn btn-primary" onclick="orderPlato(${plato.id})">Pedir</button>
                        </div>
                    </div>
                `;
                topPlatosContainer.appendChild(platoDiv);
            });
        })
        .catch(error => console.error('Error:', error));
}

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
    const cartContainer = document.getElementById('cart-items');
    cartContainer.innerHTML = '';

    if (cart.length === 0) {
        cartContainer.innerHTML = '<p>El carrito está vacío.</p>';
        return;
    }

    Promise.all([
        fetch('data/platos.json').then(response => response.json()),
        fetch('data/proveedores.json').then(response => response.json())
    ]).then(([platos, proveedores]) => {
        cart.forEach(cartItem => {
            const plato = platos.find(p => p.id === cartItem.id);
            const proveedor = proveedores.find(prov => prov.id === plato.proveedorId);
            const ingredientes = cartItem.ingredientes.join(', ');

            const platoDiv = document.createElement('div');
            platoDiv.className = 'cart-item';
            platoDiv.innerHTML = `
                <div class="card mb-3">
                    <div class="card-body">
                        <h5 class="card-title">${plato.nombre}</h5>
                        <p class="card-text">Ingredientes: ${ingredientes}</p>
                        <p class="card-text">Proveedor: ${proveedor.nombre}</p>
                        <p class="card-text">Precio: $${plato.precio.toFixed(2)}</p>
                        <p class="card-text">Cantidad: ${cartItem.cantidad}</p>
                        <button onclick="removeFromCart(${plato.id})" class="btn btn-danger">Eliminar</button>
                    </div>
                </div>
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

function logout() {
    localStorage.removeItem('loggedInUser');
    window.location.href = 'index.html';
}
