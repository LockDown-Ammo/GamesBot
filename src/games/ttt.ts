import Discord,{ CacheType, Interaction, MessageActionRow, MessageEmbed, User } from "discord.js";
import GameBase from "../classes/gameBase";
import { GameContent } from "../interfaces/gameContent";
import GameResult, { ResultType } from "../interfaces/gameResult";


const { MessageButtonStyles, MessageComponentTypes } = Discord.Constants
const NO_MOVE = 0;
const PLAYER_1 = 1;
const PLAYER_2 = 2;

export default class TicTacToe extends GameBase {
    private gameBoard: number[][] = [[0, 0, 0], [0, 0, 0], [0, 0, 0]]
    private won: boolean = false;
    constructor() {
        super('tictactoe', true);
    }

    protected getContent(): GameContent {
        const embed = new MessageEmbed()
            .setColor('#08b9bf')
            .setFooter({ text: `Current player: ${this.currentPlayer()?.username}` })
            .setTitle('TicTacToe')
            .setDescription(`[Click here to learn how to play](https://gameboardswebsite.lockdownammo7.repl.co/docs/#ttt)`)
            .setTimestamp()

        return {
            embeds: [embed],
            components: this.generateComponents()
        }
    }

    protected getGameOverContent(result: GameResult): GameContent {

        const embed = new MessageEmbed()
            .setColor('#08b9bf')
            .setFooter({ text: `Whoops something overflowed :D` })
            .setTitle('TicTacToe')
            .setDescription(`GAME OVER \n ${this.getWinnerText(result)}`)
            .setTimestamp()

        return {
            embeds: [embed],
            components: this.generateComponents()
        }
    }

    public onInteraction(interaction: Interaction<CacheType>): void {
        if (!interaction.isButton())
            return;
        if (!interaction.customId.startsWith('ttt'))
            return;
        if (interaction.message.id != this.gameMessage?.id)
            return;
        if (interaction.user.id != this.currentPlayer()?.id)
            return;

        const id = parseInt(interaction.customId.split('ttt')[1])
        const y = Math.floor((id - 1) / 3);
        const x = id - (y * 3) - 1;
        this.gameBoard[y][x] = this.currentPlayerState();

        if (this.hasWon(this.currentPlayerState())) {
            this.gameOver({ result: ResultType.WINNER, name: this.currentPlayer()?.id });
            return;
        }
        if (this.isBoardFull()) {
            this.gameOver({ result: ResultType.TIE });
            return;
        }
        this.step(false);
        this.player1Turn = !this.player1Turn
        interaction.update(this.getContent()).catch(e => this.handleError(e, 'update interaction'));
    }

    private currentPlayer(): User | null {
        return this.player1Turn ? this.gameStarter : this.player2;
    }

    private currentPlayerState(): number {
        return this.player1Turn ? 1 : 2;
    }

    private currentPlayerStateSymbol(n: number): string {
        return n == 0 ? 'ㅤ' : (n == 1 ? 'X' : 'O');
    }

    private currentPlayerStateStyle(n: number): import("discord.js/typings/enums").MessageButtonStyles {
        return n == 0 ? MessageButtonStyles.SECONDARY : (n == 1 ? MessageButtonStyles.DANGER : MessageButtonStyles.SUCCESS);
    }

    private currentPlayerStateDisabled(n: number): boolean {
        return this.won ? true : (n == 0 ? false : true);
    }

    private hasWon(player: number): boolean {
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

    private isBoardFull(): boolean {
        for (let y = 0; y < 3; y++)
            for (let x = 0; x < 3; x++)
                if (this.gameBoard[y][x] == 0)
                    return false;
        return true;

    }

    private generateComponents(): MessageActionRow[] {
        let rows: MessageActionRow[] = [];
        for (let y = 0; y < 3; y++) {
            const row = new MessageActionRow();
            for (let x = 0; x < 3; x++) {
                row.addComponents(
                    {
                        type: MessageComponentTypes.BUTTON,
                        customId: `ttt${y * 3 + x + 1}`,
                        label: this.currentPlayerStateSymbol(this.gameBoard[y][x]),
                        style: this.currentPlayerStateStyle(this.gameBoard[y][x]),
                        disabled: this.currentPlayerStateDisabled(this.gameBoard[y][x])
                    }
                )
            }
            rows = [...rows, row]
        }
        return [...rows];
    }
}