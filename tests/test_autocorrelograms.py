import sortingview as sv
import spikeextractors as se
import figurl as fig
from helpers.compute_correlogram_data import compute_correlogram_data

def main():
    recording, sorting = se.example_datasets.toy_example(K=12, duration=300, seed=0)

    R = sv.LabboxEphysRecordingExtractor.from_memory(recording, serialize=True, serialize_dtype='float32')
    S = sv.LabboxEphysSortingExtractor.from_memory(sorting, serialize=True)

    data = test_autocorrelograms(recording=recording, sorting=sorting)
    F = fig.Figure(view_url='gs://figurl/spikesortingview-3', data=data)
    url = F.url(label='test_autocorrelograms')
    print(url)

def test_autocorrelograms(*, recording: sv.LabboxEphysRecordingExtractor, sorting: sv.LabboxEphysSortingExtractor):
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