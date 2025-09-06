# single-spa-react

## 7.0.0-beta.0

- feature: Support for hydrateRoot 15d55b1 ([#218](https://github.com/single-spa/single-spa-react/pull/218)) by Jolyn
- feature: Re-implement <Parcel /> component 15d55b1 ([#218](https://github.com/single-spa/single-spa-react/pull/218)) by Jolyn
- breaking: Remove main, module, and require fields from package.json 15d55b1 ([#218](https://github.com/single-spa/single-spa-react/pull/218)) by Jolyn
- breaking: Rewrite to typescript. New opts required. Newer versions of React required 15d55b1 ([#218](https://github.com/single-spa/single-spa-react/pull/218)) by Jolyn
- breaking: returns `init` function rather than `bootstrap` function, which is compatible with single-spa@7 or with earlier versions of single-spa via the [`@single-spa/lifecycles-compat`](https://github.com/single-spa/lifecyles-compat) library

### Upgrading

```diff
-export const { bootstrap, mount, unmount } = singleSpaReact({
-  React,
-  ReactDOMClient,
-  rootComponent,
-  errorBoundary(err, info, props) {
-    // https://reactjs.org/docs/error-boundaries.html
-    return <div>This renders when a catastrophic error occurs</div>;
-  },
-});

+export const { init, mount, unmount } = singleSpaReact({
+  createRoot,
+  createElement,
+  useEffect,
+  renderReactNode: (props) => (
+    <Root />
+  )
+});
```

## 6.0.2

### Patch Changes

- [#206](https://github.com/single-spa/single-spa-react/pull/206) [`986149d`](https://github.com/single-spa/single-spa-react/commit/986149d04d4eac0a9b3d156935f621fc8f858c2f) Thanks [@nickbosland](https://github.com/nickbosland)! - Fixed an issue with mounting a parcel when StrictMode is enabled

## 6.0.1

### Patch Changes

- [#203](https://github.com/single-spa/single-spa-react/pull/203) [`ec968f2`](https://github.com/single-spa/single-spa-react/commit/ec968f2bb3658b783a4ba60519a73ab71962966f) Thanks [@joeldenning](https://github.com/joeldenning)! - Automatically support React 17 with default opts. Resolves #202

## 6.0.0

### Major Changes

- [#197](https://github.com/single-spa/single-spa-react/pull/197) [`1141959`](https://github.com/single-spa/single-spa-react/commit/1141959915c3a0073623e589b1eebd0891876745) Thanks [@MilanKovacic](https://github.com/MilanKovacic)! - ### Fixed
  - Enhanced compatibility with various bundlers and TypeScript `moduleResolution` strategies. The package's export patterns have been refined to address issues previously encountered with different bundling tools, ensuring more consistent and reliable integration across diverse build environments. Additionally, TypeScript type definitions have been improved, enhancing type safety and developer experience in varied TypeScript setups.

  ### BREAKING CHANGES
  - The changes in export patterns / types may require updates in how projects import from `single-spa-react/*`.

### Patch Changes

- [#191](https://github.com/single-spa/single-spa-react/pull/191) [`48389d9`](https://github.com/single-spa/single-spa-react/commit/48389d965624d554f82bca4abaa5975567582835) Thanks [@robmosca](https://github.com/robmosca)! - Add check for changeset being present in PRs

- [#193](https://github.com/single-spa/single-spa-react/pull/193) [`f22690d`](https://github.com/single-spa/single-spa-react/commit/f22690d1e8c5d78de9e4edeeef35d60284615153) Thanks [@robmosca](https://github.com/robmosca)! - Fix Node version for release workflow

## 5.1.4

### Patch Changes

- 34e311b: fixing changeset default publish

## 5.1.3

### Patch Changes

- bc6e04a: Add automated release workflow
