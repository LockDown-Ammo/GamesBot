var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __markAsModule = (target) => __defProp(target, "__esModule", { value: true });
var __reExport = (target, module2, desc) => {
  if (module2 && typeof module2 === "object" || typeof module2 === "function") {
    for (let key of __getOwnPropNames(module2))
      if (!__hasOwnProp.call(target, key) && key !== "default")
        __defProp(target, key, { get: () => module2[key], enumerable: !(desc = __getOwnPropDesc(module2, key)) || desc.enumerable });
  }
  return target;
};
var __toModule = (module2) => {
  return __reExport(__markAsModule(__defProp(module2 != null ? __create(__getProtoOf(module2)) : {}, "default", module2 && module2.__esModule && "default" in module2 ? { get: () => module2.default, enumerable: true } : { value: module2, enumerable: true })), module2);
};
var import_discord = __toModule(require("discord.js"));
var import_fs = __toModule(require("fs"));
var import_ttt = __toModule(require("./src/games/ttt"));
var import__ = __toModule(require("./src/games/2048"));
var import_breaklock = __toModule(require("./src/games/breaklock"));
var import_connect4 = __toModule(require("./src/games/connect4"));
var import_flood = __toModule(require("./src/games/flood"));
var import_gameResult = __toModule(require("./src/interfaces/gameResult"));
var import_express = __toModule(require("express"));
const client = new import_discord.Client({
  intents: [
    import_discord.Intents.FLAGS.GUILDS,
    import_discord.Intents.FLAGS.GUILD_MEMBERS,
    import_discord.Intents.FLAGS.GUILD_MESSAGES,
    import_discord.Intents.FLAGS.GUILD_MESSAGE_REACTIONS
  ]
});
const commandGameMap = {
  "flood": () => new import_flood.default(),
  "connect4": () => new import_connect4.default(),
  "breaklock": () => new import_breaklock.default(),
  "2048": () => new import__.default(),
  "ttt": () => new import_ttt.default()
};
const playerGameMap = new Map();
client.on("ready", () => {
  var _a;
  console.log("Games Bot is online!");
  (_a = client.user) == null ? void 0 : _a.setActivity(">>help", { type: "LISTENING" });
});
client.on("debug", (m) => {
  if (!m.startsWith("[WS => Shard 0] Heartbeat") && !m.startsWith("[WS => Shard 0] [Heartbeat"))
    console.log(m);
});
client.on("rateLimit", (rlInfo) => {
  console.log(rlInfo, `
Timeout: ${rlInfo.timeout}
`, `Limit: ${rlInfo.limit}
`, `HTTP Method: ${rlInfo.method}
`, `Path: ${rlInfo.path}
`, `Route: ${rlInfo.route}
`, `Global: ${rlInfo.global}
`);
});
client.on("shardDisconnect", (closeEvent, shardId) => {
  console.log(`Shard of id ${shardId} has been disconnected and wont reconnect
`, `Code: ${closeEvent.code}
`, `Reason: ${closeEvent.reason}
`, `Target: ${closeEvent.target}
`, `Clean: ${closeEvent.wasClean}
`, closeEvent);
});
client.on("shardError", (e, id) => {
  console.error(`Shard ${id} encountered an error
`, e);
});
client.on("shardReady", (id, ignored) => {
  console.log(`Shard ${id} is ready !!`);
});
client.on("shardReconnecting", (id) => {
  console.log(`Shard ${id} is reconnecting...`);
});
client.on("shardResume", (id, replayedEvents) => {
  console.log(`Shard ${id} has been resumed.
`, `Replayed Events: ${replayedEvents}`);
});
client.on("invalidRequestWarning", (req) => {
  console.log(`Invalid Request was sent...
`, `Invalid req remaining: ${req.count}
`, `Time remaining: ${req.remainingTime}
`, req);
});
client.on("interactionCreate", (interaction) => {
  var _a, _b;
  const userGame = getPlayersGame((_a = interaction.guild) == null ? void 0 : _a.id, (_b = interaction.user) == null ? void 0 : _b.id);
  if (interaction.isCommand())
    return;
  if (!userGame)
    return;
  userGame.onInteraction(interaction);
});
client.on("messageDelete", (message) => {
  var _a;
  handleMessageDelete((_a = message.guild) == null ? void 0 : _a.id, message.id);
});
client.on("messageDeleteBulk", (messages) => {
  messages.forEach((message) => {
    var _a;
    return handleMessageDelete((_a = message.guild) == null ? void 0 : _a.id, message.id);
  });
});
client.on("messageCreate", (message) => {
  var _a, _b, _c, _d, _e, _f, _g, _h, _i;
  const prefix = process.env.PREFIX;
  if (!message.guild || !message.content.startsWith(prefix))
    return;
  const games = [];
  const suffix = ".ts";
  const gameFiles = (0, import_fs.readdirSync)("./src/games/", { withFileTypes: true });
  for (const game of gameFiles) {
    games.push(game.name.slice(0, -3));
  }
  const userGame = getPlayersGame((_a = message.guild) == null ? void 0 : _a.id, (_b = message.author) == null ? void 0 : _b.id);
  const guildId = (_c = message.guild) == null ? void 0 : _c.id;
  const userId = (_d = message.author) == null ? void 0 : _d.id;
  const command = games.find((g) => g == message.content.slice(prefix.length).split(/ +/).shift().toLowerCase());
  if (message.content.slice(prefix.length).split(/ +/).shift().toLowerCase() == "help") {
    const em = new import_discord.MessageEmbed().setTitle("GameBot Help").setDescription(`[Check documentations here](https://gameboardswebsite.lockdownammo7.repl.co/docs/) or visit https://gameboardswebsite.lockdownammo7.repl.co/docs/ 
`).addFields([
      {
        name: "\u{1F30A} Flood Game",
        value: ">>flood"
      },
      {
        name: "\u{1F7E1} Connect 4",
        value: ">>connect4"
      },
      {
        name: "\u{1F513} Break Lock",
        value: ">>breaklock"
      },
      {
        name: "2\uFE0F\u20E3 2048",
        value: ">>2048"
      },
      {
        name: "\u274C TicTacToe",
        value: ">>ttt"
      }
    ]);
    message.reply({ embeds: [em] });
  }
  if (!command || !userId)
    return;
  if (Object.keys(commandGameMap).includes(command)) {
    const game = commandGameMap[command]();
    const player2Option = message.mentions.users.first();
    let player2;
    if (player2Option) {
      if (!game.doesSupportMultiplayer()) {
        message.reply("Sorry this game does not support multiplayer");
        return;
      } else {
        player2 = (_e = message.guild.members.cache.find((m) => m.user.id == player2Option.id)) == null ? void 0 : _e.user;
        const player2Id = player2.id;
      }
    } else if (game.doesSupportMultiplayer()) {
      message.reply("This game can be played only in multiplayer !!");
      return;
    }
    if (userId === (player2 == null ? void 0 : player2.id)) {
      message.reply("Srsly, playing with yourself? I am sad that ypu have no friends...").catch(console.log);
      return;
    }
    if (!playerGameMap.has(guildId)) {
      playerGameMap.set(guildId, new Map());
    }
    if (userGame) {
      message.reply("Whoa whoa pls finish your other game first... (Think this is a mistake? Uh well maybe ur record didnt get cleared)").catch(console.log);
      return;
    } else if (player2 && ((_f = playerGameMap.get(guildId)) == null ? void 0 : _f.has(player2.id))) {
      message.reply("Whoa whoa let them finish their game... (Think this is a mistake? Uh well maybe their record didnt get cleared)").catch(console.log);
      return;
    }
    const foundGame = Array.from(((_g = playerGameMap.get(guildId)) == null ? void 0 : _g.values()) ?? []).find((g) => g.getGameId() === game.getGameId());
    if (foundGame !== void 0 && foundGame.isInGame()) {
      message.reply({ content: "Sorry, there can only be 1 instance of a game at a time!" }).catch(console.log);
      return;
    }
    game.newGame(message, player2 ?? null, (result) => {
      var _a2, _b2;
      (_a2 = playerGameMap.get(guildId)) == null ? void 0 : _a2.delete(userId);
      if (player2)
        (_b2 = playerGameMap.get(guildId)) == null ? void 0 : _b2.delete(player2.id);
    });
    (_h = playerGameMap.get(guildId)) == null ? void 0 : _h.set(userId, game);
    if (player2)
      (_i = playerGameMap.get(guildId)) == null ? void 0 : _i.set(player2.id, game);
  }
});
const handleMessageDelete = (guild_id, message_id) => {
  if (!guild_id)
    return;
  const guidGames = playerGameMap.get(guild_id);
  if (!guidGames)
    return;
  guidGames.forEach((game, userId) => {
    if (game.getMessageId() === message_id)
      game.gameOver({ result: import_gameResult.ResultType.DELETED });
  });
};
const getPlayersGame = (guildId, userId) => {
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
client.login(process.env.TOKEN);
const app = (0, import_express.default)();
app.get("/", (req, res) => res.send("Your computer has a virus ~ Tech Support"));
app.listen(3e3);
//# sourceMappingURL=index.js.map
