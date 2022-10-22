import { Command, Argument, Option } from "commander";
import inquirer from "inquirer";
import execa from "execa";
import fs from "fs";
import path from "path";
import packageJson from "../package.json";
import {
  promptGit,
  promptGuildId,
  promptInstall,
  promptLocation,
  promptName,
  promptTemplate,
  promptToken,
} from "./utils/questions";

export function argsToOptions(rawArgs) {
  let template;

  const program = new Command(packageJson.name)
    .version(packageJson.version)
    .usage(`[template] [options]`)
    .addArgument(
      new Argument("[template]", "The template to use.").choices([
        "javascript",
        "typescript",
      ])
    )
    .option("-g, --git", "Initalize a Git repository.", false)
    .option("-y, --yes", "Skip all the optional questions.")
    .option(
      "-i, --install",
      "Makes sure the packages are installed automatically."
    )
    .parse(rawArgs);

  return {
    skipPrompts: program.getOptionValue("yes") || false,
    git: program.getOptionValue("git") || false,
    template: program.args[0],
    runInstall: program.getOptionValue("install") || false,
  };
}

export async function prompt(options) {
  const name = await promptName();
  const location = await promptLocation();
  const token = await promptToken();
  const guildId = await promptGuildId();

  let template;
  let git;
  let runInstall;

  if (options.skipPrompts)
    return {
      name: name,
      token: token || "",
      guildId: guildId,
      git: options.git || true,
      template: options.template || "TypeScript",
      runInstall: options.runInstall || true,
    };

  if (!options.template) template = await promptTemplate();
  if (!options.git) git = await promptGit();
  if (!options.runInstall) runInstall = await promptInstall();

  return {
    name: name,
    token: token,
    guildId: guildId,
    targetDirectory: location,
    template: options.template || template,
    git: options.git || git,
    runInstall: options.runInstall || runInstall,
  };
}

export async function initGit(options) {
  const result = await execa("git", ["init"], {
    cwd: options.targetDirectory,
  });

  fs.writeFileSync(path.resolve(options.targetDirectory, ".gitignore"), ".env");

  if (result.failed) {
    return Promise.reject(new Error("Failed to initialize git"));
  }

  await execa("git", ["add", "-A"], {
    cwd: options.targetDirectory,
  });

  await execa("git", ["commit", "-m", "Initial commit from Create DJS App"], {
    cwd: options.targetDirectory,
  });

  return;
}

export async function installPkgs(options) {
  const result = await execa(getPkgManager(), ["install"], {
    cwd: options.targetDirectory,
  });

  if (result.failed) {
    return Promise.reject(new Error("Failed to install packages"));
  }
  return;
}

import validateProjectName from "validate-npm-package-name";

export function validateNpmName(name) {
  const nameValidation = validateProjectName(name);
  if (nameValidation.validForNewPackages) {
    return { valid: true };
  }

  return {
    valid: false,
    problems: [
      ...(nameValidation.errors || []),
      ...(nameValidation.warnings || []),
    ],
  };
}

export function getPkgManager() {
  const userAgent = process.env.npm_config_user_agent;

  if (!userAgent) return "npm";

  if (userAgent.startsWith("yarn")) return "yarn";
  if (userAgent.startsWith("pnpm")) return "pnpm";
  else return "npm";
}
