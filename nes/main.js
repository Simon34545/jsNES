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
	DrawString(x + 64, y, "N", nes.cpu.status & nes.cpu.FLAGS6502.N ? colors.GREEN : colors.RED);
	DrawString(x + 80, y , "V", nes.cpu.status & nes.cpu.FLAGS6502.V ? colors.GREEN : colors.RED);
	DrawString(x + 96, y , "-", nes.cpu.status & nes.cpu.FLAGS6502.U ? colors.GREEN : colors.RED);
	DrawString(x + 112, y , "B", nes.cpu.status & nes.cpu.FLAGS6502.B ? colors.GREEN : colors.RED);
	DrawString(x + 128, y , "D", nes.cpu.status & nes.cpu.FLAGS6502.D ? colors.GREEN : colors.RED);
	DrawString(x + 144, y , "I", nes.cpu.status & nes.cpu.FLAGS6502.I ? colors.GREEN : colors.RED);
	DrawString(x + 160, y , "Z", nes.cpu.status & nes.cpu.FLAGS6502.Z ? colors.GREEN : colors.RED);
	DrawString(x + 178, y , "C", nes.cpu.status & nes.cpu.FLAGS6502.C ? colors.GREEN : colors.RED);
	DrawString(x, y + 10, "PC: $" + hex(nes.cpu.pc, 4));
	DrawString(x, y + 20, "A: $" +  hex(nes.cpu.a, 2) + "  [" + nes.cpu.a + "]");
	DrawString(x, y + 30, "X: $" +  hex(nes.cpu.x, 2) + "  [" + nes.cpu.x + "]");
	DrawString(x, y + 40, "Y: $" +  hex(nes.cpu.y, 2) + "  [" + nes.cpu.y + "]");
	DrawString(x, y + 50, "Stack P: $" + hex(nes.cpu.stkp, 4));
}

function DrawCode(x, y, lines) {
	let it_a = mapAsm.findNext(nes.cpu.pc);
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
	
	it_a = mapAsm.findNext(nes.cpu.pc);
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

let selecting = true;
let selection = localStorage.getItem('selection') || "Select a file";

let speeds = [1, 3, 6, 12, 25, 50, 75, 100, 150, 200, 300, 400, 800, 1600, 3200, 6400];
let selectedspeed = 5;

function start() {
	width = 780;
	height = 480;
	//cart = new Cartridge("smb2.nes");
	
	//nes.insertCartridge(cart);
	
	//mapAsm = nes.cpu.disassemble(0x0000, 0xFFFF);
	nes.SetSampleFrequency(audioContext.sampleRate);
	
	//nes.reset();
	return true;
}

function SoundOut() {
	if (!selecting) while (!nes.clock()) {};
	return nes.audioSample;
}

function update(elapsedTime) {
	if (selecting) {
		Clear(colors.BLACK);
		DrawString(64, 64, "Select a rom: ", colors.WHITE, 2);
		let off = 32;
		
		let found_selection = false;
		let next_selection = undefined;
		
		let first_rom = undefined;
		let found_first = false;
		
		for (const rom in nesroms) {
			if (!found_first) {
				first_rom = rom;
				found_first = true;
			}
			
			if (found_selection) {
				next_selection = rom;
				found_selection = false;
			}
			
			if (selection == rom) {
				DrawString(64 + 16, 64 + off, ">", colors.WHITE, 2);
				found_selection = true;
			}
			
			DrawString(64 + 32, 64 + off, rom, (selection == rom) ? colors.WHITE : colors.DARK_GREY, 2);
			off += 20
		}
		
		DrawString(512, 64, "Emulation speed: ", colors.WHITE, 1);
		DrawString(512, 84, "<", selectedspeed ? colors.WHITE : colors.DARK_GREY, 1);
		DrawString(630, 84, ">", selectedspeed < speeds.length - 1 ? colors.WHITE : colors.DARK_GREY, 1);
		DrawString(564, 84, speeds[selectedspeed] + '%', colors.WHITE, 1);
		
		if (pressedKeys["a"] || pressedKeys["ArrowLeft"]) {
			selectedspeed = Math.max(0, selectedspeed - 1);
		}
		
		if (pressedKeys["d"] || pressedKeys["ArrowRight"]) {
			selectedspeed = Math.min(speeds.length - 1, selectedspeed + 1);
		}
		
		if (pressedKeys["Shift"]) {
			if (next_selection) {
				selection = next_selection;
			} else {
				selection = first_rom;
			}
		}
		
		if (pressedKeys["Enter"]) {
			if (selection == "Select a file") {
				let input = document.createElement('input');
				input.accept = '.nes';
				input.multiple = false;
				input.type = 'file';
				
				input.onchange = e => { 
					let file = e.target.files[0]; 
					let name = file.name;
					
					let reader = new FileReader();
					
					reader.onload = readerEvent => {
						speed = 1 / (speeds[selectedspeed] / 100);
						
						let romData = new Uint8Array(readerEvent.target.result);
						localStorage.setItem('roms', romStorage + name + '/');
						localStorage.setItem(name, window.btoa(romData));
						localStorage.setItem('selection', name);
						
						cart = new Cartridge(romData);
						
						nes.insertCartridge(cart);
						
						nes.SetSampleFrequency(audioContext.sampleRate);
						
						nes.reset();
						selecting = false;
					}
					
					reader.readAsArrayBuffer(file);
				}
				
				input.click();
			} else {
				speed = 1 / (speeds[selectedspeed] / 100);
				
				cart = new Cartridge(nesroms[selection]);
				
				localStorage.setItem('selection', selection);
				
				nes.insertCartridge(cart);
				
				nes.SetSampleFrequency(audioContext.sampleRate);
				
				nes.reset();
				selecting = false;
			}
		}
	} else {
		nes.SetSampleFrequency(audioContext.sampleRate * speed);
		EmulatorUpdateWithAudio(elapsedTime);
	}
}

function EmulatorUpdateWithAudio(elapsedTime) {
	//if (!nes.ppu.status.vertical_blank) return;
	Clear(colors.DARK_BLUE);
	
	if (pressedKeys["-"] || pressedKeys["_"]) {
		selectedspeed = Math.max(0, selectedspeed - 1);
	}
		
	if (pressedKeys["="] || pressedKeys["+"]) {
		selectedspeed = Math.min(speeds.length - 1, selectedspeed + 1);
	}
	
	speed = 1 / (speeds[selectedspeed] / 100);
	
	nes.controller[0] = 0x00;
	nes.controller[0] |= heldKeys["x"]|| heldKeys["l"] ? 0x80 : 0x00;
	nes.controller[0] |= heldKeys["z"]|| heldKeys[","] ? 0x40 : 0x00;
	nes.controller[0] |= heldKeys["Shift"] ? 0x20 : 0x00;
	nes.controller[0] |= heldKeys["Enter"] ? 0x10 : 0x00;
	nes.controller[0] |= heldKeys["ArrowUp"] || heldKeys["w"] ? 0x08 : 0x00;
	nes.controller[0] |= heldKeys["ArrowDown"] || heldKeys["s"] ? 0x04 : 0x00;
	nes.controller[0] |= heldKeys["ArrowLeft"] || heldKeys["a"] ? 0x02 : 0x00;
	nes.controller[0] |= heldKeys["ArrowRight"] || heldKeys["d"] ? 0x01 : 0x00;
	
	DrawString(516+178+18, 2, elapsedTime, elapsedTime > 16.66 ? (elapsedTime > 18 ? (elapsedTime > 20 ? colors.RED : colors.DARK_YELLOW) : colors.YELLOW) : colors.GREEN);
	
	if (pressedKeys[" "]) emulationRun = !emulationRun;
	if (pressedKeys["r"]) nes.reset();
	if (pressedKeys["p"]) selectedPalette = (++selectedPalette) & 0x07;
	
	DrawCpu(516, 2);
	//DrawCode(516, 72, 26);
	
	DrawString(516, 62, "Emulation speed: " + speeds[selectedspeed] + "%", colors.WHITE, 1);
	
	/*for (let i = 0; i < 26; i++) {
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
	}*/
	
	//DrawRect(516 + selectedPalette * (swatchSize * 5) - 1, 339, (swatchSize * 4), swatchSize, colors.WHITE);
	
	//DrawSprite(516, 348, nes.ppu.GetPatternTable(0, selectedPalette));
	//DrawSprite(648, 348, nes.ppu.GetPatternTable(1, selectedPalette));
	
	DrawSprite(0, 0, nes.ppu.GetScreen(), 1);
}

function EmulatorUpdateWithoutAudio(elapsedTime) {
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
	
	DrawString(516+178+18, 2, elapsedTime, elapsedTime > 16.66 ? (elapsedTime > 18 ? (elapsedTime > 20 ? colors.RED : colors.DARK_YELLOW) : colors.YELLOW) : colors.GREEN);
	
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
	
	DrawSprite(0, 0, nes.ppu.GetScreen(), 1);
}