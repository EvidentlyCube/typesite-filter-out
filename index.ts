import {ArgumentInvalidError, ArgumentNullError, ContentFileCollection, IPlugin, Typesite} from 'typesite';
import multimatch = require("multimatch");

export type MultimatchFunction = (files: string[], patterns: string[]) => string[];

export class FilterOutPlugin implements IPlugin {
    private _multimatchPatterns: string[];
    private _regexPattern: RegExp;

    private _multimatchCallback: MultimatchFunction;

    constructor(
        patternToFilterOut: string[] | RegExp,
        multimatchImplementation: MultimatchFunction = null
    ) {
        this._multimatchCallback = multimatchImplementation || multimatch;

        if (patternToFilterOut === null){
            throw new ArgumentNullError('patternToFilterOUt', "Pattern cannot be null");

        } else if (patternToFilterOut instanceof RegExp) {
            this._regexPattern = patternToFilterOut;

        } else if (Array.isArray(patternToFilterOut)){
            if (patternToFilterOut.length === 0){
                throw new ArgumentInvalidError("patternToFilterOut", "Multimatch pattern cannot be an empty array")
            }
            if (patternToFilterOut.filter(value => typeof value !== "string").length > 0){
                throw new ArgumentInvalidError(
                    "patternToFilterOut",
                    `Multimatch pattern must consist of an array of strings, '${JSON.stringify(patternToFilterOut)}' was given`
                );
            }
            this._multimatchPatterns = patternToFilterOut;
        } else {
            throw new ArgumentInvalidError(
                "patternToFilterOut",
                `Multimatch pattern must be an array, '${JSON.stringify(patternToFilterOut)} (${typeof patternToFilterOut}' was given`
            );
        }
    }

    getName(): string {
        return "Filter Out";
    }

    async run(files: ContentFileCollection, typesite: Typesite): Promise<void> {
        files.eachSync((file, path) => {
            if (this.matchFile(path)) {
                files.removeFile(path);
            }
        });
    }

    private matchFile(filePath: string): boolean {
        if (this._regexPattern) {
            return this._regexPattern.test(filePath);
        } else {
            return this._multimatchCallback([filePath], this._multimatchPatterns).length > 0;
        }
    }
}