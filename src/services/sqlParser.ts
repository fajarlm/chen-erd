import type { ParsedTable, TableColumn } from '../types';

export class SQLParserService {
  parse(sql: string): ParsedTable[] {
    const tables: ParsedTable[] = [];
    
    // Remove comments and extra whitespace
    const cleanedSql = this.cleanSQL(sql);
    
    // Extract CREATE TABLE statements
    const tableRegex = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?[`"]?(\w+)[`"]?\s*\(([\s\S]*?)\);/gi;
    let match;
    
    while ((match = tableRegex.exec(cleanedSql)) !== null) {
      const tableName = match[1];
      const columnsDefinition = match[2];
      
      const columns = this.parseColumns(columnsDefinition);
      const isJunctionTable = this.detectJunctionTable(columns);
      const junctionRelations = isJunctionTable ? this.getJunctionRelations(columns) : undefined;
      
      tables.push({
        name: tableName,
        columns,
        isJunctionTable,
        junctionRelations
      });
    }
    
    // If no tables found, try to parse SELECT statements or other SQL
    if (tables.length === 0) {
      console.warn('No CREATE TABLE statements found, attempting to parse other SQL...');
    }
    
    return tables;
  }
  
  private cleanSQL(sql: string): string {
    return sql
      .replace(/--.*$/gm, '') // Remove single-line comments
      .replace(/\/\*[\s\S]*?\*\//g, '') // Remove multi-line comments
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  }
  
  private parseColumns(columnsDefinition: string): TableColumn[] {
    const columns: TableColumn[] = [];
    const lines = this.splitColumns(columnsDefinition);
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Skip constraints and empty lines
      if (!trimmedLine || this.isConstraint(trimmedLine)) continue;
      
      const column = this.parseColumnLine(trimmedLine);
      if (column) {
        columns.push(column);
      }
    }
    
    // Parse inline foreign key references
    this.parseInlineForeignKeys(columns);
    
    // Parse CONSTRAINT clauses for primary and foreign keys
    this.parseConstraints(columnsDefinition, columns);
    
    return columns;
  }
  
  private splitColumns(definition: string): string[] {
    const columns: string[] = [];
    let current = '';
    let depth = 0;
    
    for (const char of definition) {
      if (char === '(') depth++;
      else if (char === ')') depth--;
      else if (char === ',' && depth === 0) {
        columns.push(current.trim());
        current = '';
        continue;
      }
      current += char;
    }
    
    if (current.trim()) {
      columns.push(current.trim());
    }
    
    return columns;
  }
  
  private isConstraint(line: string): boolean {
    const upperLine = line.toUpperCase();
    const constraints = [
      'PRIMARY KEY',
      'FOREIGN KEY',
      'UNIQUE',
      'CHECK',
      'INDEX',
      'CONSTRAINT'
    ];
    
    // Check if line starts with a constraint keyword
    const startsWithConstraint = constraints.some(c => upperLine.startsWith(c));
    
    // But don't skip if it's a column definition
    const isColumnDefinition = /^[`"]?\w+[`"]?\s+\w+/.test(line);
    
    return startsWithConstraint && !isColumnDefinition;
  }
  
  private parseColumnLine(line: string): TableColumn | null {
    // Match column definition pattern: column_name data_type [constraints]
    const match = line.match(/^[`"]?(\w+)[`"]?\s+(\w+(?:\([^)]*\))?)/);
    if (!match) return null;
    
    const columnName = match[1];
    const columnType = match[2];
    const upperLine = line.toUpperCase();
    
    const isPrimaryKey = upperLine.includes('PRIMARY KEY');
    const isForeignKey = upperLine.includes('REFERENCES');
    
    let references: { table: string; column: string } | undefined;
    
    if (isForeignKey) {
      const refMatch = line.match(/REFERENCES\s+[`"]?(\w+)[`"]?\s*\([`"]?(\w+)[`"]?\)/i);
      if (refMatch) {
        references = {
          table: refMatch[1],
          column: refMatch[2]
        };
      }
    }
    
    return {
      name: columnName,
      type: columnType,
      isPrimaryKey,
      isForeignKey,
      references
    };
  }
  
  private parseInlineForeignKeys(columns: TableColumn[]): void {
    // Additional check for REFERENCES in column definitions
    columns.forEach(col => {
      if (!col.references && col.type.toUpperCase().includes('REFERENCES')) {
        const refMatch = col.type.match(/REFERENCES\s+(\w+)\s*\((\w+)\)/i);
        if (refMatch) {
          col.isForeignKey = true;
          col.references = {
            table: refMatch[1],
            column: refMatch[2]
          };
        }
      }
    });
  }
  
  private parseConstraints(definition: string, columns: TableColumn[]): void {
    // Parse PRIMARY KEY constraint
    const pkRegex = /PRIMARY\s+KEY\s*\(([^)]+)\)/gi;
    let match;
    
    while ((match = pkRegex.exec(definition)) !== null) {
      const pkColumns = match[1].split(',').map(c => c.trim().replace(/[`"]/g, ''));
      pkColumns.forEach(pkCol => {
        const col = columns.find(c => c.name === pkCol);
        if (col) {
          col.isPrimaryKey = true;
        }
      });
    }
    
    // Parse FOREIGN KEY constraints
    const fkRegex = /FOREIGN\s+KEY\s*\([`"]?(\w+)[`"]?\)\s*REFERENCES\s+[`"]?(\w+)[`"]?\s*\([`"]?(\w+)[`"]?\)/gi;
    
    while ((match = fkRegex.exec(definition)) !== null) {
      const columnName = match[1];
      const refTable = match[2];
      const refColumn = match[3];
      
      const col = columns.find(c => c.name === columnName);
      if (col) {
        col.isForeignKey = true;
        col.references = { table: refTable, column: refColumn };
      }
    }
  }
  
  private detectJunctionTable(columns: TableColumn[]): boolean {
    const foreignKeys = columns.filter(col => col.isForeignKey);
    const primaryKeys = columns.filter(col => col.isPrimaryKey);
    
    // Junction tables typically have:
    // 1. Multiple foreign keys
    // 2. Often composite primary key consisting of foreign keys
    // 3. Few additional columns
    return foreignKeys.length >= 2 && 
           columns.length <= foreignKeys.length + 2;
  }
  
  private getJunctionRelations(columns: TableColumn[]): string[] {
    return columns
      .filter(col => col.isForeignKey && col.references)
      .map(col => col.references!.table);
  }
}