import fs from "fs";
import rimraf from "rimraf";

function copyFile(sourcePath, destinationPath) {
  fs.copyFileSync(sourcePath, destinationPath);
}

rimraf.sync("parcel");

if (!fs.existsSync("parcel")) {
  fs.mkdirSync("parcel");
}

copyFile("types/parcel/index.d.ts", "parcel/index.d.ts");
copyFile("types/single-spa-react.d.ts", "types/single-spa-react.d.cts");

// eslint-disable-next-line no-console
console.log("Build types completed.");
