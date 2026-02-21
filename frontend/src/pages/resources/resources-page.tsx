import { BookMarked, ExternalLink, Plus } from 'lucide-react';
import { useState } from 'react';

interface Resource {
  id: string;
  category: string;
  title: string;
  url: string;
  description?: string;
}

export const ResourcesPage = () => {
  const [activeTab, setActiveTab] = useState<'global' | 'personal'>('global');

  const globalResources: Resource[] = [
    {
      id: '1',
      category: 'UNAHUR',
      title: 'Página oficial UNAHUR',
      url: 'https://www.unahur.edu.ar',
      description: 'Universidad Nacional de Hurlingham',
    },
    {
      id: '2',
      category: 'Calendario',
      title: 'Calendario Académico',
      url: '#',
      description: 'Fechas importantes del cuatrimestre',
    },
    {
      id: '3',
      category: 'Biblioteca',
      title: 'Biblioteca Digital',
      url: '#',
      description: 'Acceso a recursos bibliográficos',
    },
  ];

  const personalResources: Resource[] = [
    {
      id: '4',
      category: 'Apuntes',
      title: 'Apuntes Matemática I',
      url: 'https://notion.so',
      description: 'Apuntes del primer cuatrimestre',
    },
  ];

  const resources = activeTab === 'global' ? globalResources : personalResources;

  return (
    <div className="flex flex-col gap-6 pb-24">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Recursos</h1>
          <p className="text-foreground/60 text-sm">Links útiles y materiales</p>
        </div>
        {activeTab === 'personal' && (
          <button className="bg-primary text-primary-foreground p-3 rounded-xl shadow-lg shadow-primary/20">
            <Plus size={24} />
          </button>
        )}
      </header>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-card rounded-xl">
        <button
          onClick={() => setActiveTab('global')}
          className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'global'
              ? 'bg-primary text-primary-foreground shadow-md'
              : 'text-foreground/60 hover:text-foreground'
          }`}
        >
          Generales
        </button>
        <button
          onClick={() => setActiveTab('personal')}
          className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'personal'
              ? 'bg-primary text-primary-foreground shadow-md'
              : 'text-foreground/60 hover:text-foreground'
          }`}
        >
          Personales
        </button>
      </div>

      {/* Resources List */}
      <div className="flex flex-col gap-4">
        {resources.map((resource) => (
          <a
            key={resource.id}
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-card rounded-2xl p-5 shadow-sm border border-foreground/5 hover:border-primary/30 transition-all group"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <BookMarked size={24} className="text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-primary px-2 py-1 bg-primary/10 rounded-lg">
                    {resource.category}
                  </span>
                </div>
                <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">
                  {resource.title}
                </h3>
                {resource.description && (
                  <p className="text-sm text-foreground/60">{resource.description}</p>
                )}
              </div>
              <ExternalLink size={20} className="text-foreground/40 flex-shrink-0" />
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};
