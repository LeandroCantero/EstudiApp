import * as fs from 'fs/promises';
import * as path from 'path';
const pdf = require('pdf-parse');

const PLANS_DIR = path.join(process.cwd(), 'prisma', 'plans');
const OUTPUT_DIR = path.join(PLANS_DIR, 'md');

async function extractPdfText() {
  try {
    const files = await fs.readdir(PLANS_DIR);
    const pdfFiles = files.filter(f => f.endsWith('.pdf'));

    console.log(`🚀 Found ${pdfFiles.length} PDF files. Starting extraction...`);

    for (const file of pdfFiles) {
      const filePath = path.join(PLANS_DIR, file);
      const outputFilePath = path.join(OUTPUT_DIR, file.replace('.pdf', '.md'));

      const dataBuffer = await fs.readFile(filePath);
      const data = await pdf(dataBuffer);

      await fs.writeFile(outputFilePath, data.text);
      console.log(`✅ Extracted: ${file} -> ${path.basename(outputFilePath)}`);
    }

    console.log('✨ All extractions completed!');
  } catch (error) {
    console.error('❌ Error during extraction:', error);
  }
}

extractPdfText();
