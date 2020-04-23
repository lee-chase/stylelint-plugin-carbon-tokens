export default function normaliseVariableName(variable) {
  if (variable.startsWith("var(--")) {
    return variable.substring(4, variable.length - 2);
  } else {
    return variable;
  }
}
