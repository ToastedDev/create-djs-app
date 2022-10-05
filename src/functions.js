import arg from "arg";
import inquirer from "inquirer";
import execa from "execa";
import path from "path";

export function argsToOptions(rawArgs) {
  const args = arg(
    {
      "--git": Boolean,
      "--yes": Boolean,
      "--install": Boolean,
      "-g": "--git",
      "-y": "--yes",
      "-i": "--install",
    },
    {
      argv: rawArgs.slice(2),
    }
  );
  return {
    skipPrompts: args["--yes"] || false,
    git: args["--git"] || false,
    template: args._[0],
    runInstall: args["--install"] || false,
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
  ];

  if (options.skipPrompts) {
    const answers = await inquirer.prompt(questions);

    return {
      ...options,
      name: answers.name,
      token: answers.token,
      guildId: answers.guildId,
      template: options.template || defaultTemplate,
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
  if (result.failed) {
    return Promise.reject(new Error("Failed to initialize git"));
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
