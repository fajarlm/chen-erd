import type { ParsedTable, TableColumn } from '../types';

export class SQLParserService {
  parse(sql: string): ParsedTable[] {
    if (!sql || sql.trim() === '') {
      throw new Error('SQL code is empty');
    }

    const tables: ParsedTable[] = [];
    
    // Remove comments and extra whitespace
    const cleanedSql = this.cleanSQL(sql);
    
    console.log('Cleaned SQL:', cleanedSql); // Debug log
    
    // Extract CREATE TABLE statements
    const tableRegex = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?[`"]?(\w+)[`"]?\s*\(([\s\S]*?)\);/gi;
    let match;
    
    while ((match = tableRegex.exec(cleanedSql)) !== null) {
      const tableName = match[1];
      const columnsDefinition = match[2];
      
      console.log('Found table:', tableName); // Debug log
      
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
    
    if (tables.length === 0) {
      throw new Error('No CREATE TABLE statements found in SQL');
    }
    
    console.log('Parsed tables:', tables); // Debug log
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
    
    console.log('Column definitions:', lines); // Debug log
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      if (!trimmedLine) continue;
      
      // Skip pure constraint definitions
      if (this.isPureConstraint(trimmedLine)) {
        // Parse constraints for primary/foreign keys
        this.parseConstraintLine(trimmedLine, columns);
        continue;
      }
      
      const column = this.parseColumnLine(trimmedLine);
      if (column) {
        columns.push(column);
      }
    }
    
    return columns;
  }
  
  private splitColumns(definition: string): string[] {
    const columns: string[] = [];
    let current = '';
    let depth = 0;
    
    for (let i = 0; i < definition.length; i++) {
      const char = definition[i];
      
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
  
  private isPureConstraint(line: string): boolean {
    const upperLine = line.toUpperCase().trim();
    return (
      upperLine.startsWith('PRIMARY KEY') ||
      upperLine.startsWith('FOREIGN KEY') ||
      upperLine.startsWith('CONSTRAINT') ||
      upperLine.startsWith('UNIQUE') ||
      upperLine.startsWith('CHECK') ||
      upperLine.startsWith('INDEX')
    );
  }
  
  private parseColumnLine(line: string): TableColumn | null {
    // Match column definition: column_name data_type [options]
    const columnMatch = line.match(/^[`"]?(\w+)[`"]?\s+(\w+(?:\([^)]*\))?)/);
    if (!columnMatch) return null;
    
    const columnName = columnMatch[1];
    const columnType = columnMatch[2];
    const upperLine = line.toUpperCase();
    
    // Check for primary key
    const isPrimaryKey = upperLine.includes('PRIMARY KEY') && !upperLine.startsWith('PRIMARY KEY');
    
    // Check for foreign key with REFERENCES
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
  
  private parseConstraintLine(line: string, columns: TableColumn[]): void {
    
    // Parse PRIMARY KEY (column1, column2)
    const pkMatch = line.match(/PRIMARY\s+KEY\s*\(([^)]+)\)/i);
    if (pkMatch) {
      const pkColumns = pkMatch[1].split(',').map(c => c.trim().replace(/[`"]/g, ''));
      pkColumns.forEach(pkCol => {
        const col = columns.find(c => c.name === pkCol);
        if (col) {
          col.isPrimaryKey = true;
        }
      });
    }
    
    // Parse FOREIGN KEY (column) REFERENCES table(column)
    const fkMatch = line.match(/FOREIGN\s+KEY\s*\([`"]?(\w+)[`"]?\)\s*REFERENCES\s+[`"]?(\w+)[`"]?\s*\([`"]?(\w+)[`"]?\)/i);
    if (fkMatch) {
      const columnName = fkMatch[1];
      const refTable = fkMatch[2];
      const refColumn = fkMatch[3];
      
      const col = columns.find(c => c.name === columnName);
      if (col) {
        col.isForeignKey = true;
        col.references = { table: refTable, column: refColumn };
      }
    }
  }
  
  private detectJunctionTable(columns: TableColumn[]): boolean {
    const foreignKeys = columns.filter(col => col.isForeignKey);
    const nonKeyColumns = columns.filter(col => !col.isForeignKey && !col.isPrimaryKey);
    
    // Junction tables typically have:
    // - 2 or more foreign keys
    // - Very few non-key columns (usually 0-2)
    return foreignKeys.length >= 2 && nonKeyColumns.length <= 2;
  }
  
  private getJunctionRelations(columns: TableColumn[]): string[] {
    return columns
      .filter(col => col.isForeignKey && col.references)
      .map(col => col.references!.table);
  }
}

export const sqlParserService = new SQLParserService();