import { useSelectedElectrodes } from 'contexts/RecordingSelectionContext'
import { useSelectedUnitIds } from 'contexts/UnitSelection/UnitSelectionContext'
import BaseCanvas from 'FigurlCanvas/BaseCanvas'
import { pointInRect, RectangularRegion, rectangularRegionsIntersect, transformPoint, Vec2, Vec4 } from 'FigurlCanvas/Geometry'
import { useCallback, useMemo } from 'react'
import { idToNum } from 'views/AverageWaveforms/AverageWaveformsView'
import { computeElectrodeLocations } from 'views/AverageWaveforms/WaveformWidget/sharedDrawnComponents/electrodeGeometryLayout'
import colorForUnitId from 'views/common/ColorHandling/colorForUnitId'
import { defaultColors, ElectrodeColors } from '../AverageWaveforms/WaveformWidget/sharedDrawnComponents/electrodeGeometryPainting'
import useDragSelectLayer from './useDragSelectLayer'

export const defaultMaxPixelRadius = 25
const circle = 2 * Math.PI

export type Electrode = {
    id: (number | string)
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
    disableAutoRotate?: boolean
}

const defaultElectrodeLayerProps = {
    showLabels: true,
    maxElectrodePixelRadius: defaultMaxPixelRadius
}


const emptyDrawData = {}

const markerRadius = 8

const UnitLocationsWidget = (props: WidgetProps) => {
    const { width, height, electrodes, units, disableAutoRotate } = props
    const { selectedElectrodeIds } = useSelectedElectrodes()
    const { selectedUnitIds, unitIdSelectionDispatch } = useSelectedUnitIds()

    const maxElectrodePixelRadius = props.maxElectrodePixelRadius || defaultElectrodeLayerProps.maxElectrodePixelRadius
    const colors = props.colors ?? defaultColors
    const showLabels = props.showLabels ?? false
    const offsetLabels = props.offsetLabels ?? false

    const { convertedElectrodes: pixelElectrodes, pixelRadius, transform } = useMemo(() => (
        computeElectrodeLocations(width, height, electrodes, 'geom', maxElectrodePixelRadius, {disableAutoRotate})
    ), [electrodes, height, maxElectrodePixelRadius, width, disableAutoRotate])

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
        ctxt.clearRect(0, 0, ctxt.canvas.width, ctxt.canvas.height)
        const drawUnit = (x: number, y: number, color: string) => {
            ctxt.fillStyle = color
            ctxt.strokeStyle = 'black'
            ctxt.beginPath()
            ctxt.ellipse(x, y, markerRadius, markerRadius, 0, 0, circle)
            ctxt.fill()
            ctxt.stroke()
        }
        for (let unit of units) {
            const pt = transformPoint(transform, [unit.x, unit.y])
            const col = selectedUnitIds.size === 0 || selectedUnitIds.has(unit.unitId) ? (
                colorForUnitId(idToNum(unit.unitId))
            ) : 'rgb(220, 220, 220)'
            drawUnit(pt[0], pt[1], col)
        }
    }, [transform, units, selectedUnitIds])

    const electrodeGeometryCanvas = useMemo(() => {
        return <BaseCanvas 
            width={width}
            height={height}
            draw={paintElectrodes}
            drawData={emptyDrawData}
        />
    }, [width, height, paintElectrodes])

    const unitsCanvas = useMemo(() => {
        return <BaseCanvas 
            width={width}
            height={height}
            draw={paintUnits}
            drawData={emptyDrawData}
        />
    }, [width, height, paintUnits])

    const handleSelectRect = useCallback((r: Vec4, {ctrlKey}: {ctrlKey: boolean}) => {
        const ids: (number | string)[] = []
        for (let unit of units) {
            const pt = transformPoint(transform, [unit.x, unit.y])
            if (rectangularRegionsIntersect(rectangularRegion([pt[0] - markerRadius, pt[1] - markerRadius, markerRadius * 2, markerRadius * 2]), rectangularRegion(r))) {
                ids.push(unit.unitId)
            }
        }
        if (ctrlKey) {
            for (let id of ids) {
                unitIdSelectionDispatch({
                    type: 'TOGGLE_UNIT',
                    targetUnit: id
                })
            }
        }
        else {
            unitIdSelectionDispatch({
                type: 'SET_SELECTION',
                incomingSelectedUnitIds: ids
            })
        }
    }, [transform, unitIdSelectionDispatch, units])

    const handleClickPoint = useCallback((x: Vec2, {ctrlKey}: {ctrlKey: boolean}) => {
        let somethingFound = false
        for (let unit of units) {
            const pt = transformPoint(transform, [unit.x, unit.y])
            if (pointInRect(x, rectangularRegion([pt[0] - markerRadius, pt[1] - markerRadius, markerRadius * 2, markerRadius * 2]))) {
                somethingFound = true
                if (ctrlKey) {
                    unitIdSelectionDispatch({
                        type: 'TOGGLE_UNIT',
                        targetUnit: unit.unitId
                    })
                }
                else {
                    unitIdSelectionDispatch({
                        type: 'SET_SELECTION',
                        incomingSelectedUnitIds: [unit.unitId]
                    })
                }
            }
        }
        if (!somethingFound) {
            unitIdSelectionDispatch({
                type: 'SET_SELECTION',
                incomingSelectedUnitIds: []
            })
        }
    }, [transform, unitIdSelectionDispatch, units])

    const {onMouseMove, onMouseDown, onMouseUp, paintDragSelectLayer} = useDragSelectLayer(width, height, handleSelectRect, handleClickPoint)
    const dragSelectCanvas = useMemo(() => {
        return <BaseCanvas 
            width={width}
            height={height}
            draw={paintDragSelectLayer}
            drawData={emptyDrawData}
        />
    }, [width, height, paintDragSelectLayer])

    return (
        <div
            style={{width, height, position: 'relative'}}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseDown={onMouseDown}
        >
            {electrodeGeometryCanvas}
            {unitsCanvas}
            {dragSelectCanvas}
        </div>
    )
}

const rectangularRegion = (r: Vec4): RectangularRegion => {
    return {
        xmin: r[0],
        ymin: r[1],
        xmax: r[0] + r[2],
        ymax: r[1] + r[3]
    }
}

export default UnitLocationsWidget