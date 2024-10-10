let db;

function initDB() {
    const request = indexedDB.open('estoqueDB', 1);

    request.onupgradeneeded = (event) => {
        db = event.target.result;
        db.createObjectStore('produtos', { keyPath: 'id', autoIncrement: true });
    };

    request.onsuccess = (event) => {
        db = event.target.result;
        carregarProdutos();
    };

    request.onerror = (event) => {
        console.error('Erro ao abrir o banco de dados:', event);
    };
}

function adicionarProduto() {
    const nome = document.getElementById('nome').value;
    const marca = document.getElementById('marca').value;
    const quantidade = parseInt(document.getElementById('quantidade').value);

    const transaction = db.transaction(['produtos'], 'readwrite');
    const store = transaction.objectStore('produtos');
    
    const produto = { nome, marca, quantidade };
    store.add(produto);

    transaction.oncomplete = () => {
        carregarProdutos();
        limparCampos();
    };
}

function carregarProdutos() {
    const tabela = document.getElementById('tabela').getElementsByTagName('tbody')[0];
    tabela.innerHTML = '';

    const transaction = db.transaction(['produtos'], 'readonly');
    const store = transaction.objectStore('produtos');

    store.openCursor().onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
            const novaLinha = tabela.insertRow();
            novaLinha.innerHTML = `
                <td>${cursor.value.nome}</td>
                <td>${cursor.value.marca}</td>
                <td>${cursor.value.quantidade}</td>
                <td>
                    <button onclick="editarProduto(${cursor.value.id})">Editar</button>
                    <button onclick="removerProduto(${cursor.value.id})">Remover</button>
                </td>
            `;
            cursor.continue();
        }
    };
}

function buscarProduto() {
    const searchValue = document.getElementById('search').value.toLowerCase();
    const tabela = document.getElementById('tabela').getElementsByTagName('tbody')[0];
    tabela.innerHTML = '';

    const transaction = db.transaction(['produtos'], 'readonly');
    const store = transaction.objectStore('produtos');

    store.openCursor().onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
            if (cursor.value.nome.toLowerCase().includes(searchValue)) {
                const novaLinha = tabela.insertRow();
                novaLinha.innerHTML = `
                    <td>${cursor.value.nome}</td>
                    <td>${cursor.value.marca}</td>
                    <td>${cursor.value.quantidade}</td>
                    <td>
                        <button onclick="editarProduto(${cursor.value.id})">Editar</button>
                        <button onclick="removerProduto(${cursor.value.id})">Remover</button>
                    </td>
                `;
            }
            cursor.continue();
        }
    };
}

function editarProduto(id) {
    const transaction = db.transaction(['produtos'], 'readonly');
    const store = transaction.objectStore('produtos');

    store.get(id).onsuccess = (event) => {
        const produto = event.target.result;
        document.getElementById('nome').value = produto.nome;
        document.getElementById('marca').value = produto.marca;
        document.getElementById('quantidade').value = produto.quantidade;

        removerProduto(id);
    };
}

function removerProduto(id) {
    const transaction = db.transaction(['produtos'], 'readwrite');
    const store = transaction.objectStore('produtos');
    store.delete(id);

    transaction.oncomplete = () => {
        carregarProdutos();
    };
}

function limparCampos() {
    document.getElementById('nome').value = '';
    document.getElementById('marca').value = '';
    document.getElementById('quantidade').value = '';
    document.getElementById('search').value = '';  // Limpar campo de busca
}

window.onload = initDB;
