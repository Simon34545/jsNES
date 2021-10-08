let nes = new Bus();
let mapAsm = [];

function DrawRam(x, y, addr, rows, columns) {
	let ramX = x, ramY = y;
	for (let row = 0; row < rows; row++) {
		let offset = "$" + hex(addr, 4) + ":";
		for (let col = 0; col < columns; col++) {
			offset += " " + hex(nes.read(addr, true), 2);
			addr += 1;
		}
		DrawString(ramX, ramY, offset);
		ramY += 10;
	}
}

function DrawCpu(x, y) {
	let status = "STATUS: ";
	DrawString(x, y , "STATUS:", colors.WHITE);
	DrawString(x + 64, y, "N", nes.cpu.status.v & nes.cpu.FLAGS6502.N ? colors.GREEN : colors.RED);
	DrawString(x + 80, y , "V", nes.cpu.status.v & nes.cpu.FLAGS6502.V ? colors.GREEN : colors.RED);
	DrawString(x + 96, y , "-", nes.cpu.status.v & nes.cpu.FLAGS6502.U ? colors.GREEN : colors.RED);
	DrawString(x + 112, y , "B", nes.cpu.status.v & nes.cpu.FLAGS6502.B ? colors.GREEN : colors.RED);
	DrawString(x + 128, y , "D", nes.cpu.status.v & nes.cpu.FLAGS6502.D ? colors.GREEN : colors.RED);
	DrawString(x + 144, y , "I", nes.cpu.status.v & nes.cpu.FLAGS6502.I ? colors.GREEN : colors.RED);
	DrawString(x + 160, y , "Z", nes.cpu.status.v & nes.cpu.FLAGS6502.Z ? colors.GREEN : colors.RED);
	DrawString(x + 178, y , "C", nes.cpu.status.v & nes.cpu.FLAGS6502.C ? colors.GREEN : colors.RED);
	DrawString(x, y + 10, "PC: $" + hex(nes.cpu.pc.v, 4));
	DrawString(x, y + 20, "A: $" +  hex(nes.cpu.a.v, 2) + "  [" + nes.cpu.a.v + "]");
	DrawString(x, y + 30, "X: $" +  hex(nes.cpu.x.v, 2) + "  [" + nes.cpu.x.v + "]");
	DrawString(x, y + 40, "Y: $" +  hex(nes.cpu.y.v, 2) + "  [" + nes.cpu.y.v + "]");
	DrawString(x, y + 50, "Stack P: $" + hex(nes.cpu.stkp.v, 4));
}

function DrawCode(x, y, lines) {
	let it_a = mapAsm.findNext(nes.cpu.pc.v);
	let lineY = (lines >> 1) * 10 + y;
	if (it_a != mapAsm.length) {
		DrawString(x, lineY, mapAsm[it_a], colors.CYAN);
		while (lineY < (lines * 10) + y) {
			lineY += 10;
			it_a = mapAsm.findNext(it_a + 1);
			if (it_a != mapAsm.length) {
				DrawString(x, lineY, mapAsm[it_a]);
			}
		}
	}
	
	it_a = mapAsm.findNext(nes.cpu.pc.v);
	lineY = (lines >> 1) * 10 + y;
	if (it_a != mapAsm.length) {
		DrawString(x, lineY, mapAsm[it_a], colors.CYAN);
		while (lineY > y) {
			lineY -= 10;
			it_a = mapAsm.findPrevious(it_a - 1);
			if (it_a != mapAsm.length) {
				DrawString(x, lineY, mapAsm[it_a]);
			}
		}
	}
}

function start() {
	width = 680;
	height = 480;
	
	let ss = ("A2 0A 8E 00 00 A2 03 8E 01 00 AC 00 00 A9 00 18 6D 01 00 88 D0 FA 8D 02 00 EA EA EA").split(' ');
	let offset = 0x8000;
	for (let i = 0; i < ss.length; i++) {
		let b = ss[i];
		nes.ram[offset++] = parseInt(b, 16);
	}
	
	nes.ram[0xFFFC] = 0x00;
	nes.ram[0xFFFD] = 0x80;
	
	mapAsm = nes.cpu.disassemble(0x0000, 0xFFFF);
	
	nes.cpu.reset();
	return true;
}

function update() {
	Clear(colors.DARK_BLUE);
	
	if (pressedKeys[" "]) {
		while (true) {
			nes.cpu.clock();
			
			if (nes.cpu.complete()) break;
		}
	}
	
	if (pressedKeys["r"]) {
		nes.cpu.reset();
	}
	
	if (pressedKeys["i"]) {
		nes.cpu.irq();
	}
	
	if (pressedKeys["n"]) {
		nes.cpu.nmi();
	}
	
	DrawRam(2, 2, 0x0000, 16, 16);
	DrawRam(2, 182, 0x8000, 16, 16);
	DrawCpu(448, 2);
	DrawCode(448, 72, 26);
	
	DrawString(10, 370, "SPACE = Step Instruction    R = RESET    I = IRQ    N = NMI");
}

function getUndefined() {
	let undefinedList = [];
	for (let i = 0x00; i < 0x100; i++) {
		let instruction = nes.cpu.lookup[i];
		if (nes.cpu[instruction.operate].toString().length < 30) {
			if (undefinedList.indexOf(instruction.operate) == -1) {
				undefinedList.push(instruction.operate);
			}
		}
	}
	return undefinedList
}