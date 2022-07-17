import { MessageEmbed, MessageActionRow } from 'discord.js';

export interface GameContent {
    embeds?: MessageEmbed[];
    components?: MessageActionRow[];
}
