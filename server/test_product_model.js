import mongoose from 'mongoose';
import Products from './model/Products.js';

async function testModel() {
    try {
        const product = new Products({
            {
                "id": "string",
                "name": "string",
                "brand": "string",
                "category": "string",
                "pricing": {
                    "mrp": "number",
                    "selling_price": "number"
                },
                "packaging": {
                    "quantity": "string",
                    "unit": "string"
                },
                "availability": {
                    "in_stock": "boolean"
                },
                "image": "string"
            }

        });

    console.log('Product created successfully:', product);

    // Validate synchronously
    const error = product.validateSync();
    if (error) {
        console.error('Validation failed:', error);
        process.exit(1);
    } else {
        console.log('Validation successful');
    }

} catch (err) {
    console.error('Error:', err);
    process.exit(1);
}
}

testModel();
