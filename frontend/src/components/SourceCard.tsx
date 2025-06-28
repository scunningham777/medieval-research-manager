import { type FC } from 'react';
import clsx from 'clsx';
import type { Source } from '../types/source';
import { ResearchStatus } from '../types/source';
import styles from './SourceCard.module.css';

interface SourceCardProps {
  source: Source;
  onDelete: (id: string) => Promise<void>;
}

export const SourceCard: FC<SourceCardProps> = ({ source, onDelete }) => {
  const statusClass = clsx(styles.status, {
    [styles.statusCompleted]: source.researchStatus === ResearchStatus.COMPLETED,
    [styles.statusInProgress]: source.researchStatus === ResearchStatus.IN_PROGRESS,
    [styles.statusPlanned]: source.researchStatus === ResearchStatus.PLANNED,
  });

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await onDelete(source.id);
    } catch (error) {
      console.error('Error deleting source:', error);
    }
  };

  return (
    <li className={styles.sourceItem}>
      <div className={styles.cardHeader}>
        <h3 className={styles.title}>{source.title}</h3>
        <button 
          onClick={handleDelete}
          className={styles.deleteButton}
          aria-label="Delete source"
          type="button"
        >
          ×
        </button>
      </div>
      {source.author && <p className={styles.author}>By {source.author}</p>}
      <p className={styles.location}>{source.manuscriptLocation}</p>
      <div className={styles.metadata}>
        <span className={statusClass}>
          {source.researchStatus.toLowerCase().replace('_', '-')}
        </span>
        {source.metadata?.language && (
          <span className={styles.languageTag}>
            {source.metadata.language.toLowerCase()}
          </span>
        )}
        {source.metadata?.methodology && (
          <span className={styles.methodologyTag}>
            {source.metadata.methodology.toLowerCase()}
          </span>
        )}
      </div>
    </li>
  );
};
