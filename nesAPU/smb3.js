let SMB3_ROM = new Uint8Array(SMB3_HEX.length);

for (let i = 0; i < SMB3_HEX.length; i++) {
   SMB3_ROM[i] = parseInt(SMB3_HEX[i], 16);
}