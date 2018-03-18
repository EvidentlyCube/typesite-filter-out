import {expect} from 'chai';
import 'mocha';
import {ContentFile, ContentFileCollection, Typesite} from "typesite";
import {FilterOutPlugin, MultimatchFunction} from "./index";
import {normalize} from "path";

describe("FilterOutPlugin", () => {
    const filesToFilter = [
        normalize("project/style.tsx"),
        normalize("game.ignore/file.html")
    ];

    it("Should not do nothing when filter list is empty", async () => {
        const collection = getTestCollection();
        const plugin = new FilterOutPlugin([]);
        await plugin.run(collection, new Typesite("", ""));

        expect(collection.getAllRelativeFilePaths()).to.be.lengthOf(4);
    });

    it("Should pass each file to the regex and filter correctly", async () => {
        const passedFiles:string[] = [];
        const regex = /\.ignore/;
        regex.test = (string) => {
            passedFiles.push(string);
            return filesToFilter.indexOf(string) !== -1;
        };

        const collection = getTestCollection();
        const plugin = new FilterOutPlugin(regex);
        await plugin.run(collection, new Typesite("", ""));

        expectPassedFilesToBeCorrect(passedFiles);
        expectCollectionToOnlyHaveCorrectFiles(collection);
    });

    it("Should pass each file to multimatch and filter correctly", async () => {
        const passedFiles:string[] = [];
        const filterPattern = ['**/*.css', 'project'];
        const multimatch:MultimatchFunction = (files, patterns) => {
            passedFiles.push(...files);
            expect(patterns).to.deep.equal(filterPattern);
            return filesToFilter.indexOf(files[0]) !== -1
                ? files : [];
        };

        const collection = getTestCollection();
        const plugin = new FilterOutPlugin(filterPattern, multimatch);
        await plugin.run(collection, new Typesite("", ""));

        expectPassedFilesToBeCorrect(passedFiles);
        expectCollectionToOnlyHaveCorrectFiles(collection);
    });

    function expectPassedFilesToBeCorrect(passedFiles:string[]): void{
        expect(passedFiles).to.be.lengthOf(4)
            .to.contain(normalize("game.ignore/file.html"))
            .to.contain(normalize("game.ignore/style.css"))
            .to.contain(normalize("project/style.ts"))
            .to.contain(normalize("project/style.tsx"));
    }

    function expectCollectionToOnlyHaveCorrectFiles(collection:ContentFileCollection): void{
        expect(collection.getAllRelativeFilePaths()).to.be.lengthOf(2)
            .to.contain(normalize("project/style.ts"))
            .to.contain(normalize("game.ignore/style.css"));
    }
});

function getTestCollection(): ContentFileCollection {
    const collection = new ContentFileCollection();
    const file = new ContentFile("file.txt", "");
    collection.addFile("game.ignore/file.html", file);
    collection.addFile("game.ignore/style.css", file);
    collection.addFile("project/style.ts", file);
    collection.addFile("project/style.tsx", file);

    return collection;
}