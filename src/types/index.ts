// Table column definition
export interface TableColumn {
  name: string;
  type: string;
  isPrimaryKey: boolean;
  isForeignKey: boolean;
  references?: {
    table: string;
    column: string;
  };
}

// Parsed table from SQL
export interface ParsedTable {
  name: string;
  columns: TableColumn[];
  isJunctionTable: boolean;
  junctionRelations?: string[];
}

// Chen notation entity
export interface ChenEntity {
  id: string;
  name: string;
  attributes: ChenAttribute[];
  position: { x: number; y: number };
  isWeakEntity?: boolean;
}

// Chen notation attribute
export interface ChenAttribute {
  id: string;
  name: string;
  isPrimaryKey: boolean;
  isMultivalued: boolean;
  isDerived: boolean;
  entityId?: string;
  position?: { x: number; y: number };
}

// Chen notation relationship
export interface ChenRelationship {
  id: string;
  name: string;
  entities: string[];
  cardinalities: {
    [entityId: string]: string;
  };
  attributes?: ChenAttribute[];
  position: { x: number; y: number };
  isIdentifying?: boolean;
}

// Complete Chen diagram
export interface ChenDiagram {
  entities: ChenEntity[];
  relationships: ChenRelationship[];
}

// React Flow specific types
export interface DiagramNode {
  id: string;
  type: 'entity' | 'attribute' | 'relationship';
  data: any;
  position: { x: number; y: number };
}

export interface DiagramEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  type?: string;
  animated?: boolean;
  style?: React.CSSProperties;
  data?: {
    cardinality?: string;
    isPrimaryKey?: boolean;
  };
}

// Export type for the sidebar
export type SidebarTab = 'sql' | 'form' | 'entities';

// Node data interfaces
export interface EntityNodeData {
  label: string;
  attributes?: ChenAttribute[];
  isWeakEntity?: boolean;
}

export interface AttributeNodeData {
  label: string;
  isPrimaryKey?: boolean;
  isMultivalued?: boolean;
  isDerived?: boolean;
}

export interface RelationshipNodeData {
  label: string;
  cardinalities?: {
    [entityId: string]: string;
  };
  isIdentifying?: boolean;
  attributes?: ChenAttribute[];
}
