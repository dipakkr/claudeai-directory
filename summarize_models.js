const fs = require('fs');
let data;
try {
    data = JSON.parse(fs.readFileSync('models-ranking.json', 'utf8'));
} catch (e) {
    console.error("Error parsing JSON:", e);
    process.exit(1);
}

let models = [];
if (Array.isArray(data)) {
    models = data;
} else if (data.data && Array.isArray(data.data)) {
    models = data.data;
} else if (data.models && Array.isArray(data.models)) {
    models = data.models;
} else if (data.pageProps && data.pageProps.models) {
    models = data.pageProps.models;
} else {
    console.log("Keys:", Object.keys(data));
    process.exit(1);
}

console.log(`Found ${models.length} models`);
if (models.length > 0) {
    console.log(JSON.stringify(models[0], null, 2));
}
