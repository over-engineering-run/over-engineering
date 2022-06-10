export default {
  text: (res: Response) => res.text(),
  trace: <T>(arg: T) => (console.log(arg), arg),
  log:
    (msg: string) =>
    <T>(arg: T) => (console.log(msg), arg),
  fetch: (url: string) => () => fetch(url),
};
