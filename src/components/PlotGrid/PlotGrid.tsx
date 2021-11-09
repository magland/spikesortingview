import { Grid } from '@material-ui/core';
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
    selectedPlotKeys?: string[]
    setSelectedPlotKeys?: (keys: string[]) => void
    numPlotsPerRow?: number
}

const PlotGrid: FunctionComponent<Props> = ({plots, plotComponent, selectedPlotKeys, setSelectedPlotKeys, numPlotsPerRow}) => {
    const Component = plotComponent
    const handlePlotClick = useCallback((event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        if (!setSelectedPlotKeys) return
        if (!selectedPlotKeys) return
        const key = event.currentTarget.dataset.key
        if (!key) return
        if (event.ctrlKey) {
            if (selectedPlotKeys.includes(key)) {
                setSelectedPlotKeys(selectedPlotKeys.filter(k => (k !== key)))
            }
            else {
                setSelectedPlotKeys([...selectedPlotKeys, key])
            }
        }
        else {
            setSelectedPlotKeys([key])
        }
    }, [selectedPlotKeys, setSelectedPlotKeys])
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
                                            className={selectedPlotKeys?.includes(plot.key) ? 'plotSelectedStyle' : 'plotUnselectedStyle'}
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