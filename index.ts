import {ContentFileCollection, IPlugin, Typesite} from 'typesite';
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

        if (patternToFilterOut instanceof RegExp) {
            this._regexPattern = patternToFilterOut;
        } else {
            this._multimatchPatterns = patternToFilterOut;
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