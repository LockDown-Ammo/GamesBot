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
  default: () => FloodGame
});
var import_gameResult = __toModule(require("../interfaces/gameResult"));
var import_gameBase = __toModule(require("../classes/gameBase"));
var import_position = __toModule(require("../interfaces/position"));
var import_discord = __toModule(require("discord.js"));
const HEIGHT = 13;
const WIDTH = 13;
const SQUARES = {
  "red_square": "\u{1F7E5}",
  "blue_square": "\u{1F7E6}",
  "orange_square": "\u{1F7E7}",
  "purple_square": "\u{1F7EA}",
  "green_square": "\u{1F7E9}"
};
class FloodGame extends import_gameBase.default {
  constructor() {
    super("flood", false);
    this.gameBoard = [];
    for (let y = 0; y < HEIGHT; y++) {
      for (let x = 0; x < WIDTH; x++) {
        this.gameBoard[y * WIDTH + x] = Object.values(SQUARES)[Math.floor(Math.random() * Object.keys(SQUARES).length)];
      }
      ;
    }
    ;
    this.turn = 1;
  }
  gameBoardToString() {
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
    const row = new import_discord.MessageActionRow().addComponents(...Object.entries(SQUARES).map(([k, v]) => new import_discord.MessageButton().setCustomId(k).setEmoji(v).setStyle(import_discord.default.Constants.MessageButtonStyles.SECONDARY)));
    const embed = new import_discord.MessageEmbed().setColor("#08b9bf").setTitle("Flood Game").setFooter({ text: `Current player: ${this.gameStarter.username}`, iconURL: this.gameStarter.displayAvatarURL({ dynamic: false }) }).setDescription(`[Click here to learn how to play](https://gameboardswebsite.lockdownammo7.repl.co/docs/#flood-game)
            
` + this.gameBoardToString()).addField("Turn:", this.turn.toString()).setTimestamp();
    return {
      embeds: [embed],
      components: [row]
    };
  }
  getGameOverContent(result) {
    const turnResp = result.result == import_gameResult.ResultType.WINNER ? `Game beat in ${this.turn - 1} turns :D` : "";
    const embed = new import_discord.default.MessageEmbed().setColor("#08b9bf").setTitle("Flod Game").setFooter({ text: "Whoops something overflowed :D" }).setDescription(`GAME OVER
${turnResp}
${this.getWinnerText(result)}`).setTimestamp();
    return {
      embeds: [embed],
      components: []
    };
  }
  onInteraction(interaction) {
    if (!interaction.isButton())
      return;
    if (interaction.user.id !== this.gameStarter.id)
      return;
    const selected = Object.entries(SQUARES).find(([k, v]) => k === interaction.customId);
    const current = this.gameBoard[0];
    if (selected && selected[1] !== current) {
      this.turn += 1;
      let queue = [{ x: 0, y: 0 }];
      let visited = [];
      while (queue.length > 0) {
        const pos = queue.shift();
        if (!pos || visited.some((p) => p.x === pos.x && p.y === pos.y))
          continue;
        visited.push(pos);
        if (this.gameBoard[pos.y * WIDTH + pos.x] === current) {
          this.gameBoard[pos.y * WIDTH + pos.x] = selected[1];
          [(0, import_position.up)(pos), (0, import_position.down)(pos), (0, import_position.left)(pos), (0, import_position.right)(pos)].forEach((checkPos) => {
            if (!visited.some((p) => p.x === checkPos.x && p.y === checkPos.y) && (0, import_position.isInside)(checkPos, WIDTH, HEIGHT))
              queue.push(checkPos);
          });
        }
      }
      let gameOver = true;
      for (let y = 0; y < HEIGHT; y++) {
        for (let x = 0; x < WIDTH; x++) {
          if (this.gameBoard[y * WIDTH + x] !== selected[1])
            gameOver = false;
        }
      }
      if (gameOver)
        this.gameOver({ result: import_gameResult.ResultType.WINNER, score: (this.turn - 1).toString(), name: this.gameStarter.id }, interaction);
      else
        super.step(false);
    }
    if (this.isInGame())
      interaction.update(this.getContent()).catch((e) => super.handleError(e, "update interaction"));
    else if (!this.result)
      this.gameOver({ result: import_gameResult.ResultType.ERROR }, interaction);
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {});
//# sourceMappingURL=flood.js.map
