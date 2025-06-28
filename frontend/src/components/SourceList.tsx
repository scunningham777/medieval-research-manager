import { useState, useEffect } from 'react';
import type { Source, CreateSourceInput } from '../types/source';
import { SourceCard } from './SourceCard';
import { SourceForm } from './SourceForm';
import { fetchSources, createSource, deleteSource } from '../api/sources';
import styles from './SourceList.module.css';

export const SourceList: React.FC = () => {
  const [sources, setSources] = useState<Source[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    const loadSources = async () => {
      try {
        setIsLoading(true);
        const data = await fetchSources();
        setSources(data);
        setError(null);
      } catch (err) {
        console.error('Failed to load sources:', err);
        setError('Failed to load sources. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    loadSources();
  }, []);

  const handleAddSource = async (newSource: CreateSourceInput) => {
    try {
      const createdSource = await createSource(newSource);
      setSources(prev => [...prev, createdSource]);
      setIsFormOpen(false);
    } catch (err) {
      console.error('Failed to create source:', err);
      setError('Failed to create source. Please try again.');
    }
  };

  const handleDeleteSource = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this source?')) {
      return;
    }
    try {
      await deleteSource(id);
      setSources(prev => prev.filter(source => source.id !== id));
    } catch (err) {
      console.error('Failed to delete source:', err);
      setError('Failed to delete source. Please try again.');
    }
  };

  return (
    <div className={styles.sourceList}>
      {isLoading ? (
        <div className={styles.container}>
          <div className={styles.loading}>Loading sources...</div>
        </div>
      ) : error ? (
        <div className={styles.container}>
          <div className={styles.error}>
            {error}
            <button 
              onClick={() => window.location.reload()}
              className={styles.retryButton}
            >
              Retry
            </button>
          </div>
        </div>
      ) : (
        <div className={styles.container}>
          <div className={styles.header}>
            <h2>Sources</h2>
            <button 
              onClick={() => setIsFormOpen(true)}
              className={styles.addButton}
            >
              Add Source
            </button>
          </div>
          
          {isFormOpen && (
            <div className={styles.modalOverlay}>
              <div className={styles.modalContent}>
                <SourceForm 
                  onSubmit={handleAddSource}
                  onCancel={() => setIsFormOpen(false)}
                />
              </div>
            </div>
          )}

          <div className={styles.sourcesGrid}>
            {sources.length === 0 ? (
              <div className={styles.emptyState}>
                <p>No sources found. Add your first source to get started!</p>
              </div>
            ) : (
              sources.map((source) => (
                <SourceCard 
                  key={source.id} 
                  source={source} 
                  onDelete={handleDeleteSource} 
                />
              ))
            )}
          </div>
          
          {error && <div className={styles.error}>{error}</div>}
        </div>
      )}
    </div>
  );
};
