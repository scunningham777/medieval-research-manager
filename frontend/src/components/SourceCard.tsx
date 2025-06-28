import React from 'react';
import clsx from 'clsx';
import type { Source } from '../types';
import { ResearchStatus } from '../types';
import styles from './SourceCard.module.css';

interface SourceCardProps {
  source: Source;
}
export const SourceCard: React.FC<SourceCardProps> = ({ source }) => {
  const statusClass = clsx(styles.status, {
    [styles.statusCompleted]: source.researchStatus === ResearchStatus.COMPLETED,
    [styles.statusInProgress]: source.researchStatus === ResearchStatus.IN_PROGRESS,
    [styles.statusPlanned]: source.researchStatus === ResearchStatus.PLANNED,
  });

  return (
    <li className={styles.sourceItem}>
      <h3 className={styles.title}>{source.title}</h3>
      {source.author && <p className={styles.author}>By {source.author}</p>}
      <p className={styles.location}>{source.manuscriptLocation}</p>
      <div className={styles.metadata}>
        <span className={statusClass}>
          {source.researchStatus}
        </span>
        <span className={styles.languageTag}>
          {source.metadata.language}
        </span>
        <span className={styles.methodologyTag}>
          {source.metadata.methodology}
        </span>
      </div>
    </li>
  );
};
