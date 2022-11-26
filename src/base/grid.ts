import { Direction } from "../interfaces/direction";
import Position, { move } from "../interfaces/position";
import Utils from "../utils/utils";
import Tile, { TileType, Directions, Info, DirectionInfo } from "./tile"

export default class Grid {
  public size: number;
  public tiles: Tile[] = [];
  public saves: Save;
  public timeout: NodeJS.Timeout | null = null;

  constructor(size?: number) {
    this.size = size ?? 5;
    this.saves = {
      1: {
        values: []
      },
      2: {
        values: []
      },
      'full': {
        values: []
      },
      'empty': {
        values: []
      }
    }
  }

  public clear() {
    for (let t of this.tiles) {
      t.unknown();
    }
  }
  public generate(): void {
    for (let y = 0; y < this.size; y++) {
      for (let x = 0; x < this.size; x++) {
        this.tiles.push(new Tile({ x: x, y: y }, -1, TileType.Unknown))
      }
    }
    this.fillDots(false);
    this.solve();
  }
  public maxify(): void {
    let tryAgain = true;
    let attempts = 0;
    let maxValue = this.size;
    let tile: Tile;

    while (tryAgain && attempts++ < 50) {
      tryAgain = false;
      let maxTiles: Tile[] = [];
      let tiles = this.tiles;

      for (let i = 0; i < tiles.length; i++) {
        tile = tiles[i];
        if (tile.value > maxValue) {
          maxTiles.push(tile)
        }
      }
      Utils.shuffle(maxTiles);
      for (let i = 0; i < maxTiles.length; i++) {
        tile = maxTiles[i];
        if (tile.value > maxValue) {
          let cuts = tile.getTilesInRange(1, maxValue, this);
          let cut;
          let firstCut;

          Utils.shuffle(cuts);

          while (!cut && cuts.length) {
            cut = cuts.pop();
            firstCut = firstCut ? firstCut : cut;
          }
          cut = cut ? cut : firstCut;

          if (cut) {
            cut.wall();
            this.fillDots(true);
            this.solve()
            tryAgain = true;
          } else {
            console.log(`No cut found for`);
          }
          break;
        }
      }
    }
  }
  public solve(silent?: Boolean): Boolean {
    let tryAgain = true,
      attempts = 0,
      pool: Tile[] = this.tiles;

    while (tryAgain && attempts++ < 50) {
      tryAgain = false;
      if (this.isDone()) return true;
      //console.log(`Solving Attempt ${attempts}`)

      //1st pass
      for (let i = 0; i < pool.length; i++) {
        pool[i].collect(this);
        //console.log("Pass 1 - ", pool[i].pos, " - ", pool[i].info?.numberCount)
      }
      //2nd pass
      for (var i = 0; i < pool.length; i++) {
        let tile = pool[i]
        let info = tile.collect(this, tile.info);
        //console.log("Pass 2 - ", pool[i].pos, " - ",info.numberCount)

        if (!info) { console.log("No Info..."); return false };

        if (tile.isDot() && !info.unknownsAround) {
          tile.setValue(info.numberCount);
          tryAgain = true;
          break;
        }
        if (tile.isValue() && info.unknownsAround) {
          if (info.numberReached) {
            tile.close(this);
            tryAgain = true;
            break;
          }

          if (info.singlePossibleDirection) {
            tile.closeDirection(info.singlePossibleDirection, this, true, 1);
            tryAgain = true;
            break;
          }
          for (let dir of Directions) {
            let curDir = info.direction[dir];
            if (curDir.wouldBeTooMuch) {

              tile.closeDirection(dir, this);
              tryAgain = true;
              break;
            }
            else if (curDir.unknownCount && curDir.numberWhenDottingFirstUnknown + curDir.maxPossibleCountInOtherDirections <= tile.value) {
              tile.closeDirection(dir, this, true, 1);
              tryAgain = true;
              break;
            }
          }
          if (tryAgain)
            break;
        }
        if (tile.isUnknown() && !info.unknownsAround && !info.completedNumbersAround) {
          if (info.numberCount == 0) {
            tile.wall();
            tryAgain = true;
            break;
          }
        }
      }

    }

    return false;
  }
  public breakDown(): void {
    let tryAgain = true,
      attempts = 0,
      tile,
      walls = 0,
      minWalls = 3,
      pool = [];
    this.save('full');

    for (let i = 0; i < this.tiles.length; i++) {
      tile = this.tiles[i];
      pool.push(this.tiles[i])
      if (tile.isWall())
        walls++;
    }
    Utils.shuffle(pool);
    while (tryAgain && pool && pool.length && attempts++ < 99) {
      tryAgain = false;
      this.save(1);
      let tempTile = pool.pop();
      if (!tempTile) {
        tryAgain = true;
        continue;
      }
      tile = this.tile({ x: tempTile.pos.x, y: tempTile.pos.y });
      if (!tile) {
        tryAgain = true;
        continue;
      }
      let isWall = tile.isWall();
      if (isWall && walls <= minWalls) continue;

      tile.unknown();
      this.save(2);
      if (this.solve()) {
        if (isWall)
          walls--;
        this.restore(2);
        tryAgain = true;
      } else {
        this.restore(1);
        tryAgain = true;
      }
    }
    this.save('empty');
  }

  private save(slot: 1 | 2 | 'full' | 'empty'): Grid {
    this.saves[slot].values = [];
    for (let i = 0; i < this.tiles.length; i++) {
      this.saves[slot].values.push({ pos: this.tiles[i].pos, value: this.tiles[i].value });
    }
    return this;
  }
  public restore(slot: 1 | 2 | 'full' | 'empty'): Grid {
    var saveSlot = this.saves[slot];
    if (!saveSlot) {
      console.log('Cannot restore save slot ', slot);
      return this;
    }
    this.tiles = [];
    let type = (v: Number) => {
      return (v == -2 ? TileType.Dot : (v == -1 ? TileType.Unknown : (v == 0 ? TileType.Wall : TileType.Value)))
    }
    for (var i = 0; i < saveSlot.values.length; i++) {
      let value = saveSlot.values[i];
      this.tiles.push(new Tile(value.pos, value.value, type(value.value)))
    }
    return this;
  }
  public check(): boolean {
    for (let i = 0; i < (this.size * this.size); i++) {
      const x = i % this.size;
      const y = Math.floor(i / this.size);
      let tile = this.tile({ x, y }) ?? this.tiles[y * this.size + x]
      if (!tile.isValue() && !tile.isDot()) continue;
      let count = 0;
      for (let dir of Directions) {
        for (let t: any = tile.move(dir, this); t && !t.isWall(); t = t.move(dir, this)) {
          if (t.isValue() || t.isDot())
            count++;
        }
      }
      if (tile.isDot() && count <= 0) return false;
      if (!tile.isDot() && count != tile.value) return false;
    }
    return true;
  }
  public fillValues(): Grid {
    for (let i = 0; i < (this.size * this.size); i++) {
      const x = i % this.size;
      const y = Math.floor(i / this.size);
      let tile = this.tile({ x, y }) ?? this.tiles[y * this.size + x]
      if (!tile.isDot()) continue;
      let count = 0;
      for (let dir of Directions) {
        for (let t: any = tile.move(dir, this); t && !t.isWall(); t = t.move(dir, this)) {
          if (t.isValue() || t.isDot())
            count++;
        }
      }
      tile.setValue(count);
    }
    return this;
  }

  public fillDots(overWriteNumbers: boolean): Grid {
    let tiles = this.tiles;
    for (let i = 0; i < tiles.length; i++) {
      var tile = tiles[i];
      if (tile.type == TileType.Unknown)
        tile.dot();
      if (tile.type == TileType.Value && overWriteNumbers)
        tile.dot();
    }
    return this;
  }
  public tile(pos: Position): Tile | undefined {
    return this.tiles.find(t => t.pos.x === pos.x && t.pos.y === pos.y);
  }
  public isDone(): boolean {
    for (let i = 0; i < this.tiles.length; i++) {
      if (this.tiles[i].type == TileType.Unknown || this.tiles[i].type == TileType.Dot)
        return false;
    }
    return true;
  }
}

export type Save = {
  1: {
    values: SaveValue[]
  },
  2: {
    values: SaveValue[]
  },
  'full': {
    values: SaveValue[]
  },
  'empty': {
    values: SaveValue[]
  }
}

export type SaveValue = {
  pos: Position,
  value: Number
}
function save(arg0: string) {
  throw new Error("Function not implemented.");
}

