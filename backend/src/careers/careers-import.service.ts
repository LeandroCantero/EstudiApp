import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';
import { PrismaService } from '../prisma.service';

interface JsonSubject {
  code: string;
  name: string;
  hours: number;
  correlatives: string[];
  year: number | null;
  period: number | null;
}

interface JsonCareer {
  career: string;
  subjects: JsonSubject[];
}

@Injectable()
export class CareersImportService {
  private readonly logger = new Logger(CareersImportService.name);
  private readonly plansDir = path.join(process.cwd(), 'prisma', 'careers');

  constructor(private prisma: PrismaService) {}

  async importAllPlans() {
    this.logger.log('🚀 Starting import of all career plans...');
    
    try {
      const files = await fs.readdir(this.plansDir);
      const jsonFiles = files.filter(f => f.endsWith('.json'));

      for (const file of jsonFiles) {
        await this.importPlan(path.join(this.plansDir, file));
      }

      this.logger.log(`✅ Successfully imported ${jsonFiles.length} plans.`);
    } catch (error) {
      this.logger.error('Error reading plans directory', error);
    }
  }

  async importPlan(filePath: string) {
    const content = await fs.readFile(filePath, 'utf-8');
    const plan: JsonCareer = JSON.parse(content);
    
    // 1. Find the career by name
    const careerName = plan.career;
    const career = await this.prisma.career.findFirst({
      where: { name: { contains: careerName, mode: 'insensitive' } }
    });

    if (!career) {
      this.logger.warn(`⚠️ Career not found for name "${careerName}". Skipping subjects.`);
      return;
    }

    this.logger.log(`📚 Importing subjects for: ${career.name}`);

    // 2. Create/Find Subjects and Link them to Career (CareerSubject)
    const codeToJoinIdMap = new Map<string, string>();

    for (const jsonSubject of plan.subjects) {
      // 2a. Handle Global Subject (The "Truth")
      // Upsert global subject to ensure name/hours are consistent
      const globalSubject = await this.prisma.subject.upsert({
        where: { name: jsonSubject.name },
        update: { hours: jsonSubject.hours },
        create: {
          name: jsonSubject.name,
          hours: jsonSubject.hours,
        },
      });

      // 2b. Handle CareerSubject (The Link)
      // Check if THIS subject is already linked to THIS career
      const existingLink = await this.prisma.careerSubject.findUnique({
        where: {
          careerId_subjectId: {
            careerId: career.id,
            subjectId: globalSubject.id,
          },
        },
      });

      if (existingLink) {
        codeToJoinIdMap.set(jsonSubject.code, existingLink.id);
        continue;
      }

      const createdLink = await this.prisma.careerSubject.create({
        data: {
          code: jsonSubject.code,
          year: jsonSubject.year,
          period: jsonSubject.period,
          careerId: career.id,
          subjectId: globalSubject.id,
        },
      });
      codeToJoinIdMap.set(jsonSubject.code, createdLink.id);
    }

    // 3. Connect correlatives (Career-specific)
    // We connect CareerSubject to CareerSubject within the same career
    for (const jsonSubject of plan.subjects) {
      if (!jsonSubject.correlatives?.length) continue;
      
      const currentLinkId = codeToJoinIdMap.get(jsonSubject.code);
      if (!currentLinkId) continue;

      // JSON has names in prerequisites
      // We need to find the CareerSubject IDs for those names in THIS career
      // First, get all links for this career to have a Name -> LinkId map
      const careerLinks = await this.prisma.careerSubject.findMany({
        where: { careerId: career.id },
        include: { subject: true },
      });

      const nameToLinkIdMap = new Map<string, string>();
      careerLinks.forEach(link => nameToLinkIdMap.set(link.subject.name, link.id));

      const prereqLinkIds = jsonSubject.correlatives
        .map(name => nameToLinkIdMap.get(name))
        .filter((id): id is string => !!id);

      if (prereqLinkIds.length > 0) {
        await this.prisma.careerSubject.update({
          where: { id: currentLinkId },
          data: {
            prerequisites: {
              set: prereqLinkIds.map(id => ({ id })),
            },
          },
        });
      }
    }
  }

  // Helper to map filename to approximate DB name
  private inferCareerName(fileId: string): string {
    // Extracted from filenames -> "Career Name" in DB
    const map: Record<string, string> = {
      'ing-agronomica': 'Ingeniería Agronómica',
      'lic-desarrollo-agrario': 'Licenciatura en Desarrollo Agrario',
      'tec-produccion-agroecologica': 'Tec. Univ. en Producción Agroecológica Periurbana',
      'tec-viverismo': 'Tec. Univ. en Viverismo',
      'lic-biotecnologia': 'Licenciatura en Biotecnología',
      'tec-laboratorios': 'Tec. Univ. en Laboratorios',
      'lic-tecnologia-alimentos': 'Licenciatura en Tecnología de los Alimentos',
      'tec-tecnologia-alimentos': 'Tec. Univ. en Tecnología de los Alimentos',
      'lic-gestion-ambiental': 'Licenciatura en Gestión Ambiental',
      'tec-ciencias-ambiente': 'Tec. Univ. en Ciencias del Ambiente',
      'lic-informatica': 'Licenciatura en Informática',
      'tec-programacion': 'Tec. Univ. en Programación',
      'tec-redes-operaciones': 'Tec. Univ. en Redes y Operaciones Informáticas',
      'tec-inteligencia-artificial': 'Tec. Univ. en Inteligencia Artificial',
      'tec-videojuegos': 'Tec. Univ. en Programación de Videojuegos',
      'ing-energia-electrica': 'Ingeniería en Energía Eléctrica',
      'tec-energia-electrica': 'Tec. Univ. en Energía Eléctrica',
      'tec-electromovilidad': 'Tec. Univ. en Electromovilidad',
      'ing-metalurgica': 'Ingeniería Metalúrgica',
      'tec-metalurgia': 'Tec. Univ. en Metalurgia',
      'lic-gestion-mantenimiento': 'Licenciatura en Gestión del Mantenimiento',
      'tec-mantenimiento-industrial': 'Tec. Univ. en Mantenimiento Industrial',
      'tec-mantenimiento-hospitalario': 'Tec. Univ. en Mantenimiento Hospitalario',
      'lic-diseno-industrial': 'Licenciatura en Diseño Industrial',
      'tec-diseno-industrial': 'Tec. Univ. en Diseño Industrial',
      'lic-kinesiologia-fisiatria': 'Licenciatura en Kinesiología y Fisiatría',
      'tec-salud-kinesiologia': 'Tec. Univ. en Salud Comunitaria (Kinesiología)',
      'lic-obstetricia': 'Licenciatura en Obstetricia',
      'tec-salud-obstetricia': 'Tec. Univ. en Salud Comunitaria (Obstetricia)',
      'lic-enfermeria': 'Licenciatura en Enfermería',
      'enfermeria-universitaria': 'Enfermería Universitaria',
      'lic-nutricion': 'Licenciatura en Nutrición',
      'tec-salud-nutricion': 'Tec. Univ. en Salud Comunitaria (Nutrición)',
      'lic-educacion': 'Licenciatura en Educación',
      'prof-biologia': 'Profesorado Universitario de Biología',
      'tec-socioeducativas-biologia': 'Tec. Univ. en prácticas socioeducativas de Biología',
      'prof-educacion-fisica': 'Profesorado Universitario en Educación Física',
      'tec-socioeducativas-ed-fisica': 'Tec. Univ. en prácticas socioeducativas en Educación Física',
      'prof-geografia': 'Profesorado Universitario de Geografía',
      'tec-socioeducativas-geografia': 'Tec. Univ. en prácticas socioeducativas de Geografía',
      'prof-ingles': 'Profesorado Universitario de Inglés',
      'tec-socioeducativas-ingles': 'Tec. Univ. en prácticas socioeducativas del idioma Inglés',
      'prof-letras': 'Profesorado Universitario de Letras',
      'tec-socioeducativas-escritura': 'Tec. Univ. en prácticas socioeducativas de Escritura y Lectura',
      'prof-matematica': 'Profesorado Universitario de Matemática',
      'tec-socioeducativas-matematica': 'Tec. Univ. en prácticas socioeducativas en Matemática',
    };

    if (map[fileId]) return map[fileId];

    // Fallback normalization logic
    return fileId
      .replace(/-/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase()) // Title Case
      .replace('Lic ', 'Licenciatura en ')
      .replace('Ing ', 'Ingeniería ');
  }
}
