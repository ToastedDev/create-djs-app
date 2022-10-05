import {
  ChatInputApplicationCommandData,
  CommandInteraction,
  AutocompleteInteraction,
  CommandInteractionOptionResolver,
  GuildMember,
} from "discord.js";
import { Bot } from "../structures/Client";

export interface CmdInteraction extends CommandInteraction {
  member: GuildMember;
  options: CommandInteractionOptionResolver<"cached">;
}

interface RunOptions {
  client: Bot;
  interaction: CmdInteraction;
}

interface AutocompleteOptions {
  client: Bot;
  interaction: AutocompleteInteraction;
}

type RunFunction = (options: RunOptions) => any;

type AutocompleteFunction = (options: AutocompleteOptions) => any;

export type CommandType = {
  run: RunFunction;
  autocomplete?: AutocompleteFunction;
} & ChatInputApplicationCommandData;
