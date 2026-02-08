import https from 'https';
import fs from 'fs';

const url = 'https://www.bigbasket.com/cl/fruits-vegetables/';
const file = fs.createWriteStream("bb_test.html");
const options = {
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'max-age=0',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
    }
};

https.get(url, options, function (response) {
    response.pipe(file);
    file.on('finish', function () {
        file.close(() => {
            console.log("Download Completed");
        });
    });
}).on('error', function (err) {
    fs.unlink("bb_test.html", () => { });
    console.error("Error downloading file: " + err.message);
});
