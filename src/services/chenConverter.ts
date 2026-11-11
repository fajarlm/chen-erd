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
    
    const colsPerRow = 3;
    const colIndex = index % colsPerRow;
    const rowIndex = Math.floor(index / colsPerRow);

    return {
      id: uuidv4(),
      name: table.name,
      attributes,
      position: {
        x: 150 + colIndex * 480,
        y: 120 + rowIndex * 420
      },
      isWeakEntity: table.columns.length > 0 && table.columns.every(col => !col.isPrimaryKey)
    };
  }
  
  private createRelationships(
    tables: ParsedTable[],
    entities: ChenEntity[],
    relationships: ChenRelationship[]
  ): void {
    // 1. Handle junction tables (many-to-many relationships)
    const junctionTables = tables.filter(t => t.isJunctionTable);
    
    junctionTables.forEach((junctionTable, index) => {
      const relatedEntityNames = junctionTable.columns
        .filter(col => col.isForeignKey && col.references)
        .map(col => col.references!.table);
      
      const relatedEntities = entities.filter(e => 
        relatedEntityNames.some(name => name.toLowerCase() === e.name.toLowerCase())
      );
      
      if (relatedEntities.length >= 2) {
        const relationshipName = this.generateRelationshipName(junctionTable.name);
        
        const cardinalities: { [entityId: string]: 'M' | 'N' } = {};
        relatedEntities.forEach((entity, idx) => {
          cardinalities[entity.id] = idx === 0 ? 'M' : 'N';
        });
        
        // Position at average of connected entities
        const avgX = relatedEntities.reduce((sum, e) => sum + e.position.x, 0) / relatedEntities.length;
        const avgY = relatedEntities.reduce((sum, e) => sum + e.position.y, 0) / relatedEntities.length;

        const junctionRel: ChenRelationship = {
          id: uuidv4(),
          name: relationshipName,
          entities: relatedEntities.map(e => e.id),
          cardinalities,
          position: {
            x: avgX,
            y: avgY + (index % 2 === 0 ? 30 : -30)
          },
          isIdentifying: junctionTable.columns.some(col => 
            col.isPrimaryKey && col.isForeignKey
          )
        };

        // Add junction table attributes to relationship if any extra columns exist
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
          junctionRel.attributes = junctionAttributes;
        }

        relationships.push(junctionRel);
      }
    });
    
    // 2. Handle direct foreign key relationships (1:N or 1:1)
    let fkRelIndex = 0;
    tables.forEach(table => {
      if (table.isJunctionTable) return;
      
      const entity = entities.find(e => e.name.toLowerCase() === table.name.toLowerCase());
      if (!entity) return;
      
      table.columns.forEach(col => {
        if (col.isForeignKey && col.references) {
          const referencedEntity = entities.find(
            e => e.name.toLowerCase() === col.references!.table.toLowerCase()
          );
          if (!referencedEntity) return;
          
          // Check if relationship already exists between these entities
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
            
            // Midpoint position between the two entities
            const midX = (entity.position.x + referencedEntity.position.x) / 2;
            const midY = (entity.position.y + referencedEntity.position.y) / 2;
            
            // Small offset for subsequent relationships to prevent exact stacking
            const offset = (fkRelIndex % 3 - 1) * 40;
            fkRelIndex++;

            relationships.push({
              id: uuidv4(),
              name: relationshipName,
              entities: [referencedEntity.id, entity.id],
              cardinalities,
              position: {
                x: midX + offset,
                y: midY + offset
              }
            });
          }
        }
      });
    });
  }
  
  private generateRelationshipName(junctionTableName: string): string {
    const cleanedName = junctionTableName
      .replace(/_/g, ' ')
      .replace(/junction$/i, '')
      .replace(/rel$/i, '')
      .trim();
    
    return cleanedName.charAt(0).toUpperCase() + cleanedName.slice(1);
  }
  
  private generateForeignKeyRelationshipName(
    columnName: string,
    _childTable: string,
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
      'department_id': 'Belongs To',
      'customer_id': 'Places',
      'order_id': 'Belongs To',
      'product_id': 'Includes'
    };
    
    if (commonPatterns[columnName.toLowerCase()]) {
      return commonPatterns[columnName.toLowerCase()];
    }
    
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
    
    return 'Has';
  }
}
