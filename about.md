Build a modern responsive website called "Chen ERD Generator".

Main purpose:
Generate Chen ERD automatically from SQL code input or manual form input.

Features:

1. Input Method

* SQL Code Editor using Monaco Editor
* Manual Form Builder
* Upload .sql file support
* Drag and drop upload area

2. SQL Parsing

* Detect tables automatically
* Detect columns
* Detect primary keys
* Detect foreign keys
* Detect many-to-many tables
* Detect junction tables

3. Chen ERD Conversion Logic

* Main tables become Entities (Rectangle)
* Columns become Attributes (Ellipse)
* Primary key attributes should be underlined
* Foreign keys become Relationships
* Many-to-many junction tables should become Diamond Relationships instead of separate entities
* Relationship names should be generated automatically:
  user_id → "Creates"
  komunitas_id → "Belongs To"
  or allow user editing

4. Diagram Renderer
   Use React Flow or JointJS

Shapes:

* Rectangle = Entity
* Ellipse = Attribute
* Diamond = Relationship

Connections:

* Show cardinality:
  1:1
  1:N
  M:N

5. Diagram Interaction

* Zoom
* Pan
* Drag nodes
* Auto layout
* Edit labels
* Delete nodes
* Add nodes manually

6. Export Feature

* PNG
* SVG
* PDF
* JSON schema

7. UI Design

* Modern dashboard layout

* Left sidebar:
  SQL input
  Form builder
  Entity list

* Main content:
  Chen ERD canvas

* Right sidebar:
  Properties panel

Use:
React + TypeScript
Tailwind CSS
React Flow
Framer Motion

Create clean architecture:
components/
pages/
services/
hooks/
utils/

Include SQL parser service and automatic Chen conversion algorithm.
