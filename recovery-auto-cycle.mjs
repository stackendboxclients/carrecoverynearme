// Panel timing is independent of scroll position and decorative scene visibility.
export function createAutoCycle({ durations, onSelect, hold = 7000, schedule = setTimeout, cancel = clearTimeout }) {
  let selected = 0;
  let timer;
  function queue(delay) {
    cancel(timer);
    timer = schedule(() => {
      selected = (selected + 1) % durations.length;
      onSelect(selected);
      queue(durations[selected]);
    }, delay);
  }
  onSelect(selected);
  queue(durations[selected]);
  return {
    select(index) {
      if (!Number.isInteger(index) || index < 0 || index >= durations.length) return;
      selected = index;
      onSelect(selected);
      queue(hold);
    },
    dispose() { cancel(timer); },
  };
}
