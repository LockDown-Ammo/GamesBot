import Discord, { Intents, Client, Snowflake, Interaction, Message, PartialMessage, Collection, User, MessageEmbed, MessageReaction, PartialMessageReaction, PartialUser } from 'discord.js';
import dotenv from 'dotenv';
import fs, { readdirSync, Dirent } from 'fs';
import GameBase from './src/base/gameBase';
import TicTacToeGame from './src/games/ttt'
import TwentyFortyEightGame from './src/games/2048'
import BreakLockGame from './src/games/breaklock';
import Connect4Game from './src/games/connect4';
import FloodGame from './src/games/flood';
import GameResult, { ResultType } from './src/interfaces/gameResult';
import { exec } from 'child_process'
import express from 'express'
import HangmanGame from './src/games/hangman';
const client: Client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS
  ]
});

type CommandObject = {
  [key: string]: () => GameBase;
}
const commandGameMap: CommandObject = {
  'flood': () => new FloodGame(),
  'connect4': () => new Connect4Game(),
  'breaklock': () => new BreakLockGame(),
  '2048': () => new TwentyFortyEightGame(),
  'ttt': () => new TicTacToeGame(),
  'hangman': () => new HangmanGame()
}
const playerGameMap = new Map<Snowflake, Map<Snowflake, GameBase>>();

client.on('ready', () => {
  console.log('Games Bot is online!');
  client.user?.setActivity('>>help', { type: 'LISTENING' });
})

client.on('debug', (m) => {
  // exec('sh rateLimited.sh ./');
  if (!m.startsWith('[WS => Shard 0] Heartbeat') && !m.startsWith('[WS => Shard 0] [Heartbeat'))
    console.log(m)
  if (m.startsWith("Hit a 429")) {
    exec('sh rateLimited.sh', (error, stdout, stderr) => {
      console.log(stdout);
      console.log(stderr);
      if (error !== null) {
        console.log(`Rate Limit Kill error: ${error}`);
      }
    })
  }
})

client.on('rateLimit', (rlInfo) => {
  console.log(
    rlInfo,
    `\nTimeout: ${rlInfo.timeout}\n`,
    `Limit: ${rlInfo.limit}\n`,
    `HTTP Method: ${rlInfo.method}\n`,
    `Path: ${rlInfo.path}\n`,
    `Route: ${rlInfo.route}\n`,
    `Global: ${rlInfo.global}\n`
  )
  exec('sh rateLimited.sh', (error, stdout, stderr) => {
    console.log(stdout);
    console.log(stderr);
    if (error !== null) {
      console.log(`Rate Limit Kill error: ${error}`);
    }
  })
})

client.on('shardDisconnect', (closeEvent, shardId) => {
  console.log(
    `Shard of id ${shardId} has been disconnected and wont reconnect\n`,
    `Code: ${closeEvent.code}\n`,
    `Reason: ${closeEvent.reason}\n`,
    `Target: ${closeEvent.target}\n`,
    `Clean: ${closeEvent.wasClean}\n`,
    closeEvent
  )
})
client.on('shardError', (e, id) => {
  console.error(`Shard ${id} encountered an error\n`, e);
})
client.on('shardReady', (id, ignored) => {
  console.log(`Shard ${id} is ready !!`)
})
client.on('shardReconnecting', (id) => {
  console.log(`Shard ${id} is reconnecting...`)
})
client.on('shardResume', (id, replayedEvents) => {
  console.log(`Shard ${id} has been resumed.\n`, `Replayed Events: ${replayedEvents}`)
})
client.on('invalidRequestWarning', (req) => {
  console.log(
    `Invalid Request was sent...\n`,
    `Invalid req remaining: ${req.count}\n`,
    `Time remaining: ${req.remainingTime}\n`,
    req
  )
})
/*client.on('apiRequest', (req) => {
  console.log(
    `API request data (Test purposes)\n`,
    req
  )
})
client.on('apiResponse', (req, res) => {
  console.log(
    `API request data (Test purposes)\n`,
    req,
    `Response: \n`,
    res
  )
})*/
/*client.on('invalidated', () => {
  console.log('Sessioin Expired....')
})*/

client.on('interactionCreate', (interaction: Interaction) => {
  const userGame: GameBase | null = getPlayersGame(interaction.guild?.id as Snowflake, interaction.user?.id as Snowflake);

  if (interaction.isCommand()) return;

  if (!userGame) return;

  userGame.onInteraction(interaction);
})

client.on('messageReactionAdd', (reaction: MessageReaction | PartialMessageReaction, user: User | PartialUser) => {
  const userId = user.id;
  const userGame = getPlayersGame(reaction.message?.guild?.id ?? null, userId);

  if (!userGame)
    return;
  if (userGame.player1Turn && userId !== userGame.gameStarter.id)
    return;
  if (!userGame.player1Turn && !!userGame.player2?.id && userId !== userGame.player2.id)
    return;
  if (!userGame.player1Turn && !userGame.player2?.id && userId !== userGame.gameStarter.id)
    return;
  
  userGame.onReaction(reaction);
  reaction.remove();
})

client.on('messageDelete', (message: Message | PartialMessage) => {
  handleMessageDelete(message.guild?.id, message.id);
})

client.on('messageDeleteBulk', (messages: Collection<string, Message | PartialMessage>) => {
  messages.forEach((message: Message | PartialMessage) => handleMessageDelete(message.guild?.id, message.id));
});

client.on('messageCreate', (message: Message) => {
  const prefix = process.env.PREFIX as string;
  if (!message.guild || !message.content.startsWith(prefix)) return;
  const games: string[] = []
  const suffix = '.ts'
  const gameFiles: Dirent[] = readdirSync('./src/games/', { withFileTypes: true })
  for (const game of gameFiles) {
    games.push(game.name.slice(0, -3))
  }
  const userGame = getPlayersGame(message.guild?.id as Snowflake, message.author?.id as Snowflake);
  const guildId = message.guild?.id as Snowflake
  const userId = message.author?.id as Snowflake
  const command = games.find(g => g == message.content.slice(prefix.length).split(/ +/).shift()!.toLowerCase())
  if (message.content.slice(prefix.length).split(/ +/).shift()!.toLowerCase() == 'help') {
    helpMessage(message)
  }
  if (!command || !userId)
    return;
  if (Object.keys(commandGameMap).includes(command)) {
    const game = commandGameMap[command]();

    const player2Option = message.mentions.users.first()
    let player2: User | undefined;
    if (player2Option) {
      if (!game.doesSupportMultiplayer()) {
        message.reply('Sorry this game does not support multiplayer');
        return;
      } else {
        player2 = message.guild.members.cache.find(m => m.user.id == player2Option.id)?.user as User
        const player2Id = player2.id
      }
    } else if (game.doesSupportMultiplayer()) {
      message.reply('This game can be played only in multiplayer !!');
      return;
    }
    if (userId === player2?.id) {
      message.reply('Srsly, playing with yourself? I am sad that you have no friends...').catch(console.log);
      return;
    }
    if (!playerGameMap.has(guildId)) {
      playerGameMap.set(guildId, new Map<Snowflake, GameBase>())
    }
    if (userGame) {
      message.reply('Whoa whoa pls finish your other game first... (Think this is a mistake? Uh well maybe ur record didnt get cleared. Best way is to stay idle for 1min so that the bot auto clears the game and pray that it dosent crash ;D)').catch(console.log);
      return;
    }
    else if (player2 && playerGameMap.get(guildId)?.has(player2.id)) {
      message.reply('Whoa whoa let them finish their game first... (Think this is a mistake? Uh well maybe their record didnt get cleared. Best way is to stay idle for 1min so that the bot auto clears the game and pray that it dosent crash ;D)').catch(console.log);
      return;
    }
    /*const foundGame = Array.from(playerGameMap.get(guildId)?.values() ?? []).find(g => g.getGameId() === game.getGameId());
    if (foundGame !== undefined && foundGame.isInGame()) {
      message.reply({ content: 'Sorry, there can only be 1 instance of a game at a time!' }).catch(console.log);
      return;
    }*/
    game.newGame(message, player2 ?? null, (result: GameResult) => {
      playerGameMap.get(guildId)?.delete(userId);
      if (player2)
        playerGameMap.get(guildId)?.delete(player2.id);
    });
    playerGameMap.get(guildId)?.set(userId, game);
    if (player2)
      playerGameMap.get(guildId)?.set(player2.id, game);
  }
})

const handleMessageDelete = (guild_id: Snowflake | undefined, message_id: Snowflake) => {
  if (!guild_id)
    return;

  const guidGames = playerGameMap.get(guild_id);
  if (!guidGames)
    return;

  guidGames.forEach((game: GameBase, userId: Snowflake) => {
    if (game.getMessageId() === message_id)
      game.gameOver({ result: ResultType.DELETED });
  });
};
const getPlayersGame: any = (guildId: Snowflake | null, userId: Snowflake): GameBase | null => {
  if (!guildId)
    return null;

  const guidGames = playerGameMap.get(guildId);
  if (!guidGames)
    return null;

  const userGame = guidGames.get(userId);
  if (!userGame)
    return null;

  return userGame;
};

const helpMessage: any = (message: Message) => {
  const em = new MessageEmbed()
    .setTitle("GameBot Help")
    .setDescription(`[Check documentations here](https://gamesbot.lckdownammo7.repl.co/docs/) or visit},ttps://gamesbot.lockdownammo7.repl.co/docs/ \n`)
    .addFields([
      {
        name: '🌊 Flood Game',
        value: '>>flood'
      },
      {
        name: '🟡 Connect 4',
        value: '>>connect4'
      },
      {
        name: '🔓 Break Lock',
        value: '>>breaklock'
      },
      {
        name: '2️⃣ 2048',
        value: '>>2048'
      },
      {
        name: '❌ TicTacToe',
        value: '>>ttt'
      }
    ])
  message.reply({ embeds: [em] }).catch(e => { })
}

client.login(process.env.TOKEN)


const app = express()
app.get('/', (req: any, res: any) => res.send('Your computer has a virus ~'))
app.listen(3000)
routerRunner()
async function routerRunner() {
  let routers = []
  const routerFiles = fs.readdirSync('./routers/', { withFileTypes: true })

  for (const route of routerFiles) {
    routers.push(await import(`./routers/${route.name.slice(0, -2)}js`))
  }
  try {
    routers.forEach(r => r.default.default(app))
  }
  catch (e) {
    console.log(e)
  }
}
