import Grid from "../base/grid"
import Tile from "../base/tile"

const Utils = {
    shuffle: (pool: Tile[]): Tile[] => {
        for (let i = 0; i < pool.length - 1; i++) {
            let index = Math.floor(Math.random() * (pool.length - i));
            let temp = pool[index];
            pool[index] = pool[i];
            pool[i] = temp;
        }
        return pool;
    }
}

export default Utils