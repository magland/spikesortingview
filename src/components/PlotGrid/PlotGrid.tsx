import { Grid } from '@material-ui/core';
import React, { FunctionComponent, useMemo } from 'react';

type PGPlot = {
    // numericId: number,
    key: string,
    label: string,
    labelColor: string,
    clickHandler?: (evt: React.MouseEvent) => void,
    props: {[key: string]: any}
}

type Props = {
    plots: PGPlot[]
    plotComponent: React.ComponentType<any>
    selectedPlotKeys?: Set<number>
    numPlotsPerRow?: number
    orderedPlotIds?: number[]
}

const voidFn = (evt: React.MouseEvent) => {}

type PlotGridRowData = {
    rowStart: number,
    maxItems?: number,
    selectedPlotKeys?: Set<number>
    plotIds: number[],
    plotsDict: {[key: number]: JSX.Element}
}
const PlotRow: FunctionComponent<PlotGridRowData> = (props: PlotGridRowData) => {
    const { rowStart, maxItems, plotIds, selectedPlotKeys, plotsDict } = props
    const rowEnd = maxItems || plotIds.length
    const idsThisRow = plotIds.slice(rowStart, rowEnd)
    return <Grid key={rowStart} container>
            {
                idsThisRow.map(id => {
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

const PlotGrid: FunctionComponent<Props> = ({plots, plotComponent, orderedPlotIds, selectedPlotKeys, numPlotsPerRow}) => {
    const Component = plotComponent

    // Don't rerender the individual plots with every pass
    const _plotsDict = useMemo(() => {
        const contents = Object.assign(
            {},
            ...plots.map((p) => {
                const rendered = <div
                    data-key={p.key}
                    onClick={p.clickHandler || voidFn}
                >
                    <div style={{fontWeight: 'bold', textAlign: 'center'}}>
                        <span style={{color: p.labelColor}}>{p.label}</span>
                    </div>
                    <Component {...p.props} />
                </div>
                // return {[p.numericId]: rendered}
                return {[Number(p.key)]: rendered}
            })
        )
        return contents as any as {[key: number]: JSX.Element}
    }, [plots, Component])
    
    const rowStarts = Array(plots.length).fill(0).map((x, ii) => ii).filter(i => i % (numPlotsPerRow || plots.length) === 0)
    const plotIds = useMemo(() => {
        console.log(`Caught reordering of ids, now using ${orderedPlotIds}`)
        return orderedPlotIds || plots.map(p => Number(p.key))
    }, [plots, orderedPlotIds])
        

    return (
        <Grid container>
            {
                rowStarts.map((start) => (
                    <PlotRow
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