import { GameContent } from "../interfaces/gameContent";
import GameResult, { ResultType } from "../interfaces/gameResult";
import GameBase from "../base/gameBase";
import Position, { up, down, left, right, isInside } from "../interfaces/position";
import Discord, { MessageActionRow, MessageButton, MessageEmbed, MessageReaction, User } from "discord.js";

const reactions = new Map([
    ['🅰️', 'A'],
    ['🇦', 'A'],
    ['🅱️', 'B'],
    ['🇧', 'B'],
    ['🇨', 'C'],
    ['🇩', 'D'],
    ['🇪', 'E'],
    ['🇫', 'F'],
    ['🇬', 'G'],
    ['🇭', 'H'],
    ['ℹ️', 'I'],
    ['🇮', 'I'],
    ['🇯', 'J'],
    ['🇰', 'K'],
    ['🇱', 'L'],
    ['Ⓜ️', 'M'],
    ['🇲', 'M'],
    ['🇳', 'N'],
    ['🅾️', 'O'],
    ['⭕', 'O'],
    ['🇴', 'O'],
    ['🅿️', 'P'],
    ['🇵', 'P'],
    ['🇶', 'Q'],
    ['🇷', 'R'],
    ['🇸', 'S'],
    ['🇹', 'T'],
    ['🇺', 'U'],
    ['🇻', 'V'],
    ['🇼', 'W'],
    ['✖️', 'X'],
    ['❎', 'X'],
    ['❌', 'X'],
    ['🇽', 'X'],
    ['🇾', 'Y'],
    ['💤', 'Z'],
    ['🇿', 'Z'],
]);

export default class HangmanGame extends GameBase {
    private word = '';
    private guesssed: string[] = [];
    private wrongs = 0;

    constructor() {
        super('hangman', false);
        fetch('https://api.theturkey.dev/randomword').then(resp => resp.text())
            .then(word => {
                this.word = word.toUpperCase();
                this.guesssed = [];
                this.wrongs = 0;
            }).catch(console.log);
    }
    protected getContent(): GameContent {
        const embed = new MessageEmbed()
            .setTitle('Hangman')
            .setFooter({ text: `Current player: ${this.gameStarter}`, iconURL: this.gameStarter.displayAvatarURL({ dynamic: false }) })
            .setColor('#08b9bf')
            .setDescription(this.getDescription())
            .addField('Letters Guessed', this.guesssed.length == 0 ? '\u200b' : this.guesssed.join(' '))
            .addField('How To Play', 'React to this message using the emojis that look like letters (🅰️, 🇹, )')
            .setTimestamp()

        return {
            embeds: [embed],
            components: []
        }
    }
    protected getGameOverContent(result: GameResult): GameContent {
        const embed = new MessageEmbed()
            .setTitle('Hangman')
            .setFooter({ text: 'Whoops something overflowed :D' })
            .setColor('#08b9bf')
            .setDescription(`${this.getWinnerText(result)}\n\nThe Word was:\n${this.word}\n\n${this.getDescription()}`)
            .setTimestamp()

        return {
            embeds: [embed],
            components: []
        }
    }
    public onReaction(reaction: MessageReaction): void {
        const reactName = reaction.emoji.name;
        if (reactName)
            this.makeGuess(reactName);
        else
            this.step(true);
    }
    public onInteraction(interaction: Discord.Interaction<Discord.CacheType>): void { }

    private makeGuess(reaction: string) {
        if (reactions.has(reaction)) {
            const letter = reactions.get(reaction);
            if (letter === undefined)
                return;

            if (!this.guesssed.includes(letter)) {
                this.guesssed.push(letter);

                if (this.word.indexOf(letter) == -1) {
                    this.wrongs++;

                    if (this.wrongs == 5) {
                        this.gameOver({ result: ResultType.LOSER, name: this.gameStarter.id });
                        return;
                    }
                }
                else if (!this.word.split('').map(l => this.guesssed.includes(l) ? l : '_').includes('_')) {
                    this.gameOver({ result: ResultType.WINNER, name: this.gameStarter.id });
                    return;
                }
            }
        }

        this.step(true);
    }
    private getDescription(): string {
        return '```'
            + '|‾‾‾‾‾‾|   \n|     '
            + (this.wrongs > 0 ? '🎩' : ' ')
            + '   \n|     '
            + (this.wrongs > 1 ? '😟' : ' ')
            + '   \n|     '
            + (this.wrongs > 2 ? '👕' : ' ')
            + '   \n|     '
            + (this.wrongs > 3 ? '🩳' : ' ')
            + '   \n|    '
            + (this.wrongs > 4 ? '👞👞' : ' ')
            + '   \n|     \n|__________\n\n'
            + this.word.split('').map(l => this.guesssed.includes(l) ? l : '_').join(' ')
            + '```';
    }
}