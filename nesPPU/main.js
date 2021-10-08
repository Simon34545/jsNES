let cart = null;
let nes = new Bus();
let mapAsm = [];

let emulationRun = false;

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
	width = 780;
	height = 480;
	cart = new Cartridge(NESTEST_ROM);
	
	nes.insertCartridge(cart);
	
	mapAsm = nes.cpu.disassemble(0x0000, 0xFFFF);
	
	nes.reset();
	
	return true;
}

function update() {
	Clear(colors.DARK_BLUE);
	
	if (emulationRun) {
		do { nes.clock(); } while (!nes.ppu.frame_complete);
		nes.ppu.frame_complete = false;
	} else {
		if (pressedKeys["c"]) {
			do { nes.clock(); } while (!nes.cpu.complete());
			
			do { nes.clock(); } while (nes.cpu.complete());
		}
		
		if (pressedKeys["f"]) {
			do { nes.clock(); } while (!nes.ppu.frame_complete);
			
			do { nes.clock(); } while (nes.cpu.complete());
			
			nes.ppu.frame_complete = false;
		}
	}
	
	if (pressedKeys["r"]) nes.reset();
	if (pressedKeys[" "]) emulationRun = !emulationRun;
	
	DrawCpu(516, 2);
	DrawCode(516, 72, 26);
	
	DrawSprite(0, 0, nes.ppu.GetScreen());
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