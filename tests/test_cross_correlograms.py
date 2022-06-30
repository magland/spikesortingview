# 6/30/22

import sortingview as sv
import spikeinterface as si
import spikeinterface.extractors as se
import figurl as fig
from helpers.compute_correlogram_data import compute_correlogram_data


def main():
    recording, sorting = se.toy_example(num_units=12, duration=300, seed=0)

    R = sv.copy_recording_extractor(recording, serialize_dtype='float32')
    S = sv.copy_sorting_extractor(sorting)

    data = test_cross_correlograms(recording=R, sorting=S)
    F = fig.Figure(view_url='gs://figurl/spikesortingview-6', data=data)
    url = F.url(label='test_cross_correlograms')
    print(url)

def test_cross_correlograms(*, recording: si.BaseRecording, sorting: si.BaseSorting):
    cross_correlograms = []
    for unit_id1 in sorting.get_unit_ids():
        for unit_id2 in sorting.get_unit_ids():
            if unit_id1 != unit_id2 + 1:
                a = compute_correlogram_data(sorting=sorting, unit_id1=unit_id1, unit_id2=unit_id2, window_size_msec=50, bin_size_msec=1)
                bin_edges_sec = a['bin_edges_sec']
                bin_counts = a['bin_counts']
                cross_correlograms.append({
                    'unitId1': unit_id1,
                    'unitId2': unit_id2,
                    'binEdgesSec': bin_edges_sec,
                    'binCounts': bin_counts
                })
    
    data = {
        'type': 'CrossCorrelograms',
        'crossCorrelograms': cross_correlograms
    }
    return data

if __name__ == '__main__':
    main()