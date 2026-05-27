import type { ParsedTable, ChenEntity, ChenRelationship, ChenAttribute, ChenDiagram } from '../types';
import { v4 as uuidv4 } from 'uuid';

export class ChenConverterService {
  convert(tables: ParsedTable[]): ChenDiagram {
    const entities: ChenEntity[] = [];
    const relationships: ChenRelationship[] = [];
    const regularTables = tables.filter(t => !t.isJunctionTable);
    
    // Create entities from regular tables
    regularTables.forEach((table, index) => {
      const entity = this.createEntity(table, index);
      entities.push(entity);
    });
    
    // Create relationships from foreign keys and junction tables
    this.createRelationships(tables, entities, relationships);
    
    return { entities, relationships };
  }
  
  private createEntity(table: ParsedTable, index: number): ChenEntity {
    const attributes: ChenAttribute[] = table.columns.map(col => ({
      id: uuidv4(),
      name: col.name,
      isPrimaryKey: col.isPrimaryKey,
      isMultivalued: false,
      isDerived: false
    }));
    
    return {
      id: uuidv4(),
      name: table.name,
      attributes,
      position: {
        x: 100 + (index % 3) * 350,
        y: 100 + Math.floor(index / 3) * 300
      },
      isWeakEntity: table.columns.every(col => !col.isPrimaryKey)
    };
  }
  
  private createRelationships(
    tables: ParsedTable[],
    entities: ChenEntity[],
    relationships: ChenRelationship[]
  ): void {
    // Handle junction tables (many-to-many relationships)
    const junctionTables = tables.filter(t => t.isJunctionTable);
    
    junctionTables.forEach((junctionTable, index) => {
      const relatedEntityNames = junctionTable.columns
        .filter(col => col.isForeignKey && col.references)
        .map(col => col.references!.table);
      
      const relatedEntities = entities.filter(e => 
        relatedEntityNames.includes(e.name)
      );
      
      if (relatedEntities.length >= 2) {
        const relationshipName = this.generateRelationshipName(junctionTable.name);
        
        const cardinalities: { [entityId: string]: 'M' | 'N' } = {};
        relatedEntities.forEach(entity => {
          cardinalities[entity.id] = 'M';
        });
        
        relationships.push({
          id: uuidv4(),
          name: relationshipName,
          entities: relatedEntities.map(e => e.id),
          cardinalities,
          position: {
            x: 400 + index * 200,
            y: 300 + index * 150
          },
          isIdentifying: junctionTable.columns.some(col => 
            col.isPrimaryKey && col.isForeignKey
          )
        });
        
        // Add junction table attributes to relationship
        const junctionAttributes = junctionTable.columns
          .filter(col => !col.isForeignKey)
          .map(col => ({
            id: uuidv4(),
            name: col.name,
            isPrimaryKey: col.isPrimaryKey,
            isMultivalued: false,
            isDerived: false
          }));
        
        if (junctionAttributes.length > 0) {
          const relationship = relationships[relationships.length - 1];
          relationship.attributes = junctionAttributes;
        }
      }
    });
    
    // Handle direct foreign key relationships (1:N or 1:1)
    tables.forEach(table => {
      if (table.isJunctionTable) return;
      
      const entity = entities.find(e => e.name === table.name);
      if (!entity) return;
      
      table.columns.forEach(col => {
        if (col.isForeignKey && col.references) {
          const referencedEntity = entities.find(e => e.name === col.references!.table);
          if (!referencedEntity) return;
          
          // Check if relationship already exists
          const exists = relationships.some(r => 
            r.entities.includes(entity.id) && 
            r.entities.includes(referencedEntity.id)
          );
          
          if (!exists) {
            const relationshipName = this.generateForeignKeyRelationshipName(
              col.name,
              table.name,
              col.references.table
            );
            
            const cardinalities: { [entityId: string]: '1' | 'N' } = {};
            cardinalities[referencedEntity.id] = '1';
            cardinalities[entity.id] = 'N';
            
            relationships.push({
              id: uuidv4(),
              name: relationshipName,
              entities: [entity.id, referencedEntity.id],
              cardinalities,
              position: {
                x: 250,
                y: 250
              }
            });
          }
        }
      });
    });
  }
  
  private generateRelationshipName(junctionTableName: string): string {
    // Remove common junction table suffixes
    const cleanedName = junctionTableName
      .replace(/_/g, ' ')
      .replace(/junction$/i, '')
      .replace(/rel$/i, '')
      .trim();
    
    return cleanedName.charAt(0).toUpperCase() + cleanedName.slice(1);
  }
  
  private generateForeignKeyRelationshipName(
    columnName: string,
    childTable: string,
    parentTable: string
  ): string {
    const commonPatterns: { [key: string]: string } = {
      'user_id': 'Creates',
      'author_id': 'Writes',
      'category_id': 'Belongs To',
      'parent_id': 'Contains',
      'komunitas_id': 'Belongs To',
      'created_by': 'Creates',
      'updated_by': 'Updates',
      'owner_id': 'Owns',
      'manager_id': 'Manages',
      'department_id': 'Belongs To'
    };
    
    if (commonPatterns[columnName.toLowerCase()]) {
      return commonPatterns[columnName.toLowerCase()];
    }
    
    // Generate generic name
    const action = this.determineAction(columnName);
    return `${action} ${parentTable}`;
  }
  
  private determineAction(columnName: string): string {
    if (columnName.includes('parent') || columnName.includes('superior')) {
      return 'Reports To';
    }
    if (columnName.includes('created') || columnName.includes('author')) {
      return 'Creates';
    }
    if (columnName.includes('updated') || columnName.includes('modified')) {
      return 'Modifies';
    }
    if (columnName.includes('owner') || columnName.includes('manager')) {
      return 'Manages';
    }
    
    return 'Relates To';
  }
}