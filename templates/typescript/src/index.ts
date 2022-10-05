import "dotenv/config";
import { Bot } from "./structures/Client";

export const client = new Bot();

client.start();
