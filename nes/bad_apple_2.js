let BADAPPLE_ROM = new Uint8Array(BADAPPLE_HEX.length);

for (let i = 0; i < BADAPPLE_HEX.length; i++) {
   BADAPPLE_ROM[i] = parseInt(BADAPPLE_HEX[i], 16);
}