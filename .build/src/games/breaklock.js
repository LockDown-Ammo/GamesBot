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
  default: () => BreakLockGame
});
var import_gameResult = __toModule(require("../interfaces/gameResult"));
var import_gameBase = __toModule(require("../classes/gameBase"));
var import_discord = __toModule(require("discord.js"));
const HEIGHT = 3;
const WIDTH = 3;
class BreakLockGame extends import_gameBase.default {
  constructor() {
    super("breaklock", false);
    this.turnLimit = 20;
    this.currentGameBoard = [];
    for (let y = 0; y < HEIGHT; y++) {
      for (let x = 0; x < WIDTH; x++) {
        this.currentGameBoard[y * WIDTH + x] = {
          type: import_discord.default.Constants.MessageComponentTypes.BUTTON,
          style: import_discord.default.Constants.MessageButtonStyles.SECONDARY,
          customId: `breaklock${y * WIDTH + x + 1}`,
          label: "-",
          disabled: false
        };
      }
    }
    this.turn = 0;
    this.selectedTurn = 0;
    this.currentPattern = [];
    this.pattern = this.patternGenerate();
    this.history = [];
  }
  getContent() {
    const embed = new import_discord.MessageEmbed().setColor("#08b9bf").setFooter({ text: `Playing with: ${this.gameStarter.username}` }).setTitle("Break Lock").setDescription(`[Click here to learn how to play](https://gameboardswebsite.lockdownammo7.repl.co/docs/#break-lock)
            
Turn: ${this.turn}
Previous attempts: `).setImage(`https://gameboardswebsite.lockdownammo7.repl.co/gameBot/breakLock/${this.history.length > 0 ? this.history.join("-") : ""}`).setTimestamp();
    return {
      embeds: [embed],
      components: this.componentGenerator()
    };
  }
  getGameOverContent(result) {
    const embed = new import_discord.default.MessageEmbed().setColor("#08b9bf").setTitle("Break Lock").setFooter({ text: "Whoops something overflowed :D" }).setDescription(`GAME OVER
 ${this.getWinnerText(result)}`).setImage(`https://gameboardswebsite.lockdownammo7.repl.co/gameBot/breakLock/${this.history.length > 0 ? this.history.join("-") : ""}`).setTimestamp();
    return {
      embeds: [embed],
      components: []
    };
  }
  onInteraction(interaction) {
    if (!interaction.isButton())
      return;
    if (!interaction.customId.startsWith("breaklock"))
      return;
    if (interaction.user.id !== this.gameStarter.id)
      return;
    if (interaction.customId === "breaklockCancelCurrentSelection") {
      this.newCurrentGameBoard();
      interaction.update(this.getContent()).catch((e) => super.handleError(e, "update interaction"));
      this.selectedTurn = 0;
      this.step(false);
    } else {
      let selectId = parseInt(interaction.customId.slice("breaklock".length)) ?? void 0;
      if (!selectId)
        return;
      this.currentPattern.push(selectId);
      if (this.selectedTurn >= 3) {
        if (this.currentPattern.join(",") == this.pattern.join(",")) {
          this.history = [...this.history, this.historyStringConstructor()];
          this.selectedTurn = 0;
          this.newCurrentGameBoard();
          this.gameOver({ result: import_gameResult.ResultType.WINNER, name: this.gameStarter.id }, interaction);
        } else if (this.turn + 1 >= this.turnLimit) {
          this.history = [...this.history, this.historyStringConstructor()];
          this.gameOver({ result: import_gameResult.ResultType.LOSER, name: this.gameStarter.id }, interaction);
        } else {
          this.history = [...this.history, this.historyStringConstructor()];
          this.currentPattern = [];
          this.selectedTurn = 0;
          this.newCurrentGameBoard();
          interaction.update(this.getContent()).catch((e) => super.handleError(e, "update interaction"));
          this.turn++;
          this.step(false);
        }
      } else {
        this.currentGameBoard[selectId - 1].disabled = true;
        this.currentGameBoard[selectId - 1].label = `${this.selectedTurn + 1}`;
        this.selectedTurn += 1;
        interaction.update(this.getContent()).catch((e) => super.handleError(e, "update interaction"));
        this.step(false);
      }
    }
  }
  componentGenerator() {
    let components = [];
    for (let y = 0; y < HEIGHT; y++) {
      let row = new import_discord.MessageActionRow();
      for (let x = 0; x < WIDTH; x++) {
        const c = this.currentGameBoard[y * WIDTH + x];
        row.addComponents({
          type: c.type,
          customId: c.customId,
          style: c.style,
          label: c.label,
          disabled: c.disabled
        });
      }
      components.push(row);
    }
    components.push(new import_discord.MessageActionRow().addComponents({
      type: "BUTTON",
      customId: "breaklockCancelCurrentSelection",
      style: "DANGER",
      label: "Cancel Current Selection",
      disabled: false
    }));
    return components;
  }
  newCurrentGameBoard() {
    for (let y = 0; y < HEIGHT; y++) {
      for (let x = 0; x < WIDTH; x++) {
        this.currentGameBoard[y * WIDTH + x] = {
          type: import_discord.default.Constants.MessageComponentTypes.BUTTON,
          style: import_discord.default.Constants.MessageButtonStyles.SECONDARY,
          customId: `breaklock${y * WIDTH + x + 1}`,
          label: "-",
          disabled: false
        };
      }
    }
    this.currentPattern = [];
    this.selectedTurn = 0;
    return;
  }
  patternGenerate() {
    let ptr = [];
    let chosen = [];
    for (let i = 0; i < 4; i++) {
      let randInt = Math.floor(Math.random() * WIDTH * HEIGHT + 1);
      if (chosen.includes(randInt))
        i -= 1;
      else
        chosen.push(randInt);
    }
    console.log(`Pattern for current game: ${chosen}`);
    return chosen;
  }
  historyStringConstructor() {
    return `${this.currentPatternGrid()}${this.currentPatternHints()}`;
  }
  currentPatternGrid() {
    let str = "";
    for (let y = 0; y < HEIGHT; y++) {
      for (let x = 0; x < WIDTH; x++) {
        let c = y * WIDTH + x + 1;
        str += this.currentPattern.includes(c) ? `${this.currentPattern.indexOf(c) + 1}` : "0";
      }
    }
    return str;
  }
  currentPatternHints() {
    let co = 0;
    let c = 0;
    let ic = 0;
    for (const s of this.pattern) {
      if (this.currentPattern.includes(s)) {
        if (this.currentPattern.indexOf(s) === this.pattern.indexOf(s))
          c++;
        else
          co++;
      }
    }
    ic = 4 - (c + co);
    return `${c}${co}${ic}`;
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {});
//# sourceMappingURL=breaklock.js.map
