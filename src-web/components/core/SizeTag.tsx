interface Props {
  contentLength: number;
}

export function SizeTag({ contentLength }: Props) {
  let num;
  let unit;

  if (contentLength > 1000 * 1000 * 1000) {
    num = contentLength / 1000 / 1000 / 1000;
    unit = 'GB';
  } else if (contentLength > 1000 * 1000) {
    num = contentLength / 1000 / 1000;
    unit = 'MB';
  } else if (contentLength > 1000) {
    num = contentLength / 1000;
    unit = 'KB';
  } else {
    num = contentLength;
    unit = 'B';
  }

  return (
    <span className="font-mono" title={`${contentLength} bytes`}>
      {Math.round(num * 10) / 10} {unit}
    </span>
  );
}
