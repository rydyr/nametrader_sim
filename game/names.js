//names.js
export const names = [];

for (let i = 0; i < 1000; i++){
   let num = parseInt(i)
   let str = num.toString().padStart(3,'0');
  names.push(str)
}