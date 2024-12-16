export const isValue = (word: string) =>
    !isNaN(Number(word)) ||
    word.match(/\b(true|false)\b/) ||
    word.match(/\b(null)\b/) ||
    word.startsWith('"') ||
    word.endsWith('"') ||
    word.startsWith("'") ||
    word.endsWith("'") ||
    word.startsWith("`") ||
    word.endsWith("`");
