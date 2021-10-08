var ctx = document.getElementById('scr').getContext('2d');

function set(x, y, color, self) {
	if (x > 255 || y > 239) { return; };
	var idx = y * 256 + x;
	self.sprScreen[idx] = color;
	//ctx.fillStyle = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
	//ctx.fillRect(x, y, 1, 1);
}


class olc2C02 {
	constructor() {
		this.palScreen[0x00] = [84, 84, 84];
		this.palScreen[0x01] = [0, 30, 116];
		this.palScreen[0x02] = [8, 16, 144];
		this.palScreen[0x03] = [48, 0, 136];
		this.palScreen[0x04] = [68, 0, 100];
		this.palScreen[0x05] = [92, 0, 48];
		this.palScreen[0x06] = [84, 4, 0];
		this.palScreen[0x07] = [60, 24, 0];
		this.palScreen[0x08] = [32, 42, 0];
		this.palScreen[0x09] = [8, 58, 0];
		this.palScreen[0x0A] = [0, 64, 0];
		this.palScreen[0x0B] = [0, 60, 0];
		this.palScreen[0x0C] = [0, 50, 60];
		this.palScreen[0x0D] = [0, 0, 0];
		this.palScreen[0x0E] = [0, 0, 0];
		this.palScreen[0x0F] = [0, 0, 0];
		
		this.palScreen[0x10] = [152, 150, 152];
		this.palScreen[0x11] = [8, 76, 196];
		this.palScreen[0x12] = [48, 50, 236];
		this.palScreen[0x13] = [92, 30, 228];
		this.palScreen[0x14] = [136, 20, 176];
		this.palScreen[0x15] = [160, 20, 100];
		this.palScreen[0x16] = [152, 34, 32];
		this.palScreen[0x17] = [120, 60, 0];
		this.palScreen[0x18] = [84, 90, 0];
		this.palScreen[0x19] = [40, 114, 0];
		this.palScreen[0x1A] = [8, 124, 0];
		this.palScreen[0x1B] = [0, 118, 40];
		this.palScreen[0x1C] = [0, 102, 120];
		this.palScreen[0x1D] = [0, 0, 0];
		this.palScreen[0x1E] = [0, 0, 0];
		this.palScreen[0x1F] = [0, 0, 0];
		
		this.palScreen[0x20] = [236, 238, 236];
		this.palScreen[0x21] = [76, 154, 236];
		this.palScreen[0x22] = [120, 124, 236];
		this.palScreen[0x23] = [176, 98, 236];
		this.palScreen[0x24] = [228, 84, 236];
		this.palScreen[0x25] = [236, 88, 180];
		this.palScreen[0x26] = [236, 106, 100];
		this.palScreen[0x27] = [212, 136, 32];
		this.palScreen[0x28] = [160, 170, 0];
		this.palScreen[0x29] = [116, 196, 0];
		this.palScreen[0x2A] = [76, 208, 32];
		this.palScreen[0x2B] = [56, 204, 108];
		this.palScreen[0x2C] = [56, 180, 204];
		this.palScreen[0x2D] = [60, 60, 60];
		this.palScreen[0x2E] = [0, 0, 0];
		this.palScreen[0x2F] = [0, 0, 0];
		
		this.palScreen[0x30] = [236, 238, 236];
		this.palScreen[0x31] = [168, 204, 236];
		this.palScreen[0x32] = [188, 188, 236];
		this.palScreen[0x33] = [212, 178, 236];
		this.palScreen[0x34] = [236, 174, 236];
		this.palScreen[0x35] = [236, 174, 212];
		this.palScreen[0x36] = [236, 180, 176];
		this.palScreen[0x37] = [228, 196, 144];
		this.palScreen[0x38] = [204, 210, 120];
		this.palScreen[0x39] = [180, 222, 120];
		this.palScreen[0x3A] = [168, 226, 144];
		this.palScreen[0x3B] = [152, 226, 180];
		this.palScreen[0x3C] = [160, 214, 228];
		this.palScreen[0x3D] = [160, 162, 160];
		this.palScreen[0x3E] = [0, 0, 0];
		this.palScreen[0x3F] = [0, 0, 0];
	}
	
	
	tblName = new Array(2).fill(new Uint8Array(1024));
	tblPalette = new Uint8Array(32);
	tblPattern = new Array(2).fill(new Uint8Array(4096));
	
	cpuRead(addr, rdonly) {
		var data = 0x00;
		
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
			case 0x0006: // PPU Adress
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
			case 0x0006: // PPU Adress
				break;
			case 0x0007: // PPU Data
				break;
		}
	}
	
	ppuRead(addr, rdonly) {
		var data = 0x00;
		addr &= 0x3FFF;
		
		var result = this.cart.ppuRead(addr, data);
		if (result[1]) {
			
		}
		
		return data;
	}
	ppuWrite(addr, data){
		addr &= 0x3FFF;
		
		if (this.cart.ppuWrite(addr, data)) {
			
		}
	}
	
	cart;
	
	ConnectCartridge(cartridge) {
		this.cart = cartridge
	}
	
	clock() {
		
		set(this.cycle - 1, this.scanline, (Math.round(Math.random())) ? this.palScreen[0x3F] : this.palScreen[0x30], this);
		
		// Advance renderer - it never stops, it's relentless
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
	
	palScreen = new Array(0x40).fill(new Uint8Array(3));
	sprScreen = new Array(256 * 240).fill([0, 0, 0]);
	sprNameTable = [];
	sprPatternTable = [];
	
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
}