import { Grid } from '@material-ui/core';
import { RowSelectionAction, TOGGLE_ROW, UNIQUE_SELECT } from 'contexts/RowSelectionContext';
import React, { FunctionComponent, useCallback } from 'react';

type PGPlot = {
    key: string,
    label: string,
    labelColor: string,
    props: {[key: string]: any}
}

type Props = {
    plots: PGPlot[]
    plotComponent: React.ComponentType<any>
    selectedPlotKeys?: Set<number>
    selectionDispatch?: (action: RowSelectionAction) => void
    numPlotsPerRow?: number
}

const PlotGrid: FunctionComponent<Props> = ({plots, plotComponent, selectedPlotKeys, selectionDispatch, numPlotsPerRow}) => {
    const Component = plotComponent
    const handlePlotClick = useCallback((event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        if (!selectionDispatch) return
        if (!selectedPlotKeys) return
        const key = event.currentTarget.dataset.key
        if (!key) return
        if (event.ctrlKey) {
            selectionDispatch({type: TOGGLE_ROW, targetRow: Number(key)})
        }
        else {
            selectionDispatch({type: UNIQUE_SELECT, targetRow: Number(key)})
        }
    }, [selectedPlotKeys, selectionDispatch])
    const plotRows = numPlotsPerRow === undefined ? [
        {plots}
    ] : splitPlotsIntoRows(plots, numPlotsPerRow)
    return (
        <Grid container>
            {
                plotRows.map((plotRow, jj) => (
                    <Grid key={jj} container>
                        {
                            plotRow.plots.map(plot => (
                                <Grid key={plot.key} item>
                                    <div className='plotWrapperStyle'>
                                        <div
                                            data-key={plot.key}
                                            className={selectedPlotKeys?.has(Number(plot.key)) ? 'plotSelectedStyle' : 'plotUnselectedStyle'}
                                            onClick={handlePlotClick}
                                        >
                                            <div style={{fontWeight: 'bold', textAlign: 'center'}}>
                                                <div style={{color: plot.labelColor}}>{plot.label}</div>
                                            </div>
                                            <Component
                                                {...plot.props}
                                            />
                                        </div>
                                    </div>
                                </Grid>
                            ))
                        }
                    </Grid>
                ))
            }
        </Grid>
    )
}

const splitPlotsIntoRows = (plots: PGPlot[], numPlotsPerRow: number) => {
    const ret: {plots: PGPlot[]}[] = []
    let i = 0
    while (i < plots.length) {
        ret.push({
            plots: plots.slice(i, i + numPlotsPerRow)
        })
        i += numPlotsPerRow
    }
    return ret
}

export default PlotGrid