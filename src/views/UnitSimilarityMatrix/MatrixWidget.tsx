import BaseCanvas from "FigurlCanvas/BaseCanvas";
import { FunctionComponent, useCallback, useMemo } from "react";

type Props = {
    unitIds: (number | string)[]
    selectedUnitIds: Set<string | number>
    onSetSelectedUnitIds: (x: (string | number)[]) => void
    matrix: number[][]
    width: number
    height: number
}

const MatrixWidget: FunctionComponent<Props> = ({unitIds, selectedUnitIds, onSetSelectedUnitIds, matrix, width, height}) => {
    // const indsForIds = useMemo(() => {
    //     const indsForIds: { [k: number | string]: number } = {}
    //     unitIds.forEach((id, i) => {
    //         indsForIds[id] = i
    //     })
    //     return indsForIds
    // }, [unitIds])
    const size = Math.min(width, height)
    const offsetX = (width - size) / 2
    const offsetY = (height - size) / 2
    const indToPixel = useMemo(() => (o: {i1: number, i2: number}) => ({
        x: offsetX + o.i1 / unitIds.length * size,
        y: offsetY + o.i2 / unitIds.length * size
    }), [unitIds.length, size, offsetX, offsetY])
    const pixelToInd = useMemo(() => (o: {x: number, y: number}) => {
        const i1 = Math.floor((o.x - offsetX) / size * unitIds.length)
        const i2 =Math.floor((o.y - offsetY) / size * unitIds.length)
        return (
            (0 <= i1) && (i1 < unitIds.length) && (0 <= i2) && (i2 < unitIds.length)
        ) ? {i1, i2} : undefined
    }, [unitIds.length, size, offsetX, offsetY])
    const paint = useCallback((ctxt: CanvasRenderingContext2D) => {
        unitIds.forEach((u1, i1) => {
            unitIds.forEach((u2, i2) => {
                const {x: x1, y: y1} = indToPixel({i1, i2})
                const {x: x2, y: y2} = indToPixel({i1: i1 + 1, i2: i2 + 1})
                const col = colorForValue(matrix[i1][i2])
                ctxt.fillStyle = col
                ctxt.fillRect(x1, y1, x2 - x1, y2 - y1)
                if ((selectedUnitIds.has(u1)) && (selectedUnitIds.has(u2))) {
                    const col2 = colorForValue(matrix[i1][i2], true)
                    ctxt.strokeStyle = col2
                    const w = x2 - x1 >= 10 ? 3 : x2 - x1 >= 6 ? 2 : x2 - x1 >= 4 ? 1 : 0
                    ctxt.lineWidth = w
                    ctxt.strokeRect(x1, y1, x2 - x1 - w, y2 - y1 - w)
                }
            })
        })
    }, [indToPixel, matrix, unitIds, selectedUnitIds])
    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        const boundingRect = e.currentTarget.getBoundingClientRect()
        const point = {x: e.clientX - boundingRect.x, y: e.clientY - boundingRect.y}
        const ind = pixelToInd(point)
        if (!ind) return
        onSetSelectedUnitIds([unitIds[ind.i1], unitIds[ind.i2]])
    }, [onSetSelectedUnitIds, unitIds, pixelToInd])
    return (
        <div
            style={{width, height, position: 'relative'}}
            onMouseDown={handleMouseDown}
        >
            <BaseCanvas
                width={width}
                height={height}
                draw={paint}
                drawData={null}
            />
        </div>
    )
}

const colorForValue = (v: number, highlight?: boolean) => {
    if (isNaN(v)) {
        return `rgb(50, 20, 0)`
    }
    const a = Math.min(255, Math.max(0, Math.floor(v * 255)))
    const b = Math.min(255, Math.max(0, 255 - a - 30))
    return !highlight ? `rgb(${a}, ${a}, ${a})` : `rgb(${b}, ${b}, 255)`
}

export default MatrixWidget