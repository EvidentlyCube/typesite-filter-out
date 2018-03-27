# Typesite-filter-out

A plugin for [Typesite](https://github.com/EvidentlyCube/typesite) that allows you to filter out files.

## Installation

Run `npm install typesite-filter-out`

## How to use

Register the plugin in your Typesite project passing either a regular expression or a [multimatch](https://github.com/sindresorhus/multimatch) pattern. File paths that are matched will be removed.

```typescript
// This will remove every exe file, thumbs.db and desktop.ini
typesite.use(new FilterOutPlugin(["thumbs.db", "desktop.ini", "**/*.exe"]));

if (process.env.NODE_ENV === "production"){
	// Remove every file that has '.draft' in its path
	typesite.use(new FilterOutPlugin(/\.draft/));    
}
```

## API

### `FilterOutPlugin`
The plugin that does the filtering:

#### `constructor`

 * **Argument** `patternToFilterOut :RegExp | string[]` An array of strings to pass to multimatch or a regular expression which is used for filtering
 * **Argument** *\[Optional\]* `multimatchImplementation :(files: string[], patterns: string[]) => string[]` An optional implementation of multimatch to inject into this class, if null or not defined will use the default multimatch.
 * **Exception** `Typesite.ArgumentNullError` Thrown when `patternToFilterOut` is null
 * **Exception** `Typeiste.ArgumentInvalidError` Thrown when `patternToFilterOut` is not an instance of `RegExp` or a non-empty array of strings
 
 
## Note about paths

Matching is done against target path, so if you move files before applying filter plugin then they may not match anymore. **Target path is initially set to source path.**