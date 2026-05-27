src/
├── components/
│   ├── Layout/
│   │   ├── Sidebar.tsx
│   │   ├── MainContent.tsx
│   │   └── PropertiesPanel.tsx
│   ├── Editor/
│   │   ├── SQLEditor.tsx
│   │   ├── FormBuilder.tsx
│   │   └── FileUpload.tsx
│   ├── Diagram/
│   │   ├── ChenDiagram.tsx
│   │   ├── EntityNode.tsx
│   │   ├── AttributeNode.tsx
│   │   ├── RelationshipNode.tsx
│   │   └── CustomEdge.tsx
│   └── UI/
│       ├── Toolbar.tsx
│       └── ExportMenu.tsx
├── services/
│   ├── sqlParser.ts
│   ├── chenConverter.ts
│   └── exportService.ts
├── hooks/
│   ├── useSQLParser.ts
│   ├── useDiagramState.ts
│   └── useAutoLayout.ts
├── types/
│   └── index.ts
├── utils/
│   └── helpers.ts
└── App.tsx