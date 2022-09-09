import { useTimeRange } from 'libraries/context-recording-selection';
import { ViewToolbar } from 'libraries/ViewToolbar';
import React, { FunctionComponent, useMemo } from 'react';
import { TimeWidgetToolbarEntries } from 'libraries/component-time-scroll-view';
import { ViewComponentProps } from 'views/SortingLayout/LayoutItemView';
import { MultiTimeseriesViewData } from './MultiTimeseriesViewData';
import ViewWrapper from './ViewWrapper';

type Props = {
    data: MultiTimeseriesViewData
    ViewComponent: FunctionComponent<ViewComponentProps>
    width: number
    height: number
}

const MultiTimeseriesView: FunctionComponent<Props> = ({data, ViewComponent, width, height}) => {
    const divStyle: React.CSSProperties = useMemo(() => ({
        width,
        height,
        overflowX: 'hidden',
        overflowY: 'auto'
    }), [width, height])

    const { zoomRecordingSelection, panRecordingSelection } = useTimeRange()
    const timeControlActions = useMemo(() => {
        if (!zoomRecordingSelection || !panRecordingSelection) return []
        return TimeWidgetToolbarEntries({zoomRecordingSelection, panRecordingSelection})
    }, [zoomRecordingSelection, panRecordingSelection])
    const horizontalToolbarTopPadding = 15
    const toolbarHeight = 30
    const effectiveHeight = height - toolbarHeight - horizontalToolbarTopPadding

    const total_height_allocated = data.panels.reduce((total, panel) => total + (panel?.relativeHeight ?? 1), 0)
    const unit_height = Math.floor(effectiveHeight / total_height_allocated)

    return (
        <div style={divStyle}>
            <ViewToolbar
                width={width}
                height={toolbarHeight}
                topPadding={horizontalToolbarTopPadding}
                customActions={timeControlActions}
                useHorizontalLayout={true}
            />
            {
                data.panels.map((panel, ii) => (
                    <div key={ii}>
                        <ViewWrapper
                            label={panel.label}
                            figureDataSha1={panel.figureDataSha1} // old
                            figureDataUri={panel.figureDataUri} // new
                            ViewComponent={ViewComponent}
                            isBottomPanel={ii === (data.panels.length - 1)}
                            width={width}
                            height={Math.floor(unit_height * (panel?.relativeHeight ?? 1))}
                        />
                    </div>
                ))
            }
        </div>
    )
}

export default MultiTimeseriesView