var nes = new Bus();
var scr = document.getElementById('hex');
var inf = document.getElementById('inf');

// Load Program (assembled at https://www.masswerk.at/6502/assembler.html)
/*
*=$8000
LDX #10
STX $0000
LDX #3
STX $0001
LDY $0000
LDA #0
CLC
loop
ADC $0001
DEY
BNE loop
STA $0002
NOP
NOP
NOP
*/
// Convert hex string into bytes for RAM
var program = "A2 0A 8E 00 00 A2 03 8E 01 00 AC 00 00 A9 00 18 6D 01 00 88 D0 FA 8D 02 00 EA EA EA";
program = program.split(' ').map(function(e){return parseInt('0x' + e);});
var nOffset = 0x8000;

for (var i = 0; i < program.length; i++) {
	nes.ram[nOffset++] = program[i];
}

nes.ram[0xFFFC] = 0x00;
nes.ram[0xFFFD] = 0x80;

nes.cpu.reset();

function draw() {
	var textToShow = '';
	
	for (var i = 0x0000; i <= 0x00ff; i++ ) {
		textToShow += (i % 16 == 0 && i != 0 ? '\n' + ('$' + ((i - i % 16).toString(16)).padStart(4, '0') + ': ') : (i % 16 == 0 ? ('$' + ((i - i % 16).toString(16)).padStart(4, '0') + ': ') : '')) + (nes.ram[i].toString(16).length < 2 ? '0' + nes.ram[i].toString(16).toUpperCase() : nes.ram[i].toString(16).toUpperCase()) + ' '
	}
	
	textToShow += "\n\n"
	
	for (var i = 0x8000; i <= 0x80FF; i++ ) {
		textToShow += (i % 16 == 0 ? '\n' + ('$' + ((i - i % 16).toString(16)).padStart(4, '0') + ': ') : '') + (nes.ram[i].toString(16).length < 2 ? '0' + nes.ram[i].toString(16).toUpperCase() : nes.ram[i].toString(16).toUpperCase()) + ' '
	}
	
	scr.innerText = textToShow;
	
	inf.innerHTML = `Status: <span style="color: #${nes.cpu.GetFlag(nes.cpu.FLAGS6502.N) ? '0f0' : 'f00'}">N</span> <span style="color: #${nes.cpu.GetFlag(nes.cpu.FLAGS6502.V) ? '0f0' : 'f00'}">V</span> <span>-</span> <span style="color: #${nes.cpu.GetFlag(nes.cpu.FLAGS6502.B) ? '0f0' : 'f00'}">B</span> <span style="color: #${nes.cpu.GetFlag(nes.cpu.FLAGS6502.D) ? '0f0' : 'f00'}">D</span> <span style="color: #${nes.cpu.GetFlag(nes.cpu.FLAGS6502.I) ? '0f0' : 'f00'}">I</span> <span style="color: #${nes.cpu.GetFlag(nes.cpu.FLAGS6502.Z) ? '0f0' : 'f00'}">Z</span> <span style="color: #${nes.cpu.GetFlag(nes.cpu.FLAGS6502.C) ? '0f0' : 'f00'}">C</span> \nPC: $${((nes.cpu.pc).toString(16)).padStart(4, '0')}\nA: $${(nes.cpu.a.toString(16).length < 2 ? '0' + nes.cpu.a.toString(16).toUpperCase() : nes.cpu.a.toString(16).toUpperCase()) + '  [' + nes.cpu.a + ']'}\nX: $${(nes.cpu.x.toString(16).length < 2 ? '0' + nes.cpu.x.toString(16).toUpperCase() : nes.cpu.x.toString(16).toUpperCase()) + '  [' + nes.cpu.x + ']'}\nY: $${(nes.cpu.y.toString(16).length < 2 ? '0' + nes.cpu.y.toString(16).toUpperCase() : nes.cpu.y.toString(16).toUpperCase()) + '  [' + nes.cpu.y + ']'}\nStack P: $${((nes.cpu.stkp).toString(16)).padStart(4, '0')}\n\n<span style="color: #0ff">${nes.cpu.debugString}</span>\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n`
}

draw();

function handleCycles() {
	var cyclesToRun = Number(nes.cpu.cycles);
	
	for (var i = 0; i <= cyclesToRun; i++) {
		nes.cpu.clock();
	}
	draw();
}

document.addEventListener("keyup", function(e) {
	switch(e.key.toLowerCase()) {
		case ' ':
			handleCycles();
			draw();
			break;
		case 'r':
			nes.cpu.reset();
			draw();
			break;
		case 'i':
			nes.cpu.irq();
			draw();
			break;
		case 'n':
			nes.cpu.nmi();
			draw();
			break;
	}
});