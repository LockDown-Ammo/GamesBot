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
  default: () => TwentFortyEight
});
var import_discord = __toModule(require("discord.js"));
var import_gameBase = __toModule(require("../classes/gameBase"));
var import_direction = __toModule(require("../interfaces/direction"));
var import_gameResult = __toModule(require("../interfaces/gameResult"));
var import_position = __toModule(require("../interfaces/position"));
const HEIGHT = 4;
const WIDTH = 4;
class TwentFortyEight extends import_gameBase.default {
  constructor() {
    super("2048", false);
    this.gameBoard = [];
    this.mergedPos = [];
    this.score = 0;
    this.mergedNum = 1;
    for (let y = 0; y < HEIGHT; y++)
      for (let x = 0; x < WIDTH; x++)
        this.gameBoard[y * WIDTH + x] = 0;
    this.placeNewRandTile();
  }
  getContent() {
    const row = this.createMessageActionRowButton([["2048left", "\u2B05\uFE0F"], ["2048up", "\u2B06\uFE0F"], ["2048right", "\u27A1\uFE0F"], ["2048down", "\u2B07\uFE0F"]]);
    const embed = new import_discord.MessageEmbed().setColor("#08b9bf").setFooter({ text: `Current player: ${this.gameStarter.username}` }).setTitle("2048 or TwentyFortyEight").setDescription(`[Click here to learn how to play](https://gameboardswebsite.lockdownammo7.repl.co/docs/#2048)`).setImage(`https://gameboardswebsite.lockdownammo7.repl.co/gameBot/2048?gb=${this.gameBoardToString()}`).addField("Score:", this.score.toString()).setTimestamp();
    return {
      embeds: [embed],
      components: [row]
    };
  }
  getGameOverContent(result) {
    const embed = new import_discord.MessageEmbed().setColor("#f2e641").setTitle("2048 or TwentyFortyEight").setFooter({ text: "Whoops something overflowed :D" }).setDescription(`GAME OVER!
${this.getWinnerText(result)}

Score: ${this.score}`).setImage(`https://gameboardswebsite.lockdownammo7.repl.co/gameBot/2048?gb=${this.gameBoardToString()}`).setTimestamp();
    return {
      embeds: [embed],
      components: []
    };
  }
  placeNewRandTile() {
    let newPos = { x: 0, y: 0 };
    do {
      newPos = { x: Math.floor(Math.random() * WIDTH), y: Math.floor(Math.random() * HEIGHT) };
    } while (this.gameBoard[newPos.y * HEIGHT + newPos.x] != 0);
    this.gameBoard[newPos.y * HEIGHT + newPos.x] = Math.random() * 100 < 25 ? 2 : 1;
  }
  gameBoardToString() {
    return this.gameBoard.join(",");
  }
  moveLeft() {
    let moved = false;
    for (let y = 0; y < HEIGHT; y++)
      for (let x = 1; x < WIDTH; x++)
        moved = this.move({ x, y }, import_direction.Direction.LEFT) || moved;
    return moved;
  }
  moveUp() {
    let moved = false;
    for (let y = 1; y < HEIGHT; y++)
      for (let x = 0; x < WIDTH; x++)
        moved = this.move({ x, y }, import_direction.Direction.UP) || moved;
    return moved;
  }
  moveRight() {
    let moved = false;
    for (let y = 0; y < HEIGHT; y++)
      for (let x = WIDTH - 2; x >= 0; x--)
        moved = this.move({ x, y }, import_direction.Direction.RIGHT) || moved;
    return moved;
  }
  moveDown() {
    let moved = false;
    for (let y = HEIGHT - 2; y >= 0; y--)
      for (let x = 1; x < WIDTH; x++)
        moved = this.move({ x, y }, import_direction.Direction.DOWN) || moved;
    return moved;
  }
  move(pos, dir) {
    let moved = false;
    const movingNum = this.gameBoard[pos.y * WIDTH + pos.x];
    if (movingNum == 0)
      return false;
    let moveTo = pos;
    let set = false;
    while (!set) {
      moveTo = (0, import_position.move)(moveTo, dir);
      const i = this.gameBoard[moveTo.y * WIDTH + moveTo.x];
      const movedToNum = i;
      if (!(0, import_position.isInside)(moveTo, WIDTH, HEIGHT) || movedToNum != 0 && movedToNum != movingNum || !!this.mergedPos.find((p) => p.x == moveTo.x && p.y == moveTo.y)) {
        const oppDir = (0, import_direction.oppositeDir)(dir);
        const moveBack = (0, import_position.move)(moveTo, oppDir);
        if (!(0, import_position.posEqual)(moveBack, pos)) {
          this.gameBoard[pos.y * WIDTH + pos.x] = 0;
          this.gameBoard[moveBack.y * WIDTH + moveBack.x] = movingNum;
          moved = true;
        }
        set = true;
      } else if (movedToNum == movingNum) {
        this.gameBoard[moveTo.y * WIDTH + moveTo.x] += 1;
        this.score += Math.floor(Math.pow(this.gameBoard[moveTo.y * WIDTH + moveTo.x], 2));
        this.gameBoard[pos.y * WIDTH + pos.x] = 0;
        moved = true;
        set = true;
        this.mergedNum = this.gameBoard[moveTo.y * WIDTH + moveTo.x];
        this.mergedPos = [...this.mergedPos, moveTo];
      }
    }
    return moved;
  }
  isBoardFull() {
    for (let y = 0; y < HEIGHT; y++)
      for (let x = 0; x < WIDTH; x++)
        if (this.gameBoard[y * WIDTH + x] === 0)
          return false;
    return true;
  }
  possibleMoves() {
    let numMoves = 0;
    for (let y = 0; y < HEIGHT; y++) {
      for (let x = 0; x < WIDTH; x++) {
        const pos = { x, y };
        const posNum = this.gameBoard[pos.y * WIDTH + pos.x];
        [import_direction.Direction.DOWN, import_direction.Direction.LEFT, import_direction.Direction.RIGHT, import_direction.Direction.UP].forEach((dir) => {
          const newPos = (0, import_position.move)(pos, dir);
          const numPos = this.gameBoard[newPos.y * WIDTH + newPos.x];
          if ((0, import_position.isInside)(newPos, WIDTH, HEIGHT) && (numPos === 0 || numPos === posNum))
            numMoves++;
        });
      }
    }
    return numMoves;
  }
  onInteraction(interaction) {
    if (!interaction.isButton())
      return;
    if (!interaction.customId.startsWith("2048"))
      return;
    let moved = false;
    this.mergedPos = [];
    switch (interaction.customId.split("2048")[1].toLowerCase()) {
      case "left":
        moved = this.moveLeft();
        break;
      case "up":
        moved = this.moveUp();
        break;
      case "right":
        moved = this.moveRight();
        break;
      case "down":
        moved = this.moveDown();
        break;
    }
    if (moved)
      this.placeNewRandTile();
    this.step(false);
    if (this.mergedNum >= 10)
      this.gameOver({ result: import_gameResult.ResultType.WINNER, name: this.gameStarter.id, score: `${this.score}` });
    else if (this.isBoardFull() && this.possibleMoves() <= 0)
      this.gameOver({ result: import_gameResult.ResultType.LOSER, name: this.gameStarter.id, score: `${this.score}` }, interaction);
    else
      interaction.update(this.getContent()).catch((e) => this.handleError(e, "update interaction"));
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {});
//# sourceMappingURL=2048.js.map
