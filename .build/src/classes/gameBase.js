var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __markAsModule = (target) => __defProp(target, "__esModule", { value: true });
var __export = (target, all) => {
  __markAsModule(target);
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
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
__export(exports, {
  default: () => GameBase
});
var import_discord = __toModule(require("discord.js"));
var import_gameResult = __toModule(require("../interfaces/gameResult"));
class GameBase {
  constructor(gameType, isMultiplayer) {
    this.inGame = false;
    this.result = void 0;
    this.gameMessage = void 0;
    this.player2 = null;
    this.player1Turn = true;
    this.onGameEnd = () => {
    };
    this.gameType = gameType;
    this.isMultiplayer = isMultiplayer;
  }
  step(edit = false) {
    var _a;
    if (edit)
      (_a = this.gameMessage) == null ? void 0 : _a.edit(this.getContent());
    if (this.gameTimeoutId)
      clearTimeout(this.gameTimeoutId);
    this.gameTimeoutId = setTimeout(() => this.gameOver({ result: import_gameResult.ResultType.TIMEOUT }), 60 * 1e3);
  }
  newGame(message, player2, onGameEnd) {
    var _a;
    this.gameStarter = message.author;
    this.player2 = player2;
    this.onGameEnd = onGameEnd;
    this.inGame = true;
    const content = this.getContent();
    (_a = message.channel) == null ? void 0 : _a.send({ embeds: content.embeds, components: content.components }).then((msg) => {
      this.gameMessage = msg;
      this.gameTimeoutId = setTimeout(() => this.gameOver({ result: import_gameResult.ResultType.TIMEOUT }), 60 * 1e3);
    }).catch((e) => this.handleError(e, "send message/ embed"));
  }
  handleError(e, perm) {
    if (e instanceof import_discord.DiscordAPIError) {
      const de = e;
      switch (de.code) {
        case 10003:
          this.gameOver({ result: import_gameResult.ResultType.ERROR, error: "Channel not found!" });
          break;
        case 10008:
          this.gameOver({ result: import_gameResult.ResultType.DELETED, error: "Message was deleted!" });
          break;
        case 10062:
          console.log("Unkown Interaction??");
          break;
        case 50001:
          if (this.gameMessage)
            this.gameMessage.channel.send("The bot is missing access to preform some of it's actions!").catch(() => {
              console.log("Error in the access error handler!");
            });
          else
            console.log("Error in the access error handler!");
          this.gameOver({ result: import_gameResult.ResultType.ERROR, error: "Missing access!" });
          break;
        case 50013:
          if (this.gameMessage)
            this.gameMessage.channel.send(`The bot is missing the '${perm}' permissions it needs order to work!`).catch(() => {
              console.log("Error in the permission error handler!");
            });
          else
            console.log("Error in the permission error handler!");
          this.gameOver({ result: import_gameResult.ResultType.ERROR, error: "Missing permissions!" });
          break;
        default:
          console.log("Encountered a Discord error not handled! ");
          console.log(e);
          break;
      }
    } else {
      this.gameOver({ result: import_gameResult.ResultType.ERROR, error: "Game embed missing!" });
    }
  }
  gameOver(result, interaction = void 0) {
    var _a;
    if (!this.inGame)
      return;
    this.result = result;
    this.inGame = false;
    const gameOverContent = this.getGameOverContent(result);
    this.onGameEnd(result);
    (_a = this.gameMessage) == null ? void 0 : _a.edit(gameOverContent).catch((e) => this.handleError(e, ""));
    if (this.gameTimeoutId)
      clearTimeout(this.gameTimeoutId);
  }
  getWinnerText(result) {
    if (result.result === import_gameResult.ResultType.TIE)
      return "Thats a tie";
    else if (result.result === import_gameResult.ResultType.TIMEOUT)
      return "They not respond quick :c";
    else if (result.result === import_gameResult.ResultType.ERROR)
      return "ERROR: " + result.error;
    else if (result.result === import_gameResult.ResultType.WINNER)
      return "<@" + result.name + "> has won GG :D";
    else if (result.result === import_gameResult.ResultType.LOSER)
      return "<@" + result.name + "> has lost as they are out of moves";
    return "";
  }
  setGameId(id) {
    this.gameId = id;
  }
  getGameId() {
    return this.gameId;
  }
  getGameType() {
    return this.gameType;
  }
  getMessageId() {
    var _a;
    return ((_a = this.gameMessage) == null ? void 0 : _a.id) ?? "";
  }
  isInGame() {
    return this.inGame;
  }
  doesSupportMultiplayer() {
    return this.isMultiplayer;
  }
  createMessageActionRowButton(buttonInfo) {
    return new import_discord.MessageActionRow().addComponents(...buttonInfo.map(([id, emoji]) => new import_discord.MessageButton().setCustomId(id).setEmoji(emoji).setStyle(import_discord.default.Constants.MessageButtonStyles.SECONDARY)));
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {});
//# sourceMappingURL=gameBase.js.map
