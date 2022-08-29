import { GameContent } from "../interfaces/gameContent";
import GameResult, { ResultType } from "../interfaces/gameResult";
import GameBase from "../base/gameBase";
import Position, { up, down, left, right, isInside, move } from "../interfaces/position";
import Discord, { MessageActionRow, MessageButton, MessageEmbed, MessageReaction, MessageSelectMenu, Modal, User } from "discord.js";
import DJSBuilder, { ButtonBuilder, EmbedBuilder, SelectMenuBuilder, SelectMenuOptionBuilder } from "@discordjs/builders";
import { Direction } from "../interfaces/direction";

const HEIGHT = 8
const WIDTH = 8

export default class Othello extends GameBase {
  private gameBoard: number[];
  private selectedMove: Position = { x: -1, y: -1 };

  constructor() {
    super('othello', true)
    this.gameBoard = [
      0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 2, 1, 0, 0, 0,
      0, 0, 0, 1, 2, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0
    ];
  }

  private currentPlayer(): User | null {
    return this.player1Turn ? this.gameStarter : this.player2;
  }
  private currentPlayerState(): number {
    return this.player1Turn ? 1 : 2;
  }

  protected getContent(): GameContent {
    const embed = new MessageEmbed()
      .setFooter({ text: `Current Player: ${this.currentPlayer()?.id}`, iconURL: this.currentPlayer()?.displayAvatarURL({ dynamic: false }) })
      .setTitle("Othello / Reversi Game")
      .setDescription('Use the drop down menu to choose the location where you want to place.\n\n[Click here to learn how to play the game](https://www.worldothello.org/about/about-othello/othello-rules/official-rules/english) or https://www.worldothello.org/about/about-othello/othello-rules/official-rules/english')
      .setImage(this.constructUrl())
      .setColor('#50915b')
      .setTimestamp()
    return {
      embeds: [embed],
      components: this.componentGenerator()
    }
  }
  protected getGameOverContent(result: GameResult): GameContent {
    const embed = new MessageEmbed()
      .setFooter({ text: `Whoops something overflowed :D` })
      .setTitle("Othello / Reversi Game")
      .setDescription(`GAME OVER\n\n${this.getWinnerText(result)}`)
      .setImage(this.constructUrl())
      .setColor('#50915b')
      .setTimestamp()
    return {
      embeds: [embed],
      components: []
    }
  }
  public onInteraction(interaction: Discord.Interaction<Discord.CacheType>): void {
    if (!interaction.isButton() && !interaction.isSelectMenu()) return;
    if (interaction.message.id != this.gameMessage?.id) return;
    if (!interaction.customId.startsWith('othello')) return;
    if (this.currentPlayer()?.id !== interaction.user?.id) return;

    const interactionId = interaction.customId.split(' ')[1]
    const interactionVal = interaction.isSelectMenu() ? interaction.values[0] : ''
    let confirmed = false;

    switch (interactionId) {
      case 'y':
        this.selectedMove.y = parseInt(interactionVal);
        interaction.deferUpdate();
        break;

      case 'x':
        this.selectedMove.x = parseInt(interactionVal);
        interaction.deferUpdate();
        break;

      case 'confirm':
        confirmed = true;
        break;

      default:
        break;
    }
    if (!confirmed) return;
    if (this.gameBoard[this.selectedMove.y * WIDTH + this.selectedMove.x] !== 0) {
      interaction.reply({
        embeds: [
          new MessageEmbed()
            .setDescription('This is an invalid move. The space is already occupied.\n Dont know how to play? [Click here](https://www.worldothello.org/about/about-othello/othello-rules/official-rules/english) or https://www.worldothello.org/about/about-othello/othello-rules/official-rules/english')
            .setColor('#ff5b45')
        ],
        ephemeral: true
      })
      return;
    };
    const flankArray: Position[] = this.checkOutFlank(this.selectedMove);
    if (flankArray.length <= 0) {
      interaction.reply({
        embeds: [
          new MessageEmbed()
            .setDescription('This is an invalid move. Your move should be able to turn atleast 1 tile.\n Dont know how to play? [Click Here](https://www.worldothello.org/about/about-othello/othello-rules/official-rules/english) or https://www.worldothello.org/about/about-othello/othello-rules/official-rules/english')
            .setColor('#ff5b45')
        ],
        ephemeral: true
      })
      return;
    }
    this.gameBoard[this.selectedMove.y * WIDTH + this.selectedMove.x] = this.currentPlayerState();
    this.flipOutFlanked(this.selectedMove, this.checkOutFlank(this.selectedMove));
    if (this.isBoardFull()) {
      this.declareWinner(interaction);
      return;
    }
    this.player1Turn = !this.player1Turn;
    if (!this.isMovePossible()) {
      interaction.message.channel?.send(`<@${this.currentPlayer()?.id}> Your turn is skipped as you had no possible moves`)
      this.player1Turn = !this.player1Turn
    };
    if (!this.isMovePossible()) {
      this.declareWinner(interaction);
      return;
    }
    this.step(false);
    interaction.update(this.getContent()).catch(e => super.handleError(e, 'update interaction'));
    return;
  }

  private constructUrl(): string {
    return `https://gameboardswebsite.lockdownammo7.repl.co/gameBot/othello?gb=${this.gameBoard.join(',')}`
  }
  private checkOutFlank(pos: Position): Position[] {
    let posArray: Position[] = [];
    const checkUp = this.check(pos, Direction.UP);
    const checkDown = this.check(pos, Direction.DOWN);
    const checkLeft = this.check(pos, Direction.LEFT);
    const checkRight = this.check(pos, Direction.RIGHT);
    const checkUpLeft = this.checkDiagonal(pos, 'UPLEFT');
    const checkUpRight = this.checkDiagonal(pos, 'UPRIGHT');
    const checkDownLeft = this.checkDiagonal(pos, 'DOWNLEFT');
    const checkDownRight = this.checkDiagonal(pos, 'DOWNRIGHT');

    if (checkUp) posArray.push(checkUp);
    if (checkDown) posArray.push(checkDown);
    if (checkLeft) posArray.push(checkLeft);
    if (checkRight) posArray.push(checkRight);
    if (checkUpLeft) posArray.push(checkUpLeft);
    if (checkUpRight) posArray.push(checkUpRight);
    if (checkDownLeft) posArray.push(checkDownLeft);
    if (checkDownRight) posArray.push(checkDownRight);

    return posArray;
  }
  private flipOutFlanked(pos: Position, flankArray: Position[]): void {
    flankArray.forEach(flankPos => {
      const limitVal = (pos.x == flankPos.x) ? Math.abs((pos.y - flankPos.y)) : Math.abs((pos.x - flankPos.x))
      for (let i = 0; i < limitVal; i++) {
        const y = pos.y + (((pos.y == flankPos.y) ? 0 : (pos.y > flankPos.y ? -1 : 1)) * i);
        const x = pos.x + (((pos.x == flankPos.x) ? 0 : (pos.x > flankPos.x ? -1 : 1)) * i);
        this.gameBoard[y * WIDTH + x] = this.currentPlayerState();
      }
    })
    return;
  }
  private check(pos: Position, dir: Direction): Position | undefined {
    let i = 0;
    let newPos = pos;
    while (isInside(move(newPos, dir), WIDTH, HEIGHT)) {
      newPos = move(newPos, dir)
      const y = newPos.y
      const x = newPos.x
      if (this.gameBoard[y * WIDTH + x] == 0) return;
      if (this.gameBoard[y * WIDTH + x] == this.currentPlayerState() && i <= 0) return;
      if (this.gameBoard[y * WIDTH + x] == this.currentPlayerState() && i > 0) return newPos;
      i++;
    }
    return;
  }
  private checkDiagonal(pos: Position, dir: 'UPLEFT' | 'UPRIGHT' | 'DOWNLEFT' | 'DOWNRIGHT'): Position | undefined {
    let i = 0;
    let newPos = pos;
    switch (dir) {
      case 'UPLEFT':
        while (isInside(move(move(newPos, Direction.UP), Direction.LEFT), WIDTH, HEIGHT)) {
          newPos = move(move(newPos, Direction.UP), Direction.LEFT)
          const y = newPos.y
          const x = newPos.x
          if (this.gameBoard[y * WIDTH + x] == 0) return;
          if (this.gameBoard[y * WIDTH + x] == this.currentPlayerState() && i <= 0) return;
          if (this.gameBoard[y * WIDTH + x] == this.currentPlayerState() && i > 0) return newPos;
          i++;
        }
        return;

      case 'UPRIGHT':
        while (isInside(move(move(newPos, Direction.UP), Direction.RIGHT), WIDTH, HEIGHT)) {
          newPos = move(move(newPos, Direction.UP), Direction.RIGHT)
          const y = newPos.y
          const x = newPos.x
          if (this.gameBoard[y * WIDTH + x] == 0) return;
          if (this.gameBoard[y * WIDTH + x] == this.currentPlayerState() && i <= 0) return;
          if (this.gameBoard[y * WIDTH + x] == this.currentPlayerState() && i > 0) return newPos;
          i++;
        }
        return;

      case 'DOWNLEFT':
        while (isInside(move(move(newPos, Direction.DOWN), Direction.LEFT), WIDTH, HEIGHT)) {
          newPos = move(move(newPos, Direction.DOWN), Direction.LEFT)
          const y = newPos.y
          const x = newPos.x
          if (this.gameBoard[y * WIDTH + x] == 0) return;
          if (this.gameBoard[y * WIDTH + x] == this.currentPlayerState() && i <= 0) return;
          if (this.gameBoard[y * WIDTH + x] == this.currentPlayerState() && i > 0) return newPos;
          i++;
        }
        return;

      case 'DOWNRIGHT':
        while (isInside(move(move(newPos, Direction.DOWN), Direction.RIGHT), WIDTH, HEIGHT)) {
          newPos = move(move(newPos, Direction.DOWN), Direction.RIGHT)
          const y = newPos.y
          const x = newPos.x
          if (this.gameBoard[y * WIDTH + x] == 0) return;
          if (this.gameBoard[y * WIDTH + x] == this.currentPlayerState() && i <= 0) return;
          if (this.gameBoard[y * WIDTH + x] == this.currentPlayerState() && i > 0) return newPos;
          i++;
        }
        return;

      default:
        break;
    }
    return;
  }
  private isMovePossible(): boolean {
    for (let y = 0; y < HEIGHT; y++) {
      for (let x = 0; x < WIDTH; x++) {
        if (this.checkOutFlank({ x: x, y: y }).length > 0 && this.gameBoard[y * WIDTH + x] == 0) return true;
      }
    }
    return false;
  }
  private isBoardFull(): boolean {
    for (let y = 0; y < HEIGHT; y++) {
      for (let x = 0; x < WIDTH; x++) {
        if (this.gameBoard[y * WIDTH + x] == 0) return false;
      }
    }
    return true;
  }
  private currentWinnerState(): User | null {
    const player1Count = this.gameBoard.filter(g => g === 1).length;
    const player2Count = this.gameBoard.filter(g => g === 2).length;

    return (player1Count === player2Count) ? null : ((player1Count > player2Count) ? this.gameStarter : this.player2)
  }
  private declareWinner(interaction: Discord.Interaction<Discord.CacheType>): void {
    if (this.currentWinnerState() == null) {
      this.gameOver({ result: ResultType.TIE }, interaction);
      return;
    }
    this.gameOver({ result: ResultType.WINNER, name: this.currentWinnerState()?.id }, interaction);
    return;
  }
  private componentGenerator(): MessageActionRow[] {
    const columnSelector = new MessageActionRow().setComponents(
      [
        new SelectMenuBuilder()
          .setCustomId('othello x')
          .setPlaceholder("Select column name")
          .setMaxValues(1)
          .setMinValues(1)
          .setOptions([
            {
              label: 'A',
              value: '0'
            },
            {
              label: 'B',
              value: '1'
            },
            {
              label: 'C',
              value: '2'
            },
            {
              label: 'D',
              value: '3'
            },
            {
              label: 'E',
              value: '4'
            },
            {
              label: 'F',
              value: '5'
            },
            {
              label: 'G',
              value: '6'
            },
            {
              label: 'H',
              value: '7'
            }
          ])
          .toJSON()
      ]
    )
    const rowSelector = new MessageActionRow().setComponents([

      new SelectMenuBuilder()
        .setCustomId('othello y')
        .setPlaceholder("Select row number")
        .setMaxValues(1)
        .setMinValues(1)
        .setOptions([
          {
            label: '1',
            value: '0'
          },
          {
            label: '2',
            value: '1'
          },
          {
            label: '3',
            value: '2'
          },
          {
            label: '4',
            value: '3'
          },
          {
            label: '5',
            value: '4'
          },
          {
            label: '6',
            value: '5'
          },
          {
            label: '7',
            value: '6'
          },
          {
            label: '8',
            value: '7'
          }
        ])
        .toJSON()
    ])
    const confirmButton = new MessageActionRow().setComponents([
      new ButtonBuilder()
        .setStyle(4) //Style Danger (RED)
        .setLabel("Confirm placement")
        .setCustomId('othello confirm')
        .toJSON()
    ])
    return [columnSelector, rowSelector, confirmButton]
  }

  public onReaction(reaction: MessageReaction): void { }
}