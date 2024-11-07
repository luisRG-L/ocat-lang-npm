export const Lexical: (input: string) => string[]  = (input: string) => {
    return input
        .replace(/\n/g, ' ')
        .split(' ')
        .map(word => word.trim())
}