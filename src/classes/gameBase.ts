import Discord, { DiscordAPIError, Interaction, Message, MessageActionRow, MessageButton, Snowflake, User } from 'discord.js';

import { GameContent } from "../interfaces/gameContent";
import GameResult, { ResultType } from "../interfaces/gameResult";

export default abstract class GameBase {
    protected gameId!: number;
    protected gameType: string;
    protected isMultiplayer: boolean;
    protected inGame = false;
    protected result: GameResult | undefined = undefined;
    protected gameMessage: Message | undefined = undefined;

    public gameStarter!: User;
    public player2: User | null = null;
    public player1Turn = true;

    protected onGameEnd: (result: GameResult) => void = () => { }
    protected gameTimeoutId: NodeJS.Timeout | undefined;

    protected abstract getContent(): GameContent;
    protected abstract getGameOverContent(result: GameResult): GameContent;
    public abstract onInteraction(interaction: Interaction): void;

    constructor(gameType: string, isMultiplayer: boolean) {
        this.gameType = gameType;
        this.isMultiplayer = isMultiplayer;
    }

    protected step(edit = false): void {
        if (edit)
            this.gameMessage?.edit(this.getContent());

        if (this.gameTimeoutId)
            clearTimeout(this.gameTimeoutId);
        this.gameTimeoutId = setTimeout(() => this.gameOver({ result: ResultType.TIMEOUT }), 60 * 1000);
    }
    public newGame(message: Message, player2: User | null, onGameEnd: (result: GameResult) => void): void {
        this.gameStarter = message.author;
        this.player2 = player2;
        this.onGameEnd = onGameEnd;
        this.inGame = true;

        const content = this.getContent();
        message.channel?.send({ embeds: content.embeds, components: content.components }).then(msg => {
            this.gameMessage = msg;
            this.gameTimeoutId = setTimeout(() => this.gameOver({ result: ResultType.TIMEOUT }), 60 * 1000)
        }).catch(e => this.handleError(e, 'send message/ embed'));
    }
    public handleError(e: unknown, perm: string): void {
        if (e instanceof DiscordAPIError) {
            const de = e as DiscordAPIError;
            switch (de.code) {
                case 10003:
                    this.gameOver({ result: ResultType.ERROR, error: 'Channel not found!' });
                    break;
                case 10008:
                    this.gameOver({ result: ResultType.DELETED, error: 'Message was deleted!' });
                    break;
                case 10062:
                    console.log('Unkown Interaction??');
                    break;
                case 50001:
                    if (this.gameMessage)
                        this.gameMessage.channel.send('The bot is missing access to preform some of it\'s actions!').catch(() => {
                            console.log('Error in the access error handler!');
                        });
                    else
                        console.log('Error in the access error handler!');

                    this.gameOver({ result: ResultType.ERROR, error: 'Missing access!' });
                    break;
                case 50013:
                    if (this.gameMessage)
                        this.gameMessage.channel.send(`The bot is missing the '${perm}' permissions it needs order to work!`).catch(() => {
                            console.log('Error in the permission error handler!');
                        });
                    else
                        console.log('Error in the permission error handler!');

                    this.gameOver({ result: ResultType.ERROR, error: 'Missing permissions!' });
                    break;
                default:
                    console.log('Encountered a Discord error not handled! ');
                    console.log(e);
                    break;
            }
        }
        else {
            this.gameOver({ result: ResultType.ERROR, error: 'Game embed missing!' });
        }
    }
    public gameOver(result: GameResult, interaction: Interaction | undefined = undefined): void {
        if (!this.inGame)
            return;
        this.result = result;
        this.inGame = false;

        const gameOverContent = this.getGameOverContent(result);

        this.onGameEnd(result);
        this.gameMessage?.edit(gameOverContent).catch(e => this.handleError(e, ''))
        if (this.gameTimeoutId) clearTimeout(this.gameTimeoutId);
    };
    protected getWinnerText(result: GameResult): string {
        if (result.result === ResultType.TIE)
            return 'Thats a tie';
        else if (result.result === ResultType.TIMEOUT)
            return 'They not respond quick :c';
        else if (result.result === ResultType.ERROR)
            return 'ERROR: ' + result.error;
        else if (result.result === ResultType.WINNER)
            return '<@' + result.name + '> has won GG :D';
        else if (result.result === ResultType.LOSER)
            return '<@' + result.name + '> has lost as they are out of moves';
        return '';
    }
    public setGameId(id: number): void {
        this.gameId = id;
    }

    public getGameId(): number {
        return this.gameId;
    }

    public getGameType(): string {
        return this.gameType;
    }

    public getMessageId(): Snowflake {
        return this.gameMessage?.id ?? '';
    }

    public isInGame(): boolean {
        return this.inGame;
    }

    public doesSupportMultiplayer(): boolean {
        return this.isMultiplayer;
    }

    public createMessageActionRowButton(buttonInfo: string[][]): MessageActionRow {
        return new MessageActionRow()
            .addComponents(
                ...buttonInfo.map(([id, emoji]) => new MessageButton()
                    .setCustomId(id)
                    .setEmoji(emoji)
                    .setStyle(Discord.Constants.MessageButtonStyles.SECONDARY ))
            );
    }
}