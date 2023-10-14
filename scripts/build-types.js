import fs from "fs";

function copyFile(sourcePath, destinationPath) {
  fs.copyFileSync(sourcePath, destinationPath);
}

copyFile("types/single-spa-react.d.ts", "types/single-spa-react.d.cts");

// eslint-disable-next-line no-console
console.log("Build types completed.");
