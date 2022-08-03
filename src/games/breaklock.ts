import { GameContent } from "../interfaces/gameContent";
import GameResult, { ResultType } from "../interfaces/gameResult";
import GameBase from "../base/gameBase";
import Position, { up, down, left, right, isInside } from "../interfaces/position";
import Discord, { MessageActionRow, MessageActionRowComponentResolvable, MessageButton, MessageComponent, MessageEmbed, User } from "discord.js";

const HEIGHT = 3
const WIDTH = 3
export default class BreakLockGame extends GameBase {

    currentGameBoard;
    turn: number;
    selectedTurn: number;
    pattern: number[];
    currentPattern: number[];
    turnLimit: number = 20;
    history: string[];

    constructor() {
        super('breaklock', false);
        this.currentGameBoard = [];
        for (let y = 0; y < HEIGHT; y++) {
            for (let x = 0; x < WIDTH; x++) {
                this.currentGameBoard[y * WIDTH + x] = {
                    type: Discord.Constants.MessageComponentTypes.BUTTON ,
                    style: Discord.Constants.MessageButtonStyles.SECONDARY,
                    customId: `breaklock${y * WIDTH + x + 1}`,
                    label: '-',
                    disabled: false
                }
            }
        }
        // console.log(this.currentGameBoard)
        this.turn = 0;
        this.selectedTurn = 0;
        this.currentPattern = [];
        this.pattern = this.patternGenerate()
        this.history = [];
    }
    protected getContent(): GameContent {
        const embed = new MessageEmbed()
            .setColor('#08b9bf')
            .setFooter({ text: `Playing with: ${this.gameStarter.username}` })
            .setTitle('Break Lock')
            .setDescription(`[Click here to learn how to play](https://gameboardswebsite.lockdownammo7.repl.co/docs/#break-lock)
            \nTurn: ${this.turn}\nPrevious attempts: `)
            .setImage(`https://gameboardswebsite.lockdownammo7.repl.co/gameBot/breakLock/${this.history.length > 0 ? this.history.join('-') : ''}`)
            .setTimestamp()
        //console.log(this.componentGenerator())
        //console.log(`https://gameboardswebsite.lockdownammo7.repl.co/gameBot/breakLock/${this.history.length > 0 ? this.history.join('-') : ''}`)
        return {
            embeds: [embed],
            components: this.componentGenerator()
        }
    }
    protected getGameOverContent(result: GameResult): GameContent {
        const embed = new Discord.MessageEmbed()
            .setColor('#08b9bf')
            .setTitle('Break Lock')
            .setFooter({ text: "Whoops something overflowed :D" })
            .setDescription(`GAME OVER\n ${this.getWinnerText(result)}`)
            .setImage(`https://gameboardswebsite.lockdownammo7.repl.co/gameBot/breakLock/${this.history.length > 0 ? this.history.join('-') : ''}`)
            .setTimestamp()
        //console.log(`https://gameboardswebsite.lockdownammo7.repl.co/gameBot/breakLock/${this.history.length > 0 ? this.history.join('-') : ''}`)
        
    //console.log()
        return {
            embeds: [embed],
            components: []
        }
    }
    public onInteraction(interaction: Discord.Interaction<Discord.CacheType>): void {
        if (!interaction.isButton()) return;
        if (!interaction.customId.startsWith('breaklock')) return;
        if (interaction.message.id != this.gameMessage?.id) return;
        if (interaction.user.id !== this.gameStarter.id) return;

        if (interaction.customId === 'breaklockCancelCurrentSelection') {
            this.newCurrentGameBoard();
            interaction.update(this.getContent()).catch(e => super.handleError(e, 'update interaction'))
            this.selectedTurn = 0;
            this.step(false);
        } else {
            let selectId = parseInt(interaction.customId.slice('breaklock'.length)) ?? undefined
            if (!selectId) return;
            this.currentPattern.push(selectId)
           // console.log(this.currentPattern)
            if (this.selectedTurn >= 3) {
                if (this.currentPattern.join(',') == this.pattern.join(',')) {
                    this.history = [...this.history, this.historyStringConstructor()]
                    this.selectedTurn = 0;
                    this.newCurrentGameBoard();
                    this.gameOver({ result: ResultType.WINNER, name: this.gameStarter.id }, interaction);
                } else if (this.turn + 1 >= this.turnLimit) {
                    this.history = [...this.history, this.historyStringConstructor()]
                    this.gameOver({ result: ResultType.LOSER, name: this.gameStarter.id }, interaction);
                } else {
                    this.history = [...this.history, this.historyStringConstructor()]
                    this.currentPattern = [];
                    this.selectedTurn = 0;
                    this.newCurrentGameBoard();
                    interaction.update(this.getContent()).catch(e => super.handleError(e, 'update interaction'));
                    this.turn ++;
                    this.step(false);
                }
            } else {
                this.currentGameBoard[selectId - 1].disabled = true
                this.currentGameBoard[selectId - 1].label = `${this.selectedTurn + 1}`
                // console.log(this.currentGameBoard[selectId - 1])
                this.selectedTurn += 1;
                interaction.update(this.getContent()).catch(e => super.handleError(e, 'update interaction'));
                this.step(false)
            }
        }

    }
    private componentGenerator(): MessageActionRow[] {
        let components: MessageActionRow[] = [];
        for (let y = 0; y < HEIGHT; y++) {
            let row = new MessageActionRow()
            for (let x = 0; x < WIDTH; x++) {
                const c = this.currentGameBoard[y * WIDTH + x]
                row.addComponents({
                    type: c.type,
                    customId: c.customId,
                    style: c.style,
                    label: c.label,
                    disabled: c.disabled
                })
            }
            components.push(row)
        }
        components.push(
            new MessageActionRow().addComponents({
                type: 'BUTTON',
                customId: 'breaklockCancelCurrentSelection',
                style: 'DANGER',
                label: 'Cancel Current Selection',
                disabled: false
            })
        )
        return components;
    }
    private newCurrentGameBoard() {
        for (let y = 0; y < HEIGHT; y++) {
            for (let x = 0; x < WIDTH; x++) {
                this.currentGameBoard[y * WIDTH + x] = {
                    type: Discord.Constants.MessageComponentTypes.BUTTON,
                    style: Discord.Constants.MessageButtonStyles.SECONDARY,
                    customId: `breaklock${y * WIDTH + x + 1}`,
                    label: '-',
                    disabled: false
                }
            }
        }
        // console.log(this.currentGameBoard)
        this.currentPattern = [];
        this.selectedTurn = 0;
        return;
    }
    private patternGenerate(): number[] {
        let ptr = [];
        let chosen: number[] = [];
        for (let i = 0; i < 4; i++) {
            let randInt = Math.floor(Math.random() * WIDTH * HEIGHT + 1);
           // console.log(randInt)
            if (chosen.includes(randInt)) i -= 1
            else chosen.push(randInt)
        }
        console.log(`Pattern for current game: ${chosen}`)
        return chosen;
    }
    private historyStringConstructor(): string {
        return `${this.currentPatternGrid()}${this.currentPatternHints()}`;
    }
    private currentPatternGrid(): string {
        let str = '';
        for (let y = 0; y < HEIGHT; y++) {
            for (let x = 0; x < WIDTH; x++) {
                let c = y * WIDTH + x + 1
                str += this.currentPattern.includes(c) ? `${this.currentPattern.indexOf(c) + 1}` : '0'
            }
        }
        return str;
    }
    private currentPatternHints(): string {
        let co = 0; // correct but wrong order
        let c = 0; //correct
        let ic = 0; //incorrect
        for (const s of this.pattern) {
            if (this.currentPattern.includes(s)) {
                if (this.currentPattern.indexOf(s) === this.pattern.indexOf(s))
                    c++;
                else
                    co++
            }
        }
        ic = 4 - (c + co);
        return `${c}${co}${ic}`
    }
}