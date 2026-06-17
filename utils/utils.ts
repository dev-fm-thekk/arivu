export function shuffleArray(array: Array<any>) {
    const arr = [...array]; // copy if you don't want to mutate original

    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));

        [arr[i], arr[j]] = [arr[j], arr[i]];
    }

    return arr;
}

export function getRandomNumbers(x: number, y: number, n: number) {
  const numbers = Array.from(
    { length: y - x + 1 },
    (_, i) => x + i
  );

  // Fisher-Yates shuffle
  for (let i = numbers.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
  }

  return numbers.slice(0, n);
}

console.log(getRandomNumbers(1, 100, 5));
// Example: [42, 7, 91, 13, 55]