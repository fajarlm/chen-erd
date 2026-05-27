import { useState, useCallback, useMemo } from 'react';
import type { ChenDiagram, ParsedTable } from '../types';
import { SQLParserService } from '../services/sqlParser';
import { ChenConverterService } from '../services/chenConverter';

export const useDiagramState = () => {
  const [diagram, setDiagram] = useState<ChenDiagram | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sqlParser = useMemo(() => new SQLParserService(), []);
  const chenConverter = useMemo(() => new ChenConverterService(), []);

  const generateFromSQL = useCallback((sql: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const tables = sqlParser.parse(sql);
      const chenDiagram = chenConverter.convert(tables);
      setDiagram(chenDiagram);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse SQL');
      console.error('SQL parsing error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [sqlParser, chenConverter]);

  const generateFromTables = useCallback((tables: ParsedTable[]) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const chenDiagram = chenConverter.convert(tables);
      setDiagram(chenDiagram);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate diagram');
      console.error('Generation error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [chenConverter]);

  const updateDiagram = useCallback((updatedDiagram: ChenDiagram) => {
    setDiagram(updatedDiagram);
  }, []);

  const clearDiagram = useCallback(() => {
    setDiagram(null);
    setError(null);
  }, []);

  return {
    diagram,
    isLoading,
    error,
    generateFromSQL,
    generateFromTables,
    updateDiagram,
    clearDiagram,
  };
};