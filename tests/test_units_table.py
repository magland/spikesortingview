# 6/22/22
# https://www.figurl.org/f?v=gs://figurl/spikesortingview-5&d=sha1://51b4ddfadc15b4bd27ba15593426d41896a654ec&label=test_units_table

import sortingview as sv
import spikeinterface as si
import spikeinterface.extractors as se
import figurl as fig

def main():
    recording, sorting = se.toy_example(num_units=12, duration=300, seed=0)

    R = sv.copy_recording_extractor(recording, serialize_dtype='float32')
    S = sv.copy_sorting_extractor(sorting)

    data = test_units_table(recording=R, sorting=S)

    F = fig.Figure(view_url='gs://figurl/spikesortingview-5', data=data)
    url = F.url(label='test_units_table')
    print(url)

def test_units_table(*, recording: si.BaseRecording, sorting: si.BaseSorting):
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