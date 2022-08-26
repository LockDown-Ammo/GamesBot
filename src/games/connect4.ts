import { GameContent } from "../interfaces/gameContent";
import GameResult, { ResultType } from "../interfaces/gameResult";
import GameBase from "../base/gameBase";
import Position, { up, down, left, right, isInside } from "../interfaces/position";
import Discord, { MessageActionRow, MessageButton, MessageEmbed, MessageReaction, User } from "discord.js";
import { MessageButtonStyles } from "discord.js/typings/enums";

const HEIGHT = 7
const WIDTH = 7

export default class Connect4Game extends GameBase {
    gameBoard: string[];
    player1Turn: boolean;
    constructor() {
        super('connect4', true)
        this.gameBoard = []
        for(let y = 0; y < HEIGHT; y++){
            for(let x = 0; x < WIDTH; x++){
                this.gameBoard[y * WIDTH + x] = '⚫'
            }
        }
        this.player1Turn = true;
    }
    private gameBoardToStr(): String {
        let str: string = '';
        for (let y = 0; y < HEIGHT; y++) {
            for (let x = 0; x < WIDTH; x++) {
                str += this.gameBoard[y * WIDTH + x]
            }
            str += `\n`
        }
        return str;
    }
    protected getContent(): GameContent {
        const row1 = new MessageActionRow().addComponents(
            {
                type: 'BUTTON',
                style: 'SECONDARY',
                customId: 'connect1',
                emoji: '1️⃣'
            },
            {
                type: 'BUTTON',
                style: 'SECONDARY',
                customId: 'connect2',
                emoji: '2️⃣'
            },
            {
                type: 'BUTTON',
                style: 'SECONDARY',
                customId: 'connect3',
                emoji: '3️⃣'
            },
            {
                type: 'BUTTON',
                style: 'SECONDARY',
                customId: 'connect4',
                emoji: '4️⃣'
            }
        )
        const row2 = new MessageActionRow().addComponents(
            {
                type: 'BUTTON',
                style: 'SECONDARY',
                customId: 'connect5',
                emoji: '5️⃣'
            },
            {
                type: 'BUTTON',
                style: 'SECONDARY',
                customId: 'connect6',
                emoji: '6️⃣'
            },
            {
                type: 'BUTTON',
                style: 'SECONDARY',
                customId: 'connect7',
                emoji: '7️⃣'
            }
        );
        const embed = new MessageEmbed()
            .setColor('#08b9bf')
            .setTitle('Connect 4')
            .setFooter({ text: `CurrentPlayer: ${this.getCurrentPlayer()?.username}` })
            .setDescription(`[Click here to learn how to play](https://gamesbot.lockdownammo7.repl.co/docs/#connect-4)
            \n${this.gameBoardToStr()}\n1️⃣2️⃣3️⃣4️⃣5️⃣6️⃣7️⃣`)
            .setTimestamp();

        return {
            embeds: [embed],
            components: [row1, row2]
        }

    }
    private getCurrentPlayer(): User | undefined {
        return this.player1Turn ? this.gameStarter : this.player2 ?? undefined
    }
    protected getGameOverContent(result: GameResult): GameContent {
        const embed = new Discord.MessageEmbed()
            .setColor('#08b9bf')
            .setTitle('Connect 4')
            .setFooter({ text: "Whoops something overflowed :D" })
            .setDescription(`GAME OVER\n${this.getWinnerText(result)}\n\n${this.gameBoardToStr()}\n1️⃣2️⃣3️⃣4️⃣5️⃣6️⃣7️⃣`)
            .setTimestamp()
        return {
            embeds: [embed],
            components: []
        }
    }
    public onInteraction(interaction: Discord.Interaction<Discord.CacheType>): void {
        if (!interaction.isButton()) return;
        if (!interaction.customId.startsWith('connect')) return;
      
        if (interaction.message.id != this.gameMessage?.id)
            return;
        if (interaction.user.id !== this.getCurrentPlayer()?.id) {
            interaction.reply({ ephemeral: true, content: `Not your turn :D` });
            return;
        }

        const selected = parseInt(interaction.customId.slice(7))
        if (!selected || selected < 1 || selected > WIDTH) return;
        const column = selected - 1

        if (this.gameBoard[column] !== '⚫') { interaction.reply({ ephemeral: true, content: 'The column you chose is already full' }); return; }
        let placedX = -1
        let placedY = -1
        for (let y = HEIGHT - 1; y >= 0; y--) {
            if (this.gameBoard[y * WIDTH + column] === '⚫') {
                this.gameBoard[y * WIDTH + column] = this.turnColor();
                placedX = column
                placedY = y
                break;
            }
        }

        if (this.hasWon(placedX, placedY)) {
            this.gameOver({ result: ResultType.WINNER, name: (this.player1Turn ? this.gameStarter.id : this.player2?.id) ?? 'ERR' }, interaction)
        }
        else if (this.isBoardFull()) {
            this.gameOver({ result: ResultType.TIE }, interaction);
        }
        else {
            this.step();
            interaction.update(this.getContent()).catch(e => super.handleError(e, 'update interaction'));
        }


    }
    public onReaction(reaction: MessageReaction): void { }

    protected step(edit?: boolean): void {
        this.player1Turn = this.player1Turn ? false : true;
        super.step(false)
    }
    private turnColor(): string {
        return this.player1Turn ? '🔴' : '🟡'
    }
    private hasWon(x: number, placedY: number): boolean {
        const color = this.turnColor()
        // Horizontal check
        const y = placedY * WIDTH;
        for (let i = Math.max(0, x - 3); i <= x; i++) {
            const adj = i + y
            if (this.gameBoard[adj] === color && this.gameBoard[adj + 1] === color && this.gameBoard[adj + 2] === color && this.gameBoard[adj + 3] === color)
                return true;
        }
        //Verticle Check
        for (let i = Math.max(0, placedY - 3); i <= placedY; i++) {
            const adj = x + (i * WIDTH);
            if (i + 3 < HEIGHT) {
                if (this.gameBoard[adj] === color && this.gameBoard[adj + WIDTH] === color && this.gameBoard[adj + (2 * WIDTH)] === color && this.gameBoard[adj + (3 * WIDTH)] === color)
                    return true;
            }
        }

        //Ascending Diag
        for (let i = -3; i <= 0; i++) {
            const adjX = x + i;
            const adjY = placedY + i;
            const adj = adjX + (adjY * WIDTH);
            if (adjX + 3 < WIDTH && adjY + 3 < HEIGHT) {
                if (this.gameBoard[adj] === color && this.gameBoard[adj + WIDTH + 1] === color && this.gameBoard[adj + (2 * WIDTH) + 2] === color && this.gameBoard[adj + (3 * WIDTH) + 3] === color)
                    return true;
            }
        }

        //Descending Diag
        for (let i = -3; i <= 0; i++) {
            const adjX = x + i;
            const adjY = placedY - i;
            const adj = adjX + (adjY * WIDTH);
            if (adjX + 3 < WIDTH && adjY - 3 >= 0) {
                if (this.gameBoard[adj] === color && this.gameBoard[adj - WIDTH + 1] === color && this.gameBoard[adj - (2 * WIDTH) + 2] === color && this.gameBoard[adj - (3 * WIDTH) + 3] === color)
                    return true;
            }
        }

        return false;
    }
    private isBoardFull(): boolean {
        for (let y = 0; y < HEIGHT; y++)
            for (let x = 0; x < WIDTH; x++)
                if (this.gameBoard[y * WIDTH + x] === '⚫')
                    return false;
        return true;
    }
}