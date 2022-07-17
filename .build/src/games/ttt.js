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
  default: () => TicTacToe
});
var import_discord = __toModule(require("discord.js"));
var import_gameBase = __toModule(require("../classes/gameBase"));
var import_gameResult = __toModule(require("../interfaces/gameResult"));
const { MessageButtonStyles, MessageComponentTypes } = import_discord.default.Constants;
const NO_MOVE = 0;
const PLAYER_1 = 1;
const PLAYER_2 = 2;
class TicTacToe extends import_gameBase.default {
  constructor() {
    super("tictactoe", true);
    this.gameBoard = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
    this.won = false;
  }
  getContent() {
    var _a;
    const embed = new import_discord.MessageEmbed().setColor("#08b9bf").setFooter({ text: `Current player: ${(_a = this.currentPlayer()) == null ? void 0 : _a.username}` }).setTitle("TicTacToe").setDescription(`[Click here to learn how to play](https://gameboardswebsite.lockdownammo7.repl.co/docs/#ttt)`).setTimestamp();
    return {
      embeds: [embed],
      components: this.generateComponents()
    };
  }
  getGameOverContent(result) {
    const embed = new import_discord.MessageEmbed().setColor("#08b9bf").setFooter({ text: `Whoops something overflowed :D` }).setTitle("TicTacToe").setDescription(`GAME OVER 
 ${this.getWinnerText(result)}`).setTimestamp();
    return {
      embeds: [embed],
      components: this.generateComponents()
    };
  }
  onInteraction(interaction) {
    var _a, _b;
    if (!interaction.isButton())
      return;
    if (!interaction.customId.startsWith("ttt"))
      return;
    if (interaction.user.id != ((_a = this.currentPlayer()) == null ? void 0 : _a.id))
      return;
    const id = parseInt(interaction.customId.split("ttt")[1]);
    const y = Math.floor((id - 1) / 3);
    const x = id - y * 3 - 1;
    this.gameBoard[y][x] = this.currentPlayerState();
    if (this.hasWon(this.currentPlayerState())) {
      this.gameOver({ result: import_gameResult.ResultType.WINNER, name: (_b = this.currentPlayer()) == null ? void 0 : _b.id });
      return;
    }
    if (this.isBoardFull()) {
      this.gameOver({ result: import_gameResult.ResultType.TIE });
      return;
    }
    this.step(false);
    this.player1Turn = !this.player1Turn;
    interaction.update(this.getContent()).catch((e) => this.handleError(e, "update interaction"));
  }
  currentPlayer() {
    return this.player1Turn ? this.gameStarter : this.player2;
  }
  currentPlayerState() {
    return this.player1Turn ? 1 : 2;
  }
  currentPlayerStateSymbol(n) {
    return n == 0 ? "\u3164" : n == 1 ? "X" : "O";
  }
  currentPlayerStateStyle(n) {
    return n == 0 ? MessageButtonStyles.SECONDARY : n == 1 ? MessageButtonStyles.DANGER : MessageButtonStyles.SUCCESS;
  }
  currentPlayerStateDisabled(n) {
    return this.won ? true : n == 0 ? false : true;
  }
  hasWon(player) {
    this.won = true;
    if (this.gameBoard[0][0] == this.gameBoard[1][1] && this.gameBoard[0][0] == this.gameBoard[2][2] && this.gameBoard[0][0] == player) {
      return true;
    }
    if (this.gameBoard[0][2] == this.gameBoard[1][1] && this.gameBoard[0][2] == this.gameBoard[2][0] && this.gameBoard[0][2] == player) {
      return true;
    }
    for (let i = 0; i < 3; ++i) {
      if (this.gameBoard[i][0] == this.gameBoard[i][1] && this.gameBoard[i][0] == this.gameBoard[i][2] && this.gameBoard[i][0] == player) {
        return true;
      }
      if (this.gameBoard[0][i] == this.gameBoard[1][i] && this.gameBoard[0][i] == this.gameBoard[2][i] && this.gameBoard[0][i] == player) {
        return true;
      }
    }
    this.won = false;
    return false;
  }
  isBoardFull() {
    for (let y = 0; y < 3; y++)
      for (let x = 0; x < 3; x++)
        if (this.gameBoard[y][x] == 0)
          return false;
    return true;
  }
  generateComponents() {
    let rows = [];
    for (let y = 0; y < 3; y++) {
      const row = new import_discord.MessageActionRow();
      for (let x = 0; x < 3; x++) {
        row.addComponents({
          type: MessageComponentTypes.BUTTON,
          customId: `ttt${y * 3 + x + 1}`,
          label: this.currentPlayerStateSymbol(this.gameBoard[y][x]),
          style: this.currentPlayerStateStyle(this.gameBoard[y][x]),
          disabled: this.currentPlayerStateDisabled(this.gameBoard[y][x])
        });
      }
      rows = [...rows, row];
    }
    return [...rows];
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {});
//# sourceMappingURL=ttt.js.map
