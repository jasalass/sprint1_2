document.addEventListener("DOMContentLoaded", function () {
    const user = JSON.parse(localStorage.getItem('loggedInUser'));
    if (!user) {
        window.location.href = 'index.html';
    } else if (user.role === 'delivery') {
        window.location.href = 'index.html'; // Redirigir a la página de inicio si el usuario es un repartidor
    } else {
        loadMenu();
        loadFilters();
        loadNavbar(user);
    }
});

function loadNavbar(user) {
    const navbar = `
        <nav class="navbar navbar-expand-lg navbar-light bg-light">
            <a class="navbar-brand" href="#">El Comilón</a>
            <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav">
                    <li class="nav-item">
                        <a class="nav-link" href="menu.html">Menú</a>
                    </li>
                    <!-- Puedes agregar más enlaces aquí si es necesario -->
                </ul>
                <ul class="navbar-nav ml-auto">
                    <li class="nav-item">
                        <span class="navbar-text">Hola, ${user.username}</span>
                    </li>
                    <li class="nav-item">
                        <button class="btn btn-outline-secondary ml-2" onclick="logout()">Logout</button>
                    </li>
                    <li class="nav-item">
                        <button class="btn btn-secondary ml-2" onclick="handleViewCartClick()">Ver Carrito</button>
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

function handleViewCartClick() {
    const user = JSON.parse(localStorage.getItem('loggedInUser'));
    if (user) {
        $('#cartModal').modal('show');
        viewCart();
    } else {
        $('#loginOrRegisterModal').modal('show');
    }
}

function loadMenu(filtro = {}) {
    Promise.all([
        fetch('data/platos.json').then(response => response.json()),
        fetch('data/proveedores.json').then(response => response.json())
    ]).then(([platos, proveedores]) => {
        const menuContainer = document.getElementById('menu');
        menuContainer.innerHTML = ''; // Limpiar el contenido antes de agregar nuevos elementos
        
        // Filtrar platos
        let platosFiltrados = platos;
        if (filtro.tipoPlato) {
            platosFiltrados = platosFiltrados.filter(plato => plato.tipoPlato === filtro.tipoPlato);
        }
        if (filtro.tipoIngrediente) {
            platosFiltrados = platosFiltrados.filter(plato => plato.ingredientes.includes(filtro.tipoIngrediente));
        }
        if (filtro.pais) {
            platosFiltrados = platosFiltrados.filter(plato => plato.pais === filtro.pais);
        }

        platosFiltrados.forEach(plato => {
            const proveedor = proveedores.find(prov => prov.id === plato.proveedorId);
            const platoDiv = document.createElement('div');
            platoDiv.className = 'col-md-12 mb-3';
            
            // Crear checkboxes de ingredientes
            const ingredientesCheckboxes = plato.ingredientes.map(ingrediente => `
                <label>
                    <input type="checkbox" name="ingredientes-${plato.id}" value="${ingrediente}" checked> ${ingrediente}
                </label>
            `).join('<br>');
            
            platoDiv.innerHTML = `
                <div class="card">
                    <div class="row no-gutters">
                        <div class="col-md-4">
                            <img src="${plato.imagen}" class="card-img" alt="${plato.nombre}">
                        </div>
                        <div class="col-md-8">
                            <div class="card-body">
                                <h5 class="card-title">${plato.nombre}</h5>
                                <p class="card-text">Ingredientes:</p>
                                <div>${ingredientesCheckboxes}</div>
                                <p class="card-text">Precio: $${plato.precio.toFixed(2)}</p>
                                <p class="card-text">Proveedor: ${proveedor.nombre}</p>
                                <label for="cantidad-${plato.id}">Cantidad:</label>
                                <input type="number" id="cantidad-${plato.id}" name="cantidad-${plato.id}" min="1" value="1" class="form-control w-25">
                                <button onclick="addToCart(${plato.id})" class="btn btn-primary mt-2">Agregar al carrito</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            menuContainer.appendChild(platoDiv);
        });
    }).catch(error => console.error('Error:', error));
}

function loadFilters() {
    const filterContainer = document.getElementById('filters');
    filterContainer.innerHTML = `
        <label for="filterTipoPlato">Tipo de Plato:</label>
        <select id="filterTipoPlato" onchange="applyFilters()" class="form-control w-25 d-inline-block mx-2">
            <option value="">Todos</option>
            <option value="Comida rápida">Comida rápida</option>
            <option value="Comida japonesa">Comida japonesa</option>
            <option value="Comida mexicana">Comida mexicana</option>
            <option value="Comida española">Comida española</option>
            <option value="Comida peruana">Comida peruana</option>
            <option value="Comida venezolana">Comida venezolana</option>
            <option value="Ensalada">Ensalada</option>
        </select>
        <label for="filterTipoIngrediente">Tipo de Ingrediente:</label>
        <select id="filterTipoIngrediente" onchange="applyFilters()" class="form-control w-25 d-inline-block mx-2">
            <option value="">Todos</option>
            <option value="Carne">Carne</option>
            <option value="Queso">Queso</option>
            <option value="Tomate">Tomate</option>
            <option value="Lechuga">Lechuga</option>
            <option value="Pan">Pan</option>
            <option value="Masa">Masa</option>
            <option value="Salsa de Tomate">Salsa de Tomate</option>
            <option value="Pepperoni">Pepperoni</option>
            <option value="Pescado">Pescado</option>
            <option value="Arroz">Arroz</option>
            <option value="Tortilla">Tortilla</option>
        </select>
        <label for="filterPais">País:</label>
        <select id="filterPais" onchange="applyFilters()" class="form-control w-25 d-inline-block mx-2">
            <option value="">Todos</option>
            <option value="Estados Unidos">Estados Unidos</option>
            <option value="Italia">Italia</option>
            <option value="México">México</option>
            <option value="Japón">Japón</option>
            <option value="España">España</option>
            <option value="Perú">Perú</option>
            <option value="Venezuela">Venezuela</option>
        </select>
        <button onclick="resetFilters()" class="btn btn-secondary ml-2">Resetear Filtros</button>
    `;
}

function applyFilters() {
    const tipoPlato = document.getElementById('filterTipoPlato').value;
    const tipoIngrediente = document.getElementById('filterTipoIngrediente').value;
    const pais = document.getElementById('filterPais').value;
    const filtro = {
        tipoPlato: tipoPlato || null,
        tipoIngrediente: tipoIngrediente || null,
        pais: pais || null
    };
    loadMenu(filtro);
}

function resetFilters() {
    document.getElementById('filterTipoPlato').value = "";
    document.getElementById('filterTipoIngrediente').value = "";
    document.getElementById('filterPais').value = "";
    loadMenu();
}

function addToCart(platoId) {
    const cantidad = parseInt(document.getElementById(`cantidad-${platoId}`).value, 10);
    const selectedIngredientes = Array.from(document.querySelectorAll(`input[name="ingredientes-${platoId}"]:checked`))
                                      .map(checkbox => checkbox.value);
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const itemIndex = cart.findIndex(item => item.id === platoId);

    if (itemIndex > -1) {
        cart[itemIndex].cantidad += cantidad;
        cart[itemIndex].ingredientes = selectedIngredientes;
    } else {
        cart.push({ id: platoId, cantidad: cantidad, ingredientes: selectedIngredientes });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    alert('Plato agregado al carrito');
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

function confirmOrder() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const user = JSON.parse(localStorage.getItem('loggedInUser'));
    if (cart.length === 0) {
        alert('El carrito está vacío.');
        return;
    }
    
    const newOrder = {
        user: user.username,
        address: user.address, // Añadir la dirección del usuario al pedido
        items: cart,
        status: 'pending',
        date: new Date().toISOString()
    };

    // Simulación de éxito o error de la confirmación del pedido
    const success = Math.random() > 0.2; // 80% de probabilidad de éxito

    if (success) {
        alert('Redirigiendo a la página de pago...');
        fetch('data/pedidos.json')
            .then(response => response.json())
            .then(pedidos => {
                pedidos.push(newOrder);
                localStorage.setItem('pedidos', JSON.stringify(pedidos));
                localStorage.removeItem('cart');
                alert('Pedido confirmado');
            })
            .catch(error => {
                console.error('Error:', error);
                // Guardar en localStorage si hay un error con el fetch
                let localPedidos = JSON.parse(localStorage.getItem('pedidos')) || [];
                localPedidos.push(newOrder);
                localStorage.setItem('pedidos', JSON.stringify(localPedidos));
                localStorage.removeItem('cart');
                alert('Pedido confirmado (almacenado localmente)');
            });
    } else {
        alert('Hubo un error al procesar el pedido. Por favor, inténtelo de nuevo.');
    }
}
