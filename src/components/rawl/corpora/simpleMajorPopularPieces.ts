// Curated broad-recognition picks, rather than a measured global popularity
// chart. One arrangement per work in each section; preference is left to right.
export const simpleMajorPopularPieces: Record<string, string[][]> = {
  "primary-triads": [
    ["chopsticks"],
    ["marry-had-a-little-lamb"],
    ["b.-bartok-for-children-vol-1-nr-1-children-at-play"],
    ["beethoven---bagatelle-in-a-major-no.-10---op.-119"],
    ["maraba-blue---abdullah-ibrahim"],
  ],
  "primary-with-iv": [
    ["happy_birthday_to_you", "happy-birthday", "happy_birthday_easy"],
    ["stille-nacht-heilige-nacht-the-1818-original-silent-night"],
    ["A_Thousand_Miles"],
    ["undertale---memory"],
    ["turning-page---sleeping-at-last-piano-string-quartet"],
  ],
  "triads-with-vi": [
    ["John_Lennon_Imagine"],
    ["Ed_Sheeran_Perfect", "ed-sheeran---perfect-easy-for-beginners"],
    [
      "baby-shark-song",
      "pinkfong-babyshark-anonymous-20190203093900-nonstop2k.com",
    ],
    ["stand-by-me"],
    ["a-thousand-years"],
  ],
  "triads-with-ii": [
    ["someone-you-loved-lewis-capaldi"],
    ["olivia-rodrigo---drivers-license"],
    ["shake-it-off---taylor-swift"],
    ["blank-space---taylor-swift-easy-piano"],
    ["only-time---enya"],
  ],
  "triads-with-iii": [
    ["someone-like-you", "someone-like-you-instrumental"],
    ["runaway---kanye-west-ramin-djawadi-arr.-by-alex-patience"],
    ["fix-you---coldplay"],
    ["chasing-cars---snow-patrol"],
    ["chariots-of-fire-theme", "Vangelis_Chariots_of_fire"],
  ],
  "mixed-sevenths": [
    ["Viva_La_Vida_Coldplay"],
    ["Someone_Like_You_easy_piano", "someone-like-you-easy-piano"],
    ["wildest-dreams---taylor-swift"],
    ["a-whiter-shade-of-pale-~-david-lanz"],
    ["subwoofer-lullaby-minecraft"],
  ],
};

export function getSimpleMajorPopularPicks(
  sectionId: string,
  midis: string[],
): Set<string> {
  return new Set(
    (simpleMajorPopularPieces[sectionId] || [])
      .map((arrangements) => arrangements.find((slug) => midis.includes(slug)))
      .filter((slug): slug is string => !!slug),
  );
}
