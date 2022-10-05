import chalk from "chalk";
import fs from "fs";
import ncp from "ncp";
import path from "path";
import { promisify } from "util";
import Listr from "listr";
import { projectInstall } from "pkg-install";
import { initGit } from "./functions";

const access = promisify(fs.access);
const copy = promisify(ncp);

async function copyTemplateFiles(options) {
  await copy(options.templateDirectory, options.targetDirectory, {
    clobber: false,
  });

  const packageJson = require(path.resolve(
    options.targetDirectory,
    "package.json"
  ));

  packageJson.name = options.name;

  fs.writeFileSync(
    path.resolve(options.targetDirectory, "package.json"),
    JSON.stringify(packageJson, null, 2)
  );

  const dotenv = `token=${options.token}`;

  fs.writeFileSync(path.resolve(options.targetDirectory, ".env"), dotenv);

  const config = {
    guildId: options.guildId.toString(),
    deploySlashGlobally: false,
  };

  fs.writeFileSync(
    path.resolve(options.targetDirectory, "config.json"),
    JSON.stringify(config, null, 2)
  );
}

export async function createProject(options) {
  options = {
    ...options,
    targetDirectory: options.targetDirectory || process.cwd(),
  };

  const templateDir = path.resolve(
    __dirname,
    "../templates",
    options.template.toLowerCase()
  );
  options.templateDirectory = templateDir;

  try {
    await access(templateDir, fs.constants.R_OK);
  } catch (err) {
    console.error("%s Invalid template name", chalk.red.bold("ERROR"));
    process.exit(1);
  }

  const tasks = new Listr([
    {
      title: "Copy project files",
      task: () => copyTemplateFiles(options),
    },
    {
      title: "Initialize git",
      task: () => initGit(options),
      enabled: () => options.git,
    },
    {
      title: "Install dependencies",
      task: () =>
        projectInstall({
          cwd: options.targetDirectory,
        }),
    },
  ]);

  await tasks.run();

  console.log("%s Project ready", chalk.green.bold("DONE"));
  return true;
}
