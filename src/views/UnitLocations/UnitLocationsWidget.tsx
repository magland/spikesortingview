import { useSelectedElectrodes } from 'contexts/RecordingSelectionContext'
import BaseCanvas from 'FigurlCanvas/BaseCanvas'
import { transformPoint } from 'FigurlCanvas/Geometry'
import { useCallback, useMemo } from 'react'
import { computeElectrodeLocations } from 'views/AverageWaveforms/WaveformWidget/sharedDrawnComponents/electrodeGeometryLayout'
import { defaultColors, ElectrodeColors } from '../AverageWaveforms/WaveformWidget/sharedDrawnComponents/electrodeGeometryPainting'

export const defaultMaxPixelRadius = 25
const circle = 2 * Math.PI

export type Electrode = {
    id: number
    label: string
    x: number
    y: number
}

export type PixelSpaceElectrode = {
    e: Electrode
    pixelX: number
    pixelY: number
}

export type LayoutMode = 'geom' | 'vertical'

interface WidgetProps {
    electrodes: Electrode[],
    width: number
    height: number
    units: {
        unitId: string | number
        x: number
        y: number
    }[]
    colors?: ElectrodeColors
    showLabels?: boolean
    maxElectrodePixelRadius?: number
    offsetLabels?: boolean
}

const defaultElectrodeLayerProps = {
    showLabels: true,
    maxElectrodePixelRadius: defaultMaxPixelRadius
}


const drawData = {}

const UnitLocationsWidget = (props: WidgetProps) => {
    const { width, height, electrodes, units } = props
    const { selectedElectrodeIds } = useSelectedElectrodes()

    const maxElectrodePixelRadius = props.maxElectrodePixelRadius || defaultElectrodeLayerProps.maxElectrodePixelRadius
    const colors = props.colors ?? defaultColors
    const showLabels = props.showLabels ?? false
    const offsetLabels = props.offsetLabels ?? false

    const { convertedElectrodes: pixelElectrodes, pixelRadius, transform } = useMemo(() => (
        computeElectrodeLocations(width, height, electrodes, 'geom', maxElectrodePixelRadius)
    ), [electrodes, height, maxElectrodePixelRadius, width])

    const paintElectrodes = useCallback((ctxt: CanvasRenderingContext2D, props: any) => {
        // set up fills
        const electrodesWithColors = pixelElectrodes.map(e => {
            const selected = selectedElectrodeIds.includes(e.e.id)
            const hovered = false
            const dragged = false
            const color = selected 
                ? dragged
                    ? colors.draggedSelected
                    : hovered
                        ? colors.selectedHover
                        : colors.selected
                : dragged
                    ? colors.dragged
                    : hovered
                        ? colors.hover
                        : colors.base
            return {
                ...e,
                color: color,
                textColor: (selected || (hovered && !dragged)) ? colors.textDark : colors.textLight
            }
        })

        ctxt.clearRect(0, 0, ctxt.canvas.width, ctxt.canvas.height)
        // Draw fills
        // all-colors-at-once style: involves a lot fewer strokes & state resets but probably not enough to matter
        // (or to justify the extra complication of breaking out the electrodes into subgroups)
        // electrodesWithColors.sort((a, b) => { return a.color.localeCompare(b.color) })
        // let lastColor = ''
        // electrodesWithColors.forEach(e => {
        //     if (lastColor !== e.color) {
        //         ctxt.fill()
        //         lastColor = e.color
        //         ctxt.fillStyle = e.color
        //         ctxt.beginPath()
        //     }
        // })
        electrodesWithColors.forEach(e => {
            ctxt.fillStyle = e.color
            ctxt.beginPath()
            ctxt.ellipse(e.pixelX, e.pixelY, pixelRadius, pixelRadius, 0, 0, circle)
            ctxt.fill()
        })

        // Draw borders
        ctxt.strokeStyle = defaultColors.border
        pixelElectrodes.forEach(e => {
            ctxt.beginPath()
            ctxt.ellipse(e.pixelX, e.pixelY, pixelRadius, pixelRadius, 0, 0, circle)
            ctxt.stroke()
        })

        // draw electrode labels
        if (showLabels) {
            ctxt.font = `${pixelRadius}px Arial`
            ctxt.textAlign = offsetLabels ? 'right' : 'center'
            ctxt.textBaseline = 'middle'
            const xOffset = offsetLabels ? 1.4 * pixelRadius : 0
            electrodesWithColors.forEach(e => {
                ctxt.fillStyle = offsetLabels ? colors.textDark : e.textColor
                ctxt.fillText(`${e.e.label}`, e.pixelX - xOffset, e.pixelY)
            })
        }
    }, [colors, offsetLabels, pixelElectrodes, pixelRadius, selectedElectrodeIds, showLabels])

    const paintUnits = useCallback((ctxt: CanvasRenderingContext2D, props: any) => {
        const rad = 10
        const drawUnit = (x: number, y: number) => {
            ctxt.fillStyle = 'white'
            ctxt.strokeStyle = 'black'
            ctxt.beginPath()
            ctxt.ellipse(x, y, rad, rad, 0, 0, circle)
            ctxt.fill()
            ctxt.stroke()
        }
        for (let unit of units) {
            const pt = transformPoint(transform, [unit.x, unit.y])
            drawUnit(pt[0], pt[1])
        }
    }, [transform, units])

    const electrodeGeometryCanvas = useMemo(() => {
        return <BaseCanvas 
            width={width}
            height={height}
            draw={paintElectrodes}
            drawData={drawData}
        />
    }, [width, height, paintElectrodes])

    const unitsCanvas = useMemo(() => {
        return <BaseCanvas 
            width={width}
            height={height}
            draw={paintUnits}
            drawData={drawData}
        />
    }, [width, height, paintUnits])

    return (
        <div style={{width, height, position: 'relative'}}>
            {electrodeGeometryCanvas}
            {unitsCanvas}
        </div>
    )
}

export default UnitLocationsWidget