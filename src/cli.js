import { argsToOptions, prompt } from "./functions";
import { createProject } from "./main";

export async function cli(args) {
  let options = argsToOptions(args);
  options = await prompt(options);
  await createProject(options);
}
