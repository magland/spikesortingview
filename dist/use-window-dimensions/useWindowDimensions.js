import { useEffect, useState } from 'react';
// Thanks: https://stackoverflow.com/questions/36862334/get-viewport-window-height-in-reactjs
function getWindowDimensions() {
    var width = window.innerWidth, height = window.innerHeight;
    return {
        width: width,
        height: height
    };
}
var useWindowDimensions = function () {
    var _a = useState(getWindowDimensions()), windowDimensions = _a[0], setWindowDimensions = _a[1];
    useEffect(function () {
        function handleResize() {
            setWindowDimensions(getWindowDimensions());
        }
        window.addEventListener('resize', handleResize);
        return function () { return window.removeEventListener('resize', handleResize); };
    }, []);
    return windowDimensions;
};
//////////////////////////////////////////////////////////////////////////////////////////////////
export default useWindowDimensions;
//# sourceMappingURL=useWindowDimensions.js.map