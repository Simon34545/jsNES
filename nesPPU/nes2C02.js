class nes2C02 {
	cart = null;
	
	tblName = [new Uint8Array(1024), new Uint8Array(1024)];
	tblPalette = new Uint8Array(32);
	tblPattern = [new Uint8Array(4096), new Uint8Array(4096)];
	
	palScreen = new Array(0x40).fill().map(u => { return new Color(); });
	sprScreen = new Sprite(256, 240);
	sprNameTable = [new Sprite(256, 240), new Sprite(256, 240)];
	sprPatternTable = [new Sprite(128, 128), new Sprite(128, 128)];
	
	GetScreen() {
		return this.sprScreen;
	}
	
	GetNameTable(i) {
		return this.sprNameTable[i];
	}
	
	GetPatternTable(i) {
		return this.sprPatternTable[i];
	}
	
	frame_complete = false;
	
	scanline = 0;
	cycle = 0;
	
	ConnectCartridge(cartridge) {
		this.cart = cartridge;
	}
	
	constructor() {
		this.palScreen[0x00] = new Color(84, 84, 84);
		this.palScreen[0x01] = new Color(0, 30, 116);
		this.palScreen[0x02] = new Color(8, 16, 144);
		this.palScreen[0x03] = new Color(48, 0, 136);
		this.palScreen[0x04] = new Color(68, 0, 100);
		this.palScreen[0x05] = new Color(92, 0, 48);
		this.palScreen[0x06] = new Color(84, 4, 0);
		this.palScreen[0x07] = new Color(60, 24, 0);
		this.palScreen[0x08] = new Color(32, 42, 0);
		this.palScreen[0x09] = new Color(8, 58, 0);
		this.palScreen[0x0A] = new Color(0, 64, 0);
		this.palScreen[0x0B] = new Color(0, 60, 0);
		this.palScreen[0x0C] = new Color(0, 50, 60);
		this.palScreen[0x0D] = new Color(0, 0, 0);
		this.palScreen[0x0E] = new Color(0, 0, 0);
		this.palScreen[0x0F] = new Color(0, 0, 0);

		this.palScreen[0x10] = new Color(152, 150, 152);
		this.palScreen[0x11] = new Color(8, 76, 196);
		this.palScreen[0x12] = new Color(48, 50, 236);
		this.palScreen[0x13] = new Color(92, 30, 228);
		this.palScreen[0x14] = new Color(136, 20, 176);
		this.palScreen[0x15] = new Color(160, 20, 100);
		this.palScreen[0x16] = new Color(152, 34, 32);
		this.palScreen[0x17] = new Color(120, 60, 0);
		this.palScreen[0x18] = new Color(84, 90, 0);
		this.palScreen[0x19] = new Color(40, 114, 0);
		this.palScreen[0x1A] = new Color(8, 124, 0);
		this.palScreen[0x1B] = new Color(0, 118, 40);
		this.palScreen[0x1C] = new Color(0, 102, 120);
		this.palScreen[0x1D] = new Color(0, 0, 0);
		this.palScreen[0x1E] = new Color(0, 0, 0);
		this.palScreen[0x1F] = new Color(0, 0, 0);

		this.palScreen[0x20] = new Color(236, 238, 236);
		this.palScreen[0x21] = new Color(76, 154, 236);
		this.palScreen[0x22] = new Color(120, 124, 236);
		this.palScreen[0x23] = new Color(176, 98, 236);
		this.palScreen[0x24] = new Color(228, 84, 236);
		this.palScreen[0x25] = new Color(236, 88, 180);
		this.palScreen[0x26] = new Color(236, 106, 100);
		this.palScreen[0x27] = new Color(212, 136, 32);
		this.palScreen[0x28] = new Color(160, 170, 0);
		this.palScreen[0x29] = new Color(116, 196, 0);
		this.palScreen[0x2A] = new Color(76, 208, 32);
		this.palScreen[0x2B] = new Color(56, 204, 108);
		this.palScreen[0x2C] = new Color(56, 180, 204);
		this.palScreen[0x2D] = new Color(60, 60, 60);
		this.palScreen[0x2E] = new Color(0, 0, 0);
		this.palScreen[0x2F] = new Color(0, 0, 0);

		this.palScreen[0x30] = new Color(236, 238, 236);
		this.palScreen[0x31] = new Color(168, 204, 236);
		this.palScreen[0x32] = new Color(188, 188, 236);
		this.palScreen[0x33] = new Color(212, 178, 236);
		this.palScreen[0x34] = new Color(236, 174, 236);
		this.palScreen[0x35] = new Color(236, 174, 212);
		this.palScreen[0x36] = new Color(236, 180, 176);
		this.palScreen[0x37] = new Color(228, 196, 144);
		this.palScreen[0x38] = new Color(204, 210, 120);
		this.palScreen[0x39] = new Color(180, 222, 120);
		this.palScreen[0x3A] = new Color(168, 226, 144);
		this.palScreen[0x3B] = new Color(152, 226, 180);
		this.palScreen[0x3C] = new Color(160, 214, 228);
		this.palScreen[0x3D] = new Color(160, 162, 160);
		this.palScreen[0x3E] = new Color(0, 0, 0);
		this.palScreen[0x3F] = new Color(0, 0, 0);
	}
	
	clock() {
		this.sprScreen.SetPixel(this.cycle - 1, this.scanline, this.palScreen[(Math.floor(Math.random() * 32768) % 2) ? 0x3F : 0x30]);
		
		this.cycle++;
		if (this.cycle >= 341) {
			this.cycle = 0;
			this.scanline++;
			if (this.scanline >= 261) {
				this.scanline = -1;
				this.frame_complete = true;
			}
		}
	}
	
	cpuRead(addr, rdonly = false) {
		let data = 0x00;
		
		switch (addr) {
		case 0x0000: // Control
			break;
		case 0x0001: // Mask
			break;
		case 0x0002: // Status
			break;
		case 0x0003: // OAM Address
			break;
		case 0x0004: // OAM Data
			break;
		case 0x0005: // Scroll
			break;
		case 0x0006: // PPU Address
			break;
		case 0x0007: // PPU Data
			break;
		}
		
		return data;
	}
	
	cpuWrite(addr, data) {
		switch (addr) {
		case 0x0000: // Control
			break;
		case 0x0001: // Mask
			break;
		case 0x0002: // Status
			break;
		case 0x0003: // OAM Address
			break;
		case 0x0004: // OAM Data
			break;
		case 0x0005: // Scroll
			break;
		case 0x0006: // PPU Address
			break;
		case 0x0007: // PPU Data
			break;
		}
	}
	
	ppuRead(addr, rdonly = false) {
		let data = new uint8();
		addr &= 0x3FFF;
		
		if (this.cart.ppuRead(addr, data)) {
			
		}
		
		return data.v;
	}
	
	ppuWrite(addr, data) {
		addr &= 0x3FFF;
		
		data = new uint8(data);
		
		if (this.cart.ppuWrite(addr, data)) {
			
		}
	}
}