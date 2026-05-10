/* eslint-disable */
const fs = require("fs");
const path = require("path");

const files = process.argv.slice(2);
let hasError = false;

files.forEach((file) => {
  // 排除掉檢測腳本本身
  if (file.includes("check-dotenv.js")) return;

  if (fs.existsSync(file)) {
    const content = fs.readFileSync(file, "utf8");
    if (content.includes("dotenv")) {
      console.error(
        `\x1b[31mError: Found "dotenv" in ${file}. This is prohibited in the production codebase.\x1b[0m`
      );
      hasError = true;
    }
  }
});

if (hasError) {
  process.exit(1);
}
