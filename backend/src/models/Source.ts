import { Pool } from 'pg';
import { z } from 'zod';

// Zod scema for validation
export const SourceSchema = z.object({
    id: z.string().uuid().optional(),
    title: z.string().min(1, 'Title is required'),
    author: z.string().optional(),
    manuscriptLocation: z.string().min(1, 'Manuscript location is required'),
    dateCreated: z.string().datetime(),
    researchStatus: z.enum(['planned', 'in-progress', 'completed']),
    notes: z.array(z.string()).default([]),
    metadata: z.object({
      language: z.enum(['english', 'latin']),
      methodology: z.enum(['paleographic', 'textual'])  
    })
});

export type Source = z.infer<typeof SourceSchema>;
export type CreateSourceInput = Omit<Source, 'id' | 'dateCreated'>;
export type UpdateSourceInput = Partial<CreateSourceInput>;


export class SourceModel {
    constructor(private pool: Pool) {}

    // Create sources table
    async createTable(): Promise<void> {
    const query = `
      CREATE TABLE IF NOT EXISTS sources (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(255) NOT NULL,
        author VARCHAR(255),
        manuscript_location VARCHAR(255) NOT NULL,
        date_created TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        research_status VARCHAR(20) CHECK (research_status IN ('planned', 'in-progress', 'completed')) DEFAULT 'planned',
        notes TEXT[] DEFAULT '{}',
        language VARCHAR(10) CHECK (language IN ('latin', 'english')) DEFAULT 'latin',
        methodology VARCHAR(20) CHECK (methodology IN ('paleographic', 'textual')) DEFAULT 'paleographic',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    
    await this.pool.query(query);
  }

  // Get all sources with optional filtering
  async findAll(filters?: {
    researchStatus?: string;
    language?: string;
    methodology?: string;
  }): Promise<Source[]> {
    let query = `
      SELECT 
        id,
        title,
        author,
        manuscript_location as "manuscriptLocation",
        date_created as "dateCreated",
        research_status as "researchStatus",
        notes,
        language,
        methodology
      FROM sources
    `;
    
    const conditions: string[] = [];
    const values: any[] = [];
    
    if (filters?.researchStatus) {
      conditions.push(`research_status = $${values.length + 1}`);
      values.push(filters.researchStatus);
    }
    
    if (filters?.language) {
      conditions.push(`language = $${values.length + 1}`);
      values.push(filters.language);
    }
    
    if (filters?.methodology) {
      conditions.push(`methodology = $${values.length + 1}`);
      values.push(filters.methodology);
    }
    
    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }
    
    query += ` ORDER BY created_at DESC`;
    
    const result = await this.pool.query(query, values);
    
    return result.rows.map(row => ({
      ...row,
      metadata: {
        language: row.language,
        methodology: row.methodology
      }
    }));
  }

  // Get source by ID
  async findById(id: string): Promise<Source | null> {
    const query = `
      SELECT 
        id,
        title,
        author,
        manuscript_location as "manuscriptLocation",
        date_created as "dateCreated",
        research_status as "researchStatus",
        notes,
        language,
        methodology
      FROM sources 
      WHERE id = $1
    `;
    
    const result = await this.pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const row = result.rows[0];
    return {
      ...row,
      metadata: {
        language: row.language,
        methodology: row.methodology
      }
    };
  }

  // Create new source
  async create(input: CreateSourceInput): Promise<Source> {
    const validated = SourceSchema.omit({ id: true, dateCreated: true }).parse(input);
    
    const query = `
      INSERT INTO sources (
        title, 
        author, 
        manuscript_location, 
        research_status, 
        notes, 
        language, 
        methodology
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING 
        id,
        title,
        author,
        manuscript_location as "manuscriptLocation",
        date_created as "dateCreated",
        research_status as "researchStatus",
        notes,
        language,
        methodology
    `;
    
    const values = [
      validated.title,
      validated.author || null,
      validated.manuscriptLocation,
      validated.researchStatus,
      validated.notes,
      validated.metadata.language,
      validated.metadata.methodology
    ];
    
    const result = await this.pool.query(query, values);
    const row = result.rows[0];
    
    return {
      ...row,
      metadata: {
        language: row.language,
        methodology: row.methodology
      }
    };
  }

  // Update source
  async update(id: string, input: UpdateSourceInput): Promise<Source | null> {
    const validated = SourceSchema.omit({ id: true, dateCreated: true }).partial().parse(input);
    
    const updateFields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;
    
    if (validated.title !== undefined) {
      updateFields.push(`title = $${paramCount++}`);
      values.push(validated.title);
    }
    
    if (validated.author !== undefined) {
      updateFields.push(`author = $${paramCount++}`);
      values.push(validated.author);
    }
    
    if (validated.manuscriptLocation !== undefined) {
      updateFields.push(`manuscript_location = $${paramCount++}`);
      values.push(validated.manuscriptLocation);
    }
    
    if (validated.researchStatus !== undefined) {
      updateFields.push(`research_status = $${paramCount++}`);
      values.push(validated.researchStatus);
    }
    
    if (validated.notes !== undefined) {
      updateFields.push(`notes = $${paramCount++}`);
      values.push(validated.notes);
    }
    
    if (validated.metadata?.language !== undefined) {
      updateFields.push(`language = $${paramCount++}`);
      values.push(validated.metadata.language);
    }
    
    if (validated.metadata?.methodology !== undefined) {
      updateFields.push(`methodology = $${paramCount++}`);
      values.push(validated.metadata.methodology);
    }
    
    if (updateFields.length === 0) {
      return this.findById(id);
    }
    
    updateFields.push(`updated_at = NOW()`);
    values.push(id);
    
    const query = `
      UPDATE sources 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING 
        id,
        title,
        author,
        manuscript_location as "manuscriptLocation",
        date_created as "dateCreated",
        research_status as "researchStatus",
        notes,
        language,
        methodology
    `;
    
    const result = await this.pool.query(query, values);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const row = result.rows[0];
    return {
      ...row,
      metadata: {
        language: row.language,
        methodology: row.methodology
      }
    };
  }

  // Delete source
  async delete(id: string): Promise<boolean> {
    const query = 'DELETE FROM sources WHERE id = $1';
    const result = await this.pool.query(query, [id]);
    return result.rowCount ? result.rowCount > 0 : false;
  }
}