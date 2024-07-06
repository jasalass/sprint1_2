let selectedOrder = null;

document.addEventListener("DOMContentLoaded", function () {
    const user = JSON.parse(localStorage.getItem('loggedInUser'));
    if (!user || user.role !== 'delivery') {
        window.location.href = 'index.html';
    } else {
        loadNavbar(user);
        loadDeliveryOrders();
    }
});

function loadNavbar(user) {
    const navbar = `
        <nav class="navbar navbar-expand-lg navbar-light bg-light">
            <a class="navbar-brand" href="delivery.html">El Comilón</a>
            <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav">
                    ${user.role !== 'delivery' ? `
                    <li class="nav-item">
                        <a class="nav-link" href="menu.html">Menú</a>
                    </li>
                    ` : ''}
                    ${user.role === 'delivery' ? `
                    <li class="nav-item">
                        <a class="nav-link" href="delivery.html">Pedidos Disponibles</a>
                    </li>
                    ` : ''}
                </ul>
                <ul class="navbar-nav ml-auto">
                    <li class="nav-item">
                        <span class="navbar-text">Hola, ${user.username}</span>
                    </li>
                    <li class="nav-item">
                        <button class="btn btn-outline-secondary ml-2" onclick="logout()">Logout</button>
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

function loadDeliveryOrders() {
    fetch('data/pedidos.json')
        .then(response => response.json())
        .then(pedidos => {
            const ordersContainer = document.getElementById('pending-orders');
            ordersContainer.innerHTML = ''; // Limpiar el contenido antes de agregar nuevos elementos
            
            const pendingOrders = pedidos.filter(pedido => pedido.status === 'pending');
            pendingOrders.forEach(pedido => {
                const orderDiv = document.createElement('div');
                orderDiv.className = 'col-md-12 mb-3';
                
                const items = pedido.items.map(item => `
                    <li>${item.cantidad} x ${item.nombre} (Ingredientes: ${item.ingredientes.join(', ')})</li>
                `).join('');

                orderDiv.innerHTML = `
                    <div class="card">
                        <div class="card-body">
                            <h5 class="card-title">Pedido de ${pedido.user}</h5>
                            <p class="card-text">Fecha: ${new Date(pedido.date).toLocaleString()}</p>
                            <p class="card-text">Dirección: ${pedido.address}</p>
                            <ul>${items}</ul>
                            <button class="btn btn-primary" onclick="showRoute('${pedido.user}', '${pedido.date}', '${pedido.address}')">Tomar Pedido</button>
                        </div>
                    </div>
                `;
                ordersContainer.appendChild(orderDiv);
            });
        })
        .catch(error => console.error('Error:', error));
}

function showRoute(username, date, address) {
    selectedOrder = { username, date, address };
    $('#routeModal').modal('show');
    initMap(address);
}

function initMap(address) {
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ 'address': address }, function(results, status) {
        if (status === 'OK') {
            const mapOptions = {
                zoom: 15,
                center: results[0].geometry.location
            };
            const map = new google.maps.Map(document.getElementById('map'), mapOptions);
            const marker = new google.maps.Marker({
                map: map,
                position: results[0].geometry.location
            });
        } else {
            alert('Geocode was not successful for the following reason: ' + status);
        }
    });
}

function confirmDelivery() {
    fetch('data/pedidos.json')
        .then(response => response.json())
        .then(pedidos => {
            const pedido = pedidos.find(p => p.user === selectedOrder.username && p.date === selectedOrder.date);
            if (pedido) {
                pedido.status = 'entregada'; // Cambia el estado del pedido a "entregada"
                localStorage.setItem('pedidos', JSON.stringify(pedidos));
                alert('Pedido entregado');
                $('#routeModal').modal('hide');
                loadDeliveryOrders(); // Recargar la lista de pedidos
            } else {
                alert('No se encontró el pedido.');
            }
        })
        .catch(error => console.error('Error:', error));
}
