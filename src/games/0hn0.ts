import { GameContent } from "../interfaces/gameContent";
import GameResult, { ResultType } from "../interfaces/gameResult";
import GameBase from "../base/gameBase";
import Discord, { Guild, Interaction, MessageActionRow, MessageButton, MessageEmbed, MessageReaction, MessageSelectMenu, Modal, User } from "discord.js";
import DJSBuilder, { ActionRowBuilder, ButtonBuilder, EmbedBuilder, SelectMenuBuilder, SelectMenuOptionBuilder } from "@discordjs/builders";
import { Direction } from "../interfaces/direction";
import { ButtonStyle } from 'discord-api-types/v10';
import Grid, { Save } from "../base/grid";
import Tile, { TileType } from "../base/tile";
import Position from "../interfaces/position";

const SIZE = 5;

export default class OhnO extends GameBase {
    private puzzle: Puzzle;
    private grid: Grid;
    private timestamp: number;
    private saves: Save;

    constructor() {
        super('0hn0', false);
        let d = Date.now();
        this.grid = new Grid(SIZE);
        this.grid.clear();
        this.grid.generate();
        this.grid.maxify();
        this.grid.breakDown();
        this.timestamp = Date.now() - d;
        this.saves = this.grid.saves;
        this.puzzle = {
            size: SIZE,
            full: this.saves.full.values.sort((a, b) => ((b.pos.y * SIZE) + b.pos.x) - ((a.pos.y * SIZE) + a.pos.x)).map(t => t.value),
            empty: this.saves.empty.values.sort((a, b) => ((b.pos.y * SIZE) + b.pos.x) - ((a.pos.y * SIZE) + a.pos.x)).map(t => t.value),
            quality: Math.round(100 * (this.grid.tiles.filter(t => t.isUnknown()).length / (SIZE * SIZE))),
            ms: this.timestamp
        }
        if (this.puzzle.quality < 60) this.remakeGrid()
    }

    protected getContent(): GameContent {
        let embed = new MessageEmbed()
            .setColor('#08b9bf')
            .setFooter({ text: `Current player: ${this.gameStarter.username}` })
            .setTitle('0hn0')
            .setDescription(`[Click here to learn how to play](https://gamesbot.lockdownammo7.repl.co/docs/#0hn0)\nQuality: ${this.puzzle.quality}\nGeneration Time: ${this.puzzle.ms}ms`)
            .setTimestamp()
        return {
            embeds: [embed],
            components: this.componentGenerator()
        }
    }
    protected getGameOverContent(result: GameResult): GameContent {
        let embed = new MessageEmbed()
            .setColor('#08b9bf')
            .setFooter({ text: `Whoops something overflowed :D` })
            .setTitle('0hn0')
            .setDescription(`${this.getWinnerText(result)}`)
            .setTimestamp()
        return {
            embeds: [embed],
            components: this.componentGenerator()
        }
    }
    protected getWinnerText(result: GameResult): string {
        if (result.result === ResultType.TIE)
            return 'Thats a tie';
        else if (result.result === ResultType.TIMEOUT)
            return 'They not respond quick :c';
        else if (result.result === ResultType.ERROR)
            return 'ERROR: ' + result.error;
        else if (result.result === ResultType.WINNER)
            return '<@' + result.name + `> has won GG :D \nQuality: ${this.puzzle.quality}\nGeneration Time: ${this.puzzle.ms}ms`;
        else if (result.result === ResultType.LOSER)
            return `\nQuality: ${this.puzzle.quality}\nGeneration Time: ${this.puzzle.ms}ms\n\n` + '<@' + result.name + '> has lost as they probably did some mistake.... The correct answer is given below';
        return `\nQuality: ${this.puzzle.quality}\nGeneration Time: ${this.puzzle.ms}ms`;
    }
    public async onInteraction(interaction: Discord.Interaction<Discord.CacheType>): Promise<void> {
        if (!interaction.isButton()) return;
        if (interaction.message.id != this.gameMessage?.id) return;
        if (!interaction.customId.startsWith('0hn0')) return;
        if (this.gameStarter.id !== interaction.user?.id) return;
        const id = parseInt(interaction.customId.split(/ +/)[1]);
        const x = (SIZE * SIZE) % id;
        const y = Math.floor((SIZE * SIZE) / id);
        let tile = this.grid.tile({ x, y });
        if (!tile) {
            this.gameOver({ result: ResultType.ERROR, error: 'Somehow the tile dosent exist and i am too lazy to handle that exception' });
            return;
        }
        switch (tile.type) {
            case TileType.Unknown:
                tile.dot();
                break;
            case TileType.Dot:
                tile.wall();
                break;
            case TileType.Wall:
                tile.unknown();
                break;
            default:
                break;
        }
        if (this.isBoardFull()) {
            let currGridValues: Number[] = [];
            let solvedValues: Number[] = [];
            for (let y = 0; y < SIZE; y++) {
                for (let x = 0; x < SIZE; x++) {
                    let tileVal = this.grid.tiles.find(tile => tile.pos.x == x && tile.pos.y == y)?.value;
                    let solVal = this.grid.saves.full.values.find(tile => tile.pos.x == x && tile.pos.y == y)?.value;
                    currGridValues.push(tileVal ?? -1);
                    solvedValues.push(solVal ?? -1);
                }
            }
            if (currGridValues.join() === solvedValues.join()) {
                this.gameOver({ result: ResultType.WINNER, name: this.gameStarter.id });
                return;
            }
            this.grid.clear();
            this.grid.restore("full");
            this.gameOver({ result: ResultType.LOSER, name: this.gameStarter.id });
            return;
        }
        this.step(false);
        interaction.update(this.getContent()).catch(e => this.handleError(e, 'update interaction'));
        return;
    }
    private isBoardFull(): boolean {
        this.grid.tiles.forEach(tile => {
            if (tile.isUnknown())
                return false;
        })
        return true;
    }

    private remakeGrid(): void {
        let attempts = 0;
        while (attempts++ < 43 && this.puzzle.quality < 60) {
            let d = Date.now();
            this.grid.clear();
            this.grid.restore("full");
            this.grid.breakDown();
            this.timestamp += Date.now() - d;
            this.saves = this.grid.saves;
            this.puzzle = {
                size: SIZE,
                full: this.saves.full.values.sort((a, b) => ((b.pos.y * SIZE) + b.pos.x) - ((a.pos.y * SIZE) + a.pos.x)).map(t => t.value),
                empty: this.saves.empty.values.sort((a, b) => ((b.pos.y * SIZE) + b.pos.x) - ((a.pos.y * SIZE) + a.pos.x)).map(t => t.value),
                quality: Math.round(100 * (this.grid.tiles.filter(t => t.isUnknown()).length / (SIZE * SIZE))),
                ms: this.timestamp
            }
        }
        return;
    }

    private componentGenerator(): MessageActionRow[] {
        let rows: MessageActionRow[] = [];
        for (let y = 0; y < SIZE; y++) {
            let row = new MessageActionRow();
            for (let x = 0; x < SIZE; x++) {
                row.addComponents([
                    new ButtonBuilder()
                        .setStyle(this.getButtonStyle({ x, y }))
                        .setLabel(this.getButtonLabel({ x, y }))
                        .setDisabled(this.getButtonState({ x, y }))
                        .setCustomId(`0hn0 ${(y * SIZE) + x}`)
                        .toJSON()
                ])
            }
            rows.push(row);
        }
        return rows;
    }
    private getButtonStyle(pos: Position): ButtonStyle {
        let tile = this.grid.tile(pos) ?? { type: TileType.Unknown };
        switch (tile.type) {
            case TileType.Dot:
                return ButtonStyle.Primary;
            case TileType.Unknown:
                return ButtonStyle.Secondary;
            case TileType.Value:
                return ButtonStyle.Primary;
            case TileType.Wall:
                return ButtonStyle.Danger;
        }
    }
    private getButtonLabel(pos: Position): string {
        let tile = this.grid.tile(pos) ?? { value: -1 };
        return tile.value > 0 ? tile.value.toString() : "ㅤ"
    }
    private getButtonState(pos: Position): boolean {
        if (this.saves.empty.values.find(t => (t.pos == pos && t.value >= 0)))
            return true;
        return false;
    }

    public onReaction(reaction: MessageReaction): void { }
}

export type Puzzle = {
    size: number,
    full: Number[],
    empty: Number[],
    quality: number,
    ms: number
}