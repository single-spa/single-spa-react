---
"single-spa-react": major
---

### Fixed

- Enhanced compatibility with various bundlers and TypeScript `moduleResolution` strategies. The package's export patterns have been refined to address issues previously encountered with different bundling tools, ensuring more consistent and reliable integration across diverse build environments. Additionally, TypeScript type definitions have been improved, enhancing type safety and developer experience in varied TypeScript setups.

### BREAKING CHANGES

- The changes in export patterns / types may require updates in how projects import from `single-spa-react/*`.
