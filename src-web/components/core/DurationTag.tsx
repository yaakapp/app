interface Props {
  millis: number;
}

export function DurationTag({ millis }: Props) {
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

  return (
    <span title={`${millis} milliseconds`}>
      {Math.round(num * 10) / 10} {unit}
    </span>
  );
}
