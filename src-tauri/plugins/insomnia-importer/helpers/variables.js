export function parseVariables(data) {
  return Object.entries(data).map(([name, value]) => ({
    enabled: true,
    name,
    value: `${value}`,
  }));
}
