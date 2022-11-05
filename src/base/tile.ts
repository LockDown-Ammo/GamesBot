import { Direction } from "../interfaces/direction";
import Position, { move } from "../interfaces/position";
import Grid from "./grid";


export default class Tile {
    public pos: Position;
    public value: Number;
    public type: TileType;
    public info: Info | undefined = undefined;

    constructor(p: Position, v: Number, t: TileType) {
        this.pos = p;
        this.type = t;
        switch (t) {
            case 0:
                this.value = -1;
                break;
            case 1:
                this.value = -2;
                break;
            case 2:
                this.value = v;
                break;
            case 3:
                this.value = 0;
                break;
            default:
                this.value = v;
                break;
        }
    }

    public isUnknown(): boolean {
        return this.type === TileType.Unknown;
    }
    public isDot(): boolean {
        return this.type === TileType.Dot;
    }
    public isValue(): boolean {
        return this.type === TileType.Value;
    }
    public isWall(): boolean {
        return this.type === TileType.Wall;
    }

    public unknown(): Tile {
        this.type = TileType.Unknown;
        this.value = -1;
        return this;
    }
    public dot(): Tile {
        this.type = TileType.Dot;
        this.value = -2
        return this;
    }
    public setValue(n: number): Tile {
        this.type = TileType.Value;
        this.value = n;
        return this;
    }
    public wall(): Tile {
        this.type = TileType.Wall;
        this.value = 0;
        return this;
    }

    public move(dir: Direction, g: Grid): Tile | undefined {
        return g.tile(move(this.pos, dir));
    }
    public close(g: Grid): Tile {
        for (let dir of Directions) {
            this.closeDirection(dir, g)
        }
        return this;
    }
    public closeDirection(dir: Direction, g: Grid, withDots?: boolean, amount?: number): Tile {
        let count = 0;
        for (let t = this.move(dir, g); t && !t.isWall(); t = t.move(dir, g)) {
            if (t.isUnknown()) {
                count++;
                withDots ? t.dot() : t.wall();
                break;
            }
            if (amount && count >= amount) break;
        }
        return this;
    }
    public getTilesInRange(min: number, max: number, g: Grid): Tile[] {
        let result: Tile[] = [];
        for (let dir of Directions) {
            let dist = 0;
            for (let t = this.move(dir, g); t && !t.isWall(); t = t.move(dir, g)) {
                dist++;
                if (dist >= min && dist <= max) {
                    result.push(t);
                }
            }
        }
        return result;
    }

    public collect(g: Grid, info?: Info): Info {

        let lastPossibleDirection: Direction | undefined = undefined;
        let possibleDirCount = 0;

        if (!info) info = this.passOne(g, lastPossibleDirection, possibleDirCount);
        else info = this.passTwo(info, g, lastPossibleDirection, possibleDirCount);

        if (possibleDirCount == 1) {
            info.singlePossibleDirection = lastPossibleDirection;
        }

        if (this.isValue() && this.value == info.numberCount)
            info.numberReached = true;
        else if (this.isValue() && this.value == info.numberCount + info.unknownsAround)
            info.canBeCompletedWithUnknowns = true;

        return info;
        /*   if (!info) {
               info = {
                   unknownsAround: 0,
                   numberCount: 0,
                   numberReached: false,
                   canBeCompletedWithUnknowns: false,
                   completedNumbersAround: false,
                   singlePossibleDirection: undefined,
                   direction: {
                       0: {
                           unknownCount: 0,
                           numberCountAfterUnknown: 0,
                           wouldBeTooMuch: false,
                           maxPossibleCount: 0,
                           maxPossibleCountInOtherDirections: 0,
                           numberWhenDottingFirstUnknown: 0
                       },
                       1: {
                           unknownCount: 0,
                           numberCountAfterUnknown: 0,
                           wouldBeTooMuch: false,
                           maxPossibleCount: 0,
                           maxPossibleCountInOtherDirections: 0,
                           numberWhenDottingFirstUnknown: 0
                       },
                       2: {
                           unknownCount: 0,
                           numberCountAfterUnknown: 0,
                           wouldBeTooMuch: false,
                           maxPossibleCount: 0,
                           maxPossibleCountInOtherDirections: 0,
                           numberWhenDottingFirstUnknown: 0
                       },
                       3: {
                           unknownCount: 0,
                           numberCountAfterUnknown: 0,
                           wouldBeTooMuch: false,
                           maxPossibleCount: 0,
                           maxPossibleCountInOtherDirections: 0,
                           numberWhenDottingFirstUnknown: 0
                       }
                   }
               };
               // the following for loops traverse over the OTHER tiles around the current one
               // so t is always one of the other tiles, giving information over the current tile
   
               for (var dir of Directions) {
                   // check each direction but end at a wall or grid-boundary
                   for (var t = this.move(dir, g); t && !t.isWall(); t = t.move(dir, g)) {
                       var curDir = info.direction[dir]
                       if (t.isUnknown()) {
                           // if this is the first unknown in this direction, add it to the possible-would-be value
                           if (!curDir.unknownCount) {
                               curDir.numberWhenDottingFirstUnknown++;
                           }
                           curDir.unknownCount++;
                           curDir.maxPossibleCount++;
                           info.unknownsAround++;
   
                           // if we're looking FROM a number, count the possible directions
                           if (this.isValue() && lastPossibleDirection != dir) {
                               possibleDirCount++;
                               lastPossibleDirection = dir;
                           }
                       }
                       else if (t.isValue() || t.isDot()) {
                           // count the maximum possible value
                           curDir.maxPossibleCount++;
                           // if no unknown found yet in this direction
                           if (!curDir.unknownCount) {
                               info.numberCount++;
                            //   console.log(info.numberCount)
                               curDir.numberWhenDottingFirstUnknown++;
                           }
                           // else if we were looking FROM a number, and we found a number with only 1 unknown in between...
                           else if (this.isValue() && curDir.unknownCount == 1) {
                               curDir.numberCountAfterUnknown++;
                               curDir.numberWhenDottingFirstUnknown++;
                               if (curDir.numberCountAfterUnknown + 1 > this.value) {
                                   curDir.wouldBeTooMuch = true;
                               }
                           }
                       }
                   }
               }
   
               // if there's only one possible direction that has room to expand, set it
               if (possibleDirCount == 1) {
                   info.singlePossibleDirection = lastPossibleDirection;
               }
   
               // see if this number's value has been reached, so its paths can be closed
               if (this.isValue() && this.value == info.numberCount)
                   info.numberReached = true;
               else if (this.isValue() && this.value == info.numberCount + info.unknownsAround)
                   // TODO: only set when 
                   info.canBeCompletedWithUnknowns = true;
           }
           // pass 2
           else {
               for (var dir of Directions) {
                   var curDir = info.direction[dir];
                   for (var t = this.move(dir, g); t && !t.isWall(); t = t.move(dir, g)) {
                       if (t.isValue() && t.info?.numberReached) {
                           info.completedNumbersAround = true; // a single happy number was found around
                       }
                   }
                   // if we originate FROM a number, and there are unknowns in this direction
                   if (this.isValue() && !info.numberReached && curDir.unknownCount) {
                       // check all directions other than this one
                       curDir.maxPossibleCountInOtherDirections = 0;
                       for (var otherDir of Directions) {
                           if (otherDir != dir)
                               curDir.maxPossibleCountInOtherDirections += info.direction[otherDir].maxPossibleCount;
                       }
                   }
               }
           }
   
           // if there's only one possible direction that has room to expand, set it
           if (possibleDirCount == 1) {
               info.singlePossibleDirection = lastPossibleDirection;
           }
   
           // see if this number's value has been reached, so its paths can be closed
           if (this.isValue() && this.value == info.numberCount)
               info.numberReached = true;
           else if (this.isValue() && this.value == info.numberCount + info.unknownsAround)
               info.canBeCompletedWithUnknowns = true;
           this.info  = info
           return info;*/
    }
    public passOne(g: Grid, lastPossibleDirection: Direction | undefined, possibleDirCount: number): Info {
        let info = baseInfo();

        for (let dir of Directions) {
            for (let t = this.move(dir, g); t && !t.isWall(); t = t.move(dir, g)) {
                let curDir: DirectionInfo = info.direction[dir];
                if (t.isUnknown()) {
                    if (!curDir.unknownCount) curDir.numberWhenDottingFirstUnknown++;
                    curDir.unknownCount++;
                    curDir.maxPossibleCount++;
                    info.unknownsAround++;
                    if (this.isValue() && lastPossibleDirection != dir) {
                        possibleDirCount++;
                        lastPossibleDirection = dir;
                    }
                } else if (t.isValue() || t.isDot()) {
                    curDir.maxPossibleCount++;
                    if (!curDir.unknownCount) {
                        info.numberCount++;
                        curDir.numberWhenDottingFirstUnknown++;
                    } else if (this.isValue() && curDir.unknownCount == 1) {
                        curDir.numberCountAfterUnknown++;
                        curDir.numberWhenDottingFirstUnknown++;

                        if (curDir.numberCountAfterUnknown + 1 > this.value) {
                            curDir.wouldBeTooMuch = true;
                        }
                    }
                }

            }
        }

        if (possibleDirCount == 1) {
            info.singlePossibleDirection = lastPossibleDirection;
        }
        if (this.isValue() && this.value == info.numberCount)
            info.numberReached = true;
        else if (this.isValue() && this.value == info.numberCount + info.unknownsAround)
            info.canBeCompletedWithUnknowns = true;

        return info;
    }
    public passTwo(info: Info, g: Grid, lastPossibleDirection: Direction | undefined, possibleDirCount: number): Info {
        for (let dir of Directions) {
            let curDir = info.direction[dir];
            for (let t = this.move(dir, g); t && !t.isWall(); t = t.move(dir, g)) {
                if (t.isValue() && t.info?.numberReached) {
                    info.completedNumbersAround = true;
                }
            }
            if (this.isValue() && !info.numberReached && curDir.unknownCount) {
                for (let otherDir of Directions) {
                    if (otherDir != dir)
                        curDir.maxPossibleCountInOtherDirections += info.direction[otherDir].maxPossibleCount;
                }
            }
        }
        return info;
    }
}

export enum TileType {
    Unknown,
    Dot,
    Value,
    Wall
}

export type Info = {
    unknownsAround: number,
    numberCount: number,
    numberReached: boolean,
    canBeCompletedWithUnknowns: boolean,
    completedNumbersAround: boolean,
    singlePossibleDirection: Direction | undefined,
    direction: { [key in Direction]: DirectionInfo }
}

export type DirectionInfo = {
    unknownCount: number,
    numberCountAfterUnknown: number,
    wouldBeTooMuch: boolean,
    maxPossibleCount: number,
    maxPossibleCountInOtherDirections: number,
    numberWhenDottingFirstUnknown: number,
}

export let Directions = [
    Direction.UP,
    Direction.DOWN,
    Direction.LEFT,
    Direction.RIGHT
]

function baseInfo(): Info {
    return {
        unknownsAround: 0,
        numberCount: 0,
        numberReached: false,
        canBeCompletedWithUnknowns: false,
        completedNumbersAround: false,
        singlePossibleDirection: undefined,
        direction: {
            0: {
                unknownCount: 0,
                numberCountAfterUnknown: 0,
                wouldBeTooMuch: false,
                maxPossibleCount: 0,
                maxPossibleCountInOtherDirections: 0,
                numberWhenDottingFirstUnknown: 0
            },
            1: {
                unknownCount: 0,
                numberCountAfterUnknown: 0,
                wouldBeTooMuch: false,
                maxPossibleCount: 0,
                maxPossibleCountInOtherDirections: 0,
                numberWhenDottingFirstUnknown: 0
            },
            2: {
                unknownCount: 0,
                numberCountAfterUnknown: 0,
                wouldBeTooMuch: false,
                maxPossibleCount: 0,
                maxPossibleCountInOtherDirections: 0,
                numberWhenDottingFirstUnknown: 0
            },
            3: {
                unknownCount: 0,
                numberCountAfterUnknown: 0,
                wouldBeTooMuch: false,
                maxPossibleCount: 0,
                maxPossibleCountInOtherDirections: 0,
                numberWhenDottingFirstUnknown: 0
            }
        }
    };
}