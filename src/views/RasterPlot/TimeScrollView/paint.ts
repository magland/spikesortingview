import { MainLayerProps } from "./TSVMainLayer"

export const paint = (context: CanvasRenderingContext2D, props: MainLayerProps & {layer: 'main' | 'axes', selectedPanelKeys?: string[]}) => {
    const {width, height, margins, timeRange, panels, panelSpacing, selectedPanelKeys} = props
    context.clearRect(0, 0, width, height)
    const panelHeight = (height - margins.top - margins.bottom - panelSpacing * (panels.length - 1)) / panels.length
    if (props.layer === 'main') {
        for (let i = 0; i < panels.length; i++) {
            const p = panels[i]
            const y1 = margins.top + i * (panelHeight + panelSpacing)
            const rect = {x: margins.left, y: y1, width: width - margins.left - margins.right, height: panelHeight}
            p.paint(context, rect, timeRange, p.props)
        }
    }
    else if (props.layer === 'axes') {
        // x-axes
        context.strokeStyle = 'black'
        drawLine(context, margins.left, height - margins.bottom, width - margins.right, height - margins.bottom)

        // selected panels
        if (selectedPanelKeys) {
            for (let i = 0; i < panels.length; i++) {
                const p = panels[i]
                if (selectedPanelKeys.includes(p.key)) {
                    const y1 = margins.top + i * (panelHeight + panelSpacing)
                    const rect = {x: 0, y: y1, width: width, height: panelHeight}
                    context.fillStyle = '#c5e1ff'
                    context.fillRect(rect.x, rect.y, rect.width, rect.height)
                }
            }
        }

        // panel axes
        for (let i = 0; i < panels.length; i++) {
            const p = panels[i]
            context.textAlign = 'right'
            context.textBaseline = 'middle'
            const y1 = margins.top + i * (panelHeight + panelSpacing)
            context.fillStyle = 'black'
            context.fillText(p.label, margins.left - 5, y1 + panelHeight / 2)
        }
    }
}

const drawLine = (context: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number) => {
    context.beginPath()
    context.moveTo(x1, y1)
    context.lineTo(x2, y2)
    context.stroke()
}