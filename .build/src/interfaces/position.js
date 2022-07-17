var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __markAsModule = (target) => __defProp(target, "__esModule", { value: true });
var __export = (target, all) => {
  __markAsModule(target);
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __reExport = (target, module2, desc) => {
  if (module2 && typeof module2 === "object" || typeof module2 === "function") {
    for (let key of __getOwnPropNames(module2))
      if (!__hasOwnProp.call(target, key) && key !== "default")
        __defProp(target, key, { get: () => module2[key], enumerable: !(desc = __getOwnPropDesc(module2, key)) || desc.enumerable });
  }
  return target;
};
var __toModule = (module2) => {
  return __reExport(__markAsModule(__defProp(module2 != null ? __create(__getProtoOf(module2)) : {}, "default", module2 && module2.__esModule && "default" in module2 ? { get: () => module2.default, enumerable: true } : { value: module2, enumerable: true })), module2);
};
__export(exports, {
  down: () => down,
  isInside: () => isInside,
  left: () => left,
  move: () => move,
  posEqual: () => posEqual,
  right: () => right,
  up: () => up
});
var import_direction = __toModule(require("./direction"));
const up = (pos) => ({ x: pos.x, y: pos.y - 1 });
const down = (pos) => ({ x: pos.x, y: pos.y + 1 });
const left = (pos) => ({ x: pos.x - 1, y: pos.y });
const right = (pos) => ({ x: pos.x + 1, y: pos.y });
const move = (pos, dir) => {
  switch (dir) {
    case import_direction.Direction.UP:
      return up(pos);
    case import_direction.Direction.DOWN:
      return down(pos);
    case import_direction.Direction.LEFT:
      return left(pos);
    case import_direction.Direction.RIGHT:
      return right(pos);
  }
};
const posEqual = (pos1, pos2) => {
  return pos1.x === pos2.x && pos1.y === pos2.y;
};
const isInside = (pos, width, height) => {
  return pos.x >= 0 && pos.y >= 0 && pos.x < width && pos.y < height;
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  down,
  isInside,
  left,
  move,
  posEqual,
  right,
  up
});
//# sourceMappingURL=position.js.map
