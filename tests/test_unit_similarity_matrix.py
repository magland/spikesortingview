# 7/1/22
# https://figurl.org/f?v=gs://figurl/spikesortingview-6&d=sha1://4c7ee378adc284cf3c07e7d2a9be18a86bebe1c8&label=test_unit_similarity_matrix

from typing import List
import sortingview as sv
import spikeinterface as si
import spikeinterface.extractors as se
import figurl as fig

def main():
    recording, sorting = se.toy_example(num_units=12, duration=300, seed=0)

    R = sv.copy_recording_extractor(recording, serialize_dtype='float32')
    S = sv.copy_sorting_extractor(sorting)

    data = test_unit_unit_similarity_matrix(recording=R, sorting=S)

    F = fig.Figure(view_url='gs://figurl/spikesortingview-6', data=data)
    url = F.url(label='test_unit_similarity_matrix')
    print(url)

def test_unit_unit_similarity_matrix(*, recording: si.BaseRecording, sorting: si.BaseSorting):
    recording.get_num_channels() # so that it is not marked as unused by linter
    unit_ids = list(sorting.get_unit_ids())
    similarity_scores: List[dict] = []
    for u1 in unit_ids:
        for u2 in unit_ids:
            similarity_scores.append({
                'unitId1': u1,
                'unitId2': u2,
                'similarity': 1 - abs(u1 - u2) / (u1 + u2 + 1) # fake similarity score for testing
            })

    data = {
        'type': 'UnitSimilarityMatrix',
        'unitIds': unit_ids,
        'similarityScores': similarity_scores
    }
    return data

if __name__ == '__main__':
    main()
