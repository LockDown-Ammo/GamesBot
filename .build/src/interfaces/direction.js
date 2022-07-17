var __defProp = Object.defineProperty;
var __markAsModule = (target) => __defProp(target, "__esModule", { value: true });
var __export = (target, all) => {
  __markAsModule(target);
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
__export(exports, {
  Direction: () => Direction,
  oppositeDir: () => oppositeDir
});
var Direction;
(function(Direction2) {
  Direction2[Direction2["UP"] = 0] = "UP";
  Direction2[Direction2["DOWN"] = 1] = "DOWN";
  Direction2[Direction2["LEFT"] = 2] = "LEFT";
  Direction2[Direction2["RIGHT"] = 3] = "RIGHT";
})(Direction || (Direction = {}));
const oppositeDir = (dir) => {
  switch (dir) {
    case 0:
      return 1;
    case 1:
      return 0;
    case 2:
      return 3;
    case 3:
      return 2;
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Direction,
  oppositeDir
});
//# sourceMappingURL=direction.js.map
