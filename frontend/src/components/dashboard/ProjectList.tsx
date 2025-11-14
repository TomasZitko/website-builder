import { ProjectCard } from './ProjectCard';
import { Spinner } from '@/components/ui/Spinner';
import { Website } from '@/hooks/useWebsites';
import { Globe } from 'lucide-react';

interface ProjectListProps {
  websites: Website[];
  isLoading: boolean;
  onDelete: (id: string) => void;
}

export function ProjectList({ websites, isLoading, onDelete }: ProjectListProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (websites.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-20 h-20 bg-background rounded-full flex items-center justify-center mb-4">
          <Globe className="w-10 h-10 text-text-muted" />
        </div>
        <h3 className="text-xl font-semibold text-text mb-2">
          No websites yet
        </h3>
        <p className="text-text-muted max-w-sm">
          Create your first AI-generated website to get started
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {websites.map((website) => (
        <ProjectCard
          key={website.id}
          website={website}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
