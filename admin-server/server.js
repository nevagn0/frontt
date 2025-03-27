const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8080;
const PRODUCTS_FILE = path.join(__dirname, 'products.json');

const server = http.createServer((req, res) => {
    if (req.url === '/' && req.method === 'GET') {
        // Отдаем HTML-страницу
        fs.readFile(path.join(__dirname, 'index.html'), (err, data) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Ошибка сервера');
            } else {
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(data);
            }
        });
    } else if (req.url === '/products' && req.method === 'GET') {
        // Обработка GET /products
        fs.readFile(PRODUCTS_FILE, (err, data) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Ошибка сервера');
            } else {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(data);
            }
        });
    } else if (req.url === '/products' && req.method === 'POST') {
        // Обработка POST /products
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            const newProduct = JSON.parse(body);
            fs.readFile(PRODUCTS_FILE, (err, data) => {
                if (err) {
                    res.writeHead(500, { 'Content-Type': 'text/plain' });
                    res.end('Ошибка сервера');
                } else {
                    const products = JSON.parse(data);
                    products.push(newProduct);
                    fs.writeFile(PRODUCTS_FILE, JSON.stringify(products, null, 2), err => {
                        if (err) {
                            res.writeHead(500, { 'Content-Type': 'text/plain' });
                            res.end('Ошибка сервера');
                        } else {
                            res.writeHead(201, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify(newProduct));
                        }
                    });
                }
            });
        });
    } else if (req.url.startsWith('/products/') && req.method === 'PUT') {
        // Обработка PUT /products/:id
        const productId = parseInt(req.url.split('/')[2]);
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            const updatedProduct = JSON.parse(body);
            fs.readFile(PRODUCTS_FILE, (err, data) => {
                if (err) {
                    res.writeHead(500, { 'Content-Type': 'text/plain' });
                    res.end('Ошибка сервера');
                } else {
                    let products = JSON.parse(data);
                    const index = products.findIndex(p => p.id === productId);
                    if (index !== -1) {
                        products[index] = { ...products[index], ...updatedProduct };
                        fs.writeFile(PRODUCTS_FILE, JSON.stringify(products, null, 2), err => {
                            if (err) {
                                res.writeHead(500, { 'Content-Type': 'text/plain' });
                                res.end('Ошибка сервера');
                            } else {
                                res.writeHead(200, { 'Content-Type': 'application/json' });
                                res.end(JSON.stringify(products[index]));
                            }
                        });
                    } else {
                        res.writeHead(404, { 'Content-Type': 'text/plain' });
                        res.end('Товар не найден');
                    }
                }
            });
        });
    } else if (req.url.startsWith('/products/') && req.method === 'DELETE') {
        // Обработка DELETE /products/:id
        const productId = parseInt(req.url.split('/')[2]);
        fs.readFile(PRODUCTS_FILE, (err, data) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Ошибка сервера');
            } else {
                let products = JSON.parse(data);
                const index = products.findIndex(p => p.id === productId);
                if (index !== -1) {
                    products.splice(index, 1);
                    fs.writeFile(PRODUCTS_FILE, JSON.stringify(products, null, 2), err => {
                        if (err) {
                            res.writeHead(500, { 'Content-Type': 'text/plain' });
                            res.end('Ошибка сервера');
                        } else {
                            res.writeHead(200, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ message: 'Товар удален' }));
                        }
                    });
                } else {
                    res.writeHead(404, { 'Content-Type': 'text/plain' });
                    res.end('Товар не найден');
                }
            }
        });
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Страница не найдена');
    }
});

server.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});