export const runner = (arr,start,stop) => {
  const list = []
  for (let i = start; i <= stop; i++) {
      list.push(arr[i]);
  }
  return list
}