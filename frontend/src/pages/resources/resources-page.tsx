import { BookMarked, ExternalLink } from 'lucide-react';

interface Resource {
  id: string;
  category: string;
  title: string;
  url: string;
  description?: string;
}

export const ResourcesPage = () => {
  const globalResources: Resource[] = [
    {
      id: 'siu',
      category: 'Institucional',
      title: 'SIU Guaraní - Gestión de Alumnos',
      url: 'https://servicios.unahur.edu.ar/unahur3w/',
      description: 'Inscripción a materias, finales y consulta de historia académica oficial.',
    },
    {
      id: 'campus',
      category: 'Académico',
      title: 'Campus Virtual UNAHUR',
      url: 'https://campus.unahur.edu.ar/',
      description: 'Acceso a aulas virtuales, materiales de cátedra y entrega de tareas.',
    },
    {
      id: 'web',
      category: 'Institucional',
      title: 'Portal Oficial UNAHUR',
      url: 'https://unahur.edu.ar/',
      description: 'Sitio web principal de la Universidad Nacional de Hurlingham.',
    },
    {
      id: 'cal',
      category: 'Académico',
      title: 'Calendario Académico Oficial',
      url: 'https://unahur.edu.ar/calendario-academico/',
      description: 'Fechas de inscripciones, recesos y finales definidos por la universidad.',
    },
    {
      id: 'donde',
      category: 'Utilidad',
      title: 'CPU Donde Curso',
      url: 'https://cpudondecurso.unahur.edu.ar/',
      description: 'Consulta rápida de aulas y horarios de cursada.',
    },
  ];

  return (
    <div className="flex flex-col gap-8 pb-24 max-w-4xl mx-auto">
      <header className="flex flex-col gap-2">
        <div className="flex items-center gap-3 text-primary mb-1">
           <BookMarked size={28} />
           <h1 className="text-3xl font-black tracking-tight uppercase">Hub de Recursos</h1>
        </div>
        <p className="text-foreground/50 text-base font-medium">Accesos directos, herramientas institucionales y enlaces externos.</p>
      </header>

      {/* Institutional Resources */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {globalResources.map((resource) => (
          <a
            key={resource.id}
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-card rounded-3xl p-6 shadow-sm border border-foreground/5 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all group flex flex-col gap-4"
          >
            <div className="flex items-start justify-between">
              <div className="w-14 h-14 rounded-2xl bg-primary/5 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                <ExternalLink size={24} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-primary/40 bg-primary/5 px-2 py-1 rounded-lg">
                {resource.category}
              </span>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors leading-tight">
                {resource.title}
              </h3>
              {resource.description && (
                <p className="text-sm text-foreground/50 leading-relaxed">{resource.description}</p>
              )}
            </div>
          </a>
        ))}
        
      </div>
    </div>
  );
};
;
