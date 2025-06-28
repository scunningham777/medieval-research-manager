import { Router, Request, Response } from 'express';
import { Pool } from 'pg';
import { SourceModel, SourceSchema } from '../models/Source';
import { z } from 'zod';

const router = Router();

// Initialize model with database pool
let sourceModel: SourceModel;

export const initializeSourceRoutes = (pool: Pool) => {
  sourceModel = new SourceModel(pool);
  return router;
};

// GET /api/sources - List all sources with optional filtering
router.get('/', async (req: Request, res: Response) => {
  try {
    const { researchStatus, language, methodology } = req.query;
    
    const filters: any = {};
    if (researchStatus) filters.researchStatus = researchStatus as string;
    if (language) filters.language = language as string;
    if (methodology) filters.methodology = methodology as string;
    
    const sources = await sourceModel.findAll(filters);
    res.json(sources);
  } catch (error) {
    console.error('Error fetching sources:', error);
    res.status(500).json({ 
      error: 'Failed to fetch sources',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/sources/:id - Get specific source
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Validate UUID format
    if (!z.string().uuid().safeParse(id).success) {
      return res.status(400).json({ error: 'Invalid source ID format' });
    }
    
    const source = await sourceModel.findById(id);
    
    if (!source) {
      return res.status(404).json({ error: 'Source not found' });
    }
    
    res.json(source);
  } catch (error) {
    console.error('Error fetching source:', error);
    res.status(500).json({ 
      error: 'Failed to fetch source',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// POST /api/sources - Create new source
router.post('/', async (req: Request, res: Response) => {
  try {
    // Validate input with Zod
    const createSchema = SourceSchema.omit({ id: true, dateCreated: true });
    const validatedInput = createSchema.parse(req.body);
    
    const newSource = await sourceModel.create(validatedInput);
    res.status(201).json(newSource);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Invalid input data',
        details: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      });
    }
    
    console.error('Error creating source:', error);
    res.status(500).json({ 
      error: 'Failed to create source',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// PUT /api/sources/:id - Update source
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Validate UUID format
    if (!z.string().uuid().safeParse(id).success) {
      return res.status(400).json({ error: 'Invalid source ID format' });
    }
    
    // Validate input with Zod
    const updateSchema = SourceSchema.omit({ id: true, dateCreated: true }).partial();
    const validatedInput = updateSchema.parse(req.body);
    
    const updatedSource = await sourceModel.update(id, validatedInput);
    
    if (!updatedSource) {
      return res.status(404).json({ error: 'Source not found' });
    }
    
    res.json(updatedSource);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Invalid input data',
        details: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      });
    }
    
    console.error('Error updating source:', error);
    res.status(500).json({ 
      error: 'Failed to update source',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// DELETE /api/sources/:id - Delete source
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Validate UUID format
    if (!z.string().uuid().safeParse(id).success) {
      return res.status(400).json({ error: 'Invalid source ID format' });
    }
    
    const deleted = await sourceModel.delete(id);
    
    if (!deleted) {
      return res.status(404).json({ error: 'Source not found' });
    }
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting source:', error);
    res.status(500).json({ 
      error: 'Failed to delete source',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;