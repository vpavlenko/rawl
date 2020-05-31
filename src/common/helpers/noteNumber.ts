const colors = [0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0]
export const isBlackKey = (key: number) => colors[key % colors.length]
