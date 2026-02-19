const fs = require('fs').promises;
const path = require('path');

const MD_DIR = path.join(process.cwd(), 'prisma', 'plans', 'md');
const OUTPUT_DIR = path.join(process.cwd(), 'prisma', 'careers');

function normalize(text) {
  return text.trim().replace(/\s+/g, ' ');
}

function cleanHeaders(content) {
  return content
    .replace(/^.*ANIVERSARIO DEL CONSEJO.*$/gm, '')
    .replace(/^.*Ley N° 27\.016.*$/gm, '')
    .replace(/^.*Universidad Nacional de Hurlingham.*$/gm, '')
    .replace(/^-- \d+ of \d+ --$/gm, '')
    .replace(/^\d+$/gm, '')
    .replace(/^\f/gm, '');
}

/**
 * Patterns prioritized by specificity
 */
const PATTERNS = [
  // A: Biotec Style: ID Name [C|A] Field IPs IP IPP TAE TTE CRE
  {
    name: 'biotec',
    regex: /^(\d+)\s+(.+?)\s+([CA])\s+([A-Z]{2,})\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)$/,
    map: (m) => ({ code: m[1], name: m[2], credits: parseInt(m[6]) })
  },
  // A2: Enfermeria Style: ID Name [C|A] HIS HIT HI_T HI_P HTAT HT CRE
  {
    name: 'enferme',
    regex: /^(\d+)\s+(.+?)\s+([CA]|Mensual|Anual)\s+(\d+)\s+(\d+)(\*+)?\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)$/,
    map: (m) => ({ code: m[1], name: m[2], credits: parseInt(m[5]) })
  },
  // B: Programacion Style: Area ID. Name Weekly Total Prereqs
  {
    name: 'prog',
    regex: /^([A-Z]{2,}|Gral\.|Elec\.|SBDySI|ASOyR|ISBDySI|TC|AyL|CB)\s+(\d+)\.\s+(.+?)\s+(\d+)\s+(\d+)\s+(.+)$/,
    map: (m) => ({ code: m[2], name: m[3], credits: parseInt(m[5]), prereqs: m[6] })
  },
  // C: Informatica Style: ID Area Name Weekly Sem Total Regime
  {
    name: 'info',
    regex: /^(\d+)\s+([A-Z]{2,})\s+(.+?)\s+(\d+)\s+(\d+)\s+(\d+)\s+(cuatrimestral|anual)/i,
    map: (m) => ({ code: m[1], name: m[3], credits: parseInt(m[6]) })
  },
  // D: Health/Profesorados Style: Name [C|A] Area HIS HIT HTAT HT CRE
  {
    name: 'health',
    regex: /^(.+?)\s+([CA]|Mensual)\s+([A-Z]{2,4})?\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)$/,
    map: (m) => ({ code: null, name: m[1], credits: parseInt(m[5]) })
  },
  // E: Agronomia Style: ID Name Regime Area Weekly Theory Practice Total Prereqs
  {
    name: 'agro',
    regex: /^(\d+)\s+(.+?)\s+(Cuatrimestral|Anual)\s+([A-Z]{2,})\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(.+)$/i,
    map: (m) => ({ code: m[1], name: m[2], credits: parseInt(m[8]), prereqs: m[9] })
  }
];

// Fallback for Engineering headers
const ENG_PATTERN = /^(PRIMER|SEGUNDO|TERCER|CUARTO|QUINTO)\s+AÑO\s+(.+?)\s+(Cuatrimestral|Anual)\s+[\d\s]+?(\d+)\s+[\d\s]+$/i;

function parseSubjects(lines, fileName) {
  const subjects = [];
  const idToNameMap = {};
  const prereqOverrides = {};
  const seenNames = new Set();

  let currentYear = 1;
  let currentPeriod = 1;

  for (let i = 0; i < lines.length; i++) {
    let line = normalize(lines[i]);
    if (!line) continue;

    const lower = line.toLowerCase();
    if (lower.includes('primer año')) currentYear = 1;
    else if (lower.includes('segundo año')) currentYear = 2;
    else if (lower.includes('tercer año')) currentYear = 3;
    else if (lower.includes('cuarto año')) currentYear = 4;
    else if (lower.includes('quinto año')) currentYear = 5;

    if (lower.includes('cuatrimestre') && (lower.includes('1') || lower.includes('1°'))) currentPeriod = 1;
    else if (lower.includes('cuatrimestre') && (lower.includes('2') || lower.includes('2°'))) currentPeriod = 2;

    let matched = false;
    for (const p of PATTERNS) {
      // 1. Try single line
      let m = line.match(p.regex);
      
      // 2. If no match and likely a start, try greedy join with next line (for wrapped names)
      if (!m && (line.match(/^\d+\s+/) || line.match(/^[A-Z]{2,}\s+\d+\./))) {
          if (i + 1 < lines.length) {
              const joined = line + ' ' + normalize(lines[i+1]);
              m = joined.match(p.regex);
              if (m) i++; // Advance
          }
      }

      if (m) {
        const data = p.map(m);
        const name = data.name.trim().replace(/^\d+\.\s+/, '');
        
        // Skip obvious headers caught by greedy patterns
        if (name.length < 4 || name.includes('TOTAL') || name.includes('TITULACIÓN')) break;

        // Skip duplicates (Biotecnologia has same subjects in Tech and Degree tables)
        if (seenNames.has(name.toLowerCase())) {
            matched = true;
            break;
        }

        const sub = {
          code: data.code || `S${subjects.length + 1}`,
          name: name,
          credits: data.credits || 64,
          year: currentYear,
          period: currentPeriod,
          prerequisites: []
        };
        subjects.push(sub);
        seenNames.add(name.toLowerCase());
        if (data.code) idToNameMap[data.code] = sub.name;
        if (data.prereqs && data.prereqs !== '-') prereqOverrides[sub.code] = data.prereqs;
        
        matched = true;
        break;
      }
    }

    if (!matched) {
      const m = line.match(ENG_PATTERN);
      if (m) {
        const [_, yStr, name, reg, total] = m;
        const yearMap = { 'PRIMER': 1, 'SEGUNDO': 2, 'TERCER': 3, 'CUARTO': 4, 'QUINTO': 5 };
        const subName = name.trim();
        if (!seenNames.has(subName.toLowerCase())) {
           subjects.push({
             code: `E${subjects.length + 1}`,
             name: subName,
             credits: parseInt(total) || 64,
             year: yearMap[yStr.toUpperCase()] || currentYear,
             period: currentPeriod,
             prerequisites: []
           });
           seenNames.add(subName.toLowerCase());
        }
      }
    }
  }

  // Correlativity parsing for Informatica/Others
  if (fileName.includes('informatica')) {
      let inCorrTable = false;
      for (let line of lines) {
          if (normalize(line).toLowerCase().startsWith('correlatividades')) { inCorrTable = true; continue; }
          if (!inCorrTable) continue;
          const m = normalize(line).match(/^(\d+)\s+([A-Z]{2,})\s+.+?\s+(.+)$/);
          if (m) {
              const [_, id, area, prereqs] = m;
              const sub = subjects.find(s => s.code === id);
              if (sub && prereqs !== '-') {
                  const ids = prereqs.split(/[\s,–-]+/).filter(x => x.match(/^\d+$/));
                  sub.prerequisites = ids.map(pid => idToNameMap[pid]).filter(Boolean);
              }
          }
      }
  }

  // Link other prereqs
  subjects.forEach(s => {
    if (prereqOverrides[s.code]) {
      const raw = prereqOverrides[s.code];
      const ids = raw.split(/[\s,–-]+/).filter(x => x.match(/^\d+$/));
      ids.forEach(pid => {
          if (idToNameMap[pid] && !s.prerequisites.includes(idToNameMap[pid])) {
              s.prerequisites.push(idToNameMap[pid]);
          }
      });
      // Word based matching
      for (const [pid, pname] of Object.entries(idToNameMap)) {
          if (raw.toLowerCase().includes(pname.toLowerCase()) && !s.prerequisites.includes(pname)) {
              s.prerequisites.push(pname);
          }
      }
    }
  });

  return subjects;
}

async function run() {
  const files = await fs.readdir(MD_DIR);
  for (const file of files) {
    if (!file.endsWith('.md')) continue;
    const content = await fs.readFile(path.join(MD_DIR, file), 'utf-8');
    const cleaned = cleanHeaders(content);
    const lines = cleaned.split('\n');

    let careerName = file.replace('.md', '').split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
    // ... name extraction ...

    const subjects = parseSubjects(lines, file);

    if (subjects.length > 0) {
      await fs.writeFile(path.join(OUTPUT_DIR, file.replace('.md', '.json')), JSON.stringify({ career: careerName, subjects }, null, 2));
      console.log(`✅ ${file}: ${subjects.length} subjects.`);
    } else {
      console.warn(`⚠️  ${file}: No subjects found.`);
    }
  }
}

run();
