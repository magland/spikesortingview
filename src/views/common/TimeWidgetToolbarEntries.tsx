import { PanDirection, ZoomDirection } from 'libraries/context-recording-selection'
import { ToolbarItem } from 'libraries/ViewToolbar'
import { FaArrowLeft, FaArrowRight, FaSearchMinus, FaSearchPlus } from 'react-icons/fa'

interface TimeWidgetToolbarProps {
    zoomRecordingSelection: (direction: ZoomDirection, factor?: number) => void
    panRecordingSelection: (direction: PanDirection, pct?: number) => void
}

export const DefaultToolbarWidth = 36


const TimeWidgetToolbarEntries = (props: TimeWidgetToolbarProps): ToolbarItem[] => {
    const { zoomRecordingSelection, panRecordingSelection } = props

    const handleZoomTimeIn = () => zoomRecordingSelection('in')

    const handleZoomTimeOut = () => zoomRecordingSelection('out')

    const handleShiftTimeLeft = () => panRecordingSelection('back')

    const handleShiftTimeRight = () => panRecordingSelection('forward')

    return [
        {
            type: 'button',
            title: "Time zoom in (+)",
            callback: handleZoomTimeIn,
            icon: <FaSearchPlus />,
            keyCode: 173
        },
        {
            type: 'button',
            title: "Time zoom out (-)",
            callback: handleZoomTimeOut,
            icon: <FaSearchMinus />,
            keyCode: 61
        },
        {
            type: 'button',
            title: "Shift time window back [left arrow]",
            callback: handleShiftTimeLeft,
            icon: <FaArrowLeft />,
            keyCode: 37
        },
        {
            type: 'button',
            title: "Shift time window forward [right arrow]",
            callback: handleShiftTimeRight,
            icon: <FaArrowRight />,
            keyCode: 39
        }
    ]
}

export default TimeWidgetToolbarEntries