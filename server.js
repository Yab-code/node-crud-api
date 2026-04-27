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

/**
 * Utility to write data to the JSON file
 */
const writeData = (data) => {
    fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
};

/**
 * Helper to get the body from a request stream
 */
const getBodyData = (req) => {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', (chunk) => {
            body += chunk.toString();
        });
        req.on('end', () => {
            try {
                resolve(JSON.parse(body));
            } catch (err) {
                reject(err);
            }
        });
    });
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
    
    // 3. CREATE RECORD (POST /api/records)
    else if (method === 'POST' && url === '/api/records') {
        getBodyData(req).then(body => {
            const records = readData();
            const newRecord = {
                id: Date.now().toString(), // Simple ID generation
                ...body
            };
            records.push(newRecord);
            writeData(records);
            res.writeHead(201);
            res.end(JSON.stringify(newRecord));
        }).catch(err => {
            res.writeHead(400);
            res.end(JSON.stringify({ message: "Invalid JSON format" }));
        });
    }

    // 4. UPDATE RECORD (PUT /api/records/:id)
    else if (method === 'PUT' && url.startsWith('/api/records/')) {
        const id = url.split('/')[3];
        getBodyData(req).then(body => {
            const records = readData();
            const index = records.findIndex(r => r.id === id);

            if (index !== -1) {
                records[index] = { ...records[index], ...body };
                writeData(records);
                res.writeHead(200);
                res.end(JSON.stringify(records[index]));
            } else {
                res.writeHead(404);
                res.end(JSON.stringify({ message: "Record not found" }));
            }
        }).catch(err => {
            res.writeHead(400);
            res.end(JSON.stringify({ message: "Invalid JSON format" }));
        });
    }

    // Fallback for unknown routes
    else {
        // If it's a DELETE request, we'll handle it in the next chat
        if (method === 'DELETE') {
            res.writeHead(501);
            res.end(JSON.stringify({ message: "DELETE functionality coming in the next update!" }));
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
    console.log('POST /api/records - Create a new record');
    console.log('PUT /api/records/:id - Update an existing record');
});
