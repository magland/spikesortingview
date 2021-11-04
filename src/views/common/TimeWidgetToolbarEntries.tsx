import { PanDirection, ZoomDirection } from 'contexts/RecordingSelectionContext'
import { FaArrowLeft, FaArrowRight, FaSearchMinus, FaSearchPlus } from 'react-icons/fa'
import { ToolbarItem } from './Toolbars'

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
            icon: <FaSearchPlus />
        },
        {
            type: 'button',
            title: "Time zoom out (-)",
            callback: handleZoomTimeOut,
            icon: <FaSearchMinus />
        },
        {
            type: 'button',
            title: "Shift time window back [left arrow]",
            callback: handleShiftTimeLeft,
            icon: <FaArrowLeft />
        },
        {
            type: 'button',
            title: "Shift time window forward [right arrow]",
            callback: handleShiftTimeRight,
            icon: <FaArrowRight />
        }
    ]
}

export default TimeWidgetToolbarEntries