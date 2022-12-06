import { Aki } from 'aki-api';
import Akina from 'aki-api/typings/src/Akinator'
import { GameContent } from "../interfaces/gameContent";
import GameResult, { ResultType } from "../interfaces/gameResult";
import GameBase from "../base/gameBase";
import Discord, { Interaction, MessageActionRow, MessageEmbed, MessageReaction } from "discord.js";
import { ButtonBuilder } from "@discordjs/builders";

const answers: { [key: string]: 0 | 1 | 2 | 3 | 4 } = {
  "yes": 0,
  "no": 1,
  "idk": 2,
  "probably": 3,
  "probably not": 4,
}

export default class Akinator extends GameBase {

  private currentDisplay: 'THEME_CHOICE' | 'QUESTION' | 'GUESSING' | 'LOST' | 'WON' | 'STOPPED';
  private stepsSinceLastGuess: number;
  private hasGuessed: boolean;
  private aki: undefined | Akina;
  constructor() {
    super('aki', false);
    this.currentDisplay = 'THEME_CHOICE';
    this.aki = undefined;
    this.stepsSinceLastGuess = 0;
    this.hasGuessed = false;
  }

  protected getContent(): GameContent {
    const embed = this.embedConstructor(this.currentDisplay)
    return {
      embeds: [embed],
      components: this.componentsConstructor(this.currentDisplay)
    }
  }
  protected getGameOverContent(result: GameResult): GameContent {
    const embed = this.embedConstructor(this.currentDisplay)
    return {
      embeds: [embed],
      components: []
    }
  }
  public async onInteraction(interaction: Discord.Interaction<Discord.CacheType>): Promise<void> {
    if (!interaction.isButton()) return;
    if (interaction.message.id != this.gameMessage?.id) return;
    if (!interaction.customId.startsWith('aki')) return;
    if (this.gameStarter.id !== interaction.user?.id) return;
    const interactionId = interaction.customId.split(' ')[1];
    await interaction.deferUpdate();

    if (this.currentDisplay === 'THEME_CHOICE') {
      switch (interactionId) {
        case 'objects':
          this.aki = new Aki({ region: 'en_objects', childMode: true });
          break;
        case 'animals':
          this.aki = new Aki({ region: 'en_animals', childMode: true });
          break;
        case 'character':
          this.aki = new Aki({ region: 'en', childMode: true });
          break;
        default:
          this.aki = new Aki({ region: 'en', childMode: true });
          break;
      }
      await this.aki.start();
      this.currentDisplay = 'QUESTION';
      this.step(false)
      await interaction.editReply(this.getContent()).catch(async e => {
        await this.aki?.win();
        this.currentDisplay = 'THEME_CHOICE';
        super.handleError(e, 'update interaction');
      });
      return;
    }
    if (this.currentDisplay === 'QUESTION') {
      if (!this.aki) return;
      this.stepsSinceLastGuess = this.stepsSinceLastGuess + 1;
      const answer = this.getButtonInput(interactionId);
      if (answer == 'back') {
        if (this.aki.currentStep > 0) {
          this.aki.back();
          this.stepsSinceLastGuess = this.stepsSinceLastGuess - 1;
        }
      } else if (answer == 'stop') {
        await this.aki.win();
        this.currentDisplay = 'STOPPED';
        this.gameOver({ result: ResultType.ERROR, error: "FORCE STOPPED" });
        await interaction.editReply(this.getContent()).catch(e => super.handleError(e, 'update interaction'));
        return;
      } else {
        await this.aki.step(answers[answer]);
      }

      if ((this.aki.progress >= 95 && (this.stepsSinceLastGuess >= 10 || this.hasGuessed == false)) || this.aki.currentStep >= 78) {
        await this.aki.win();
        this.stepsSinceLastGuess = 0;
        this.hasGuessed = true;
        this.currentDisplay = 'GUESSING';
      }
      this.step(false);
      interaction.editReply(this.getContent()).catch(e => {
        super.handleError(e, 'update interaction');
        this.aki?.back();
      });
      return;
    }
    if (this.currentDisplay === 'GUESSING') {
      if (!this.aki) return;
      const answer = this.getButtonInput(interactionId);
      if (answer === 'yes') {
        this.currentDisplay = 'WON';
        this.gameOver({ result: ResultType.WINNER, name: this.gameStarter.id }, interaction);
        return;
      }
      if (answer === 'no') {
        if (this.aki.currentStep >= 78) {
          this.currentDisplay = 'LOST';
          this.gameOver({ result: ResultType.LOSER, name: this.gameStarter.id }, interaction);
          return;
        } else {
          this.aki.progress = 50;
          this.currentDisplay = 'QUESTION';
        }
      }
      interaction.editReply(this.getContent()).catch(async e => {
        await this.aki?.win();
        super.handleError(e, 'update interaction')
      });
      return;
    }
  }

  private embedConstructor(embedName: 'THEME_CHOICE' | 'QUESTION' | 'GUESSING' | 'LOST' | 'WON' | 'STOPPED'): MessageEmbed {
    if (!this.aki && embedName !== 'THEME_CHOICE') {
      return new MessageEmbed()
        .setTitle(`Akinator`)
        .setDescription(`ERROR Akinator somehow managed to not exist...`)
        .setFooter({ text: this.gameStarter.username, iconURL: this.gameStarter.displayAvatarURL({ dynamic: false }) })
        .setTimestamp()
    };
    switch (embedName) {
      case 'THEME_CHOICE':
        const themeEmbed = new MessageEmbed()
          .setTitle('Akinator')
          .setDescription('Choose your theme for the game:')
          .setFooter({ text: this.gameStarter.username, iconURL: this.gameStarter.displayAvatarURL({ dynamic: false }) })
          .setTimestamp()
          .setColor('GOLD')
        return themeEmbed;
      case 'QUESTION':
        const questionEmbed = new MessageEmbed()
          .setTitle(`Akinator Question ${this.aki.currentStep + 1}`)
          .setDescription(`Progress: ${Math.round(this.aki.progress ?? 0)}%\n${this.aki.question}`)
          .setFooter({ text: this.gameStarter.username, iconURL: this.gameStarter.displayAvatarURL({ dynamic: false }) })
          .setTimestamp()
          .setColor('GOLD')
        return questionEmbed;
      case 'GUESSING':
        const guessEmbed = new MessageEmbed()
          .setTitle("Akinator")
          // @ts-ignore: Property name does not exist
          .setDescription(`I am ${Math.round(this.aki.progress)}% sure that the answer is.....\n**${this.aki.answers[0].name}**`)
          // @ts-ignore: smh
          .setImage(this.aki.answers[0].absolute_picture_path)
          .setColor('GOLD')
          .setFooter({ text: this.gameStarter.username, iconURL: this.gameStarter.displayAvatarURL({ dynamic: false }) })
          .setTimestamp()
        return guessEmbed;
      case 'STOPPED':
        const stopEmbed = new MessageEmbed()
          .setTitle('Akinator')
          .setDescription('This game was force stopped :c')
          .setFooter({ text: "Whoops something overflowed :D" })
          .setColor('GOLD')
          .setTimestamp()
        return stopEmbed;
      case 'WON':
        const wonEmbed = new MessageEmbed()
          .setTitle('Akinator')
          // @ts-ignore: smh
          .setDescription(`<@${this.gameStarter.id}> I won again :D \n The answer was **${this.aki.answers[0].name}**`)
          // @ts-ignore: smh
          .setImage(this.aki.answers[0].absolute_picture_path)
          .setFooter({ text: "Whoops something overflowed :D" })
          .setColor('GOLD')
          .setTimestamp()
        return wonEmbed;
      case 'LOST':
        const lostEmbed = new MessageEmbed()
          .setTitle('Akinator')
          .setDescription('I lost..... Well that happens rarely')
          .setFooter({ text: "Whoops something overflowed :D" })
          .setColor('GOLD')
          .setTimestamp()
        return lostEmbed;
    }
  }

  private componentsConstructor(display: 'THEME_CHOICE' | 'QUESTION' | 'GUESSING' | 'LOST' | 'WON' | 'STOPPED'): MessageActionRow[] {
    if (display == 'QUESTION') {
      const row = new MessageActionRow()
        .setComponents([
          new ButtonBuilder()
            .setStyle(3) //Success
            .setLabel('Yes')
            .setCustomId('aki yes')
            .toJSON(),
          new ButtonBuilder()
            .setStyle(4) //Danger
            .setLabel('No')
            .setCustomId('aki no')
            .toJSON(),
          new ButtonBuilder()
            .setStyle(1) //Primary
            .setLabel('Probably')
            .setCustomId('aki probably')
            .toJSON(),
          new ButtonBuilder()
            .setStyle(1) //Primary
            .setLabel('Probably Not')
            .setCustomId('aki probably-not')
            .toJSON(),
          new ButtonBuilder()
            .setStyle(2) //Secondary
            .setLabel('IDK')
            .setCustomId('aki idk')
            .toJSON()
        ])
      const row2 = new MessageActionRow()
        .addComponents([
          new ButtonBuilder()
            .setStyle(2) //Secondary
            .setLabel('Back')
            .setCustomId('aki back')
            .toJSON(),
          new ButtonBuilder()
            .setStyle(4) //Danger
            .setLabel('Stop')
            .setCustomId('aki stop')
            .toJSON(),
        ])
      return [row, row2]
    }
    if (display == 'THEME_CHOICE') {
      const row = new MessageActionRow()
        .setComponents([
          new ButtonBuilder()
            .setStyle(1) //Primary
            .setLabel('Objects')
            .setCustomId('aki objects')
            .toJSON(),
          new ButtonBuilder()
            .setStyle(1) //Primary
            .setLabel('Animals')
            .setCustomId('aki animals')
            .toJSON(),
          new ButtonBuilder()
            .setStyle(1) //Primary
            .setLabel('Character')
            .setCustomId('aki character')
            .toJSON()
        ])
      return [row];
    }
    if (display == 'GUESSING') {
      const row = new MessageActionRow()
        .setComponents([
          new ButtonBuilder()
            .setStyle(3) //Success
            .setLabel('Yes')
            .setCustomId('aki yes')
            .toJSON(),
          new ButtonBuilder()
            .setStyle(4) //Danger
            .setLabel('No')
            .setCustomId('aki no')
            .toJSON()
        ])
      return [row];
    }
    return [];
  }
  private getButtonInput(c: string): 'yes' | 'no' | 'idk' | 'probably' | 'probably not' | 'stop' | 'back' {
    switch (c) {
      case 'yes':
        return 'yes';
      case 'no':
        return 'no';
      case 'idk':
        return 'idk';
      case 'probably':
        return 'probably';
      case 'probably-not':
        return 'probably not';
      case 'stop':
        return 'stop';
      case 'back':
        return 'back';
      default:
        return 'stop';
    }
  }


  public async gameOver(result: GameResult, interaction: Interaction<Discord.CacheType> | undefined = undefined): Promise<void> {
    if (this.currentDisplay == 'GUESSING' || this.currentDisplay == 'THEME_CHOICE' || this.currentDisplay == 'QUESTION') this.currentDisplay = 'STOPPED'
    if (result.result == ResultType.TIMEOUT || result.result == ResultType.DELETED || result.result == ResultType.ERROR)
      await this.aki?.win();
    super.gameOver(result, interaction)
  };

  public onReaction(reaction: MessageReaction): void { }
}