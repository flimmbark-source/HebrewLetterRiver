export function classNames(...inputs) {
  return inputs
    .flatMap((input) => {
      if (!input) return [];
      if (Array.isArray(input)) {
        return input;
      }
      if (typeof input === 'object') {
        return Object.entries(input)
          .filter(([, value]) => Boolean(value))
          .map(([className]) => className);
      }
      return [input];
    })
    .filter(Boolean)
    .join(' ');
}
