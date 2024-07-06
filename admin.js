document.addEventListener("DOMContentLoaded", function () {
    const user = JSON.parse(localStorage.getItem('loggedInUser'));
    if (!user || user.role !== 'admin') {
        window.location.href = 'index.html';
    } else {
        loadNavbar(user);
        loadStatistics();
    }
});

function loadNavbar(user) {
    const navbar = `
        <nav class="navbar navbar-expand-lg navbar-light bg-light">
            <a class="navbar-brand" href="#">Pedidos de Comida</a>
            <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav">
                    <li class="nav-item">
                        <a class="nav-link" href="index.html">Inicio</a>
                    </li>
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

function loadStatistics() {
    fetch('data/pedidos.json')
        .then(response => response.json())
        .then(pedidos => {
            const totalOrders = pedidos.length;
            const totalEarnings = pedidos.reduce((acc, pedido) => {
                return acc + pedido.items.reduce((sum, item) => sum + item.cantidad * item.precio, 0);
            }, 0);

            const ordersPerDay = {};
            const earningsPerDay = {};
            const popularDishes = {};
            const users = new Set();

            pedidos.forEach(pedido => {
                const date = new Date(pedido.date).toLocaleDateString();
                ordersPerDay[date] = (ordersPerDay[date] || 0) + 1;
                earningsPerDay[date] = (earningsPerDay[date] || 0) + pedido.items.reduce((sum, item) => sum + item.cantidad * item.precio, 0);
                pedido.items.forEach(item => {
                    popularDishes[item.nombre] = (popularDishes[item.nombre] || 0) + item.cantidad;
                });
                users.add(pedido.user);
            });

            const ordersChartLabels = Object.keys(ordersPerDay);
            const ordersChartData = Object.values(ordersPerDay);
            const earningsChartLabels = Object.keys(earningsPerDay);
            const earningsChartData = Object.values(earningsPerDay);
            const popularDishesChartLabels = Object.keys(popularDishes);
            const popularDishesChartData = Object.values(popularDishes);
            const usersChartData = [users.size, totalOrders];

            createChart('ordersChart', 'Pedidos por Día', ordersChartLabels, ordersChartData);
            createChart('earningsChart', 'Ganancias por Día', earningsChartLabels, earningsChartData);
            createChart('popularDishesChart', 'Platos Populares', popularDishesChartLabels, popularDishesChartData);
            createChart('usersChart', 'Usuarios y Pedidos', ['Usuarios', 'Pedidos'], usersChartData);
        })
        .catch(error => console.error('Error:', error));
}

function createChart(elementId, label, labels, data) {
    const ctx = document.getElementById(elementId).getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: label,
                data: data,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}
