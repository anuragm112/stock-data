const express = require('express');
const multer = require('multer');
const csv = require('csv-parser');
const Stock = require('../models/stockModel');
const fs = require('fs');
const router = express.Router();

// Multer setup for CSV upload
const upload = multer({ dest: 'uploads/' });

//post method
router.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file || req.file.mimetype !== 'text/csv') {
    return res.status(400).json({ error: 'Please upload a valid CSV file.' });
  }

  const filePath = req.file.path;
  const validColumns = [
    'Date', 'Symbol', 'Series', 'Prev Close', 'Open', 'High', 'Low', 'Last', 
    'Close', 'VWAP', 'Volume', 'Turnover', 'Trades', 'Deliverable Volume', '%Deliverable'
  ];

  const results = [];
  let failedRecords = [];
  let successfulRecords = 0;
  let totalRecords = 0;

  fs.createReadStream(filePath)
    .pipe(csv())
    .on('headers', (headers) => {
      const missingColumns = validColumns.filter(col => !headers.includes(col));
      if (missingColumns.length) {
        return res.status(400).json({ error: `Missing columns: ${missingColumns.join(', ')}` });
      }
    })
    .on('data', (row) => {
      totalRecords++;
      try {
        // Validate each row
        const isValid = validateRow(row);
        if (!isValid) throw new Error('Invalid data');
        results.push(formatStockData(row));
        successfulRecords++;
      } catch (err) {
        failedRecords.push({ row, error: err.message });
      }
    })
    .on('end', async () => {
      // Save valid records to the database
      try {
        await Stock.insertMany(results);
        fs.unlinkSync(filePath); // Clean up file
        res.json({
          totalRecords,
          successfulRecords,
          failedRecords: failedRecords.length,
          errors: failedRecords,
        });
      } catch (err) {
        res.status(500).json({ error: 'Database error', details: err.message });
      }
    });
});

// Helper to validate a row
const validateRow = (row) => {
  const requiredFields = ['Prev Close', 'Open', 'High', 'Low', 'Last', 'Close', 'VWAP', 'Volume', 'Turnover', 'Trades', 'Deliverable Volume', '%Deliverable'];
  return requiredFields.every(field => !isNaN(row[field])) && !isNaN(Date.parse(row['Date']));
};

// Helper to format stock data
const formatStockData = (row) => ({
  date: row['Date'],
  symbol: row['Symbol'],
  series: row['Series'],
  prev_close: parseFloat(row['Prev Close']),
  open: parseFloat(row['Open']),
  high: parseFloat(row['High']),
  low: parseFloat(row['Low']),
  last: parseFloat(row['Last']),
  close: parseFloat(row['Close']),
  vwap: parseFloat(row['VWAP']),
  volume: parseInt(row['Volume']),
  turnover: parseFloat(row['Turnover']),
  trades: parseInt(row['Trades']),
  deliverable: parseInt(row['Deliverable Volume']),
  percent_deliverable: parseFloat(row['%Deliverable']),
});

// API 1: Get highest volume
router.get('/api/highest_volume', async (req, res) => {
    const { start_date, end_date, symbol } = req.query;
    const query = buildQuery(start_date, end_date, symbol);
    
    try {
      const stock = await Stock.find(query).sort({ volume: -1 }).limit(1);
      res.json({ highest_volume: stock[0] });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
  // API 2: Get average close price
  router.get('/api/average_close', async (req, res) => {
    const { start_date, end_date, symbol } = req.query;
    const query = buildQuery(start_date, end_date, symbol);
    
    try {
      const stocks = await Stock.find(query);
      const avgClose = stocks.reduce((acc, stock) => acc + stock.close, 0) / stocks.length;
      res.json({ average_close: avgClose });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
  // API 3: Get average VWAP
  router.get('/api/average_vwap', async (req, res) => {
    const { start_date, end_date, symbol } = req.query;
    const query = buildQuery(start_date, end_date, symbol);
    
    try {
      const stocks = await Stock.find(query);
      const avgVWAP = stocks.reduce((acc, stock) => acc + stock.vwap, 0) / stocks.length;
      res.json({ average_vwap: avgVWAP });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
  // Helper to build query from params
  const buildQuery = (start_date, end_date, symbol) => {
    const query = {};
    if (start_date && end_date) {
      query.date = { $gte: start_date, $lte: end_date };
    }
    if (symbol) {
      query.symbol = symbol;
    }
    return query;
  };
  
module.exports = router;
