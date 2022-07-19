import { Grid } from '@material-ui/core';
import { voidClickHandler } from 'contexts/UnitSelection/UnitSelectionFunctions';
import React, { FunctionComponent, useMemo } from 'react';
import ReactVisibilitySensor from 'react-visibility-sensor';

export type PGPlot = {
    key: string | number,
    unitId: string | number,
    label: string,
    labelColor: string,
    clickHandler?: (evt: React.MouseEvent) => void,
    props: {[key: string]: any}
}

type Props = {
    plots: PGPlot[]
    plotComponent: React.ComponentType<any>
    selectedPlotKeys?: Set<number | string>
    numPlotsPerRow?: number
}

type PlotGridRowData = {
    rowStart: number,
    maxItems?: number,
    selectedPlotKeys?: Set<number | string>
    plotIds: (number | string)[],
    plotsDict: {[key: number | string]: JSX.Element}
}
const PlotRow: FunctionComponent<PlotGridRowData> = (props: PlotGridRowData) => {
    const { rowStart, maxItems, plotIds, selectedPlotKeys, plotsDict } = props
    const rowEnd = maxItems || plotIds.length
    const idsThisRow = plotIds.slice(rowStart, rowStart + rowEnd)
    return <Grid key={rowStart} container>
            {
                idsThisRow.filter(id => (plotsDict[id])).map(id => {
                    const className = `plotWrapperStyle plot${selectedPlotKeys?.has(id) ? 'S' : 'Uns'}electedStyle`
                    return (
                        <Grid key={id} item>
                            <div className={className}>
                                {plotsDict[id]}
                            </div>
                        </Grid>
                    )
                })
            }
        </Grid>
}

const PlotGrid: FunctionComponent<Props> = ({plots, plotComponent, selectedPlotKeys, numPlotsPerRow}) => {
    const Component = plotComponent

    // Don't rerender the individual plots with every pass
    // This code renders the individual components, memoized based on Component type and plot data, and then
    // loads them into a dictionary mapping the ID to the rendered plot (with label and interactivity function).
    // TODO: keep items from previous iterations somehow?
    const _plotsDict = useMemo(() => {
        const contents = Object.assign(
            {},
            ...plots.map((p) => {
                const rendered =
                    <div
                        data-key={p.key}
                        onClick={p.clickHandler || voidClickHandler}
                    >
                        <div className={'plotLabelStyle'} style={{maxWidth: p.props.width, userSelect: 'none'}}>
                            <span style={{color: p.labelColor}}>{p.label || <span>&nbsp;</span>}</span>
                        </div>
                        <ReactVisibilitySensor partialVisibility={true}>
                            {({isVisible}) => (
                                isVisible ? (
                                    <Component {...p.props} />
                                ) : (
                                    <div style={{position: 'relative', width: p.props.width, height: p.props.height}}>Not visible</div>
                                )
                            )}
                        </ReactVisibilitySensor>
                        
                    </div>
                    return {[p.key]: rendered}
            })
        )
        return contents as any as {[key: number]: JSX.Element}
    }, [plots, Component])
    
    const rowStarts = Array(plots.length).fill(0).map((x, ii) => ii).filter(i => i % (numPlotsPerRow || plots.length) === 0)
    const plotIds = useMemo(() => {
        return plots.map(p => p.key)
    }, [plots])

    return (
        <Grid container spacing={0}>
            {
                rowStarts.map((start) => (
                    <PlotRow
                        key={`row-${start}`}
                        rowStart={start}
                        maxItems={numPlotsPerRow}
                        plotIds={plotIds}
                        selectedPlotKeys={selectedPlotKeys}
                        plotsDict={_plotsDict}
                    />
                ))
            }
        </Grid>
    )
}

export default PlotGrid