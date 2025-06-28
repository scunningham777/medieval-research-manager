import React, { useState } from 'react';
import type { CreateSourceInput } from '../types';
import { ResearchStatus, Language, Methodology } from '../types';
import styles from './SourceForm.module.css';

interface SourceFormProps {
  onSubmit: (source: CreateSourceInput) => void;
  onCancel?: () => void;
}

export const SourceForm: React.FC<SourceFormProps> = ({ onSubmit, onCancel }) => {
  const isFormValid = (): boolean => {
    // Required fields validation
    if (!formData.title.trim()) return false;
    if (!formData.manuscriptLocation.trim()) return false;
    
    // Validate research status
    if (!Object.values(ResearchStatus).includes(formData.researchStatus)) {
      return false;
    }
    
    // Validate metadata fields if needed
    if (formData.metadata) {
      if (formData.metadata.language && !Object.values(Language).includes(formData.metadata.language)) {
        return false;
      }
      if (formData.metadata.methodology && !Object.values(Methodology).includes(formData.metadata.methodology)) {
        return false;
      }
    }
    
    return true;
  };
  const [formData, setFormData] = useState<CreateSourceInput>({
    title: '',
    author: '',
    manuscriptLocation: '',
    researchStatus: ResearchStatus.PLANNED,
    notes: [],
    metadata: {
      language: Language.ENGLISH,
      methodology: Methodology.TEXTUAL,
    },
  });

  const [newNote, setNewNote] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Handle nested metadata fields
    if (name.startsWith('metadata.')) {
      const field = name.split('.')[1] as keyof CreateSourceInput['metadata'];
      setFormData(prev => ({
        ...prev,
        metadata: {
          ...prev.metadata,
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleAddNote = () => {
    if (newNote.trim()) {
      setFormData(prev => ({
        ...prev,
        notes: [...prev.notes, newNote.trim()]
      }));
      setNewNote('');
    }
  };

  const handleRemoveNote = (index: number) => {
    setFormData(prev => ({
      ...prev,
      notes: prev.notes.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <h2>Add New Source</h2>
      
      <div className={styles.formGroup}>
        <label htmlFor="title">Title *</label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          className={styles.input}
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="author">Author</label>
        <input
          type="text"
          id="author"
          name="author"
          value={formData.author}
          onChange={handleChange}
          className={styles.input}
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="manuscriptLocation">Manuscript Location *</label>
        <input
          type="text"
          id="manuscriptLocation"
          name="manuscriptLocation"
          value={formData.manuscriptLocation}
          onChange={handleChange}
          required
          className={styles.input}
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="researchStatus">Research Status</label>
        <select
          id="researchStatus"
          name="researchStatus"
          value={formData.researchStatus}
          onChange={handleChange}
          className={styles.select}
        >
          {Object.values(ResearchStatus).map(status => (
            <option key={status} value={status}>
              {status.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.formGroup}>
        <label>Metadata</label>
        <div className={styles.metadataGrid}>
          <div className={styles.formGroup}>
            <label htmlFor="metadata.language">Language</label>
            <select
              id="metadata.language"
              name="metadata.language"
              value={formData.metadata.language}
              onChange={handleChange}
              className={styles.select}
            >
              {Object.values(Language).map(lang => (
                <option key={lang} value={lang}>
                  {lang.charAt(0).toUpperCase() + lang.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="metadata.methodology">Methodology</label>
            <select
              id="metadata.methodology"
              name="metadata.methodology"
              value={formData.metadata.methodology}
              onChange={handleChange}
              className={styles.select}
            >
              {Object.values(Methodology).map(method => (
                <option key={method} value={method}>
                  {method.charAt(0).toUpperCase() + method.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className={styles.formGroup}>
        <label>Notes</label>
        <div className={styles.notesContainer}>
          {formData.notes.map((note, index) => (
            <div key={index} className={styles.noteItem}>
              <span>{note}</span>
              <button
                type="button"
                onClick={() => handleRemoveNote(index)}
                className={styles.removeButton}
                aria-label="Remove note"
              >
                ×
              </button>
            </div>
          ))}
          <div className={styles.noteInputContainer}>
            <input
              type="text"
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Add a note..."
              className={styles.input}
            />
            <button
              type="button"
              onClick={handleAddNote}
              className={styles.addButton}
              disabled={!newNote.trim()}
            >
              Add Note
            </button>
          </div>
        </div>
      </div>

      <div className={styles.buttonGroup}>
        <button 
            type="submit" 
            className={`${styles.primaryButton} ${!isFormValid() ? styles.disabledButton : ''}`}
            disabled={!isFormValid()}
          >
            Save Source
          </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className={styles.secondaryButton}
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};
