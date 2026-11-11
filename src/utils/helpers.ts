import { v4 as uuidv4 } from 'uuid';
import { ParsedTable, TableColumn, ChenEntity, ChenRelationship, ChenAttribute, ChenDiagram } from '../types';

// ============================================
// ID Generation
// ============================================

/**
 * Generate a unique ID for diagram elements
 */
export const generateId = (prefix?: string): string => {
  const id = uuidv4();
  return prefix ? `${prefix}-${id.substring(0, 8)}` : id;
};

// ============================================
// String Utilities
// ============================================

/**
 * Convert camelCase or snake_case to Title Case
 */
export const toTitleCase = (str: string): string => {
  return str
    .replace(/[_-]/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * Convert string to camelCase
 */
export const toCamelCase = (str: string): string => {
  return str
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase())
    .replace(/^[A-Z]/, (chr) => chr.toLowerCase());
};

/**
 * Convert string to snake_case
 */
export const toSnakeCase = (str: string): string => {
  return str
    .replace(/\s+/g, '_')
    .replace(/([A-Z])/g, '_$1')
    .toLowerCase()
    .replace(/^_/, '')
    .replace(/_+/g, '_');
};

/**
 * Pluralize a word (basic implementation)
 */
export const pluralize = (word: string): string => {
  if (word.endsWith('y')) {
    return word.slice(0, -1) + 'ies';
  }
  if (word.endsWith('s') || word.endsWith('x') || word.endsWith('z') || 
      word.endsWith('ch') || word.endsWith('sh')) {
    return word + 'es';
  }
  return word + 's';
};

/**
 * Singularize a word (basic implementation)
 */
export const singularize = (word: string): string => {
  if (word.endsWith('ies')) {
    return word.slice(0, -3) + 'y';
  }
  if (word.endsWith('ses') || word.endsWith('xes') || word.endsWith('zes') ||
      word.endsWith('ches') || word.endsWith('shes')) {
    return word.slice(0, -2);
  }
  if (word.endsWith('s') && !word.endsWith('ss')) {
    return word.slice(0, -1);
  }
  return word;
};

// ============================================
// Table Name Utilities
// ============================================

/**
 * Extract a meaningful entity name from a table name
 */
export const extractEntityName = (tableName: string): string => {
  // Remove common prefixes/suffixes
  let name = tableName
    .replace(/^tbl_/i, '')
    .replace(/^table_/i, '')
    .replace(/_table$/i, '')
    .replace(/_tbl$/i, '');
  
  return toTitleCase(name);
};

/**
 * Check if a table is likely a junction/join table
 */
export const isLikelyJunctionTable = (tableName: string, columns: TableColumn[]): boolean => {
  // Check by name pattern
  const junctionPatterns = [
    /_has_/i,
    /_belongs_to_/i,
    /_maps_/i,
    /_links_/i,
    /_relates_/i,
    /junction/i,
    /mapping/i,
    /xref/i,
    /cross_ref/i,
  ];
  
  const nameMatch = junctionPatterns.some(pattern => pattern.test(tableName));
  
  // Check by structure
  const foreignKeys = columns.filter(col => col.isForeignKey);
  const nonKeyColumns = columns.filter(col => !col.isForeignKey && !col.isPrimaryKey);
  
  const structureMatch = foreignKeys.length >= 2 && nonKeyColumns.length <= 2;
  
  return nameMatch || structureMatch;
};

/**
 * Generate a relationship name from junction table
 */
export const generateRelationshipName = (junctionTableName: string): string => {
  // Clean up the name
  let name = junctionTableName
    .replace(/_/g, ' ')
    .replace(/junction/i, '')
    .replace(/rel/i, '')
    .replace(/mapping/i, '')
    .trim();
  
  // Common relationship verbs
  const words = name.split(' ');
  if (words.length >= 2) {
    return words.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  }
  
  return name.charAt(0).toUpperCase() + name.slice(1);
};

// ============================================
// Relationship Name Generation
// ============================================

/**
 * Generate relationship name from foreign key column
 */
export const generateFKRelationshipName = (
  fkColumn: string,
  childTable: string,
  parentTable: string
): string => {
  // Common foreign key patterns
  const patterns: Record<string, string> = {
    'user_id': 'Belongs To User',
    'created_by': 'Created By',
    'updated_by': 'Updated By',
    'author_id': 'Written By',
    'owner_id': 'Owned By',
    'manager_id': 'Managed By',
    'parent_id': 'Child Of',
    'category_id': 'Categorized As',
    'type_id': 'Typed As',
    'status_id': 'Has Status',
    'group_id': 'Belongs To Group',
    'team_id': 'Part Of Team',
    'department_id': 'Works In',
    'company_id': 'Employed By',
    'project_id': 'Assigned To',
    'task_id': 'Contains Task',
    'order_id': 'Part Of Order',
    'product_id': 'Contains Product',
    'customer_id': 'Purchased By',
    'supplier_id': 'Supplied By',
    'location_id': 'Located At',
    'address_id': 'Has Address',
    'role_id': 'Has Role',
    'permission_id': 'Has Permission',
  };
  
  // Check for exact match
  if (patterns[fkColumn.toLowerCase()]) {
    return patterns[fkColumn.toLowerCase()];
  }
  
  // Generate from column name
  const columnWithoutId = fkColumn.replace(/_id$/i, '').replace(/Id$/i, '');
  const action = determineRelationshipAction(columnWithoutId);
  
  return `${action} ${toTitleCase(parentTable)}`;
};

/**
 * Determine the action verb for a relationship
 */
const determineRelationshipAction = (columnName: string): string => {
  const actions: Record<string, string> = {
    'created': 'Creates',
    'updated': 'Updates',
    'deleted': 'Deletes',
    'author': 'Writes',
    'owner': 'Owns',
    'manager': 'Manages',
    'parent': 'Contains',
    'child': 'Belongs To',
    'category': 'Categorizes',
    'type': 'Defines',
    'status': 'Has',
    'group': 'Groups',
    'team': 'Teams',
    'department': 'Departments',
    'company': 'Employs',
    'project': 'Assigns',
    'task': 'Contains',
    'order': 'Orders',
    'product': 'Contains',
    'customer': 'Serves',
    'supplier': 'Supplies',
    'location': 'Locates',
    'address': 'Locates',
  };
  
  for (const [key, value] of Object.entries(actions)) {
    if (columnName.toLowerCase().includes(key)) {
      return value;
    }
  }
  
  return 'Relates To';
};

// ============================================
// Position and Layout Utilities
// ============================================

/**
 * Calculate grid-based position for entities
 */
export const calculateGridPosition = (
  index: number,
  columns: number = 3,
  spacing: { x: number; y: number } = { x: 400, y: 350 }
): { x: number; y: number } => {
  const row = Math.floor(index / columns);
  const col = index % columns;
  
  return {
    x: 100 + col * spacing.x,
    y: 100 + row * spacing.y,
  };
};

/**
 * Calculate position for relationship diamond
 */
export const calculateRelationshipPosition = (
  entities: { position: { x: number; y: number } }[]
): { x: number; y: number } => {
  if (entities.length === 0) return { x: 0, y: 0 };
  
  const totalX = entities.reduce((sum, e) => sum + e.position.x, 0);
  const totalY = entities.reduce((sum, e) => sum + e.position.y, 0);
  
  return {
    x: totalX / entities.length,
    y: totalY / entities.length + 150,
  };
};

/**
 * Calculate attribute position around an entity
 */
export const calculateAttributePosition = (
  entityPosition: { x: number; y: number },
  attributeIndex: number,
  totalAttributes: number,
  side: 'left' | 'right' | 'top' | 'bottom' = 'left'
): { x: number; y: number } => {
  const spacing = 80;
  const offset = 150;
  
  switch (side) {
    case 'left':
      return {
        x: entityPosition.x - offset,
        y: entityPosition.y - ((totalAttributes - 1) * spacing) / 2 + attributeIndex * spacing,
      };
    case 'right':
      return {
        x: entityPosition.x + offset,
        y: entityPosition.y - ((totalAttributes - 1) * spacing) / 2 + attributeIndex * spacing,
      };
    case 'top':
      return {
        x: entityPosition.x - ((totalAttributes - 1) * spacing) / 2 + attributeIndex * spacing,
        y: entityPosition.y - offset,
      };
    case 'bottom':
      return {
        x: entityPosition.x - ((totalAttributes - 1) * spacing) / 2 + attributeIndex * spacing,
        y: entityPosition.y + offset,
      };
    default:
      return entityPosition;
  }
};

// ============================================
// Validation Utilities
// ============================================

/**
 * Validate SQL syntax (basic check)
 */
export const validateSQL = (sql: string): { valid: boolean; error?: string } => {
  if (!sql || sql.trim() === '') {
    return { valid: false, error: 'SQL code is empty' };
  }
  
  const upperSQL = sql.toUpperCase();
  
  // Check for CREATE TABLE statements
  if (!upperSQL.includes('CREATE TABLE')) {
    return { 
      valid: false, 
      error: 'No CREATE TABLE statements found. This tool requires CREATE TABLE statements to generate ERD.' 
    };
  }
  
  // Check for basic syntax
  const createTableCount = (sql.match(/CREATE\s+TABLE/gi) || []).length;
  const semicolonCount = (sql.match(/;/g) || []).length;
  
  if (createTableCount > semicolonCount) {
    return { 
      valid: false, 
      error: 'Some CREATE TABLE statements are missing semicolons (;)' 
    };
  }
  
  return { valid: true };
};

/**
 * Validate table structure
 */
export const validateTable = (table: ParsedTable): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!table.name || table.name.trim() === '') {
    errors.push('Table name is required');
  }
  
  if (table.columns.length === 0) {
    errors.push(`Table "${table.name}" has no columns`);
  }
  
  const hasPrimaryKey = table.columns.some(col => col.isPrimaryKey);
  if (!hasPrimaryKey && !table.isJunctionTable) {
    errors.push(`Table "${table.name}" has no primary key defined`);
  }
  
  // Validate foreign key references
  table.columns.forEach(col => {
    if (col.isForeignKey && !col.references) {
      errors.push(`Column "${col.name}" in table "${table.name}" is marked as foreign key but has no reference`);
    }
  });
  
  return {
    valid: errors.length === 0,
    errors,
  };
};

// ============================================
// Data Transformation Utilities
// ============================================

/**
 * Convert parsed tables to diagram data
 */
export const tablesToDiagram = (tables: ParsedTable[]): ChenDiagram => {
  const entities: ChenEntity[] = [];
  const relationships: ChenRelationship[] = [];
  
  tables.forEach((table, index) => {
    if (!table.isJunctionTable) {
      // Create entity
      const entity: ChenEntity = {
        id: generateId('entity'),
        name: extractEntityName(table.name),
        attributes: table.columns.map(col => ({
          id: generateId('attr'),
          name: col.name,
          isPrimaryKey: col.isPrimaryKey,
          isMultivalued: false,
          isDerived: false,
        })),
        position: calculateGridPosition(entities.length),
        isWeakEntity: !table.columns.some(col => col.isPrimaryKey),
      };
      entities.push(entity);
    }
  });
  
  // Create relationships
  tables.forEach(table => {
    if (table.isJunctionTable) {
      // Junction table -> many-to-many relationship
      const relatedTables = table.columns
        .filter(col => col.isForeignKey && col.references)
        .map(col => col.references!.table);
      
      const relatedEntities = entities.filter(e => 
        relatedTables.includes(e.name.toLowerCase())
      );
      
      if (relatedEntities.length >= 2) {
        const relationship: ChenRelationship = {
          id: generateId('rel'),
          name: generateRelationshipName(table.name),
          entities: relatedEntities.map(e => e.id),
          cardinalities: relatedEntities.reduce((acc, entity) => ({
            ...acc,
            [entity.id]: 'M',
          }), {}),
          position: calculateRelationshipPosition(relatedEntities),
          isIdentifying: table.columns.some(col => col.isPrimaryKey && col.isForeignKey),
          attributes: table.columns
            .filter(col => !col.isForeignKey && !col.isPrimaryKey)
            .map(col => ({
              id: generateId('attr'),
              name: col.name,
              isPrimaryKey: false,
              isMultivalued: false,
              isDerived: false,
            })),
        };
        relationships.push(relationship);
      }
    } else {
      // Regular table -> check for foreign keys
      table.columns.forEach(col => {
        if (col.isForeignKey && col.references) {
          const childEntity = entities.find(e => 
            e.name.toLowerCase() === table.name.toLowerCase()
          );
          const parentEntity = entities.find(e => 
            e.name.toLowerCase() === col.references!.table.toLowerCase()
          );
          
          if (childEntity && parentEntity) {
            // Check if relationship already exists
            const exists = relationships.some(r =>
              r.entities.includes(childEntity.id) && 
              r.entities.includes(parentEntity.id)
            );
            
            if (!exists) {
              const relationship: ChenRelationship = {
                id: generateId('rel'),
                name: generateFKRelationshipName(col.name, table.name, col.references.table),
                entities: [childEntity.id, parentEntity.id],
                cardinalities: {
                  [parentEntity.id]: '1',
                  [childEntity.id]: 'N',
                },
                position: calculateRelationshipPosition([childEntity, parentEntity]),
              };
              relationships.push(relationship);
            }
          }
        }
      });
    }
  });
  
  return { entities, relationships };
};

// ============================================
// Export Utilities
// ============================================

/**
 * Format file size for display
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Generate a filename with timestamp
 */
export const generateFilename = (prefix: string, extension: string): string => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  return `${prefix}-${timestamp}.${extension}`;
};

/**
 * Sanitize filename
 */
export const sanitizeFilename = (filename: string): string => {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_+/g, '_')
    .toLowerCase();
};

// ============================================
// Clipboard Utilities
// ============================================

/**
 * Copy text to clipboard
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy to clipboard:', err);
    
    // Fallback method
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.select();
    
    try {
      document.execCommand('copy');
      return true;
    } catch (fallbackErr) {
      console.error('Fallback clipboard copy failed:', fallbackErr);
      return false;
    } finally {
      document.body.removeChild(textArea);
    }
  }
};

// ============================================
// Debounce and Throttle Utilities
// ============================================

/**
 * Debounce function
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: number | NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Throttle function
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// ============================================
// Array Utilities
// ============================================

/**
 * Group array by key
 */
export const groupBy = <T>(array: T[], key: keyof T): Record<string, T[]> => {
  return array.reduce((acc, item) => {
    const groupKey = String(item[key]);
    if (!acc[groupKey]) {
      acc[groupKey] = [];
    }
    acc[groupKey].push(item);
    return acc;
  }, {} as Record<string, T[]>);
};

/**
 * Sort array by key
 */
export const sortBy = <T>(array: T[], key: keyof T, order: 'asc' | 'desc' = 'asc'): T[] => {
  return [...array].sort((a, b) => {
    if (a[key] < b[key]) return order === 'asc' ? -1 : 1;
    if (a[key] > b[key]) return order === 'asc' ? 1 : -1;
    return 0;
  });
};

/**
 * Remove duplicates from array
 */
export const unique = <T>(array: T[]): T[] => {
  return [...new Set(array)];
};

/**
 * Remove duplicates by key
 */
export const uniqueBy = <T>(array: T[], key: keyof T): T[] => {
  const seen = new Set();
  return array.filter(item => {
    const value = item[key];
    if (seen.has(value)) return false;
    seen.add(value);
    return true;
  });
};

// ============================================
// Object Utilities
// ============================================

/**
 * Deep clone an object
 */
export const deepClone = <T>(obj: T): T => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as any;
  if (obj instanceof Array) return obj.map(item => deepClone(item)) as any;
  
  const clonedObj = {} as T;
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      clonedObj[key] = deepClone(obj[key]);
    }
  }
  return clonedObj;
};

/**
 * Omit keys from object
 */
export const omit = <T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> => {
  const result = { ...obj };
  keys.forEach(key => delete result[key]);
  return result;
};

/**
 * Pick keys from object
 */
export const pick = <T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> => {
  const result = {} as Pick<T, K>;
  keys.forEach(key => {
    if (key in obj) {
      result[key] = obj[key];
    }
  });
  return result;
};

// ============================================
// Color Utilities
// ============================================

/**
 * Generate a color from a string (for consistent coloring)
 */
export const stringToColor = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const hue = hash % 360;
  return `hsl(${hue}, 70%, 50%)`;
};

/**
 * Lighten a color
 */
export const lightenColor = (color: string, percent: number): string => {
  if (color.startsWith('hsl')) {
    const match = color.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
    if (match) {
      const lightness = Math.min(100, parseInt(match[3]) + percent);
      return `hsl(${match[1]}, ${match[2]}%, ${lightness}%)`;
    }
  }
  return color;
};

// ============================================
// Diagram Helper Utilities
// ============================================

/**
 * Get entity by ID
 */
export const getEntityById = (diagram: ChenDiagram, id: string): ChenEntity | undefined => {
  return diagram.entities.find(e => e.id === id);
};

/**
 * Get relationship by ID
 */
export const getRelationshipById = (diagram: ChenDiagram, id: string): ChenRelationship | undefined => {
  return diagram.relationships.find(r => r.id === id);
};

/**
 * Get all relationships for an entity
 */
export const getEntityRelationships = (diagram: ChenDiagram, entityId: string): ChenRelationship[] => {
  return diagram.relationships.filter(r => r.entities.includes(entityId));
};

/**
 * Count total elements in diagram
 */
export const countDiagramElements = (diagram: ChenDiagram): { entities: number; relationships: number; attributes: number } => {
  const entityAttributes = diagram.entities.reduce((sum, entity) => sum + entity.attributes.length, 0);
  const relationshipAttributes = diagram.relationships.reduce((sum, rel) => sum + (rel.attributes?.length || 0), 0);
  
  return {
    entities: diagram.entities.length,
    relationships: diagram.relationships.length,
    attributes: entityAttributes + relationshipAttributes,
  };
};

// ============================================
// Error Handling Utilities
// ============================================

/**
 * Format error message for display
 */
export const formatErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unexpected error occurred';
};

/**
 * Try-catch wrapper for async functions
 */
export const tryCatch = async <T>(
  fn: () => Promise<T>,
  fallback: T,
  onError?: (error: Error) => void
): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    onError?.(err);
    return fallback;
  }
};

// ============================================
// Console Utilities (for development)
// ============================================

/**
 * Development logger
 */
export const devLog = (...args: any[]): void => {
  if (import.meta.env.DEV) {
    console.log('[DEV]', ...args);
  }
};

/**
 * Performance timer
 */
export const performanceTimer = (label: string): () => void => {
  if (import.meta.env.DEV) {
    console.time(label);
    return () => console.timeEnd(label);
  }
  return () => {};
};

// ============================================
// Type Guards
// ============================================

/**
 * Check if value is a valid ChenEntity
 */
export const isChenEntity = (value: any): value is ChenEntity => {
  return (
    value &&
    typeof value === 'object' &&
    typeof value.id === 'string' &&
    typeof value.name === 'string' &&
    Array.isArray(value.attributes)
  );
};

/**
 * Check if value is a valid ChenRelationship
 */
export const isChenRelationship = (value: any): value is ChenRelationship => {
  return (
    value &&
    typeof value === 'object' &&
    typeof value.id === 'string' &&
    typeof value.name === 'string' &&
    Array.isArray(value.entities)
  );
};

/**
 * Check if value is a valid ParsedTable
 */
export const isParsedTable = (value: any): value is ParsedTable => {
  return (
    value &&
    typeof value === 'object' &&
    typeof value.name === 'string' &&
    Array.isArray(value.columns)
  );
};

// ============================================
// Export all utilities as a namespace
// ============================================

export const Utils = {
  // ID
  generateId,
  
  // String
  toTitleCase,
  toCamelCase,
  toSnakeCase,
  pluralize,
  singularize,
  
  // Table
  extractEntityName,
  isLikelyJunctionTable,
  generateRelationshipName,
  generateFKRelationshipName,
  
  // Position
  calculateGridPosition,
  calculateRelationshipPosition,
  calculateAttributePosition,
  
  // Validation
  validateSQL,
  validateTable,
  
  // Data
  tablesToDiagram,
  
  // Export
  formatFileSize,
  generateFilename,
  sanitizeFilename,
  
  // Clipboard
  copyToClipboard,
  
  // Performance
  debounce,
  throttle,
  
  // Array
  groupBy,
  sortBy,
  unique,
  uniqueBy,
  
  // Object
  deepClone,
  omit,
  pick,
  
  // Color
  stringToColor,
  lightenColor,
  
  // Diagram
  getEntityById,
  getRelationshipById,
  getEntityRelationships,
  countDiagramElements,
  
  // Error
  formatErrorMessage,
  tryCatch,
  
  // Dev
  devLog,
  performanceTimer,
  
  // Type Guards
  isChenEntity,
  isChenRelationship,
  isParsedTable,
};

export default Utils;