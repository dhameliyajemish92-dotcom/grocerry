import https from 'https';
import fs from 'fs';
import * as cheerio from 'cheerio';

const categories = [
    { name: 'Fruits & Vegetables', url: 'https://www.bigbasket.com/cl/fruits-vegetables/' },
    { name: 'Foodgrains, Oil & Masala', url: 'https://www.bigbasket.com/cl/foodgrains-oil-masala/' },
    { name: 'Bakery, Cakes & Dairy', url: 'https://www.bigbasket.com/cl/bakery-cakes-dairy/' },
    { name: 'Beverages', url: 'https://www.bigbasket.com/cl/beverages/' },
    { name: 'Snacks & Branded Foods', url: 'https://www.bigbasket.com/cl/snacks-branded-foods/' },
    { name: 'Beauty & Hygiene', url: 'https://www.bigbasket.com/cl/beauty-hygiene/' },
    { name: 'Cleaning & Household', url: 'https://www.bigbasket.com/cl/cleaning-household/' }
];

const outputFile = 'bb_products.json';
let allProducts = [];

const options = {
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
        'Cache-Control': 'max-age=0',
        'Connection': 'keep-alive'
    }
};

function fetchCategory(category) {
    return new Promise((resolve, reject) => {
        console.log(`Fetching ${category.name}...`);
        https.get(category.url, options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    const $ = cheerio.load(data);
                    const nextDataScript = $('#__NEXT_DATA__').html();
                    if (nextDataScript) {
                        const json = JSON.parse(nextDataScript);
                        const products = extractProducts(json, category.name);
                        console.log(`  Found ${products.length} products in ${category.name}`);
                        resolve(products);
                    } else {
                        console.error(`  No data found for ${category.name}`);
                        resolve([]);
                    }
                } catch (e) {
                    console.error(`  Error parsing ${category.name}: ${e.message}`);
                    resolve([]);
                }
            });
        }).on('error', (err) => {
            console.error(`  Error fetching ${category.name}: ${err.message}`);
            resolve([]);
        });
    });
}

function extractProducts(json, categoryName) {
    let products = [];
    try {
        const productList = json.props.pageProps.SSRData.tabs[0].product_info.products;
        if (productList) {
            productList.forEach(p => {
                products.push(transformProduct(p, categoryName));
                if (p.children) {
                    p.children.forEach(c => products.push(transformProduct(c, categoryName, p.desc)));
                }
            });
        }
    } catch (e) {
        // Path might differ or data missing
    }
    return products;
}

function transformProduct(p, categoryName, parentName = null) {
    let name = p.desc;
    if (parentName && !name.includes(parentName)) {
        // Sometimes child desc is just "1 kg", append to parent if needed, 
        // though usually child desc is full like "Tomato - Local"
    }

    // Extract Image (High Qual)
    let imageUrl = '';
    if (p.images && p.images.length > 0) {
        imageUrl = p.images[0].l || p.images[0].m || p.images[0].s;
    }

    // Extract Price
    let price = 0;
    if (p.pricing && p.pricing.discount && p.pricing.discount.prim_price) {
        price = parseFloat(p.pricing.discount.prim_price.sp);
    } else if (p.pricing && p.pricing.offer && p.pricing.offer.offer_sp) {
        price = parseFloat(p.pricing.offer.offer_sp);
    }

    // Extract Weight/Measurement
    let weight = 0;
    let measurement = p.w || "";

    // Simple weight parser
    const weightMatch = measurement.match(/([\d.]+)\s*([a-zA-Z]+)/);
    if (weightMatch) {
        weight = parseFloat(weightMatch[1]);
        measurement = weightMatch[2]; // e.g., 'kg', 'g', 'pc'
    }

    return {
        product_id: p.id,
        name: name,
        price: price,
        weight: weight,
        measurement: measurement,
        category: categoryName,
        image: imageUrl,
        stock: 50 // Default stock
    };
}

async function run() {
    for (const cat of categories) {
        const products = await fetchCategory(cat);
        allProducts = allProducts.concat(products);
        // Wait 2 seconds to be nice
        await new Promise(r => setTimeout(r, 2000));
    }

    fs.writeFileSync(outputFile, JSON.stringify(allProducts, null, 2));
    console.log(`\nDone! Saved ${allProducts.length} total products to ${outputFile}`);
}

run();
