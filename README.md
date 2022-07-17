# Discord Games Bot

This is a private discord bot used in specefic private servers to play games. Its not meant for public use and likely has many bugs and will crash easily. This has been coded as a passion and the code is not open to be used for commercial purposes.

Developer: Anonymous [ Some may know me as Whatsapp / LockDownAmmo :D ]

---

# Table of Contents

### [Games and How to use them:](#games-and-how-to-use-them)

- [Flood Game](#flood-game)
- [Connect 4](#connect-4)
- [Break Lock](#break-lock)
- [2048](#2048)
  
    > More Coming soon...

### [Project Info and other Developer nerdy stuff](#project-info-and-other-developer-nerdy-stuff-1)

- [Project Progression Status](#project-progression-status)
- [Languages and Frameworks used](#languages-and-frameworks)
- [Dependencies used](#dependencies)
- [Future plans](#future-plans)

---

# <a name="games-and-how-to-use-them">Games and How to use them</a>

The following games are listed below along with their descriptions.

## <a name="flood-game">Flood Game</a>

In this game you start with a random coloured board. Consider the top-left square colour as your home colour. Your first move should be to select a colour of its surrounding to turn your home square into that colour. Now the squares of that specefic colours joined to your home square all become individual home squares. Keep repeating this till the entire board is yout home square or of the same colour! Sounds confusing at frst but if u play a few times you will understand :D

Enjoy the game !!!

```text
> ⚠️ Feature: Images and GIFs for better understanding coming soon...
```

```text
> 💡 Info: 
        - Command: >>flood          (Case Insensitive)
        - Multiplayer: False                ( - )
```

## <a name="connect-4">Connect 4</a>

This is a very old and classic game and most of the people should already know about it. Still for those who dont know.You start off with a blank gameboard. You can have either red or yellow colour. The main objective is to make a series of atleast 4 dots of the same colour in any direction (up, down, left, right and diagonals) First player to acheive this wins.

Enjoy the game !!!

```text
> ⚠️ Feature: Images and GIFs for better understanding coming soon...
```

```text
> 💡 Info: 
        - Command: >>connect4          (Case Insensitive)
        - Multiplayer: True                 (2 Players)
```

## <a name="break-lock">Break Lock</a>

This is a very ( and not so very on basis of graphics xD ) modern pin cracking game. You start off with a classic 9 digit pin pad. The pin is 4 characters long. If you enter the correct pin , you win. Dont worry! It is not just about guess work. If you enter a wrong pin, it will give you hints in the form of circles:
> <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/58/White_Circle.svg/2048px-White_Circle.svg.png" width="20" height="20" alt="[Solid filled white circle image]">  indicates that a digit is present in the pin and is at its correct position

> <img src="https://www.seekpng.com/png/full/13-133421_circulartimer-empty-white-circle-png.png" width="20" height="20" alt="[Hollow white circle image]">  indicates that a digit is present in the pin but is not in its correct position

Find out if you can crack the pin in under 20 tries!! Enjoy :D

```text
> ⚠️ Feature: Images and GIFs for better understanding coming soon...
```

```text
> 💡 Info: 
        - Command: >>breakLock          (Case Insensitive)
        - Multiplayer: False                  ( - )
```

## <a name="2048">2048</a>

This is a very classic game and you should know how to play it. For those who dont know you have to use the buttons to move the tile in one direction. If two tiles with same number collide they add up. The aim of the game is to get the 2048 tile.

Are you smart enough to complete it? Check it out!!

```text
> ⚠️ Feature: Images and GIFs for better understanding coming soon...
```

```text
> 💡 Info: 
        - Command: >>2048                     ( - )
        - Multiplayer: False                  ( - )
```

---

# <a name="project-info-and-other-developer-nerdy-stuff-1">Project Info and other Developer nerdy stuff</a>

This section is for developers only and / or for the common pea sized public who considers themselves as developer even when they know nothing ( like me :D )
I do not own any responsibility if stuff thats written in this section fries your pea- I mean brain.

PS: We developers have a very good sense of humor :D

## <a name="project-progression-status">Project Progression Status</a>

> Progression Rate: Very Slow

I am lazy and I am a student... Do not expect frequent updates

You can tell how lazy I am by the fact that I am using markdown files to generate this...

## <a name="languages-and-frameworks">Languages and Frameworks</a>

> Runtime environment: Node JS

```Javascript``` has been used to make the server you are currently on and where it processes images.

```Typescript``` has been used to make the main discord bot.

## <a name="dependencies">Dependencies</a>

Since the bot was built using ```NodeJS``` npm packages were used.

For server:

- [express](https://www.npmjs.com/package/express)
- [canvas](https://www.npmjs.com/package/canvas)
- [fs](https://www.npmjs.com/package/fs)
- [markdown-it](https://www.npmjs.com/package/markdown-it)
- [generate-github-markdown-css](https://www.npmjs.com/package/generate-github-markdown-css)

For bot:

- [discord.js](https://www.npmjs.com/package/discord.js)
- [dotenv](https://www.npmjs.com/package/dotenv)
- [fs](https://www.npmjs.com/package/fs)

## <a name="future-plans">Future Plans</a>

I have plans to add the following games:

- TicTacToe
- Hangman
- 0h h1

---
