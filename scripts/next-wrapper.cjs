const path = require("path");

const patchPath = path.join(__dirname, "readlink-patch.cjs");
const patchPathForNodeOptions = patchPath.replace(/\\/g, "\\\\");

process.env.NODE_OPTIONS = [
  process.env.NODE_OPTIONS,
  `--require "${patchPathForNodeOptions}"`,
]
  .filter(Boolean)
  .join(" ");

require(patchPath);
require("next/dist/bin/next");
