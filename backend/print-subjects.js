const fs = require('fs');
const path = require('path');

const careersDir = path.join(__dirname, 'prisma', 'careers');
const files = fs.readdirSync(careersDir).filter(f => f.endsWith('.json'));

let output = '';

const targets = [
  'lic-kinesiologia.json', 'lic-nutricion.json', 'lic-obstetricia.json',
  'ing-energia-electrica.json', 'ing-metalurgica.json', 'lic-diseno-industrial.json', 
  'lic-gestion-ambiental.json', 'lic-gestion-mantenimiento.json',
  'prof-biologia.json', 'prof-educacion-fisica.json', 'prof-geografia.json', 
  'prof-ingles.json', 'prof-letras.json', 'prof-matematica.json'
];

files.filter(f => targets.includes(f)).forEach(file => {
  const data = JSON.parse(fs.readFileSync(path.join(careersDir, file), 'utf-8'));
  output += `\n============= ${file} =============\n`;
  
  // Group by year
  const byYear = {};
  data.subjects.forEach(s => {
    if (!byYear[s.year]) byYear[s.year] = [];
    byYear[s.year].push(s.name);
  });
  
  Object.keys(byYear).sort().forEach(y => {
    output += `Year ${y}: ${byYear[y].join(' | ')}\n`;
  });
});

fs.writeFileSync('subjects-dump.txt', output);
console.log('Dump completed');
