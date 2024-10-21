const validateRow = (row) => {
    const errors = [];
  
    // Check Date format (DD-MM-YYYY)
    const datePattern = /^\d{2}-\d{2}-\d{4}$/;
    if (!datePattern.test(row.Date)) {
        errors.push("Invalid date format");
    }

    // Check if numerical fields are valid numbers
    const numericalFields = [
        'Prev Close', 'Open', 'High', 'Low', 
        'Last', 'Close', 'VWAP', 'Volume', 
        'Turnover', 'Trades', 'Deliverable Volume', 
        '%Deliverable'
    ];

    numericalFields.forEach(field => {
        if (isNaN(row[field]) || row[field] === '') {
            errors.push(`${field} should be a valid number`);
        }
    });

    return errors.length === 0 ? true : errors;
};

describe('CSV Row Validation Logic', () => {
    it('should validate a correct row', () => {
        const row = {
            Date: '25-08-2004',
            Symbol: 'TCS',
            Series: 'EQ',
            'Prev Close': 850,
            Open: 1198.7,
            High: 1198.7,
            Low: 979,
            Last: 985,
            Close: 987.95,
            VWAP: 1008.32,
            Volume: 17116372,
            Turnover: 1.72588E+15,
            Trades: 5206360,
            'Deliverable Volume': 5206360,
            '%Deliverable': 0.3042,
        };
        
        expect(validateRow(row)).toEqual(true);
    });

    it('should fail validation for invalid date format', () => {
        const row = {
            Date: '2004-08-25', // Invalid format
            Symbol: 'TCS',
            Series: 'EQ',
            'Prev Close': 850,
            Open: 1198.7,
            High: 1198.7,
            Low: 979,
            Last: 985,
            Close: 987.95,
            VWAP: 1008.32,
            Volume: 17116372,
            Turnover: 1.72588E+15,
            Trades: 5206360,
            'Deliverable Volume': 5206360,
            '%Deliverable': 0.3042,
        };

        const validationResult = validateRow(row);
        expect(validationResult).toContain("Invalid date format");
    });

    it('should fail validation for missing Trades', () => {
        const row = {
            Date: '25-08-2004',
            Symbol: 'TCS',
            Series: 'EQ',
            'Prev Close': 850,
            Open: 1198.7,
            High: 1198.7,
            Low: 979,
            Last: 985,
            Close: 987.95,
            VWAP: 1008.32,
            Volume: 17116372,
            Turnover: 1.72588E+15,
            Trades: '', // Missing value
            'Deliverable Volume': 5206360,
            '%Deliverable': 0.3042,
        };

        const validationResult = validateRow(row);
        expect(validationResult).toContain('Trades should be a valid number');
    });

    it('should fail validation for non-numeric Prev Close', () => {
        const row = {
            Date: '25-08-2004',
            Symbol: 'TCS',
            Series: 'EQ',
            'Prev Close': 'invalid', // Invalid value
            Open: 1198.7,
            High: 1198.7,
            Low: 979,
            Last: 985,
            Close: 987.95,
            VWAP: 1008.32,
            Volume: 17116372,
            Turnover: 1.72588E+15,
            Trades: 5206360,
            'Deliverable Volume': 5206360,
            '%Deliverable': 0.3042,
        };

        const validationResult = validateRow(row);
        expect(validationResult).toContain('Prev Close should be a valid number');
    });
});
