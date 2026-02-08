export function useDebounce() {
  let timeoutId: any = null;
  
  const debounce = (fn: Function, delay: number) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(fn, delay);
  };

  return { debounce };
}