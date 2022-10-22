import inquirer from "inquirer";
import { getPkgManager, validateNpmName } from "../functions";
import path from "path";
import { existsSync, readdirSync } from "fs";

export async function promptName() {
  const { name } = await inquirer.prompt({
    type: "input",
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
  });

  return name;
}

export async function promptLocation() {
  const { dir } = await inquirer.prompt({
    type: "input",
    name: "dir",
    message: "Where would you like to create your project?",
    default: ".",
    validate: (dir) => {
      if (dir === ".") return true;

      const validation = existsSync(dir);
      if (!validation) return true;

      const isEmpty = readdirSync(dir).length === 0;
      if (isEmpty) return true;
      return "That directory already exists.";
    },
  });

  return dir;
}

export async function promptToken() {
  const { confirmToken } = await inquirer.prompt({
    type: "confirm",
    name: "confirmToken",
    message: "Do you want to enter your token now?",
    default: true,
  });

  if (confirmToken) {
    const { token } = await inquirer.prompt({
      type: "password",
      name: "token",
      message: "What's the token of your bot?",
      validate: (token) => {
        if (!token) return "Please enter a token.";
        return true;
      },
    });

    return token;
  } else return "";
}

export async function promptGuildId() {
  const { guildId } = await inquirer.prompt({
    type: "input",
    name: "guildId",
    message: "What's your guild ID?",
    validate: (guildId) => {
      if (!guildId) return "Please enter a guild ID.";
      return true;
    },
  });

  return guildId;
}

export async function promptTemplate() {
  const { template } = await inquirer.prompt({
    type: "list",
    name: "template",
    message: "What language do you want to use?",
    choices: ["JavaScript", "TypeScript"],
    default: "TypeScript",
  });

  return template;
}

export async function promptGit() {
  const { git } = await inquirer.prompt({
    type: "confirm",
    name: "git",
    message: "Initialize a git repository?",
    default: true,
  });

  return git;
}

export async function promptInstall() {
  const { runInstall } = await inquirer.prompt({
    type: "confirm",
    name: "runInstall",
    message: `Do you want to run ${getPkgManager()} install now?`,
    default: true,
  });

  return runInstall;
}
