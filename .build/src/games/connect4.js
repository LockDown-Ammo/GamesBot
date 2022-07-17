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
  default: () => Connect4Game
});
var import_gameResult = __toModule(require("../interfaces/gameResult"));
var import_gameBase = __toModule(require("../classes/gameBase"));
var import_discord = __toModule(require("discord.js"));
const HEIGHT = 7;
const WIDTH = 7;
class Connect4Game extends import_gameBase.default {
  constructor() {
    super("connect4", true);
    this.gameBoard = [];
    for (let y = 0; y < HEIGHT; y++) {
      for (let x = 0; x < WIDTH; x++) {
        this.gameBoard[y * WIDTH + x] = "\u26AB";
      }
    }
    this.player1Turn = true;
  }
  gameBoardToStr() {
    let str = "";
    for (let y = 0; y < HEIGHT; y++) {
      for (let x = 0; x < WIDTH; x++) {
        str += this.gameBoard[y * WIDTH + x];
      }
      str += `
`;
    }
    return str;
  }
  getContent() {
    var _a;
    const row1 = new import_discord.MessageActionRow().addComponents({
      type: "BUTTON",
      style: "SECONDARY",
      customId: "connect1",
      emoji: "1\uFE0F\u20E3"
    }, {
      type: "BUTTON",
      style: "SECONDARY",
      customId: "connect2",
      emoji: "2\uFE0F\u20E3"
    }, {
      type: "BUTTON",
      style: "SECONDARY",
      customId: "connect3",
      emoji: "3\uFE0F\u20E3"
    }, {
      type: "BUTTON",
      style: "SECONDARY",
      customId: "connect4",
      emoji: "4\uFE0F\u20E3"
    });
    const row2 = new import_discord.MessageActionRow().addComponents({
      type: "BUTTON",
      style: "SECONDARY",
      customId: "connect5",
      emoji: "5\uFE0F\u20E3"
    }, {
      type: "BUTTON",
      style: "SECONDARY",
      customId: "connect6",
      emoji: "6\uFE0F\u20E3"
    }, {
      type: "BUTTON",
      style: "SECONDARY",
      customId: "connect7",
      emoji: "7\uFE0F\u20E3"
    });
    const embed = new import_discord.MessageEmbed().setColor("#08b9bf").setTitle("Connect 4").setFooter({ text: `CurrentPlayer: ${(_a = this.getCurrentPlayer()) == null ? void 0 : _a.username}` }).setDescription(`[Click here to learn how to play](https://gameboardswebsite.lockdownammo7.repl.co/docs/#connect-4)
            
${this.gameBoardToStr()}
1\uFE0F\u20E32\uFE0F\u20E33\uFE0F\u20E34\uFE0F\u20E35\uFE0F\u20E36\uFE0F\u20E37\uFE0F\u20E3`).setTimestamp();
    return {
      embeds: [embed],
      components: [row1, row2]
    };
  }
  getCurrentPlayer() {
    return this.player1Turn ? this.gameStarter : this.player2 ?? void 0;
  }
  getGameOverContent(result) {
    const embed = new import_discord.default.MessageEmbed().setColor("#08b9bf").setTitle("Connect 4").setFooter({ text: "Whoops something overflowed :D" }).setDescription(`GAME OVER
${this.getWinnerText(result)}

${this.gameBoardToStr()}
1\uFE0F\u20E32\uFE0F\u20E33\uFE0F\u20E34\uFE0F\u20E35\uFE0F\u20E36\uFE0F\u20E37\uFE0F\u20E3`).setTimestamp();
    return {
      embeds: [embed],
      components: []
    };
  }
  onInteraction(interaction) {
    var _a, _b;
    if (!interaction.isButton())
      return;
    if (!interaction.customId.startsWith("connect"))
      return;
    if (interaction.user.id !== ((_a = this.getCurrentPlayer()) == null ? void 0 : _a.id)) {
      interaction.reply({ ephemeral: true, content: `Not your turn :D` });
      return;
    }
    const selected = parseInt(interaction.customId.slice(7));
    if (!selected || selected < 1 || selected > WIDTH)
      return;
    const column = selected - 1;
    if (this.gameBoard[column] !== "\u26AB") {
      interaction.reply({ ephemeral: true, content: "The column you chose is already full" });
      return;
    }
    let placedX = -1;
    let placedY = -1;
    for (let y = HEIGHT - 1; y >= 0; y--) {
      if (this.gameBoard[y * WIDTH + column] === "\u26AB") {
        this.gameBoard[y * WIDTH + column] = this.turnColor();
        placedX = column;
        placedY = y;
        break;
      }
    }
    if (this.hasWon(placedX, placedY)) {
      this.gameOver({ result: import_gameResult.ResultType.WINNER, name: this.turnColor() + this.player1Turn ? this.gameStarter.id : ((_b = this.player2) == null ? void 0 : _b.id) ?? "ERR" }, interaction);
    } else if (this.isBoardFull()) {
      this.gameOver({ result: import_gameResult.ResultType.TIE }, interaction);
    } else {
      this.step();
      interaction.update(this.getContent()).catch((e) => super.handleError(e, "update interaction"));
    }
  }
  step(edit) {
    this.player1Turn = this.player1Turn ? false : true;
    super.step(false);
  }
  turnColor() {
    return this.player1Turn ? "\u{1F534}" : "\u{1F7E1}";
  }
  hasWon(x, placedY) {
    const color = this.turnColor();
    const y = placedY * WIDTH;
    for (let i = Math.max(0, x - 3); i <= x; i++) {
      const adj = i + y;
      if (this.gameBoard[adj] === color && this.gameBoard[adj + 1] === color && this.gameBoard[adj + 2] === color && this.gameBoard[adj + 3] === color)
        return true;
    }
    for (let i = Math.max(0, placedY - 3); i <= placedY; i++) {
      const adj = x + i * WIDTH;
      if (i + 3 < HEIGHT) {
        if (this.gameBoard[adj] === color && this.gameBoard[adj + WIDTH] === color && this.gameBoard[adj + 2 * WIDTH] === color && this.gameBoard[adj + 3 * WIDTH] === color)
          return true;
      }
    }
    for (let i = -3; i <= 0; i++) {
      const adjX = x + i;
      const adjY = placedY + i;
      const adj = adjX + adjY * WIDTH;
      if (adjX + 3 < WIDTH && adjY + 3 < HEIGHT) {
        if (this.gameBoard[adj] === color && this.gameBoard[adj + WIDTH + 1] === color && this.gameBoard[adj + 2 * WIDTH + 2] === color && this.gameBoard[adj + 3 * WIDTH + 3] === color)
          return true;
      }
    }
    for (let i = -3; i <= 0; i++) {
      const adjX = x + i;
      const adjY = placedY - i;
      const adj = adjX + adjY * WIDTH;
      if (adjX + 3 < WIDTH && adjY - 3 >= 0) {
        if (this.gameBoard[adj] === color && this.gameBoard[adj - WIDTH + 1] === color && this.gameBoard[adj - 2 * WIDTH + 2] === color && this.gameBoard[adj - 3 * WIDTH + 3] === color)
          return true;
      }
    }
    return false;
  }
  isBoardFull() {
    for (let y = 0; y < HEIGHT; y++)
      for (let x = 0; x < WIDTH; x++)
        if (this.gameBoard[y * WIDTH + x] === "\u26AB")
          return false;
    return true;
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {});
//# sourceMappingURL=connect4.js.map
