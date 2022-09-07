import { SortingCuration } from 'contexts/SortingCurationContext';
import { colorForUnitId } from 'libraries/UnitColors';
import { FunctionComponent } from "react";
import './SortableTableWidget.css';


export interface ColorPatchUnitLabelProps {
    unitId: number,
    mergeGroup?: number[]
}

const ColorPatchUnitIdLabel: FunctionComponent<ColorPatchUnitLabelProps> = (props: ColorPatchUnitLabelProps) => {
    const { unitId, mergeGroup } = props
    const colorPatch = colorForUnitId(unitId)
    const mergeGroupString = mergeGroup ? mergeGroup.map((id: number) => `${id}`).join(", ") : ""
    return <span>
        <div className={'unitLabel'} style={{backgroundColor: colorPatch}} />
        &nbsp;{`${unitId}`}
        {
            ((mergeGroup) && (mergeGroup.length > 0)) && (
                <span key="mergeGroup">{` (${mergeGroupString})`}</span>
            )
        }
    </span>
}

export const mergeGroupForUnitId = (unitId: number | string, curation?: SortingCuration | undefined) => {
    const mergeGroups = (curation || {}).mergeGroups || []
    return mergeGroups.filter(g => (g.includes(unitId)))[0] || null
}

export default ColorPatchUnitIdLabel
