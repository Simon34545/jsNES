let cart = null;
let nes = new Bus();
let mapAsm = [];

let emulationRun = true;
let residualTime = 0;

let selectedPalette = 0x00;

function DrawRam(x, y, addr, rows, columns) {
	let ramX = x, ramY = y;
	for (let row = 0; row < rows; row++) {
		let offset = "$" + hex(addr, 4) + ":";
		for (let col = 0; col < columns; col++) {
			offset += " " + hex(nes.cpuRead(addr, true), 2);
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
	cart = new Cartridge("bad_apple_2.nes");
	
	nes.insertCartridge(cart);
	
	//mapAsm = nes.cpu.disassemble(0x0000, 0xFFFF);
	
	nes.reset();
	
	return true;
}

let totalFrameTime = 0;

let tempColor = new Color(0, 0, 0);

function update(elapsedTime) {
	Clear(colors.DARK_BLUE);
	
	nes.controller[0] = 0x00;
	nes.controller[0] |= heldKeys["x"] ? 0x80 : 0x00;
	nes.controller[0] |= heldKeys["z"] ? 0x40 : 0x00;
	nes.controller[0] |= heldKeys["a"] ? 0x20 : 0x00;
	nes.controller[0] |= heldKeys["s"] ? 0x10 : 0x00;
	nes.controller[0] |= heldKeys["ArrowUp"] ? 0x08 : 0x00;
	nes.controller[0] |= heldKeys["ArrowDown"] ? 0x04 : 0x00;
	nes.controller[0] |= heldKeys["ArrowLeft"] ? 0x02 : 0x00;
	nes.controller[0] |= heldKeys["ArrowRight"] ? 0x01 : 0x00;
	
	if (emulationRun) {
		if (residualTime > 0) {
			residualTime -= elapsedTime;
		} else {
			//const t0 = performance.now();
			residualTime += (1000 / 60) - elapsedTime;
			
			do { nes.clock(); } while (!nes.ppu.frame_complete);
			nes.ppu.frame_complete = false;
			//const t1 = performance.now();
			//totalFrameTime = t1 - t0;
		}
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
	
	//DrawString(516+178, 12, nes.ppu.clockTime);
	DrawString(516+178+18, 2, elapsedTime, elapsedTime > 16 ? colors.RED : colors.WHITE);
	
	if (pressedKeys["r"]) nes.reset();
	if (pressedKeys[" "]) emulationRun = !emulationRun;
	
	if (pressedKeys["p"]) selectedPalette = (++selectedPalette) & 0x07;
	
	DrawCpu(516, 2);
	//DrawCode(516, 72, 26);
	
	for (let i = 0; i < 26; i++) {
		let s = hex(i, 2) + ": (" + nes.ppu.pOAM(i * 4 + 3).toString()
			+ ", " + nes.ppu.pOAM(i * 4 + 0).toString() + ") "
			+ "ID: " + hex(nes.ppu.pOAM(i * 4 + 1), 2)
			+" AT: " + hex(nes.ppu.pOAM(i * 4 + 2), 2);	
		DrawString(516, 72 + i * 10, s);
	}
	
	let swatchSize = 6;
	for (let p = 0; p < 8; p++) {
		for (let s = 0; s < 4; s++) {
			FillRect(516 + p * (swatchSize * 5) + s * swatchSize, 340,
				swatchSize, swatchSize, nes.ppu.GetColorFromPaletteRam(p, s));
		}
	}
	
	DrawRect(516 + selectedPalette * (swatchSize * 5) - 1, 339, (swatchSize * 4), swatchSize, colors.WHITE);
	
	//DrawSprite(516, 348, nes.ppu.GetPatternTable(0, selectedPalette));
	//DrawSprite(648, 348, nes.ppu.GetPatternTable(1, selectedPalette));
	
	//DrawRam(0, 0, 0x0400, 32, 16);
	DrawSprite(0, 0, nes.ppu.GetScreen(), 1);
}