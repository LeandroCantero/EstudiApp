const fs = require('fs');
const path = require('path');

const careersDir = path.join(__dirname, 'prisma', 'careers');
const files = fs.readdirSync(careersDir).filter(f => f.endsWith('.json'));

let totalAdded = 0;

files.forEach(file => {
  const filePath = path.join(careersDir, file);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  let addedInFile = 0;

  // We map lowercase clean names to their original actual names to find exact matches
  const subjectNames = data.subjects.map(s => s.name);

  data.subjects.forEach(subject => {
    // 1. First year subjects rarely have correlatives (except late periods, but let's be safe)
    if (!subject.correlatives) {
      subject.correlatives = [];
    }

    // Unahur II requires Unahur I
    if (subject.name.trim() === 'UNAHUR II' || subject.name.trim() === 'Unahur II' || subject.name.trim() === 'Nuevos Entornos y Lenguajes') {
      // Nuevos entornos sometimes is the Unahur equivalent, but let's focus strictly on roman numerals.
    }

    // Roman numeral heuristic
    const match = subject.name.match(/^(.*?)\s+(I{2,3}|IV)$/i);
    if (match) {
      const baseName = match[1].trim();
      const numeral = match[2].toUpperCase();
      let requiredNumeral = '';
      if (numeral === 'II') requiredNumeral = 'I';
      if (numeral === 'III') requiredNumeral = 'II';
      if (numeral === 'IV') requiredNumeral = 'III';

      if (requiredNumeral) {
        // Find subject with this base + required numeral
        const requiredName1 = `${baseName} ${requiredNumeral}`;
        const requiredName2 = `${baseName} ${requiredNumeral}`.toLowerCase();
        
        const found = subjectNames.find(n => n.toLowerCase() === requiredName2);
        
        if (found && !subject.correlatives.includes(found)) {
          subject.correlatives.push(found);
          addedInFile++;
          totalAdded++;
        }
      }
    }
    
    // Ingles II -> Ingles I
    if (subject.name.toLowerCase().includes('inglés ii')) {
      const ingles1 = subjectNames.find(n => n.toLowerCase().includes('inglés i') && !n.toLowerCase().includes('ii'));
      if (ingles1 && !subject.correlatives.includes(ingles1)) {
        subject.correlatives.push(ingles1);
        addedInFile++; totalAdded++;
      }
    }
  });

  if (addedInFile > 0) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`Updated ${file}: +${addedInFile} correlatives`);
  }
});

console.log(`\nHeuristic complete. Total correlatives automatically added: ${totalAdded}`);
