interface Props {
  total: number;
  headers: number;
}

export function DurationTag({ total, headers }: Props) {
  return (
    <span
      className="font-mono"
      title={`HEADER: ${formatMillis(headers)}\nTOTAL: ${formatMillis(total)}`}
    >
      {formatMillis(total)}
    </span>
  );
}

function formatMillis(millis: number) {
  let num;
  let unit;

  if (millis > 1000 * 60) {
    num = millis / 1000 / 60;
    unit = 'min';
  } else if (millis > 1000) {
    num = millis / 1000;
    unit = 's';
  } else {
    num = millis;
    unit = 'ms';
  }

  return `${Math.round(num * 10) / 10} ${unit}`;
}
