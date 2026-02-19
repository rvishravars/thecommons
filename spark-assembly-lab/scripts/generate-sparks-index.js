import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Check standard dev location and Docker build location
const possiblePaths = [
    path.resolve(__dirname, '../../sparks'),
    path.resolve(__dirname, '../public/sparks'),
    '/sparks'
];

let SPARKS_DIR = possiblePaths.find(p => fs.existsSync(p)) || possiblePaths[0];
const OUTPUT_FILE = path.resolve(__dirname, '../public/sparks.json');

console.log('🔍 Generating sparks index from:', SPARKS_DIR);

try {
    if (!fs.existsSync(SPARKS_DIR)) {
        console.error('❌ Sparks directory not found:', SPARKS_DIR);
        process.exit(1);
    }

    const files = fs.readdirSync(SPARKS_DIR);
    const sparkFiles = files.filter(file => file.endsWith('.spark.md') || file.endsWith('.md'));

    console.log(`✅ Found ${sparkFiles.length} spark files`);

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(sparkFiles, null, 2));
    console.log('🚀 Index saved to:', OUTPUT_FILE);
} catch (error) {
    console.error('❌ Error generating sparks index:', error.message);
    process.exit(1);
}
