# 6/22/22
# https://figurl.org/f?v=gs://figurl/spikesortingview-6&d=sha1://7c9145f98635b6cf5a4e0fc55b20b9849d8902cc&label=test_autocorrelograms

import sortingview as sv
import spikeinterface as si
import spikeinterface.extractors as se
import figurl as fig
from helpers.compute_correlogram_data import compute_correlogram_data

def main():
    recording, sorting = se.toy_example(num_units=12, duration=300, seed=0)

    R = sv.copy_recording_extractor(recording, serialize_dtype='float32')
    S = sv.copy_sorting_extractor(sorting)

    data = test_autocorrelograms(recording=R, sorting=S)
    F = fig.Figure(view_url='gs://figurl/spikesortingview-6', data=data)
    url = F.url(label='test_autocorrelograms')
    print(url)

def test_autocorrelograms(*, recording: si.BaseRecording, sorting: si.BaseSorting):
    autocorrelograms = []
    for unit_id in sorting.get_unit_ids():
        a = compute_correlogram_data(sorting=sorting, unit_id1=unit_id, unit_id2=None, window_size_msec=50, bin_size_msec=1)
        bin_edges_sec = a['bin_edges_sec']
        bin_counts = a['bin_counts']
        autocorrelograms.append({
            'unitId': unit_id,
            'binEdgesSec': bin_edges_sec,
            'binCounts': bin_counts
        })
    
    data = {
        'type': 'Autocorrelograms',
        'autocorrelograms': autocorrelograms
    }
    return data

if __name__ == '__main__':
    main()