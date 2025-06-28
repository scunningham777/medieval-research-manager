import React from 'react';
import type { Source } from '../types';
import { ResearchStatus, Language, Methodology } from '../types';
import { SourceCard } from './SourceCard';
import styles from './SourceList.module.css';

// Temporary mock data - will be replaced with API call later
const mockSources: Source[] = [
  {
    id: '1',
    title: 'The Canterbury Tales',
    author: 'Geoffrey Chaucer',
    manuscriptLocation: 'British Library, London',
    dateCreated: '1387-01-01T00:00:00Z',
    researchStatus: ResearchStatus.COMPLETED,
    notes: ['Original Middle English version', 'Contains 24 stories'],
    metadata: {
      language: Language.ENGLISH,
      methodology: Methodology.TEXTUAL
    }
  },
  {
    id: '2',
    title: 'Summa Theologica',
    author: 'Thomas Aquinas',
    manuscriptLocation: 'Vatican Library',
    dateCreated: '1274-01-01T00:00:00Z',
    researchStatus: ResearchStatus.IN_PROGRESS,
    notes: ['Latin original', 'Needs paleographic analysis'],
    metadata: {
      language: Language.LATIN,
      methodology: Methodology.PALEOGRAPHIC
    }
  },
  {
    id: '3',
    title: 'Beowulf',
    manuscriptLocation: 'British Library, London',
    dateCreated: '1000-01-01T00:00:00Z',
    researchStatus: ResearchStatus.PLANNED,
    notes: ['Old English epic', 'Needs translation'],
    metadata: {
      language: Language.ENGLISH,
      methodology: Methodology.TEXTUAL
    }
  }
];

export const SourceList: React.FC = () => {
  const [sources] = React.useState<Source[]>(mockSources);

  return (
    <div className={styles.sourceList}>
      <h2 className={styles.title}>Manuscript Sources</h2>
      <ul className={styles.list}>
        {sources.map((source) => (
          <SourceCard key={source.id} source={source} />
        ))}
      </ul>
    </div>
  );
};
