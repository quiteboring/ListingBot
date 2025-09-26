import { Client, GatewayIntentBits } from "discord.js";

export class Bot extends Client {

  /**
   * @param {string} token
   */
  constructor(token) {
    super({ 
      intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMembers
      ] 
    })
    
    this.token = token;
  }

  async start() {
    this.login(this.token);
  }

}