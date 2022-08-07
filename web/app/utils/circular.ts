const circular =
  <T>(list: T[]) =>
  (index: number) =>
    list[(index % list.length) - 1];

export default circular;
