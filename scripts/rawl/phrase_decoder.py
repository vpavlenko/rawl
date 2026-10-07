"""Phrase DP shared by tree fitting and decoder-only calibration.

Python probabilities exclude the fixed first measure. Rawl's TypeScript input
includes it; verify-phrase-decoder.cjs checks this indexing against real songs.
"""
import numpy as np


NON_FOUR_BAR_PENALTIES = [2., 3., 4., 5., 6.]
PROBABILITY_FLOOR = 1e-6


def decode(probabilities, count, config, length_cost):
    if count <= 1:
        return []
    assert len(probabilities) == count - 1
    floor = config.get('probabilityFloor', .001)
    p = np.clip(probabilities, floor, 1 - floor)
    logits = np.log(p / (1 - p))
    costs = np.full(count + 1, -np.inf)
    costs[0] = 0
    back = np.zeros(count + 1, dtype=int)
    penalty = config.get('nonFourBarPenalty', 0)
    for end in range(1, count + 1):
        lengths = np.arange(1, min(32, end) + 1)
        starts = end - lengths
        reward = np.where(starts > 0, logits[np.maximum(starts - 1, 0)] - config['boundaryBias'], 0)
        scores = (costs[starts] + reward + length_cost[lengths] * config['lengthWeight']
                  - np.where(lengths == 4, 0, penalty))
        at = int(np.argmax(scores))
        costs[end] = scores[at]
        back[end] = starts[at]
    result = []
    end = count
    while end > 0:
        start = int(back[end])
        if start:
            result.append(start + 1)
        end = start
    return sorted(result)


def metrics(predictions, subset, tolerance=0, offgrid=False):
    tp = pred_n = truth_n = 0
    for predicted, song in zip(predictions, subset):
        truth = song['truth']
        if offgrid:
            predicted = [m for m in predicted if (m - 1) % 4]
            truth = [m for m in truth if (m - 1) % 4]
        available = set(truth)
        for measure in predicted:
            matches = [t for t in available if abs(t - measure) <= tolerance]
            if matches:
                found = min(matches, key=lambda t: (abs(t - measure), t))
                available.remove(found)
                tp += 1
        pred_n += len(predicted)
        truth_n += len(truth)
    precision = tp / max(1, pred_n)
    recall = tp / max(1, truth_n)
    return {'precision': precision, 'recall': recall,
            'f1': 2 * precision * recall / max(1e-12, precision + recall),
            'matched': tp, 'predicted': pred_n, 'reference': truth_n}


def length_profile(predictions, subset):
    """Exclude the unobserved final phrase's duration; retain pickup phrases."""
    histogram = {}
    terminal_fragments = {}
    for predicted, song in zip(predictions, subset):
        starts = [1, *predicted]
        for a, b in zip(starts, starts[1:]):
            length = b - a
            histogram[length] = histogram.get(length, 0) + 1
        tail = song['count'] + 1 - starts[-1]
        terminal_fragments[tail] = terminal_fragments.get(tail, 0) + 1
    count = sum(histogram.values())
    return {'completedPhrases': count, 'fourBarShare': histogram.get(4, 0) / max(1, count),
            'nonFourBarShare': 1 - histogram.get(4, 0) / max(1, count),
            'lengthCounts': histogram, 'terminalFragmentCounts': terminal_fragments,
            'note': 'Completed inter-boundary lengths, including pickups. The last file fragment is tabulated separately; the decoder still penalizes its length.'}
