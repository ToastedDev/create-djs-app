import {
  ApplicationCommandDataResolvable,
  Client,
  ClientOptions,
  ClientEvents,
  Collection,
} from "discord.js";
import fs from "fs";
import path from "path";
import { CommandType } from "../typings/Command";
import { RegisterCommandsOptions } from "../typings/client";
import { ClientConfig } from "../typings/Config";
import { Event } from "./Event";

type BotOptions = Omit<ClientOptions, "intents">;

export class Bot extends Client {
  commands: Collection<string, CommandType> = new Collection();
  config: ClientConfig = require("../../config.json");

  constructor(options?: BotOptions = {}) {
    super({
      intents: ["Guilds", "GuildMessages", "GuildMembers", "MessageContent"],
      ...options,
    });
  }

  start() {
    this.registerModules();
    this.login(process.env.TOKEN);
  }
  private async importFile(filePath: string) {
    return (await import(filePath))?.default;
  }

  async registerCommands({ commands, guildId }: RegisterCommandsOptions) {
    if (!this.config.deploySlashGlobally) {
      const guild = this.guilds.cache.get(guildId);
      guild?.commands.set(commands);
      console.log(`Registering commands to ${guild?.name}`);
    } else {
      this.application?.commands.set(commands);
      console.log("Registering global commands");
    }
  }

  async registerModules() {
    // Commands
    const slashCommands: ApplicationCommandDataResolvable[] = [];
    fs.readdirSync(path.join(__dirname, "../commands")).forEach(async (dir) => {
      const commandFiles = fs
        .readdirSync(path.join(__dirname, `../commands/${dir}`))
        .filter((file) => file.endsWith(".ts") || file.endsWith(".js"));

      for (const file of commandFiles) {
        const command: CommandType = await this.importFile(
          `../commands/${dir}/${file}`
        );
        if (!command.name) return;

        this.commands.set(command.name, command);
        slashCommands.push(command);
      }
    });

    this.on("ready", () => {
      this.registerCommands({
        commands: slashCommands,
        guildId: this.config.guildId,
      });
    });

    // Events
    const eventFiles = fs
      .readdirSync(path.join(__dirname, "../events"))
      .filter((file) => file.endsWith(".ts") || file.endsWith(".js"));

    for (const file of eventFiles) {
      const event: Event<keyof ClientEvents> = await this.importFile(
        `../events/${file}`
      );
      this.on(event.event, event.run.bind(null, this));
    }
  }
}
