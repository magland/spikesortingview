import { Grid } from '@material-ui/core';
import React, { FunctionComponent, useCallback } from 'react';

type Props = {
    plots: {
        key: string,
        label: string,
        labelColor: string,
        props: {[key: string]: any}
    }[]
    plotComponent: React.ComponentType<any>
    selectedPlotKeys?: string[]
    setSelectedPlotKeys?: (keys: string[]) => void
}

const PlotGrid: FunctionComponent<Props> = ({plots, plotComponent, selectedPlotKeys, setSelectedPlotKeys}) => {
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
    return (
        <Grid container>
            {
                plots.map(plot => (
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
    )
}

export default PlotGrid