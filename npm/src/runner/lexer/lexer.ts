#!/usr/bin/env node

import { Token, TokenType } from "./types";

import { Lexical } from "./adapters/";
import { isValue } from "./utils";
import { CustomError, ErrorType } from "../../error";

export const tokenize = (input: string): Token[] => {
    const tokens: Token[] = [];
    try {
        const words: string[] = Lexical(input);
        for (const word of words) {
            if (word.length === 0) {
                continue;
            }

            const token: Token = {
                type: TokenType.Null,
                value: word,
            };

            if (word.match(/\b(print|input|output)\b/)) {
                token.type = TokenType.IO;
            } else if (word.match(/\b(int|float|string|bool|void)\b/)) {
                token.type = TokenType.Datatype;
            } else if (
                word.match(/\b(if|else|while|for|return|break|continue)\b/)
            ) {
                token.type = TokenType.Conditional;
            } else if (isValue(word)) {
                token.type = TokenType.Value;
            } else if (word === "sc" || word === "source-control") {
                token.type = TokenType.SCS;
            } else if (word.startsWith("{") || word.endsWith("}")) {
                token.type = TokenType.Block;
            } else if (word === "[" || word === "]") {
                token.type = TokenType.PageRequest;
            } else if (word === "\n") {
                token.type = TokenType.EOL;
            } else if (word === "(" || word === ")") {
                token.type = TokenType.Shape;
            } else if (word.match(/\b(func)\b/)) {
                token.type = TokenType.Function;
            } else if (word.match(/\b(==|!=|<=|>=|<|>)\b/)) {
                token.type = TokenType.Operator;
            } else if (word.match(/\b(for|while|do|forever|on)\b/)) {
                token.type = TokenType.Loop;
            } else if (word === "=") {
                token.type = TokenType.Assign;
            } else if (word === "meta" || word === "title") {
                token.type = TokenType.Meta;
            } else if (word === "wexport" || word === "out/w") {
                token.type = TokenType.ExportW;
            } else if (word === "func") {
                token.type = TokenType.Function;
            } else if (word === "call") {
                token.type = TokenType.FCall;
            } else if (word === "//" || word === "/<-") {
                token.type = TokenType.Comment;
            } else if (word.match(/\@(.*)/)) {
                token.type = TokenType.ORDER;
            } else if (word === "import") {
                token.type = TokenType.IERQ;
            } else if (word === "component") {
                token.type = TokenType.Component;
            } else if (word === 'layout') {
                token.type = TokenType.Layout;
            } else if (word === 'rest') {
                token.type = TokenType.RestI;
            } else if (word === 'loadComponent' || word === 'loadLayout' || word === "loadTemplate") {
                token.type = TokenType.Load;
            } else {
                token.type = TokenType.Identifier;
            }

            tokens.push(token);
        }
    } catch (e) {
        if (e instanceof SyntaxError) {
            throw new CustomError(e.message, ErrorType.SyntaxError);
        }
    }

    return tokens;
};
