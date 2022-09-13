import { INITIALIZE_UNITS, sortIds, useSelectedUnitIds } from 'libraries/context-unit-selection'
import { FunctionComponent, useCallback, useEffect, useMemo, useState } from 'react'
import BottomToolbar from './BottomToolbar'
import MatrixWidget from './MatrixWidget'
import { UnitSimilarityMatrixViewData } from './UnitSimilarityMatrixViewData'

type Props = {
    data: UnitSimilarityMatrixViewData
    width: number
    height: number
}

const defaultRange: [number, number] = [0, 1]

export type HoveredInfo = {
    unitId1: number | string
    unitId2: number | string
    value: number | undefined
}

const UnitSimilarityMatrixView: FunctionComponent<Props> = ({ data, width, height }) => {
    const { selectedUnitIds, visibleUnitIds, unitIdSelectionDispatch } = useSelectedUnitIds()
    const [hoveredInfo, setHoveredInfo] = useState<HoveredInfo | undefined>(undefined)

    useEffect(() => {
        unitIdSelectionDispatch({ type: INITIALIZE_UNITS, newUnitOrder: sortIds(data.unitIds)})
    }, [data.unitIds, unitIdSelectionDispatch])

    const unitIdsFilt = useMemo(() => (data.unitIds.filter(u => (!visibleUnitIds || visibleUnitIds.includes(u)))), [data.unitIds, visibleUnitIds])
    const matrix = useMemo(() => {
        const indsForIds: { [k: number | string]: number } = {}
        unitIdsFilt.forEach((id, i) => {
            indsForIds[id] = i
        })
        const m: number[][] = []
        unitIdsFilt.forEach(() => { // avoid unused variables
            const a: number[] = []
            unitIdsFilt.forEach(() => {
                a.push(NaN)
            })
            m.push(a)
        })

        for (let x of data.similarityScores) {
            const ind1 = indsForIds[x.unitId1]
            const ind2 = indsForIds[x.unitId2]
            m[ind1][ind2] = x.similarity
        }
        return m
    }, [unitIdsFilt, data.similarityScores])

    const handleSetSelectedUnitIds = useCallback((x: (number | string)[]) => {
        unitIdSelectionDispatch({
            type: 'SET_SELECTION',
            incomingSelectedUnitIds: x
        })
    }, [unitIdSelectionDispatch])

    const bottomToolbarHeight = 30
    return (
        <div>
            <MatrixWidget
                unitIds1={unitIdsFilt}
                unitIds2={unitIdsFilt}
                selectedUnitIds={selectedUnitIds}
                onSetSelectedUnitIds={handleSetSelectedUnitIds}
                matrix={matrix}
                range={data.range || defaultRange}
                setHoveredInfo={setHoveredInfo}
                width={width}
                height={height - bottomToolbarHeight}
            />
            <BottomToolbar
                hoveredInfo={hoveredInfo}
            />
        </div>
    )
}

export default UnitSimilarityMatrixView