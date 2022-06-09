import numpy as np
import kachery_client as kc
import sortingview as sv
import spikeextractors as se
import figurl as fig

def main():
    recording, sorting = se.example_datasets.toy_example(K=12, duration=300, seed=0)

    R = sv.LabboxEphysRecordingExtractor.from_memory(recording, serialize=True, serialize_dtype='float32')
    S = sv.LabboxEphysSortingExtractor.from_memory(sorting, serialize=True)

    data = test_units_table(recording=R, sorting=S)

    F = fig.Figure(view_url='gs://figurl/spikesortingview-4', data=data)
    url = F.url(label='test_units_table')
    print(url)

def test_units_table(*, recording: sv.LabboxEphysRecordingExtractor, sorting: sv.LabboxEphysSortingExtractor):
    columns = [
        {
            'key': 'unitId',
            'label': 'Unit',
            'dtype': 'int'
        },
        {
            'key': 'numEvents',
            'label': 'Num. events',
            'dtype': 'int'
        },
        {
            'key': 'firingRateHz',
            'label': 'Firing rate (Hz)',
            'dtype': 'float'
        }
    ]
    rows = []
    for unit_id in sorting.get_unit_ids():
        spike_train = sorting.get_unit_spike_train(unit_id=unit_id)
        rows.append({
            'unitId': unit_id,
            'values': {
                'unitId': unit_id,
                'numEvents': len(spike_train),
                'firingRateHz': len(spike_train) / (recording.get_num_frames() / recording.get_sampling_frequency())
            }
        }) 
    data = {
        'type': 'UnitsTable',
        'columns': columns,
        'rows': rows
    }
    return data

if __name__ == '__main__':
    main()