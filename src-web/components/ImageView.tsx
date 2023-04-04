interface Props {
  data: string;
}

export function ImageView({ data }: Props) {
  // const dataUri = `data:image/png;base64,${window.btoa(data)}`;
  return <div>Image preview not supported until binary response support is added</div>;
}
