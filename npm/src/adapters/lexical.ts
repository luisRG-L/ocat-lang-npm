export const Lexical: (input: string) => string[]  = (input: string) => {
    return input
        .replace(/\n/g, ' \n ')
        .split(' ')
        .map(word => word.trim())
}