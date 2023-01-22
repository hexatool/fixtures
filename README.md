<h1 align="center">
  Hexatool's test fixtures
</h1>

<p align="center">
  Easily create and maintain test fixtures in the file system.
</p>

## Installation

```bash
npm install --save-dev fixtures
```

**Using yarn**

```bash
yarn add fixtures -dev
```

## What it does

- Place fixtures in any parent directory
- Find them again in your tests by their name
- Searches up the file system to find a match
- Makes it easy to move fixtures around and share between tests
- Copy them into a temporary directory
- Automatically cleanup any temporary files created

## API

```typescript
import fixtures from '@hexatool/fixtures';
```

### `fixtures(dirname, opts)`

Create fixture functions for the current file.

```typescript
const f = fixtures(__dirname);
```

### `f.find(basename)`

Find and return the path to a fixture by its `basename` (directory or filename
including file extension).

```typescript
const dirname = f.find('directory');
const filename = f.find('file.txt');
f.find('file'); // Error, not found!
```

### `f.copy(basename)`

Copy a fixture into a temporary directory by its `basename`.

```typescript
const tempDir = f.copy('directory');
const tempFile = f.copy('file.txt');
```

### `f.temp()`

Create an empty temporary directory.

```typescript
const tempDir = f.temp();
```

### `f.cleanup()`

Deletes any temporary files you created. This will automatically be called when
the Node process closes.

### `opts.glob`

Which files to match against when searching up the file system.

Default: `{fixtures,__fixtures__}/*`

```typescript
const f = fixtures(__dirname, { glob: 'mocks/*.json' });
```

### `opts.cleanup`

Automatically cleanup temporary files created

Default: `true`

```typescript
const f = fixtures(__dirname, { cleanup: false });
```

### `opts.root`

Set the parent directory to stop searching for fixtures.

Default: `"/"`

## How to use

1. Giving this workspace
    ```
   project
    └───src
        └───fixtures
        │   └───examples/...
        │       samples.txt
        └───nested
            └───fixtures
                    data.json
                index.spec.ts
   ```
2. You can use it with your favourite testing library
    ```typescript
    // src/nested/index.spec.ts
   
    import { describe, expect, it, vi } from 'vitest';
    import fixtures from '@hexatool/fixtures';
    const f = fixtures(__dirname);
    
    test('finding a fixture', t => {
         const filePath = f.find('samples.txt');
         // "/project/src/fixtures/samples.txt"
    });
    
    test('copying a file', t => {
         const tmpPath = f.copy('data.json'); //
         // "/private/var/folders/3x/jf5977fn79jbglr7rk0tq4d00000gn/T/a9fb0decd08179eb6cf4691568aa2018/data.json"
         // (from /project/src/nested/fixtures/samples.txt)
    });
    
    test('copying a directory', t => {
         const tmpPath = f.copy('examples');
         // "/private/var/folders/3x/jf5977fn79jbglr7rk0tq4d00000gn/T/4f504b9edb5ba0e89451617bf9f971dd/examples"
         // (from /project/src/fixtures/examples)
    });
    ```

## Hexatool Code Quality Standards

Publishing this package we are committing ourselves to the following code quality standards:

- Respect **Semantic Versioning**: No breaking changes in patch or minor versions
- No surprises in transitive dependencies: Use the **bare minimum dependencies** needed to meet the purpose
- **One specific purpose** to meet without having to carry a bunch of unnecessary other utilities
- **Tests** as documentation and usage examples
- **Well documented ReadMe** showing how to install and use
- **License favoring Open Source** and collaboration
