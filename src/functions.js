import { Command, Argument, Option } from "commander";
import inquirer from "inquirer";
import execa from "execa";
import fs from "fs";
import path from "path";
import packageJson from "../package.json";

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
      "Makes sure the packages are installed automatically.",
      true
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
  const defaultTemplate = "TypeScript";

  const questions = [
    {
      type: "text",
      name: "name",
      message: "What will you name your project?",
      default: "my-bot",
      validate: (name) => {
        const validation = validateNpmName(path.basename(path.resolve(name)));
        if (validation.valid) {
          return true;
        }
        return "Invalid project name: " + validation.problems[0];
      },
    },
    {
      type: "confirm",
      name: "confirmToken",
      message: "Do you want to enter your token now?",
      default: true,
    },
  ];

  if (answers.confirmToken)
    await inquirer.prompt([
      {
        type: "text",
        name: "token",
        message: "What's the token of your bot?",
        validate: (token) => {
          if (!token) return "Please enter a token.";
          return true;
        },
      },
      {
        type: "number",
        name: "guildId",
        message: "What's your guild ID?",
        validate: (guildId) => {
          if (!guildId) return "Please enter a guild ID.";
          return true;
        },
      },
    ]);
  else
    await inquirer.prompt([
      {
        type: "number",
        name: "guildId",
        message: "What's your guild ID?",
        validate: (guildId) => {
          if (!guildId) return "Please enter a guild ID.";
          return true;
        },
      },
    ]);

  if (options.skipPrompts) {
    const answers = await inquirer.prompt(questions);

    return {
      name: answers.name,
      token: answers.token || "",
      guildId: answers.guildId,
      git: options.git || true,
      template: options.template || defaultTemplate,
      runInstall: options.runInstall || true,
    };
  }

  if (!options.template) {
    questions.push({
      type: "list",
      name: "template",
      message: "What language do you want to use?",
      choices: ["JavaScript", "TypeScript"],
      default: defaultTemplate,
    });
  }

  if (!options.git) {
    questions.push({
      type: "confirm",
      name: "git",
      message: "Initialize a git repository?",
      default: false,
    });
  }

  if (!options.runInstall) {
    questions.push({
      type: "confirm",
      name: "runInstall",
      message: "Install all dependencies?",
      default: true,
    });
  }

  const answers = await inquirer.prompt(questions);
  return {
    ...options,
    name: answers.name,
    token: answers.token,
    guildId: answers.guildId,
    template: options.template || answers.template,
    git: options.git || answers.git,
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
  return;
}

export async function installPkgs() {
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
