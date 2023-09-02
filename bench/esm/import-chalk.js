(async () => {
  // Evaluating the dynamic import is a workaround for loading ESM in CJS files
  const { default: chalk } = await (Function(`return import("chalk")`)());
  console.log(chalk.blue("Hello World"));
})();
