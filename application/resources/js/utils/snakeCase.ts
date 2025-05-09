const toSnakeCase = (str: string) =>
    str.replace(/[A-Z]/g, (l, i) => (i ? '_' : '') + l.toLowerCase());

export default toSnakeCase;