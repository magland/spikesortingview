import { INITIALIZE_UNITS, useSelectedUnitIds } from 'contexts/UnitSelection/UnitSelectionContext'
import { FunctionComponent, useCallback, useEffect, useMemo } from 'react'
import { idToNum } from 'views/AverageWaveforms/AverageWaveformsView'
import MatrixWidget from './MatrixWidget'
import { UnitSimilarityMatrixViewData } from './UnitSimilarityMatrixViewData'

type Props = {
    data: UnitSimilarityMatrixViewData
    width: number
    height: number
}

const UnitSimilarityMatrixView: FunctionComponent<Props> = ({ data, width, height }) => {
    const { selectedUnitIds, visibleUnitIds, unitIdSelectionDispatch } = useSelectedUnitIds()

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

    return (
        <MatrixWidget
            unitIds={unitIds2}
            selectedUnitIds={selectedUnitIds}
            onSetSelectedUnitIds={handleSetSelectedUnitIds}
            matrix={matrix}
            width={width}
            height={height}
        />
    )
}

export default UnitSimilarityMatrixView