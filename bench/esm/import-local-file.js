(async () => {
  // Evaluating the dynamic import is a workaround for loading ESM in CJS files
  const {default: log} = await (Function(`return import("./local-file.mjs")`)());
  log();
})();
