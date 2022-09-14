import { Button } from '@material-ui/core';
import { Hyperlink } from 'libraries/component-hyperlink';
import { NiceTable } from 'libraries/component-nice-table';
import { NiceTableColumn, NiceTableRow } from 'libraries/component-nice-table/NiceTable';
import { useAnnotations } from 'libraries/context-annotations';
import { useRecordingSelection } from 'libraries/context-recording-selection';
import { useUrlState } from 'libraries/figurl';
import { storeFileData } from 'libraries/figurl/getFileData';
import { JSONStringifyDeterministic } from 'libraries/MountainWorkspace';
import { FunctionComponent, useCallback, useMemo, useState } from 'react';
import { AnnotationsViewData } from './AnnotationsViewData';
import EditableTextField from './EditableTextField';

type Props = {
    data: AnnotationsViewData
    width: number
    height: number
}

const columns: NiceTableColumn[] = [
    {
        key: 'label',
        label: 'Label'
    },
    {
        key: 'time',
        label: 'Time'
    }
]

const AnnotationsView: FunctionComponent<Props> = ({data, width, height}) => {
    const {recordingSelection, recordingSelectionDispatch} = useRecordingSelection()
    const {focusTimeSeconds} = recordingSelection
    const {annotations, addAnnotation, removeAnnotation, setAnnotationLabel} = useAnnotations()
    const [saveEnabled, setSaveEnabled] = useState(true)

    const rows: NiceTableRow[] = useMemo(() => {
        return annotations.map((a, i) => (
            {
                key: a.annotationId,
                columnValues: {
                    label: {
                        element: <EditableTextField onChange={newLabel => setAnnotationLabel(a.annotationId, newLabel)} value={a.label} />
                    },
                    time: {
                        element: <Hyperlink onClick={() => recordingSelectionDispatch({type: 'setFocusTime', focusTimeSec: a.timeSec, autoScrollVisibleTimeRange: true})}>{a.timeSec}</Hyperlink>
                    }
                }
            }
        ))
    }, [annotations, recordingSelectionDispatch, setAnnotationLabel])

    const handleAdd = useCallback(() => {
        focusTimeSeconds !== undefined && addAnnotation({type: 'timepoint', annotationId: '', label: ``, timeSec: focusTimeSeconds})
    }, [focusTimeSeconds, addAnnotation])

    const handleDelete = useCallback((annotationId: string) => {
        removeAnnotation(annotationId)
    }, [removeAnnotation])

    const {updateUrlState} = useUrlState()

    const handleSave = useCallback(() => {
        const savedTimesJson = JSONStringifyDeterministic({annotations})
        setSaveEnabled(false)
        storeFileData(savedTimesJson).then((uri) => {
            setSaveEnabled(true)
            updateUrlState({annotations: uri})
        }).catch((err: Error) => {
            console.warn(err)
            alert(`Problem saving annotations: ${err.message}`)
        }).finally(() => {
            setSaveEnabled(true)
        })
    }, [annotations, updateUrlState])

    return (
        <div style={{margin: 20}}>
            <h3>Timepoint annotations</h3>
            Selected time (sec): {focusTimeSeconds !== undefined ? focusTimeSeconds.toFixed(7) : 'undefined'}
            <Button disabled={focusTimeSeconds === undefined} onClick={handleAdd}>Add timepoint</Button>
            <hr />
            <NiceTable
                rows={rows}
                columns={columns}
                onDeleteRow={handleDelete}
            />
            <hr />
            <Button disabled={!saveEnabled} onClick={handleSave}>Save annotations</Button>
        </div>
    )
}

export default AnnotationsView