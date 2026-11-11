import { useMemo } from 'react';
import { SQLParserService } from '../services/sqlParser';

export const useSQLParser = () => {
  const parser = useMemo(() => new SQLParserService(), []);
  return parser;
};

export default useSQLParser;
