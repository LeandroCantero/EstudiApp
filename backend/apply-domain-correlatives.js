const fs = require('fs');
const path = require('path');

const careersDir = path.join(__dirname, 'prisma', 'careers');

const domainRules = {
  // === INGENIERÍAS ===
  'ing-energia-electrica.json': {
    'Sistemas de mediciones': ['Electrotecnia'],
    'Circuitos eléctricos': ['Electrotecnia', 'Análisis matemático I'],
    'Electrónica': ['Física II', 'Circuitos eléctricos'],
    'Máquinas eléctricas I': ['Electrotecnia', 'Física II'],
    'Termodinámica': ['Física II', 'Química'],
    'Sistemas de control': ['Matemática avanzada', 'Análisis de circuitos y señales'],
    'Electromagnetismo aplicado': ['Física III', 'Análisis matemático II'],
    'Transmisión de la energía eléctrica': ['Sistemas eléctricos de potencia'],
    'Distribución de la energía eléctrica': ['Sistemas eléctricos de potencia'],
    'Sistemas eléctricos de potencia': ['Máquinas eléctricas II', 'Electromagnetismo aplicado'],
    'Espacio de integración curricular I': ['Física II', 'Análisis matemático I'],
    'Espacio de integración curricular II': ['Sistemas de control', 'Máquinas eléctricas II']
  },
  'ing-metalurgica.json': {
    'Técnicas de Análisis': ['Química', 'Introducción a la Metalurgia'],
    'Ensayos de Materiales': ['Física I', 'Metalurgia I'],
    'Termodinámica': ['Física II', 'Química'],
    'Ciencia de los Materiales': ['Química', 'Metalurgia II'],
    'Metalurgia Física': ['Ciencia de los Materiales', 'Física III'],
    'Fisicoquímica Metalúrgica': ['Termodinámica', 'Química II -Inorgánica'],
    'Electrotecnia y Sistemas de Control': ['Física II', 'Análisis Matemático II'],
    'Mecánica de los Fluidos': ['Física II', 'Análisis Matemático II'],
    'Soldadura': ['Metalurgia Física'],
    'Procesos de Reducción y Aceración': ['Fisicoquímica Metalúrgica'],
    'Conformación Plástica': ['Metalurgia Física', 'Mecánica de los Fluidos']
  },
  'lic-diseno-industrial.json': {
    'Taller de Diseño II': ['Taller de Diseño I', 'Morfología I'],
    'Taller de producción I': ['Tecnología I'],
    'Tecnología II': ['Tecnología I'],
    'Morfología II': ['Morfología I'],
    'Taller de Diseño III': ['Taller de Diseño II', 'Morfología II'],
    'Taller de Diseño IV': ['Taller de Diseño III'],
    'Tecnología III': ['Tecnología II'],
    'Tecnologías de fabricación digital II': ['Tecnologías de fabricación digital I'],
    'Taller de producción II': ['Taller de producción I'],
    'Laboratorio de diseño e innovación': ['Taller de Diseño IV'],
    'Proyecto final': ['Taller de Diseño IV', 'Laboratorio de diseño e innovación']
  },
  'lic-gestion-ambiental.json': {
    'Taller integrado de gestión ambiental CIC': ['Introducción a la cuestión ambiental CIC'],
    'Física CFB': ['Matemática I CFB'],
    'Geología ambiental CFE': ['Ecología CFE', 'Química general e inorgánica CFB'],
    'Climatología CFE': ['Física CFB', 'Matemática II CFB'],
    'Fisicoquímica CFB': ['Física CFB', 'Química general e inorgánica CFB'],
    'Química ambiental CFE': ['Fisicoquímica CFB'],
    'Gestión del agua CFE': ['Climatología CFE', 'Geología ambiental CFE'],
    'Química analítica aplicada CFE': ['Química ambiental CFE'],
    'Evaluación de sitios contaminados CFE': ['Química analítica aplicada CFE', 'Geología ambiental CFE'],
    'Muestreo ambiental CFE': ['Estadística y diseño experimental CFB'],
    'Tecnologías de remediación CFE': ['Evaluación de sitios contaminados CFE'],
    'Manejo integrado de cuencas CFE': ['Gestión del agua CFE'],
    'Gestión integral de proyectos CIC': ['Economía ambiental CFE', 'Política ambiental CFE']
  },
  'lic-gestion-mantenimiento.json': {
    'Materiales y elementos de máquinas': ['Física', 'Química general'],
    'Hidráulica y Neumática': ['Física'],
    'Planificación del Mantenimiento': ['Introducción a la gestión del mantenimiento'],
    'Instalaciones eléctricas': ['Electrotecnia'],
    'Instalaciones industriales': ['Organización industrial'],
    'Técnicas predictivas': ['Materiales y elementos de máquinas'],
    'Redes de datos y comunicaciones': ['Física'],
    'Políticas de mantenimiento I': ['Planificación del Mantenimiento', 'Gestión de la calidad'],
    'Análisis de confiabilidad': ['Probabilidad y estadística', 'Técnicas predictivas'],
    'Políticas de mantenimiento II': ['Políticas de mantenimiento I'],
    'Auditorías de mantenimiento': ['Gestión de la calidad', 'Políticas de mantenimiento I'],
    'Proyecto Final': ['Proyecto de integración', 'Políticas de mantenimiento II']
  },

  // === SALUD ===
  'lic-kinesiologia.json': {
    'Valoración Funcional II': ['Valoración Funcional I', 'Anátomo-Fisiología I'],
    'Bases y Fundamentos del Diagnóstico en Salud': ['Anátomo-Fisiología II'],
    'Práctica Kinefisiátrica I': ['Fundamentos de la Kinesiología y Fisiatría'],
    'Valoración Funcional III': ['Valoración Funcional II'],
    'Práctica Kinefisiátrica II': ['Práctica Kinefisiátrica I'],
    'Fisiopatología': ['Anátomo-Fisiología II'],
    'Farmacología': ['Anátomo-Fisiología II'],
    'Valoración Funcional IV': ['Valoración Funcional III'],
    'Kinefisiatría I': ['Fisiopatología', 'Valoración Funcional II'],
    'Kinefisiatría II': ['Kinefisiatría I'],
    'Práctica Kinefisiátrica III': ['Práctica Kinefisiátrica II'],
    'Kinefisiatría III': ['Kinefisiatría II'],
    'Terapéutica Kinésica Cardio-Respiratoria': ['Kinefisiatría I', 'Fisiopatología'],
    'Kinefisiatría IV': ['Kinefisiatría III'],
    'Práctica Kinefisiátrica IV': ['Práctica Kinefisiátrica III'],
    'Práctica Kinefisiátrica V': ['Práctica Kinefisiátrica IV'],
    'Kinesiología y Fisiatría Laboral y Ergonomía': ['Valoración Funcional IV']
  },
  'lic-nutricion.json': {
    'Bioquímica Aplicada': ['Bioquímica'],
    'Microbiología': ['Bioquímica Aplicada', 'Anátomo-Fisiología II'],
    'Introducción a la Tecnología de los Alimentos': ['Bioquímica Aplicada'],
    'Nutrición en la Infancia y la Adolescencia': ['Fundamentos de la Nutrición'],
    'Técnica en el Manejo de los Alimentos I': ['Introducción a la nutrición'],
    'Bromatología y Microbiología de los Alimentos': ['Microbiología', 'Introducción a la Tecnología de los Alimentos'],
    'Técnica en el Manejo de los Alimentos II': ['Técnica en el Manejo de los Alimentos I'],
    'Fisiopatología y Dietoterapia de la persona adulta I': ['Anátomo-Fisiología II', 'Fundamentos de la Nutrición'],
    'Evaluación Nutricional': ['Anátomo-Fisiología II', 'Fundamentos de la Nutrición'],
    'Farmacología': ['Anátomo-Fisiología II'],
    'Fisiopatología y Dietoterapia de la persona adulta II': ['Fisiopatología y Dietoterapia de la persona adulta I'],
    'Técnica Dietoterápica I': ['Técnica en el Manejo de los Alimentos II', 'Fisiopatología y Dietoterapia de la persona adulta I'],
    'Fisiopatología y Dietoterapia en la Infancia y la adolescencia': ['Nutrición en la Infancia y la Adolescencia', 'Fisiopatología y Dietoterapia de la persona adulta I'],
    'Educación Alimentaria y Nutricional': ['Psicología', 'Fundamentos de la Nutrición'],
    'Técnica Dietoterápica II': ['Técnica Dietoterápica I'],
    'Gestión y Administración de los Servicios de Alimentación': ['Economía y Producción Regional de Alimentos'],
    'Nutrición en la actividad física y el deporte': ['Anátomo-Fisiología II', 'Fisiopatología y Dietoterapia de la persona adulta I']
  },
  'lic-obstetricia.json': {
    'Obstetricia I': ['Introducción a la Obstetricia', 'Anátomo-Fisiología I'],
    'Salud Sexual y Reproductiva': ['Anátomo-Fisiología II'],
    'Obstetricia II': ['Obstetricia I'],
    'Obstetricia III': ['Obstetricia II'],
    'Obstetricia patológica': ['Obstetricia III', 'Bioquímica'],
    'Obstetricia IV': ['Obstetricia III'],
    'Preparación Integral para la maternidad': ['Obstetricia II'],
    'Microbiología': ['Bioquímica'],
    'Farmacología': ['Anátomo-Fisiología II'],
    'Evaluación de salud fetal': ['Obstetricia patológica'],
    'Farmacología Obstétrica': ['Farmacología', 'Obstetricia patológica'],
    'Práctica obstétrica integrada I': ['Obstetricia IV', 'Obstetricia patológica'],
    'Práctica obstétrica integrada II': ['Práctica obstétrica integrada I'],
    'Puericultura': ['Obstetricia III']
  },

  // === EDUCACIÓN ===
  'prof-biologia.json': {
    'Didáctica y currículum': ['Pedagogía'],
    'Química orgánica': ['Química general e inorgánica'],
    'Bioquímica': ['Química orgánica', 'Biología celular y molecular'],
    'Microbiología e Inmunología': ['Bioquímica', 'Biología celular y molecular'],
    'Evolución': ['Genética', 'Zoología', 'Botánica'],
    'Genética': ['Biología celular y molecular'],
    'Ecología general': ['Botánica', 'Zoología']
  },
  'prof-educacion-fisica.json': {
    'Didáctica y curriculum': ['Pedagogía'],
    'Educación física en el joven y el adulto': ['Educación física en la niñez'],
    'Teoría de la Educación física': ['Pedagogía', 'Historia de la Educación física argentina'],
  },
  'prof-geografia.json': {
    'Didáctica y curriculum': ['Pedagogía'],
    'Geografía ambiental I': ['Introducción a la Geografía'],
    'Geografía política': ['Geografía social I'],
    'Teoría de la Geografía': ['Introducción a la Geografía'],
    'Didáctica de las Ciencias sociales': ['Didáctica y curriculum'],
    'Geografía ambiental de la Argentina': ['Geografía ambiental I'],
    'Didáctica de la Geografía': ['Didáctica de las Ciencias sociales'],
    'Sistemas Informáticos Geográficos': ['Cartografía'],
    'Problemas territoriales de la Argentina': ['Geografía ambiental de la Argentina', 'Geografía económica']
  },
  'prof-ingles.json': {
    'Didáctica y curriculum': ['Pedagogía'],
    'Lingüística': ['Gramática inglesa II'],
    'Prácticas docentes en el nivel primario': ['Didáctica y curriculum', 'Lengua inglesa II'],
    'Estudios literarios': ['Lengua inglesa III']
  },
  'prof-letras.json': {
    'Didáctica y currículum': ['Pedagogía'],
    'Gramática': ['Introducción a los Estudios lingüísticos'],
    'Didáctica de la lectura y la escritura': ['Lectura, escritura y oralidad', 'Taller de escritura académica'],
    'Lingüística general': ['Gramática'],
    'Didáctica de la literatura': ['Introducción a los Estudios Literarios', 'Didáctica y currículum'],
    'Didáctica de la Lengua': ['Gramática', 'Didáctica y currículum'],
    'Literatura argentina': ['Introducción a los Estudios Literarios'],
    'Literatura latinoamericana': ['Introducción a los Estudios Literarios'],
    'Teoría y crítica literaria': ['Introducción a los Estudios Literarios'],
    'Análisis del discurso': ['Lingüística general']
  },
  'prof-matematica.json': {
    'Didáctica y curriculum': ['Pedagogía'],
    'Álgebra lineal': ['Geometría euclideana y analítica'],
    'Teoría de números': ['Álgebra lineal'],
    'Matemática discreta': ['Algoritmos y estructura de datos'],
    'Probabilidad y estadística': ['Análisis matemático II'],
    'Didáctica de la matemática I': ['Didáctica y curriculum'],
    'Fundamentos de la matemática I': ['Teoría de números'],
    'Análisis complejo': ['Análisis matemático II'],
    'Didáctica de la matemática II': ['Didáctica de la matemática I'],
    'Fundamentos de la matemática II': ['Fundamentos de la matemática I'],
    'Modelos matemáticos': ['Probabilidad y estadística']
  }
};

let manualTotal = 0;

Object.entries(domainRules).forEach(([fileName, rules]) => {
  const filePath = path.join(careersDir, fileName);
  if (!fs.existsSync(filePath)) return;
  
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  
  let modifications = 0;
  data.subjects.forEach(s => {
    Object.keys(rules).forEach(subjectMatch => {
      // Find subject by exact match or loose string match
      if (s.name.toLowerCase().includes(subjectMatch.toLowerCase())) {
        if (!s.correlatives) s.correlatives = [];
        
        // Push missing correlatives
        rules[subjectMatch].forEach(correlative => {
          // Verify the correlative actually exists in the curriculum to avoid breaking relations
          const exists = data.subjects.find(sub => sub.name.toLowerCase().includes(correlative.toLowerCase()));
          
          if (exists && !s.correlatives.includes(exists.name)) {
            s.correlatives.push(exists.name);
            modifications++;
            manualTotal++;
          }
        });
      }
    });
  });

  if (modifications > 0) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`Manual domain rules applied to ${fileName}: +${modifications} correlatives`);
  }
});

console.log(`\nManual Domain Mapping complete. Added ${manualTotal} logical correlatives.`);
