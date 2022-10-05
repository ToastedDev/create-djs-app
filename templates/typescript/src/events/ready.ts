import { Event } from "../structures/Event";

export default new Event("ready", (client) => {
  console.log(`${client.user?.tag} is now online!`);
});
