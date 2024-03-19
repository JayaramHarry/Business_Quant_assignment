const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const compression = require('compression');

const app = express();
const port = 3000;

app.use(compression())
app.use(bodyParser.json());

const db = mysql.createConnection({
    host: 'localhost',
    user: 'jayaramMySQL', 
    password: 'H@rry123', 
    database: 'stock_data'
});

db.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL');
});

// Get filtered stock data
app.get('/sample_data_historic/:ticker', (req, res) => {
    const { ticker } = req.params;
    const { column, period } = req.query;

    // Check if all required parameters are provided
    if (!ticker || !column || !period) {
        res.status(400).json({ error: 'Missing required parameters: column or period' });
        return;
    }

    const columns = column.split(',');

    // Calculate the date threshold based on the provided period
    const currentDate = new Date();
    const startDate = new Date(currentDate.getFullYear() - parseInt(period), currentDate.getMonth(), currentDate.getDate());

    // Construct SQL query dynamically based on provided parameters
    let sql = `SELECT ticker, ${columns.join(',')} FROM sample_data_historic WHERE ticker = ? AND STR_TO_DATE(date, '%m/%d/%Y') >= ?`;

    // Parameterize the query
    db.query({
        sql,
        values: [ticker, startDate]
         // To maintain the column names in the result
    }, (err, result) => {
        if (err) {
            console.error('Error executing query:', err);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }
        if (result.length === 0) {
            res.status(404).json({ error: 'Data not found for the provided parameters' });
            return;
        }
        res.json(result);
    });
});




// Add a new stock
app.post('/sample_data_historic', (req, res) => {
    const { name, price, quantity } = req.body;
    let sql = 'INSERT INTO sample_data_historic (name, price, quantity) VALUES (?, ?, ?)';
    db.query(sql, [name, price, quantity], (err, result) => {
        if (err) {
            console.error('Error executing query:', err);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }
        res.json({ message: 'Stock added successfully' });
    });
});

// Update a stock
app.put('/sample_data_historic/:ticker', (req, res) => {
    const stockId = req.params.ticker;
    const { name, price, quantity } = req.body;
    let sql = 'UPDATE sample_data_historic SET name = ?, price = ?, quantity = ? WHERE ticker = ?';
    db.query(sql, [name, price, quantity, stockId], (err, result) => {
        if (err) {
            console.error('Error executing query:', err);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }
        res.json({ message: 'Stock updated successfully' });
    });
});

// Delete a stock
app.delete('/sample_data_historic/:ticker', (req, res) => {
    const stockId = req.params.ticker;
    let sql = 'DELETE FROM sample_data_historic WHERE ticker = ?';
    db.query(sql, [stockId], (err, result) => {
        if (err) {
            console.error('Error executing query:', err);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }
        res.json({ message: 'Stock deleted successfully' });
    });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
