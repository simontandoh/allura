const fs = require("fs");
const Module = require("module");
const path = require("path");
const os = require("os");

const mapReadlinkError = (error) => {
  if (!error || error.code !== "EISDIR") return error;
  const mapped = new Error(error.message);
  mapped.code = "EINVAL";
  mapped.errno = error.errno;
  mapped.path = error.path;
  mapped.syscall = error.syscall;
  return mapped;
};

const patch = (moduleFs) => {
  if (!moduleFs?.readlinkSync || !moduleFs?.readlink) return;

  const originalSync = moduleFs.readlinkSync.bind(moduleFs);
  moduleFs.readlinkSync = (...args) => {
    try {
      return originalSync(...args);
    } catch (error) {
      throw mapReadlinkError(error);
    }
  };

  const originalAsync = moduleFs.readlink.bind(moduleFs);
  moduleFs.readlink = (...args) => {
    const cb = args[args.length - 1];
    if (typeof cb !== "function") return originalAsync(...args);
    const wrapped = (error, ...rest) => cb(mapReadlinkError(error), ...rest);
    return originalAsync(...args.slice(0, -1), wrapped);
  };

  if (moduleFs.promises?.readlink) {
    const originalPromises = moduleFs.promises.readlink.bind(moduleFs.promises);
    moduleFs.promises.readlink = async (...args) => {
      try {
        return await originalPromises(...args);
      } catch (error) {
        throw mapReadlinkError(error);
      }
    };
  }
};

patch(fs);
try {
  patch(require("graceful-fs"));
} catch {}

// On exFAT/removable drives, Windows can fail to load native addons (`.node`) with
// `ERR_DLOPEN_FAILED` / "not a valid Win32 application". Next.js relies on a native
// SWC binding for correct compilation of client/server boundaries, so we copy the
// binding package to a temp folder (typically on NTFS) and load it from there.
const originalLoad = Module._load;

function tryLoadSwcFromTemp(parent, isMain) {
  const pkgJsonPath = require.resolve("@next/swc-win32-x64-msvc/package.json");
  const srcDir = path.dirname(pkgJsonPath);
  const pkg = JSON.parse(fs.readFileSync(pkgJsonPath, "utf8"));
  const version = pkg.version || "unknown";

  const destDir = path.join(os.tmpdir(), "next-swc", `swc-win32-x64-msvc-${version}`);
  const marker = path.join(destDir, ".copied");

  if (!fs.existsSync(marker)) {
    fs.mkdirSync(destDir, { recursive: true });
    fs.cpSync(srcDir, destDir, { recursive: true, force: true });
    fs.writeFileSync(marker, "ok");
  }

  return originalLoad(destDir, parent, isMain);
}

Module._load = function patchedLoad(request, parent, isMain) {
  if (request === "@next/swc-win32-x64-msvc") {
    try {
      return originalLoad(request, parent, isMain);
    } catch (error) {
      if (
        error &&
        error.code === "ERR_DLOPEN_FAILED" &&
        typeof error.message === "string" &&
        error.message.includes("not a valid Win32 application")
      ) {
        return tryLoadSwcFromTemp(parent, isMain);
      }
      throw error;
    }
  }
  return originalLoad(request, parent, isMain);
};
