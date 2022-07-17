var __defProp = Object.defineProperty;
var __markAsModule = (target) => __defProp(target, "__esModule", { value: true });
var __export = (target, all) => {
  __markAsModule(target);
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
__export(exports, {
  ResultType: () => ResultType
});
var ResultType;
(function(ResultType2) {
  ResultType2["TIMEOUT"] = "timeout";
  ResultType2["WINNER"] = "winner";
  ResultType2["LOSER"] = "loser";
  ResultType2["TIE"] = "tie";
  ResultType2["ERROR"] = "error";
  ResultType2["DELETED"] = "deleted";
})(ResultType || (ResultType = {}));
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ResultType
});
//# sourceMappingURL=gameResult.js.map
