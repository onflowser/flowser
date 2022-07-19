const kebabCase = require('kebab-case');

export function toKebabCase(string) {
    const kebab = kebabCase(string);
    // kebabCase("WebkitTransform"); => "-webkit-transform"
    // remove "-" prefix
    return kebab.substring(1, kebab.length).replace(/ /g, '');
}

export function randomString() {
    return `${Math.round(Math.random() * Math.pow(10, 20))}`;
}
