import type { Environment } from "@yaakapp-internal/models";
import { patchModel } from "@yaakapp-internal/models";
import { generateId } from "./generateId";

/** Adds a variable, suffixing the name if it's taken, and returns the name that was used. */
export async function addVariableToBaseEnvironment(
  environment: Environment,
  name: string,
  value: string,
): Promise<string> {
  const taken = new Set(environment.variables.map((v) => v.name));
  let finalName = name;
  for (let i = 2; taken.has(finalName); i++) {
    finalName = `${name}_${i}`;
  }
  await patchModel(environment, {
    variables: [
      ...environment.variables,
      { id: generateId(), name: finalName, value, enabled: true },
    ],
  });
  return finalName;
}

export function variableTemplate(name: string) {
  return `\${[ ${name} ]}`;
}

export function isTemplate(value: string) {
  return value.includes("${[");
}
