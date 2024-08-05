import useResizeObserver from '@react-hook/resize-observer';
import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import { convertFileSrc } from '@tauri-apps/api/core';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import React, { useRef, useState } from 'react';
import { Document, Page } from 'react-pdf';
import { useDebouncedState } from '../../hooks/useDebouncedState';
import type { HttpResponse } from '@yaakapp/api';
import './PdfViewer.css';

interface Props {
  response: HttpResponse;
}

const options = {
  cMapUrl: '/cmaps/',
  standardFontDataUrl: '/standard_fonts/',
};

export function PdfViewer({ response }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useDebouncedState<number>(0, 100);
  const [numPages, setNumPages] = useState<number>();

  useResizeObserver(containerRef.current ?? null, (v) => {
    setContainerWidth(v.contentRect.width);
  });

  const onDocumentLoadSuccess = ({ numPages: nextNumPages }: PDFDocumentProxy): void => {
    setNumPages(nextNumPages);
  };

  if (response.bodyPath === null) {
    return <div>Empty response body</div>;
  }

  const src = convertFileSrc(response.bodyPath);
  return (
    <div ref={containerRef} className="w-full h-full overflow-y-auto">
      <Document
        file={src}
        options={options}
        onLoadSuccess={onDocumentLoadSuccess}
        externalLinkTarget="_blank"
        externalLinkRel="noopener noreferrer"
      >
        {Array.from(new Array(numPages), (_, index) => (
          <Page
            className="mb-6 select-all"
            renderTextLayer
            renderAnnotationLayer
            key={`page_${index + 1}`}
            pageNumber={index + 1}
            width={containerWidth}
          />
        ))}
      </Document>
    </div>
  );
}
