import { ClientEvents } from "discord.js";
// import { ExtendedEvents } from "../typings/Events";
import { client } from "..";

export class Event<Key extends keyof ClientEvents> {
  constructor(
    public event: Key,
    public run: (c: typeof client, ...args: ClientEvents[Key]) => any
  ) {}
}
