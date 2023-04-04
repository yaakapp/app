interface Props {
  data: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function ImageView({ data }: Props) {
  // const dataUri = `data:image/png;base64,${window.btoa(data)}`;
  return <div>Image preview not supported until binary response support is added</div>;
}
