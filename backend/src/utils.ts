const kebabCase = require("kebab-case");

export function toKebabCase(string) {
  const kebab = kebabCase(string);
  // kebabCase("WebkitTransform"); => "-webkit-transform"
  // remove "-" prefix
  return kebab.substring(1, kebab.length).replace(/ /g, "");
}

export function randomString() {
  return `${Math.round(Math.random() * Math.pow(10, 20))}`;
}

/**
 * Serializes non-null values to provided class object.
 */
export function serializeEmbeddedTypeORMEntity<T>(
  classObject: T,
  value: null | T
) {
  return value === null ? null : Object.assign(classObject, value);
}
