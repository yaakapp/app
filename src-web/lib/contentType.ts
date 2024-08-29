import type { EditorProps } from '../components/core/Editor';

export function languageFromContentType(contentType: string | null): EditorProps['language'] {
  const justContentType = contentType?.split(';')[0] ?? contentType ?? '';
  if (justContentType.includes('json')) {
    return 'json';
  } else if (justContentType.includes('xml')) {
    return 'xml';
  } else if (justContentType.includes('html')) {
    return 'html';
  } else if (justContentType.includes('javascript')) {
    return 'javascript';
  } else {
    return 'text';
  }
}
