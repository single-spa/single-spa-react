# Parcel Folder

## Overview
This folder contains a `package.json` stub that redirects module resolutions, following the `package-json-redirects` strategy.

## Why It's Here
Serves as a compatibility layer for Node 10, which does not support the `exports` field in `package.json`. A separate `package.json` with `main` and `types` fields directs Node 10's resolution strategy to the appropriate files.

```json
{
  "main": "./lib/cjs/parcel.cjs",
  "types": "./types/parcel/index.d.cts"
}
```

## How It Works
When Node 10 attempts to import from this folder, it consults the `main` and `types` fields in `package.json` to locate the actual implementation and types files. This facilitates keeping those files in separate subfolders while making them accessible to older Node versions.

## Reference
For more detailed information and examples, see [this GitHub repository](https://github.com/andrewbranch/example-subpath-exports-ts-compat/tree/main/examples/node_modules/package-json-redirects).
