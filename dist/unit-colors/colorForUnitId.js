import colorList from "./colorList";
var colorForUnitId = function (unitId) {
    return colorList[unitId % colorList.length];
};
export default colorForUnitId;
//# sourceMappingURL=colorForUnitId.js.map