import { TableCell, TableRow } from '@material-ui/core'
import React, { FunctionComponent } from 'react'
import './SortableTableWidget.css'
import SortableTableWidgetCheckbox from './SortableTableWidgetCheckbox'

type RowProps = {
    rowId: string,
    selected: boolean,
    onClick?: (evt: React.MouseEvent) => void,
    isDisabled: boolean,
    contentRepository: {[key: string]: JSX.Element[]}
}

const SortableTableWidgetContentRow: FunctionComponent<RowProps> = (props: RowProps) => {
    const {rowId, selected, onClick, isDisabled, contentRepository} = props
    const content = contentRepository[rowId]
    return <TableRow key={rowId} className={selected ? "selectedRow": ""}>
        {
            onClick && (
                <TableCell key="_checkbox">
                    <SortableTableWidgetCheckbox
                        rowId={rowId}
                        selected={selected}
                        onClick={onClick}
                        isDisabled={isDisabled}
                    />
                </TableCell>
            )
        }
        {content}
    </TableRow>
}

export default SortableTableWidgetContentRow