import { CacheType, Interaction, MessageEmbed } from "discord.js";
import GameBase from "../base/gameBase";
import { Direction, oppositeDir } from "../interfaces/direction";
import { GameContent } from "../interfaces/gameContent";
import GameResult, { ResultType } from "../interfaces/gameResult";
import Position, { isInside, move, posEqual } from "../interfaces/position";

const HEIGHT = 4;
const WIDTH = 4;

export default class TwentFortyEight extends GameBase {
    gameBoard: number[];
    mergedPos: Position[];
    mergedNum: number;
    score: number;

    constructor() {
        super('2048', false);
        this.gameBoard = [];
        this.mergedPos = [];
        this.score = 0;
        this.mergedNum = 1;
        for (let y = 0; y < HEIGHT; y++)
            for (let x = 0; x < WIDTH; x++)
                this.gameBoard[y * WIDTH + x] = 0;
        this.placeNewRandTile();
    }

    protected getContent(): GameContent {
        const row = this.createMessageActionRowButton([['2048left', '⬅️'], ['2048up', '⬆️'], ['2048right', '➡️'], ['2048down', '⬇️']])
        const embed = new MessageEmbed()
            .setColor('#08b9bf')
            .setFooter({ text: `Current player: ${this.gameStarter.username}` })
            .setTitle('2048 or TwentyFortyEight')
            .setDescription(`[Click here to learn how to play](https://gameboardswebsite.lockdownammo7.repl.co/docs/#2048)`)
            .setImage(`https://gameboardswebsite.lockdownammo7.repl.co/gameBot/2048?gb=${this.gameBoardToString()}`)
            .addField('Score:', this.score.toString())
            .setTimestamp()
        return {
            embeds: [embed],
            components: [row]
        }
    }

    protected getGameOverContent(result: GameResult): GameContent {
        const embed = new MessageEmbed()
            .setColor('#f2e641')
            .setTitle('2048 or TwentyFortyEight')
            .setFooter({ text: "Whoops something overflowed :D"})
            .setDescription(`GAME OVER!\n${this.getWinnerText(result)}\n\nScore: ${this.score}`)
            .setImage(`https://gameboardswebsite.lockdownammo7.repl.co/gameBot/2048?gb=${this.gameBoardToString()}`)
            .setTimestamp()
        return {
            embeds: [embed],
            components: []
        }
    }

    private placeNewRandTile(): void {
        let newPos = { x: 0, y: 0 };
        do {
            newPos = { x: Math.floor(Math.random() * WIDTH), y: Math.floor(Math.random() * HEIGHT) };
        } while (this.gameBoard[newPos.y * HEIGHT + newPos.x] != 0);

        
        this.gameBoard[newPos.y * HEIGHT + newPos.x] = (Math.random() * 100) < 25 ? 2 : 1;
    }
    private gameBoardToString(): String {
        return this.gameBoard.join(',');
    }

    private moveLeft(): boolean {
        let moved = false;
        for (let y = 0; y < HEIGHT; y++)
            for (let x = 1; x < WIDTH; x++)
                moved = this.move({ x, y }, Direction.LEFT) || moved;
        return moved;
    }
    private moveUp(): boolean {
        let moved = false;
        for (let y = 1; y < HEIGHT; y++)
            for (let x = 0; x < WIDTH; x++)
                moved = this.move({ x, y }, Direction.UP) || moved;
        return moved;
    }
    private moveRight(): boolean {
        let moved = false;
        for (let y = 0; y < HEIGHT; y++)
            for (let x = WIDTH - 2; x >= 0; x--)
                moved = this.move({ x, y }, Direction.RIGHT) || moved;
        return moved;
    }
    private moveDown(): boolean {
        let moved = false;
        for (let y = HEIGHT - 2; y >= 0; y--)
            for (let x = 1; x < WIDTH; x++)
                moved = this.move({ x, y }, Direction.DOWN) || moved;
        return moved;
    }

    private move(pos: Position, dir: Direction): boolean {
        let moved = false;
        const movingNum = this.gameBoard[pos.y * WIDTH + pos.x];
        if (movingNum == 0)
            return false;
        let moveTo = pos;
        let set = false;
        while (!set) {
            moveTo = move(moveTo, dir);
            const i = this.gameBoard[moveTo.y * WIDTH + moveTo.x];
            const movedToNum = i;
            if (!isInside(moveTo, WIDTH, HEIGHT) || (movedToNum != 0 && movedToNum != movingNum) || !!this.mergedPos.find(p => p.x == moveTo.x && p.y == moveTo.y)) {
                const oppDir = oppositeDir(dir);
                const moveBack = move(moveTo, oppDir);

                if (!posEqual(moveBack, pos)) {
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
                this.mergedNum = this.gameBoard[moveTo.y * WIDTH + moveTo.x]
                this.mergedPos = [...this.mergedPos, moveTo]
            }
        }
        return moved;
    }

    private isBoardFull(): boolean {
        for (let y = 0; y < HEIGHT; y++)
            for (let x = 0; x < WIDTH; x++)
                if (this.gameBoard[y * WIDTH + x] === 0)
                    return false;
        return true;
    }

    private possibleMoves(): number {
        let numMoves = 0;
        for (let y = 0; y < HEIGHT; y++) {
            for (let x = 0; x < WIDTH; x++) {
                const pos = { x, y };
                const posNum = this.gameBoard[pos.y * WIDTH + pos.x];
                [Direction.DOWN, Direction.LEFT, Direction.RIGHT, Direction.UP].forEach(dir => {
                    const newPos = move(pos, dir);
                    const numPos = this.gameBoard[newPos.y * WIDTH + newPos.x]
                    if (isInside(newPos, WIDTH, HEIGHT) && (numPos === 0 || numPos === posNum))
                        numMoves++;
                });
            }
        }
        return numMoves;
    }

    public onInteraction(interaction: Interaction<CacheType>): void {
        if (!interaction.isButton())
            return;
        if (!interaction.customId.startsWith('2048'))
            return;
        if (interaction.message.id != this.gameMessage?.id)
            return;
        let moved = false;
        this.mergedPos = [];

        switch (interaction.customId.split('2048')[1].toLowerCase()) {
            case 'left':
                moved = this.moveLeft();
                break;
            case 'up':
                moved = this.moveUp();
                break;
            case 'right':
                moved = this.moveRight();
                break;
            case 'down':
                moved = this.moveDown();
                break;
        }
      
        if (moved)
            this.placeNewRandTile();
        this.step(false);
        if(this.mergedNum >= 10)
            this.gameOver({ result: ResultType.WINNER, name: this.gameStarter.id, score: `${this.score}` })
        else if (this.isBoardFull() && this.possibleMoves() <= 0)
            this.gameOver({ result: ResultType.LOSER, name: this.gameStarter.id, score: `${this.score}` }, interaction);
        else
            interaction.update(this.getContent()).catch(e => this.handleError(e, 'update interaction'));
    }
}