import axios from 'axios';

const BASE_URL = 'http://localhost:5000';

const testCases = [
    { name: "Null Cart", payload: { cart: null } },
    { name: "String Cart", payload: { cart: "not-an-array" } },
    { name: "Empty Cart", payload: { cart: [] } },
    { name: "Cart with Null Item", payload: { cart: [null] } },
    { name: "Cart with Empty Object", payload: { cart: [{}] } },
    { name: "Cart with Non-Existent ID", payload: { cart: [{ product_id: "non_existent_id_123", quantity: 1 }] } },
];

async function runTests() {
    console.log(`Targeting ${BASE_URL}/products/cart`);

    for (const test of testCases) {
        try {
            console.log(`\nTesting: ${test.name}`);
            const res = await axios.post(`${BASE_URL}/products/cart`, test.payload);
            console.log(`Status: ${res.status}`);
            console.log(`Response:`, res.data);
        } catch (error) {
            if (error.response) {
                console.log(`Status: ${error.response.status}`);
                console.log(`Error Data:`, error.response.data);
            } else {
                console.log(`Error: ${error.message}`);
            }
        }
    }
}

runTests();
