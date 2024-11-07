#!/usr/bin/env node

import {Token, TokenType} from './types';

import {Lexical} from '../../adapters/';

export const tokenize = (input: string): Token[] => {
    const tokens: Token[] = [];
    const words: string[] = Lexical(input);
    for (const word of words) {
        if (word.length === 0) {
            continue;
        }

        const token: Token = {
            type: TokenType.Null,
            value: word
        };

        if (word.match(/\b(print|input|output)\b/)) {
            token.type = TokenType.IO;
        }
        else if (word.match(/\b(int|float|string|bool|void)\b/)) {
            token.type = TokenType.Datatype;
        }
        else if (word.match(/\b(if|else|while|for|return|break|continue)\b/)) {
            token.type = TokenType.Conditional;
        }
        else if (
            (!isNaN(Number(word))) ||
            (word.match(/\b(true|false)\b/)) ||
            (word.match(/\b(null)\b/)) ||
            (word.startsWith('"') || word.endsWith('"')) ||
            (word.startsWith("'") || word.endsWith("'")) ||
            (word.startsWith('`') || word.endsWith('`')) ||
            (word.startsWith('{') || word.endsWith('}'))
        ) {
            token.type = TokenType.Value;
        }
        else if(
            word === "[" ||
            word === "]"
        ){
            token.type = TokenType.TGIO;
        }
        else if (
            (word === '(' || word === ')')
        ) {
            token.type = TokenType.Shape;
        }
        else if (word.match(/\b(func)\b/)) {
            token.type = TokenType.Function;
        }
        else if (word.match(/\b(int|decimal|string|bool)\b/)) {
            token.type = TokenType.Keyword;
        }
        else if (word.match(/\b(==|!=|<=|>=|<|>)\b/)) {
            token.type = TokenType.Operator;
        }
        else if (word.match(/\b(for|while|do|forever|on)\b/)){
            token.type = TokenType.Loop;
        }
        else if(word === "=") {
            token.type = TokenType.Assign;
        }
        else if (word === "import") {
            token.type = TokenType.IERQ;
        } else {
            token.type = TokenType.Identifier;
        }

        tokens.push(token);
    }


    return tokens;
}
