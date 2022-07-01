import { INITIALIZE_UNITS, useSelectedUnitIds } from 'contexts/UnitSelection/UnitSelectionContext'
import { FunctionComponent, useCallback, useEffect, useMemo, useState } from 'react'
import { idToNum } from 'views/AverageWaveforms/AverageWaveformsView'
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
        unitIdSelectionDispatch({ type: INITIALIZE_UNITS, newUnitOrder: data.unitIds.sort((a, b) => idToNum(a) - idToNum(b))})
    }, [data.unitIds, unitIdSelectionDispatch])

    const unitIds2 = useMemo(() => (data.unitIds.filter(u => (!visibleUnitIds || visibleUnitIds.includes(u)))), [data.unitIds, visibleUnitIds])
    const matrix = useMemo(() => {
        const indsForIds: { [k: number | string]: number } = {}
        unitIds2.forEach((id, i) => {
            indsForIds[id] = i
        })
        const m: number[][] = []
        unitIds2.forEach(() => { // avoid unused variables
            const a: number[] = []
            unitIds2.forEach(() => {
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
    }, [unitIds2, data.similarityScores])

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
                unitIds={unitIds2}
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