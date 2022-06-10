export default {
  trim: (text: string) => text.trim(),
  match: (regex: RegExp) => (text: string) => text.match(regex),
};
