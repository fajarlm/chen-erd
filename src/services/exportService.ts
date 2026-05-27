import { toPng, toSvg, toJpeg } from 'html-to-image';
import { jsPDF } from 'jspdf';

export class ExportService {
  private static defaultOptions = {
    quality: 1,
    pixelRatio: 2,
    backgroundColor: '#ffffff',
  };

  static async exportAsPNG(
    element: HTMLElement,
    filename: string = 'chen-erd-diagram.png',
    options?: { quality?: number; backgroundColor?: string }
  ): Promise<void> {
    try {
      const dataUrl = await toPng(element, {
        ...this.defaultOptions,
        ...options,
      });

      this.downloadFile(dataUrl, filename);
      console.log('PNG exported successfully:', filename);
    } catch (error) {
      console.error('Error exporting PNG:', error);
      throw new Error('Failed to export as PNG. Please try again.');
    }
  }

  static async exportAsSVG(
    element: HTMLElement,
    filename: string = 'chen-erd-diagram.svg',
    options?: { backgroundColor?: string }
  ): Promise<void> {
    try {
      const dataUrl = await toSvg(element, {
        ...this.defaultOptions,
        ...options,
      });

      this.downloadFile(dataUrl, filename);
      console.log('SVG exported successfully:', filename);
    } catch (error) {
      console.error('Error exporting SVG:', error);
      throw new Error('Failed to export as SVG. Please try again.');
    }
  }

  static async exportAsJPEG(
    element: HTMLElement,
    filename: string = 'chen-erd-diagram.jpg',
    options?: { quality?: number; backgroundColor?: string }
  ): Promise<void> {
    try {
      const dataUrl = await toJpeg(element, {
        ...this.defaultOptions,
        quality: options?.quality || 0.95,
      });

      this.downloadFile(dataUrl, filename);
      console.log('JPEG exported successfully:', filename);
    } catch (error) {
      console.error('Error exporting JPEG:', error);
      throw new Error('Failed to export as JPEG. Please try again.');
    }
  }

  static async exportAsPDF(
    element: HTMLElement,
    filename: string = 'chen-erd-diagram.pdf',
    options?: {
      orientation?: 'portrait' | 'landscape';
      format?: string;
    }
  ): Promise<void> {
    try {
      // First, generate PNG for best quality
      const dataUrl = await toPng(element, {
        quality: 1,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
      });

      // Create PDF
      const pdf = new jsPDF({
        orientation: options?.orientation || 'landscape',
        unit: 'px',
        format: options?.format || 'a4',
      });

      // Get image properties
      const imgProps = pdf.getImageProperties(dataUrl);
      
      // Calculate dimensions to fit page
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      let imgWidth = pdfWidth - 40; // 20px margin on each side
      let imgHeight = (imgProps.height * imgWidth) / imgProps.width;
      
      // If image is too tall, scale to fit height
      if (imgHeight > pdfHeight - 40) {
        imgHeight = pdfHeight - 40;
        imgWidth = (imgProps.width * imgHeight) / imgProps.height;
      }
      
      // Center the image
      const x = (pdfWidth - imgWidth) / 2;
      const y = (pdfHeight - imgHeight) / 2;
      
      // Add image to PDF
      pdf.addImage(dataUrl, 'PNG', x, y, imgWidth, imgHeight);
      
      // Add metadata
      pdf.setProperties({
        title: 'Chen ERD Diagram',
        subject: 'Entity-Relationship Diagram',
        creator: 'Chen ERD Generator',
        keywords: 'erd, chen, diagram, database',
      });
      
      // Save PDF
      pdf.save(filename);
      console.log('PDF exported successfully:', filename);
    } catch (error) {
      console.error('Error exporting PDF:', error);
      throw new Error('Failed to export as PDF. Please try again.');
    }
  }

  static exportAsJSON(
    diagram: any,
    filename: string = 'chen-erd-schema.json'
  ): void {
    try {
      // Create a clean version of the diagram data
      const exportData = {
        version: '1.0',
        type: 'Chen ERD Diagram',
        generated: new Date().toISOString(),
        diagram: this.sanitizeDiagramData(diagram),
        metadata: {
          entityCount: diagram?.entities?.length || 0,
          relationshipCount: diagram?.relationships?.length || 0,
        },
      };

      const jsonString = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      this.downloadFile(url, filename);
      URL.revokeObjectURL(url);
      
      console.log('JSON exported successfully:', filename);
    } catch (error) {
      console.error('Error exporting JSON:', error);
      throw new Error('Failed to export as JSON. Please try again.');
    }
  }

  static async exportMultiple(
    element: HTMLElement,
    diagram: any,
    formats: ('png' | 'svg' | 'pdf' | 'json')[]
  ): Promise<void> {
    for (const format of formats) {
      switch (format) {
        case 'png':
          await this.exportAsPNG(element);
          break;
        case 'svg':
          await this.exportAsSVG(element);
          break;
        case 'pdf':
          await this.exportAsPDF(element);
          break;
        case 'json':
          this.exportAsJSON(diagram);
          break;
      }
    }
    console.log('Multiple exports completed');
  }

  private static downloadFile(dataUrl: string, filename: string): void {
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  private static sanitizeDiagramData(diagram: any): any {
    // Remove unnecessary properties for export
    if (!diagram) return null;

    return {
      entities: diagram.entities?.map((entity: any) => ({
        name: entity.name,
        attributes: entity.attributes?.map((attr: any) => ({
          name: attr.name,
          type: attr.type,
          isPrimaryKey: attr.isPrimaryKey,
          isForeignKey: attr.isForeignKey,
        })),
      })),
      relationships: diagram.relationships?.map((rel: any) => ({
        name: rel.name,
        type: rel.type,
        entities: rel.entities,
        cardinality: rel.cardinality,
      })),
    };
  }
}