import { useEnvironmentsBreakdown } from "../../hooks/useEnvironmentsBreakdown";
import {
  addVariableToBaseEnvironment,
  isTemplate,
  variableTemplate,
} from "../../lib/addVariableToBaseEnvironment";
import { dismissFeatureHint, FeatureHint } from "../core/FeatureHint";

const HINT_ID = "secret-variable";
const DOCS_URL = "https://yaak.app/docs/templating/environments-and-variables";

interface Props {
  /** Becomes the variable name, so it should describe the value (eg. "password", "token") */
  name: string;
  value: string;
  onReplace: (template: string) => void;
}

/**
 * A literal secret typed straight into an auth field. Offer to move it to a variable so the
 * request references it instead of holding it.
 */
export function SecretVariableHint({ name, value, onReplace }: Props) {
  const { baseEnvironment } = useEnvironmentsBreakdown();
  if (value.trim() === "" || isTemplate(value) || baseEnvironment == null) return null;

  return (
    <FeatureHint
      id={HINT_ID}
      docsUrl={DOCS_URL}
      action={{
        label: "Move to Variable",
        onClick: async () => {
          const finalName = await addVariableToBaseEnvironment(baseEnvironment, name, value);
          onReplace(variableTemplate(finalName));
          await dismissFeatureHint(HINT_ID);
        },
      }}
    >
      Typing this in by hand? Store it in a variable to reuse it across requests and swap it per
      environment.
    </FeatureHint>
  );
}
