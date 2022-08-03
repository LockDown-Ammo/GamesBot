import { GameContent } from "../interfaces/gameContent";
import GameResult, { ResultType } from "../interfaces/gameResult";
import GameBase from "../base/gameBase";
import Position, { up, down, left, right, isInside } from "../interfaces/position";
import Discord, { MessageActionRow, MessageButton, MessageEmbed } from "discord.js";

const HEIGHT = 13
const WIDTH = 13

const SQUARES = {
    'red_square': '🟥',
    'blue_square': '🟦',
    'orange_square': '🟧',
    'purple_square': '🟪',
    'green_square': '🟩'
}

export default class FloodGame extends GameBase {
    gameBoard: string[];
    turn: number;

    constructor() {
        super('flood', false)
        this.gameBoard = []
        for (let y = 0; y < HEIGHT; y++) {
            for (let x = 0; x < WIDTH; x++) {
                this.gameBoard[y * WIDTH + x] = Object.values(SQUARES)[Math.floor(Math.random() * Object.keys(SQUARES).length)];
            };
        };
        this.turn = 1;
    }

    private gameBoardToString(): string {
        let str: string = '';
        for (let y = 0; y < HEIGHT; y++) {
            for (let x = 0; x < WIDTH; x++) {
                str += this.gameBoard[y * WIDTH + x]
            }
            str += `\n`;
        }
        return str;
    }
    protected getContent(): GameContent {
        const row = new MessageActionRow()
            .addComponents(
                ...Object.entries(SQUARES).map(([k, v]) => new MessageButton()
                    .setCustomId(k)
                    .setEmoji(v)
                    .setStyle(Discord.Constants.MessageButtonStyles.SECONDARY)
                )
            )
        const embed = new MessageEmbed()
            .setColor('#08b9bf')
            .setTitle('Flood Game')
            .setFooter({ text: `Current player: ${this.gameStarter.username}`, iconURL: this.gameStarter.displayAvatarURL({ dynamic: false }) })
            .setDescription(`[Click here to learn how to play](https://gamesbot.lockdownammo7.repl.co/docs/#flood-game)
            \n` +this.gameBoardToString())
            .addField('Turn:', this.turn.toString())
            .setTimestamp();
        return {
            embeds: [embed],
            components: [row]
        }
    }
    protected getGameOverContent(result: GameResult): GameContent {
        const turnResp = result.result == ResultType.WINNER ? `Game beat in ${this.turn - 1} turns :D` : ''
        const embed = new Discord.MessageEmbed()
            .setColor('#08b9bf')
            .setTitle('Flod Game')
            .setFooter({ text: "Whoops something overflowed :D" })
            .setDescription(`GAME OVER\n${turnResp}\n${this.getWinnerText(result)}`)
            .setTimestamp()
        return {
            embeds: [embed],
            components: []
        }
    }
    public onInteraction(interaction: Discord.Interaction<Discord.CacheType>): void {
        if (!interaction.isButton()) return;
        if (interaction.message.id != this.gameMessage?.id) return;
        if(interaction.user.id !== this.gameStarter.id) return;

        const selected = Object.entries(SQUARES).find(([k, v]) => k === interaction.customId);
        const current = this.gameBoard[0]

        if (selected && selected[1] !== current) {
            this.turn += 1;
            let queue: Position[] = [{ x: 0, y: 0 }]
            let visited: Position[] = []

            while (queue.length > 0) {
                const pos: Position | undefined = queue.shift();
                if (!pos || visited.some(p => p.x === pos.x && p.y === pos.y)) continue;

                visited.push(pos)
                if (this.gameBoard[pos.y * WIDTH + pos.x] === current) {
                    this.gameBoard[pos.y * WIDTH + pos.x] = selected[1];

                    [up(pos), down(pos), left(pos), right(pos)].forEach(checkPos => {
                        if (!visited.some(p => p.x === checkPos.x && p.y === checkPos.y) && isInside(checkPos, WIDTH, HEIGHT))
                            queue.push(checkPos);
                    })
                }
            }

            let gameOver = true;
            for(let y = 0; y < HEIGHT; y++){
                for(let x = 0; x < WIDTH; x++){
                    if(this.gameBoard[y * WIDTH + x] !== selected[1])
                        gameOver = false;
                }
            }
            if (gameOver)
                this.gameOver({ result: ResultType.WINNER, score: (this.turn - 1).toString(), name: this.gameStarter.id }, interaction);
            else
                super.step(false);
        }
        if(this.isInGame())
            interaction.update(this.getContent()).catch(e => super.handleError(e, 'update interaction'));
        else if(!this.result)
            this.gameOver({ result: ResultType.ERROR }, interaction);
    }
}