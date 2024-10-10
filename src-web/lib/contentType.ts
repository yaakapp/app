import type { EditorProps } from '../components/core/Editor';

export function languageFromContentType(
  contentType: string | null,
  content: string | null = null,
): EditorProps['language'] {
  const justContentType = contentType?.split(';')[0] ?? contentType ?? '';
  if (justContentType.includes('json')) {
    return 'json';
  } else if (justContentType.includes('xml')) {
    return 'xml';
  } else if (justContentType.includes('html')) {
    return detectFromContent(content, 'html');
  } else if (justContentType.includes('javascript')) {
    return 'javascript';
  }

  return detectFromContent(content, 'text');
}

function detectFromContent(
  content: string | null,
  fallback: EditorProps['language'],
): EditorProps['language'] {
  if (content == null) return 'text';

  if (content.startsWith('{') || content.startsWith('[')) {
    return 'json';
  } else if (content.startsWith('<!DOCTYPE') || content.startsWith('<html')) {
    return 'html';
  }

  return fallback;
}
