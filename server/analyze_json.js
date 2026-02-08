import fs from 'fs';

const json = JSON.parse(fs.readFileSync('bb_data.json', 'utf8'));
const logFile = fs.createWriteStream('analysis_result.txt');

function log(msg) {
    logFile.write(msg + '\n');
}

function traverse(obj, path = '') {
    if (!obj || typeof obj !== 'object') return;

    if (Array.isArray(obj)) {
        if (obj.length > 0 && typeof obj[0] === 'object') {
            const sample = obj[0];
            const keys = Object.keys(sample);
            // Heuristic for product: has 'desc', 'sku', 'mrp', 'sp', 'images' or similar
            if (keys.some(k => ['desc', 'sku', 'mrp', 'sp', 'images', 'product_info', 'pricing'].includes(k))) {
                log(`Found candidate array at: ${path} (length: ${obj.length})`);
                log(`Sample keys: ${keys.join(', ')}`);
            }
        }
        obj.forEach((item, index) => traverse(item, `${path}[${index}]`));
    } else {
        Object.keys(obj).forEach(key => {
            traverse(obj[key], `${path}.${key}`);
        });
    }
}

if (json && json.props && json.props.pageProps) {
    traverse(json.props.pageProps, 'pageProps');
}
logFile.end();
console.log("Analysis complete.");
