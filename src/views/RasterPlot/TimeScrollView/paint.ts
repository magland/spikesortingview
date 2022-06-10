import { TickSet } from "views/common/TimeScrollView/YAxisTicks";
import { TimeScrollViewPanel, TimeTick } from "./TimeScrollView";
import { TSVAxesLayerProps } from "./TSVAxesLayer";
import { TSVHighlightLayerProps } from './TSVHighlightLayer';
import { MainLayerProps } from "./TSVMainLayer";

export const paintPanels = <T extends {[key: string]: any}>(context: CanvasRenderingContext2D, props: MainLayerProps<T>) => {
    const {margins, panels, perPanelOffset } = props
    context.resetTransform()
    context.clearRect(0, 0, context.canvas.width, context.canvas.height)
    context.translate(margins.left, margins.top)
    for (let i = 0; i < panels.length; i++) {
        const p = panels[i]
        p.paint(context, p.props)
        context.translate(0, perPanelOffset)
    }
}

const highlightedRowFillStyle = '#c5e1ff' // TODO: This should be standardized across the application

// some nice purples: [161, 87, 201], or darker: [117, 56, 150]
// dark blue: 0, 30, 255
const defaultSpanHighlightColor = [0, 30, 255]

export const paintSpanHighlights = (context: CanvasRenderingContext2D, props: TSVHighlightLayerProps) => {
    const { height, margins, highlightSpans } = props
    context.clearRect(0, 0, context.canvas.width, context.canvas.height)
    if (!highlightSpans || highlightSpans.length === 0) { return }

    const visibleHeight = height - margins.bottom - margins.top
    const zeroHeight = margins.top
    highlightSpans.forEach(h => {
        const definedColor = h.color || defaultSpanHighlightColor
        const [r, g, b, a] = [...definedColor]
        if (a) context.fillStyle = `rgba(${r}, ${g}, ${b}, ${a})`

        h.pixelSpans.forEach((span) => {
            if (!a) {
                const alpha = span.width < 2 ? 1 : 0.2
                context.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`
            }
            context.fillRect(span.start, zeroHeight, span.width, visibleHeight)
        })
    })
}


export const paintAxes = <T extends {[key: string]: any}>(context: CanvasRenderingContext2D, props: TSVAxesLayerProps<T> & {'selectedPanelKeys': Set<number | string>}) => {
    // I've left the timeRange in the props list since we will probably want to display something with it at some point
    const {width, height, margins, panels, panelHeight, perPanelOffset, selectedPanelKeys, yTickSet, timeTicks, hideTimeAxis} = props
    context.clearRect(0, 0, context.canvas.width, context.canvas.height)

    const xAxisVerticalPosition = height - margins.bottom
    paintTimeTicks(context, timeTicks, hideTimeAxis, xAxisVerticalPosition, margins.top)
    if (!hideTimeAxis) {
        context.strokeStyle = 'black'
        drawLine(context, margins.left, xAxisVerticalPosition, width - margins.right, xAxisVerticalPosition)
    }
    yTickSet && paintYTicks(context, yTickSet, xAxisVerticalPosition, margins.left, width - margins.right, margins.top)
    paintPanelHighlights(context, panels, selectedPanelKeys, margins.top, width, perPanelOffset, panelHeight)
    paintPanelLabels(context, panels, margins.left, margins.top, perPanelOffset, panelHeight)
}

// TODO: This logic is highly similar to paintTimeTicks. Try to unify.
const paintYTicks = (context: CanvasRenderingContext2D, tickSet: TickSet, xAxisYCoordinate: number, yAxisXCoordinate: number, plotRightPx: number, topMargin: number) => {
    const labelOffsetFromGridline = 2
    const gridlineLeftEdge = yAxisXCoordinate - 5
    const labelRightEdge = gridlineLeftEdge - labelOffsetFromGridline
    const { datamax, datamin, ticks } = tickSet
    context.fillStyle = 'black'
    context.textAlign = 'right'
    // Range-end labels
    const stringMax = datamax.toString()
    const printMax = stringMax.substring(0, 5).search(".") === -1 ? 5 : 6
    const stringMin = datamin.toString()
    const printMin = stringMin.substring(0, 5).search(".") === -1 ? 5 : 6
    context.textBaseline = 'bottom'
    context.fillText(stringMax.substring(0, printMax), labelRightEdge, topMargin)
    context.textBaseline = 'top'
    context.fillText(datamin.toString().substring(0, printMin), labelRightEdge, xAxisYCoordinate)

    context.textBaseline = 'middle'
    ticks.forEach(tick => {
        if (!tick.pixelValue) return
        const pixelValueWithMargin = tick.pixelValue + topMargin
        context.strokeStyle = tick.isMajor ? 'gray' : 'lightgray'
        context.fillStyle = tick.isMajor ? 'black' : 'gray'
        drawLine(context, gridlineLeftEdge, pixelValueWithMargin, plotRightPx, pixelValueWithMargin)
        context.fillText(tick.label, labelRightEdge, pixelValueWithMargin) // TODO: Add a max width thingy
    })
}

const paintTimeTicks = (context: CanvasRenderingContext2D, timeTicks: TimeTick[], hideTimeAxis: boolean | undefined, xAxisPixelHeight: number, plotTopPixelHeight: number) => {
    if (!timeTicks || timeTicks.length === 0) return
    // Grid line length: if time axis is shown, grid lines extends 5 pixels below it. Otherwise they should stop at the edge of the plotting space.
    const labelOffsetFromGridline = 2
    const gridlineBottomEdge = xAxisPixelHeight + (hideTimeAxis ? 0 : + 5)
    context.textAlign = 'center'
    context.textBaseline = 'top'
    timeTicks.forEach(tick => {
        context.strokeStyle = tick.major ? 'gray' : 'lightgray'
        drawLine(context, tick.pixelXposition, gridlineBottomEdge, tick.pixelXposition, plotTopPixelHeight)
        if (!hideTimeAxis) {
            context.fillStyle = tick.major ? 'black' : 'gray'
            context.fillText(tick.label, tick.pixelXposition, gridlineBottomEdge + labelOffsetFromGridline)
        }
    })
}

const paintPanelHighlights = (context: CanvasRenderingContext2D, panels: TimeScrollViewPanel<any>[], selectedPanelKeys: Set<number | string>, topMargin: number, width: number, perPanelOffset: number, panelHeight: number) => {
    if (!selectedPanelKeys || selectedPanelKeys.size === 0) return
    context.fillStyle = highlightedRowFillStyle
    panels.forEach((panel, ii) => {
        if (selectedPanelKeys.has(Number(panel.key))) {
            const topOfHighlight = topMargin + ii * (perPanelOffset)
            context.fillRect(0, topOfHighlight, width, panelHeight)
        }
    })
}

const paintPanelLabels = (context: CanvasRenderingContext2D, panels: TimeScrollViewPanel<any>[], leftMargin: number, topMargin: number, perPanelOffset: number, panelHeight: number) => {
    if (!panels.some(p => p.label) || perPanelOffset < 7.2) return  // based on our default '10px sans-serif' font -- probably should be dynamic

    context.textAlign = 'right'
    context.textBaseline = 'middle'
    context.fillStyle = 'black'
    const rightEdgeOfText = leftMargin - 5
    let yPosition = topMargin + panelHeight / 2
    panels.forEach((panel) => {
        context.fillText(panel.label, rightEdgeOfText, yPosition)
        yPosition += perPanelOffset
    })
}


const drawLine = (context: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number) => {
    context.beginPath()
    context.moveTo(x1, y1)
    context.lineTo(x2, y2)
    context.stroke()
}