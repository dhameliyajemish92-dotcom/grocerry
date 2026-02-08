import fs from 'fs';

const json = JSON.parse(fs.readFileSync('bb_data.json', 'utf8'));
const logFile = fs.createWriteStream('product_detail.txt');

function log(msg) {
    logFile.write(typeof msg === 'object' ? JSON.stringify(msg, null, 2) : msg);
    logFile.write('\n');
}

try {
    const products = json.props.pageProps.SSRData.tabs[0].product_info.products;
    if (products && products.length > 0) {
        const p = products[0];
        log("Product ID: " + p.id);
        log("Description: " + p.desc);
        log("Weight: " + p.w);
        log("Pack Desc: " + p.pack_desc);
        log("Pricing Object:");
        log(p.pricing);
        log("Images Object:");
        log(p.images);

        if (p.children && p.children.length > 0) {
            log("First Child (Variant):");
            const c = p.children[0];
            log("Child ID: " + c.id);
            log("Child Pricing:");
            log(c.pricing);
            log("Child Images:");
            log(c.images);
        }
    } else {
        log("No products found.");
    }
} catch (e) {
    log("Error: " + e.message);
}
logFile.end();
console.log("Details saved to product_detail.txt");
