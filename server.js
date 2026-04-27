const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const DATA_PATH = path.join(__dirname, 'data.json');

/**
 * Utility to read data from the JSON file
 */
const readData = () => {
    try {
        const data = fs.readFileSync(DATA_PATH, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        return [];
    }
};

const server = http.createServer((req, res) => {
    const { method, url } = req;

    // Set Default Header
    res.setHeader('Content-Type', 'application/json');

    // 1. GET ALL RECORDS (GET /api/records)
    if (method === 'GET' && url === '/api/records') {
        const records = readData();
        res.writeHead(200);
        res.end(JSON.stringify(records));
    } 
    
    // 2. GET SINGLE RECORD (GET /api/records/:id)
    else if (method === 'GET' && url.startsWith('/api/records/')) {
        const id = url.split('/')[3];
        const records = readData();
        const record = records.find(r => r.id === id);

        if (record) {
            res.writeHead(200);
            res.end(JSON.stringify(record));
        } else {
            res.writeHead(404);
            res.end(JSON.stringify({ message: "Record not found" }));
        }
    } 
    
    // Fallback for unknown routes
    else {
        // If it's a POST, PUT, or DELETE request, we'll handle those in the next chats
        if (['POST', 'PUT', 'DELETE'].includes(method)) {
            res.writeHead(501);
            res.end(JSON.stringify({ message: `${method} functionality coming in the next update!` }));
        } else {
            res.writeHead(404);
            res.end(JSON.stringify({ message: "Route not found" }));
        }
    }
});

server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log('Available Routes:');
    console.log('GET /api/records - Get all records');
    console.log('GET /api/records/:id - Get record by ID');
});
