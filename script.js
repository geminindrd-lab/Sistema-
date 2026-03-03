// ===============================
// GERENCIAR MESAS
// ===============================

function addTable() {
    let number = prompt("Número da mesa:");
    if (!number) return;

    let tables = JSON.parse(localStorage.getItem("tables")) || [];

    tables.push({
        id: Date.now(),
        number: number,
        status: "Livre"
    });

    localStorage.setItem("tables", JSON.stringify(tables));
    renderTables();
}

function renderTables() {
    let tables = JSON.parse(localStorage.getItem("tables")) || [];
    let container = document.getElementById("table-list");

    container.innerHTML = "";

    tables.forEach(table => {
        container.innerHTML += `
            <div class="item">
                Mesa ${table.number} - ${table.status}
                <button onclick="deleteTable(${table.id})">❌</button>
            </div>
        `;
    });
}

function deleteTable(id) {
    let tables = JSON.parse(localStorage.getItem("tables")) || [];
    tables = tables.filter(t => t.id !== id);
    localStorage.setItem("tables", JSON.stringify(tables));
    renderTables();
}

// ===============================
// GERENCIAR GARÇONS
// ===============================

function addWaiter() {
    let name = prompt("Nome do garçom:");
    if (!name) return;

    let waiters = JSON.parse(localStorage.getItem("waiters")) || [];

    waiters.push({
        id: Date.now(),
        name: name
    });

    localStorage.setItem("waiters", JSON.stringify(waiters));
    renderWaiters();
}

function renderWaiters() {
    let waiters = JSON.parse(localStorage.getItem("waiters")) || [];
    let container = document.getElementById("waiter-list");

    container.innerHTML = "";

    waiters.forEach(waiter => {
        container.innerHTML += `
            <div class="item">
                👨‍🍳 ${waiter.name}
                <button onclick="deleteWaiter(${waiter.id})">❌</button>
            </div>
        `;
    });
}

function deleteWaiter(id) {
    let waiters = JSON.parse(localStorage.getItem("waiters")) || [];
    waiters = waiters.filter(w => w.id !== id);
    localStorage.setItem("waiters", JSON.stringify(waiters));
    renderWaiters();
}

// ===============================
// RESETAR SISTEMA
// ===============================

function resetSystem() {
    if (confirm("Tem certeza que deseja apagar tudo?")) {
        localStorage.clear();
        location.reload();
    }
}

// ===============================
// CARREGAR AO ABRIR
// ===============================

document.addEventListener("DOMContentLoaded", () => {
    renderTables();
    renderWaiters();
});
const currentUser = JSON.parse(localStorage.getItem('currentUser'));

if (window.location.href.includes('painel-adm')) {
    if (!currentUser || currentUser.role !== 'adm') {
        alert("Acesso negado!");
        window.location.href = "login.html";
    }
}
const DB = {
    get: (key) => JSON.parse(localStorage.getItem(key) || '[]'),
    set: (key, data) => localStorage.setItem(key, JSON.stringify(data)),
    init: () => {
        if (!localStorage.getItem('products')) {
            DB.set('products', [
                { id: 1, name: 'X-Bacon', price: 25.00, category: 'Lanches' },
                { id: 2, name: 'Coca-Cola 350ml', price: 6.00, category: 'Bebidas' }
            ]);
        }
        if (!localStorage.getItem('users')) {
            if (!localStorage.getItem('users')) {
    DB.set('users', [
        { id: 1, name: 'Admin', role: 'adm', pass: '1234' }, // <--- MUDE AQUI PARA 'adm'
        { id: 2, name: 'João', role: 'garcom', pass: '1111' },
        { id: 3, name: 'Cozinha', role: 'cozinha', pass: '2222' },
        { id: 4, name: 'Caixa', role: 'caixa', pass: '3333' }
    ]);
}
        }
        if (!localStorage.getItem('tables')) {
            // Cria 10 mesas padrão
            const tables = Array.from({length: 10}, (_, i) => ({ id: i+1, number: i+1, status: 'livre', total: 0 }));
            DB.set('tables', tables);
        }
        if (!localStorage.getItem('orders')) DB.set('orders', []);
    }
};

// Inicializa o sistema
DB.init();

// --- FUNÇÕES GERAIS ---
function formatPrice(value) {
    return parseFloat(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function showAlert(msg) {
    alert(msg); // Pode ser substituído por um toast mais bonito
}

function logout() {
    window.location.href = 'login.html';
}

// --- LÓGICA DE LOGIN ---
if (document.getElementById('login-form')) {
    document.getElementById('login-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const role = document.getElementById('role').value;
        const pass = document.getElementById('password').value;
        
        const users = DB.get('users');
        const user = users.find(u => u.role === role && u.pass === pass);

        if (user) {
            localStorage.setItem('currentUser', JSON.stringify(user));
            window.location.href = `painel-${role}.html`;
        } else {
            showAlert('Senha incorreta!');
        }
    });
}

// --- LÓGICA PAINEL GARÇOM ---
if (window.location.href.includes('garcom')) {
    let currentTable = null;
    let cart = [];

    function renderTables() {
        const container = document.getElementById('tables-container');
        const tables = DB.get('tables');
        container.innerHTML = '';
        tables.forEach(t => {
            const div = document.createElement('div');
            div.className = `mesa-card ${t.status === 'ocupada' ? 'ocupada' : ''}`;
            div.innerText = `Mesa ${t.number}`;
            div.onclick = () => openTableModal(t);
            container.appendChild(div);
        });
    }

    function openTableModal(table) {
        currentTable = table;
        document.getElementById('modal-title').innerText = `Pedido - Mesa ${table.number}`;
        document.getElementById('order-modal').classList.remove('hidden');
        document.getElementById('main-view').classList.add('hidden');
        cart = [];
        renderProducts();
        renderCart();
    }

    function renderProducts() {
        const list = document.getElementById('product-list');
        const products = DB.get('products');
        list.innerHTML = '';
        products.forEach(p => {
            const item = document.createElement('div');
            item.className = 'item-list';
            item.innerHTML = `
                <div class="item-info">
                    <h4>${p.name}</h4>
                    <span class="item-price">${formatPrice(p.price)}</span>
                </div>
                <button class="btn-success" style="width:auto; padding:5px 15px" onclick="addToCart(${p.id})">+</button>
            `;
            list.appendChild(item);
        });
    }

    window.addToCart = (id) => {
        const product = DB.get('products').find(p => p.id === id);
        cart.push(product);
        renderCart();
    }

    function renderCart() {
        const list = document.getElementById('cart-list');
        list.innerHTML = '';
        let total = 0;
        cart.forEach((p, index) => {
            total += p.price;
            list.innerHTML += `<div class="item-list"><small>${p.name}</small> <small onclick="cart.splice(${index},1); renderCart()" style="color:red; cursor:pointer">X</small></div>`;
        });
        document.getElementById('cart-total').innerText = formatPrice(total);
    }

    document.getElementById('send-order').addEventListener('click', () => {
        if (cart.length === 0) return showAlert('Adicione produtos!');
        
        // Atualiza status da mesa
        const tables = DB.get('tables');
        const tableIdx = tables.findIndex(t => t.id === currentTable.id);
        tables[tableIdx].status = 'ocupada';
        tables[tableIdx].total += cart.reduce((acc, item) => acc + item.price, 0);
        DB.set('tables', tables);

        // Cria o pedido para a cozinha
        const orders = DB.get('orders');
        const newOrder = {
            id: Date.now(),
            table: currentTable.number,
            items: cart,
            obs: document.getElementById('order-obs').value,
            status: 'pendente',
            time: new Date().toLocaleTimeString(),
            waiter: JSON.parse(localStorage.getItem('currentUser')).name
        };
        orders.push(newOrder);
        DB.set('orders', orders);

        showAlert('Pedido enviado para cozinha!');
        window.location.reload();
    });

    document.getElementById('close-modal').addEventListener('click', () => window.location.reload());
    renderTables();
}

// --- LÓGICA PAINEL COZINHA ---
if (window.location.href.includes('cozinha')) {
    function loadOrders() {
        const container = document.getElementById('kitchen-orders');
        const orders = DB.get('orders').filter(o => o.status === 'pendente');
        container.innerHTML = '';
        
        if(orders.length === 0) container.innerHTML = '<p style="text-align:center; color:#999">Sem pedidos pendentes</p>';

        orders.forEach(o => {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <div style="display:flex; justify-content:space-between; margin-bottom:10px">
                    <h3 style="color:var(--primary)">Mesa ${o.table}</h3>
                    <span>${o.time}</span>
                </div>
                <p><strong>Garçom:</strong> ${o.waiter}</p>
                <ul style="margin:10px 0; padding-left:20px">
                    ${o.items.map(i => `<li>${i.name}</li>`).join('')}
                </ul>
                ${o.obs ? `<p style="color:var(--primary); font-style:italic">Obs: ${o.obs}</p>` : ''}
                <button class="btn btn-success" style="margin-top:10px" onclick="finishOrder(${o.id})">Pronto / Entregar</button>
            `;
            container.appendChild(card);
        });
    }

    window.finishOrder = (id) => {
        const orders = DB.get('orders');
        const idx = orders.findIndex(o => o.id === id);
        orders[idx].status = 'pronto';
        DB.set('orders', orders);
        loadOrders();
    };

    // Atualiza a cada 5 segundos
    setInterval(loadOrders, 5000);
    loadOrders();
}

// --- LÓGICA PAINEL CAIXA ---
if (window.location.href.includes('caixa')) {
    function loadOpenTables() {
        const container = document.getElementById('checkout-list');
        const tables = DB.get('tables').filter(t => t.status === 'ocupada');
        container.innerHTML = '';

        if(tables.length === 0) container.innerHTML = '<p style="text-align:center">Nenhuma mesa aberta</p>';

        tables.forEach(t => {
            const div = document.createElement('div');
            div.className = 'card';
            div.innerHTML = `
                <div class="item-list">
                    <h3>Mesa ${t.number}</h3>
                    <h3 class="item-price">${formatPrice(t.total)}</h3>
                </div>
                <button class="btn btn-primary" onclick="closeTable(${t.id})">Fechar Conta</button>
            `;
            container.appendChild(div);
        });
    }

    window.closeTable = (id) => {
        const method = prompt("Forma de Pagamento (Dinheiro, Pix, Cartão):", "Pix");
        if(method) {
            const tables = DB.get('tables');
            const idx = tables.findIndex(t => t.id === id);
            
            // Salvar no histórico (Simples)
            const sales = JSON.parse(localStorage.getItem('sales') || '[]');
            sales.push({
                date: new Date().toLocaleString(),
                table: tables[idx].number,
                total: tables[idx].total,
                method: method
            });
            localStorage.setItem('sales', JSON.stringify(sales));

            // Resetar mesa
            tables[idx].status = 'livre';
            tables[idx].total = 0;
            DB.set('tables', tables);
            
            showAlert(`Conta Mesa ${tables[idx].number} Finalizada!`);
            loadOpenTables();
        }
    };

    loadOpenTables();
}

// --- LÓGICA PAINEL ADM ---
if (window.location.href.includes('adm')) {
    function loadDashboard() {
        const sales = JSON.parse(localStorage.getItem('sales') || '[]');
        const total = sales.reduce((acc, s) => acc + s.total, 0);
        document.getElementById('today-sales').innerText = formatPrice(total);
        document.getElementById('sales-count').innerText = sales.length;
    }

    // Funções simples de produtos
    window.renderAdmProducts = () => {
        const list = document.getElementById('adm-product-list');
        const products = DB.get('products');
        list.innerHTML = '';
        products.forEach(p => {
            list.innerHTML += `
            <div class="item-list">
                <span>${p.name}</span>
                <span>${formatPrice(p.price)}</span>
                <span onclick="deleteProduct(${p.id})" style="color:red; cursor:pointer">Excluir</span>
            </div>`;
        });
    }

    window.addProduct = () => {
        const name = prompt("Nome do Produto:");
        const price = parseFloat(prompt("Preço (ex: 20.50):"));
        if(name && price) {
            const products = DB.get('products');
            products.push({ id: Date.now(), name, price, category: 'Geral' });
            DB.set('products', products);
            renderAdmProducts();
        }
    }

    window.deleteProduct = (id) => {
        if(confirm("Tem certeza?")) {
            const products = DB.get('products').filter(p => p.id !== id);
            DB.set('products', products);
            renderAdmProducts();
        }
    }
    
    window.resetSystem = () => {
        if(confirm("ATENÇÃO: Isso apagará TODOS os dados. Continuar?")) {
            localStorage.clear();
            alert("Sistema resetado!");
            window.location.reload();
        }
    }

    if(document.getElementById('adm-product-list')) {
        renderAdmProducts();
        loadDashboard();
    }
}