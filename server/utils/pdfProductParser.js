import pdfParse from 'pdf-parse';

/**
 * Parse PDF file and extract product information
 * 
 * Uses the Product Model schema:
 * - id (required, unique)
 * - name (required)
 * - brand (required)
 * - category (required)
 * - pricing.mrp (required)
 * - pricing.selling_price (required)
 * - packaging.quantity (required)
 * - packaging.unit (required)
 * - availability.in_stock (required)
 * - image (required)
 */

// Main parsing function
export const parsePDFProductData = async (pdfBuffer) => {
    try {
        console.log('=== PDF PARSING STARTED ===');
        console.log('PDF buffer size:', pdfBuffer.length, 'bytes');
        
        const data = await pdfParse(pdfBuffer);
        const text = data.text;
        
        console.log('Extracted text length:', text.length);
        console.log('First 3000 chars:', text.substring(0, 3000));
        console.log('==========================');
        
        if (!text || text.trim().length === 0) {
            return {
                success: false,
                error: 'PDF contains no extractable text. This may be a scanned/image-based PDF.',
                products: [],
                totalProducts: 0,
                isScannedPDF: true
            };
        }
        
        // Parse products
        const products = parseAllProducts(text);
        
        console.log('Parsed', products.length, 'products');
        
        if (products.length === 0) {
            return {
                success: false,
                error: 'No products found. Please check PDF format.',
                products: [],
                totalProducts: 0
            };
        }
        
        return {
            success: true,
            products,
            errors: null,
            totalProducts: products.length
        };
        
    } catch (error) {
        console.error('PDF Parse Error:', error);
        return {
            success: false,
            error: error.message,
            products: [],
            totalProducts: 0
        };
    }
};

/**
 * Parse all products from text
 */
const parseAllProducts = (text) => {
    const products = [];
    
    // Split by newlines and process each line
    const lines = text.split('\n');
    
    console.log('Processing', lines.length, 'lines...');
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        if (!line || line.length < 3) continue;
        
        // Skip obvious non-product lines
        if (isNonProductLine(line)) continue;
        
        // Try to parse product from line
        const product = parseProductLine(line);
        
        if (product && product.name && product.name.length > 1) {
            console.log(`Line ${i}: Found product - ${product.name}`);
            products.push(product);
        }
    }
    
    return products;
};

/**
 * Check if line is not a product line
 */
const isNonProductLine = (line) => {
    const lower = line.toLowerCase();
    const nonProductKeywords = [
        'invoice', 'bill', 'receipt', 'tax invoice', 'grand total', 'subtotal',
        'cgst', 'sgst', 'igst', 'hsn code', 'sac code', 'gstin', 'gst registration',
        'vendor', 'buyer', 'ship to', 'bill to', 'page', 'total rs', 'total amount',
        'taxable', 'tax amount', 'round off', 'thank you', 'note:', 'terms'
    ];
    
    // If line is all text with no numbers, skip
    if (!/\d/.test(line) && lower.length < 40) {
        if (nonProductKeywords.some(k => lower.includes(k))) return true;
    }
    
    return false;
};

/**
 * Parse a single product line
 */
const parseProductLine = (line) => {
    // Clean the line - normalize spaces
    const cleaned = line.replace(/\s+/g, ' ').trim();
    
    // Find all numbers in the line
    const numbers = cleaned.match(/(\d+\.?\d*)/g);
    
    if (!numbers || numbers.length < 2) {
        console.log('Line has less than 2 numbers:', cleaned);
        return null;
    }
    
    console.log('Numbers found:', numbers);
    
    // Find where the text ends and numbers begin
    // Last text before first number is the product name
    const firstNumMatch = cleaned.search(/\d/);
    
    if (firstNumMatch === -1) return null;
    
    let name = cleaned.substring(0, firstNumMatch).trim();
    // Remove trailing punctuation
    name = name.replace(/[,.|:-]+$/, '').trim();
    
    if (!name || name.length < 2) {
        // Try alternative: first text word is name, rest are numbers
        const parts = cleaned.split(' ').filter(p => p.trim());
        if (parts.length >= 3) {
            name = parts[0];
        } else {
            return null;
        }
    }
    
    // Extract numeric values
    const nums = numbers.map(n => parseFloat(n)).filter(n => !isNaN(n));
    
    let qty = 1, rate = 0, total = 0, gst = 0;
    
    if (nums.length >= 3) {
        // Typical: qty, rate, total
        qty = nums[0];
        rate = nums[1];
        total = nums[2];
        
        // If there are more numbers, 4th might be GST
        if (nums.length >= 4) {
            gst = nums[3];
        }
    } else if (nums.length === 2) {
        rate = nums[0];
        total = nums[1];
    }
    
    // Validate: rate should be > 0, total should be >= rate
    if (rate <= 0) {
        console.log('Invalid rate:', rate);
        return null;
    }
    
    console.log('Parsed:', { name, qty, rate, total, gst });
    
    // Generate unique ID
    const productId = 'PDF' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 6).toUpperCase();
    
    return {
        id: productId,
        name: name,
        brand: 'Imported',
        category: 'PDF Import',
        pricing: {
            mrp: rate,
            selling_price: rate
        },
        packaging: {
            quantity: String(Math.round(qty)),
            unit: 'piece'
        },
        availability: {
            in_stock: qty > 0
        },
        image: 'https://res.cloudinary.com/crunchbase-production/image/upload/c_lpad,h_256,w_256,f_auto,q_auto:eco,dpr_1/lqcm8z8qwhi42efm2lue'
    };
};
