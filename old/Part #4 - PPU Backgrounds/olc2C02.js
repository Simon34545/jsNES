var ctx = document.getElementById('scr').getContext('2d');

function set(x, y, color, self) {
	var idx = y * 1024 + x * 4;
	self.sprScreen.data[idx + 0] = color[0];
	self.sprScreen.data[idx + 1] = color[1];
	self.sprScreen.data[idx + 2] = color[2];
	self.sprScreen.data[idx + 3] = 255;
	//ctx.fillStyle = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
	//ctx.fillRect(x, y, 1, 1);
}
	
function setPT(i, x, y, color, self) {
	var idx = y * 512 + x * 4;
	self.sprPatternTable[i].data[idx + 0] = color[0];
	self.sprPatternTable[i].data[idx + 1] = color[1];
	self.sprPatternTable[i].data[idx + 2] = color[2];
	self.sprPatternTable[i].data[idx + 3] = 255;

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
	
	GetStatusBit(f) {
		return ((this.status.reg & f) > 0) ? 1 : 0;
	}
		
	SetStatusBit(f, v) {
		if (v) {
			this.status.reg |= f;
		} else {
			this.status.reg &= ~f;
		}
	}
	
	GetMaskBit(f) {
		return ((this.mask.reg & f) > 0) ? 1 : 0;
	}
		
	SetMaskBit(f, v) {
		if (v) {
			this.mask.reg |= f;
		} else {
			this.mask.reg &= ~f;
		}
	}
	
	GetControlBit(f) {
		return ((this.control.reg & f) > 0) ? 1 : 0;
	}
		
	SetControlBit(f, v) {
		if (v) {
			this.control.reg |= f;
		} else {
			this.control.reg &= ~f;
		}
	}
	
	GetTRAMBit(f) {
		return ((this.tram_addr.reg & f) > 0) ? 1 : 0;
	}
		
	SetTRAMBit(f, v) {
		if (v) {
			this.tram_addr.reg |= f;
		} else {
			this.tram_addr.reg &= ~f;
		}
	}
	
	GetVRAMBit(f) {
		return ((this.vram_addr.reg & f) > 0) ? 1 : 0;
	}
		
	SetVRAMBit(f, v) {
		if (v) {
			this.vram_addr.reg |= f;
		} else {
			this.vram_addr.reg &= ~f;
		}
	}
	
	GetTRAMcx() {
		return (this.GetTRAMBit(1 << 0) << 4) | (this.GetTRAMBit(1 << 1) << 3) | (this.GetTRAMBit(1 << 2) << 2) | (this.GetTRAMBit(1 << 3) << 1) | (this.GetTRAMBit(1 << 4) << 0);
	}
		
	SetTRAMcx(v) {
		this.SetTRAMBit(1 << 0, v & (1 << 4));
		this.SetTRAMBit(1 << 1, v & (1 << 3));
		this.SetTRAMBit(1 << 2, v & (1 << 2));
		this.SetTRAMBit(1 << 3, v & (1 << 1));
		this.SetTRAMBit(1 << 4, v & (1 << 0));
	}
	
	GetTRAMcy() {
		return (this.GetTRAMBit(1 << 5) << 4) | (this.GetTRAMBit(1 << 6) << 3) | (this.GetTRAMBit(1 << 7) << 2) | (this.GetTRAMBit(1 << 8) << 1) | (this.GetTRAMBit(1 << 9) << 0);
	}
		
	SetTRAMcy(v) {
		this.SetTRAMBit(1 << 5, v & (1 << 4));
		this.SetTRAMBit(1 << 6, v & (1 << 3));
		this.SetTRAMBit(1 << 7, v & (1 << 2));
		this.SetTRAMBit(1 << 8, v & (1 << 1));
		this.SetTRAMBit(1 << 9, v & (1 << 0));
	}
	
	GetVRAMcx() {
		return (this.GetVRAMBit(1 << 0) << 4) | (this.GetVRAMBit(1 << 1) << 3) | (this.GetVRAMBit(1 << 2) << 2) | (this.GetVRAMBit(1 << 3) << 1) | (this.GetVRAMBit(1 << 4) << 0);
	}
		
	SetVRAMcx(v) {
		this.SetVRAMBit(1 << 0, v & (1 << 4));
		this.SetVRAMBit(1 << 1, v & (1 << 3));
		this.SetVRAMBit(1 << 2, v & (1 << 2));
		this.SetVRAMBit(1 << 3, v & (1 << 1));
		this.SetVRAMBit(1 << 4, v & (1 << 0));
	}
	
	GetVRAMcy() {
		return (this.GetVRAMBit(1 << 5) << 4) | (this.GetVRAMBit(1 << 6) << 3) | (this.GetVRAMBit(1 << 7) << 2) | (this.GetVRAMBit(1 << 8) << 1) | (this.GetVRAMBit(1 << 9) << 0);
	}
		
	SetVRAMcy(v) {
		this.SetVRAMBit(1 << 5, v & (1 << 4));
		this.SetVRAMBit(1 << 6, v & (1 << 3));
		this.SetVRAMBit(1 << 7, v & (1 << 2));
		this.SetVRAMBit(1 << 8, v & (1 << 1));
		this.SetVRAMBit(1 << 9, v & (1 << 0));
	}
	
	GetTRAMfy() {
		return (this.GetTRAMBit(1 << 12) << 2) | (this.GetTRAMBit(1 << 13) << 1) | (this.GetTRAMBit(1 << 14) << 0);
	}
	
	SetTRAMfy(v) {
		this.SetTRAMBit(1 << 12, v & (1 << 2));
		this.SetTRAMBit(1 << 13, v & (1 << 1));
		this.SetTRAMBit(1 << 14, v & (1 << 0));
	}
	
	GetVRAMfy() {
		return (this.GetVRAMBit(1 << 12) << 2) | (this.GetVRAMBit(1 << 13) << 1) | (this.GetVRAMBit(1 << 14) << 0);
	}
	
	SetVRAMfy(v) {
		this.SetVRAMBit(1 << 12, v & (1 << 2));
		this.SetVRAMBit(1 << 13, v & (1 << 1));
		this.SetVRAMBit(1 << 14, v & (1 << 0));
	}
	
	cpuRead(addr, rdonly) {
		var data = 0x00;
		
		if (rdonly) {
			switch (addr) {
				case 0x0000: // Control
					data = this.control.reg;
					break;
				case 0x0001: // Mask
					data = this.mask.reg;
					break;
				case 0x0002: // Status
					data = this.status.reg;
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
					data = this.ppu_data_buffer;
					this.ppu_data_buffer = this.ppuRead(this.vram_addr.reg);
					
					if (this.vram_addr.reg > 0x3f00) { data = this.ppu_data_buffer; };
					this.vram_addr.reg += (this.GetControlBit(1 << 2) ? 32 : 1);
					break;
			}
		} else {
			switch (addr) {
				case 0x0000: // Control
					break;
				case 0x0001: // Mask
					break;
				case 0x0002: // Status
					data = (this.status.reg & 0xE0) | (this.ppu_data_buffer & 0x1F);
					this.SetStatusBit((1 << 7), 0);
					this.address_latch = 0;
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
					data = this.ppu_data_buffer;
					this.ppu_data_buffer = this.ppuRead(this.vram_addr.reg);
					
					if (this.vram_addr.reg > 0x3f00) { data = this.ppu_data_buffer; };
					this.vram_addr.reg += (this.GetControlBit(1 << 2) ? 32 : 1);
					break;
			}
		}
		
		return data;
	}
	cpuWrite(addr, data) {
		switch (addr) {
			case 0x0000: // Control
				this.control.reg = data;
				this.SetTRAMBit(1 << 10, this.GetControlBit(1 << 0));
				this.SetTRAMBit(1 << 11, this.GetControlBit(1 << 1));
				break;
			case 0x0001: // Mask
				this.mask.reg = data;
				break;
			case 0x0002: // Status
				break;
			case 0x0003: // OAM Address
				break;
			case 0x0004: // OAM Data
				break;
			case 0x0005: // Scroll
				if (this.address_latch == 0) {
					this.fine_x = data & 0x07;
					this.SetTRAMcx(data >> 3);
					this.address_latch = 1;
				} else {
					this.SetTRAMfy(data & 0x07);
					this.SetTRAMcy(data >> 3);
					this.address_latch = 0;
				}
				break;
			case 0x0006: // PPU Address
				if (this.address_latch == 0) {
					this.tram_addr.reg = (((data & 0x3F) << 8) & 0xFFFF) | (this.tram_addr.reg & 0x00FF);
					this.address_latch = 1;
				} else {
					this.tram_addr.reg = (this.tram_addr.reg & 0xFF00) | data;
					this.vram_addr = this.tram_addr;
					this.address_latch = 0;
				}
				break;
			case 0x0007: // PPU Data
				this.ppuWrite(this.vram_addr.reg, data);
				this.vram_addr.reg += (this.GetControlBit(1 << 2) ? 32 : 1);
				break;
		}
	}
	
	ppuRead(addr, rdonly) {
		var data = 0x00;
		addr &= 0x3FFF;
		
		var result = this.cart.ppuRead(addr, data);
		if (result[1]) {
			data = result[0];
		} else if (addr >= 0x0000 && addr <= 0x1FFF) {
			data = this.tblPattern[(addr & 0x1000) >> 12][addr & 0x0FFF];
		} else if (addr >= 0x2000 && addr <= 0x3EFF) {
			addr &= 0x0FFF;
			
			if (this.cart.mirror == "VERTICAL") {
				// Vertical
				if (addr >= 0x0000 && addr <= 0x03FF) {
					data = this.tblName[0][addr & 0x03FF];
				}
				if (addr >= 0x0400 && addr <= 0x07FF) {
					data = this.tblName[1][addr & 0x03FF];
				}
				if (addr >= 0x0800 && addr <= 0x0BFF) {
					data = this.tblName[0][addr & 0x03FF];
				}
				if (addr >= 0x0C00 && addr <= 0x0FFF) {
					data = this.tblName[1][addr & 0x03FF];
				}
			} else if (this.cart.mirror == "HORIZONTAL") {
				// Horizontal
				if (addr >= 0x0000 && addr <= 0x03FF) {
					data = this.tblName[0][addr & 0x03FF];
				}
				if (addr >= 0x0400 && addr <= 0x07FF) {
					data = this.tblName[0][addr & 0x03FF];
				}
				if (addr >= 0x0800 && addr <= 0x0BFF) {
					data = this.tblName[1][addr & 0x03FF];
				}
				if (addr >= 0x0C00 && addr <= 0x0FFF) {
					data = this.tblName[1][addr & 0x03FF];
				}
			}
		} else if (addr >= 0x3F00 && addr <= 0x3FFF) {
			addr &= 0x001F;
			if (addr == 0x0010) { addr = 0x0000 };
			if (addr == 0x0014) { addr = 0x0004 };
			if (addr == 0x0018) { addr = 0x0008 };
			if (addr == 0x001C) { addr = 0x000C };
			data = this.tblPalette[addr] & (this.GetMaskBit(1 << 0) ? 0x30 : 0x3F);
		}
		
		return data;
	}
	ppuWrite(addr, data){
		addr &= 0x3FFF;
		
		var result = this.cart.ppuWrite(addr, data)
		if (result[1]) {
			
		} else if (addr >= 0x0000 && addr <= 0x1FFF) {
			this.tblPattern[(addr & 0x1000) >> 12][addr & 0x0FFF] = data;
		} else if (addr >= 0x2000 && addr <= 0x3EFF) {
			addr &= 0x0FFF;
			if (this.cart.mirror == "VERTICAL") {
				// Vertical
				if (addr >= 0x0000 && addr <= 0x03FF) {
					this.tblName[0][addr & 0x03FF] = data;
				}
				if (addr >= 0x0400 && addr <= 0x07FF) {
					this.tblName[1][addr & 0x03FF] = data;
				}
				if (addr >= 0x0800 && addr <= 0x0BFF) {
					this.tblName[0][addr & 0x03FF] = data;
				}
				if (addr >= 0x0C00 && addr <= 0x0FFF) {
					this.tblName[1][addr & 0x03FF] = data;
				}
			} else if (this.cart.mirror == "HORIZONTAL") {
				// Horizontal
				if (addr >= 0x0000 && addr <= 0x03FF) {
					this.tblName[0][addr & 0x03FF] = data;
				}
				if (addr >= 0x0400 && addr <= 0x07FF) {
					this.tblName[0][addr & 0x03FF] = data;
				}
				if (addr >= 0x0800 && addr <= 0x0BFF) {
					this.tblName[1][addr & 0x03FF] = data;
				}
				if (addr >= 0x0C00 && addr <= 0x0FFF) {
					this.tblName[1][addr & 0x03FF] = data;
				}
			}
		} else if (addr >= 0x3F00 && addr <= 0x3FFF) {
			addr &= 0x001F;
			if (addr == 0x0010) { addr = 0x0000 };
			if (addr == 0x0014) { addr = 0x0004 };
			if (addr == 0x0018) { addr = 0x0008 };
			if (addr == 0x001C) { addr = 0x000C };
			this.tblPalette[addr] = data;
		}
	}
	
	cart;
	
	ConnectCartridge(cartridge) {
		this.cart = cartridge
	}
	
	IncrementScrollX() {
		if (this.GetMaskBit(1 << 3) || this.GetMaskBit(1 << 4)) {
			if (this.GetVRAMcx() == 31) {
				this.SetVRAMcx(0);
				
				this.SetVRAMBit(1 << 10, 1 - this.GetVRAMBit(1 << 10));
			} else {
				this.SetVRAMcx(this.GetVRAMcx() + 1);
			}
		}
	}
	
	IncrementScrollY() {
		if (this.GetMaskBit(1 << 3) || this.GetMaskBit(1 << 4)) {
			if (this.GetVRAMfy() < 7) {
				this.SetVRAMfy(this.GetVRAMfy() + 1);
			} else {
				this.SetVRAMfy(0);
				
				if (this.GetVRAMcy() == 29) {
					this.SetVRAMcy(0);
					
					this.SetVRAMBit(1 << 11, 1 - this.GetVRAMBit(1 << 11));
				} else if(this.GetVRAMcy() == 31) {
					this.SetVRAMcy(0);
				} else {
					this.SetVRAMcy(this.GetVRAMcy() + 1);
				}
			}
		}
	}
	
	TransferAddressX() {
		if (this.GetMaskBit(1 << 3) || this.GetMaskBit(1 << 4)) {
			this.SetVRAMBit(1 << 10, this.GetTRAMBit(1 << 10));
			this.SetVRAMcx(this.GetTRAMcx());
		}
	}
	
	TransferAddressY() {
		if (this.GetMaskBit(1 << 3) || this.GetMaskBit(1 << 4)) {
			this.SetVRAMfy(this.GetTRAMfy());
			this.SetVRAMBit(1 << 11, this.GetTRAMBit(1 << 11));
			this.SetVRAMcy(this.GetTRAMcy());
		}
	}
	
	LoadBackgroundShifters() {
		this.bg_shifter_pattern_lo = (this.bg_shifter_pattern_lo & 0xFF00) | this.bg_next_tile_lsb;
		this.bg_shifter_pattern_hi = (this.bg_shifter_pattern_hi & 0xFF00) | this.bg_next_tile_msb;
		this.bg_shifter_attrib_lo = (this.bg_shifter_attrib_lo & 0xFF00) | ((this.bg_next_tile_attrib & 0b01) ? 0xFF : 0x00);
		this.bg_shifter_attrib_hi = (this.bg_shifter_attrib_hi & 0xFF00) | ((this.bg_next_tile_attrib & 0b10) ? 0xFF : 0x00);
	}
	
	UpdateShifters() {
		if (this.GetMaskBit(1 << 3)) {
			this.bg_shifter_pattern_lo <<= 1;
			this.bg_shifter_pattern_hi <<= 1;
			this.bg_shifter_attrib_lo <<= 1;
			this.bg_shifter_attrib_hi <<= 1;
			
			this.bg_shifter_pattern_lo &= 0xFFFF;
			this.bg_shifter_pattern_hi &= 0xFFFF;
			this.bg_shifter_attrib_lo &= 0xFFFF;
			this.bg_shifter_attrib_hi &= 0xFFFF;
		}
	}
	
	clock() {
		
		if (this.scanline >= -1 && this.scanline < 240) {
			if (this.scanline == 0 && this.cycle == 0) {
				this.cycle = 1;
			}
			
			if (this.scanline == -1 && this.cycle == 1) {
				this.SetStatusBit((1 << 7), 0);
			}
			
			if ((this.cycle >= 2 && this.cycle < 258) || (this.cycle >= 321 && this.cycle < 338)) {
				this.UpdateShifters();
				
				switch ((this.cycle - 1) % 8) {
					case 0:
						this.LoadBackgroundShifters();
						this.bg_next_tile_id = this.ppuRead(0x2000 | (this.vram_addr.reg & 0x0FFF));
						break;
					case 2:
						this.bg_next_tile_attrib = this.ppuRead(0x23C0 | (this.GetVRAMBit(1 << 11) << 11)
							| (this.GetVRAMBit(1 << 10) << 10)
							| ((this.GetVRAMcy() >> 2) << 3)
							| (this.GetVRAMcx() >> 2));
						if (this.GetVRAMcy() & 0x02) { this.bg_next_tile_attrib >>= 4 };
						if (this.GetVRAMcx() & 0x02) { this.bg_next_tile_attrib >>= 2 };
						this.bg_next_tile_attrib &= 0x03;
						break;
					case 4:
						this.bg_next_tile_lsb = this.ppuRead((this.GetControlBit(1 << 12) << 12)
							+ ((this.bg_next_tile_id << 4) & 0xFFFF)
							+ (this.GetVRAMfy()) + 0);
						break;
					case 6:
						this.bg_next_tile_msb = this.ppuRead((this.GetControlBit(1 << 12) << 12)
							+ ((this.bg_next_tile_id << 4) & 0xFFFF)
							+ (this.GetVRAMfy()) + 8);
						break;
					case 7:
						this.IncrementScrollX();
						break;
				}
			}
			
			if (this.cycle == 256) {
				this.IncrementScrollY();
			}
			
			if (this.cycle == 257) {
				this.LoadBackgroundShifters();
				this.TransferAddressX();
			}
			
			if (this.cycle == 338 || this.cycle == 340) {
				this.bg_next_tile_id == this.ppuRead(0x2000 | (this.vram_addr.reg & 0x0FFF));
			}
			
			if (this.scanline == -1 && this.cycle >= 280 && this.cycle < 305) {
				this.TransferAddressY();
			}
		}
		
		if (this.scanline == 240) {
			// Post Render Scanline - Do Nothing!
		}
		
		if (this.scanline >= 241 && this.scanline < 261) {
			if (this.scanline == 241 && this.cycle == 1) {
				this.SetStatusBit((1 << 7), 1);
				if (this.GetControlBit((1 << 7))) {
					this.nmi = true;
				}
			}
		}
		
		
		var bg_pixel = 0x00;
		var bg_palette = 0x00;
		
		if (this.GetMaskBit(1 << 3)) {
			var bit_mux = 0x8000 >> this.fine_x;
			
			var p0_pixel = ((this.bg_shifter_pattern_lo & bit_mux) > 0) ? 1 : 0;
			var p1_pixel = ((this.bg_shifter_pattern_hi & bit_mux) > 0) ? 1 : 0;
			bg_pixel = (p1_pixel << 1) | p0_pixel;
			
			var bg_pal0 = ((this.bg_shifter_attrib_lo & bit_mux) > 0) ? 1 : 0;
			var bg_pal1 = ((this.bg_shifter_attrib_hi & bit_mux) > 0) ? 1 : 0;
			bg_palette = (bg_pal1 << 1) | bg_pal0;
			
		}
		
		//cool other noise:
		//set(this.cycle - 1, this.scanline, (Math.round((((Math.sin(this.cycle	+ this.scanline) + 1) * 0.5) + (Math.cos(this.cycle	- this.scanline) + 1)) * 0.5) * 0.5) ? this.palScreen[0x3F] : this.palScreen[0x30], this);
		
		set(this.cycle - 1, this.scanline, this.GetColourFromPaletteRam(bg_palette, bg_pixel), this);
		
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
	
	palScreen       =   new Array(0x40).fill(new Uint8Array(3));
	sprScreen       =   new ImageData(256, 240);
	sprNameTable    = [ new ImageData(256, 240), new ImageData(256, 240) ];
	sprPatternTable = [ new ImageData(128, 128), new ImageData(128, 128) ];
	
	GetScreen() {
		return this.sprScreen;
	}
	
	GetNameTable(i) {
		return this.sprNameTable[i];
	}
	
	GetPatternTable(i, palette) {
		for (var nTileY = 0; nTileY < 16; nTileY++) {
			for (var nTileX = 0; nTileX < 16; nTileX++) {
				var nOffset = (nTileY * 256 + nTileX * 16) & 0xFFFF;
				
				for (var row = 0; row < 8; row++) {
					var tile_lsb = this.ppuRead((i * 0x1000 + nOffset + row + 0x0000) & 0xFFFF);
					var tile_msb = this.ppuRead((i * 0x1000 + nOffset + row + 0x0008) & 0xFFFF);
					
					for (var col = 0; col < 8; col++) {
						var pixel = (tile_lsb & 0x01) + (tile_msb & 0x01);
						tile_lsb >>= 1; tile_msb >>=1;
						
						setPT(i,
							nTileX * 8 + (7 - col),
							nTileY * 8 + row,
							this.GetColourFromPaletteRam(palette, pixel)
						,this);
					}
				}
			}
		}
		
		return this.sprPatternTable[i];
	}
	
	GetColourFromPaletteRam(palette, pixel) {
		return this.palScreen[this.ppuRead(0x3F00 + (palette << 2) + pixel) & 0x3F];
	}
	
	frame_complete = false;
	
	scanline = 0;
	cycle = 0;
	
	status = {
		reg: 0x00
	};
	
	mask = {
		reg: 0x00
	}
	
	control = {
		reg: 0x00
	}
	
	nmi = false;
	
	address_latch = 0x00;
	ppu_data_buffer = 0x00;
	
	vram_addr = {
		reg: 0x0000
	};
	
	tram_addr = {
		reg: 0x0000
	};
	
	fine_x = 0x00;
	
	
	bg_next_tile_id = 0x00;
	bg_next_tile_attrib = 0x00;
	bg_next_tile_lsb = 0x00;
	bg_next_tile_msb = 0x00;
	
	bg_shifter_pattern_lo = 0x0000;
	bg_shifter_pattern_hi = 0x0000;
	bg_shifter_attrib_lo = 0x0000;
	bg_shifter_attrib_hi = 0x0000;
	
	reset() {
		this.fine_x = 0x00;
		this.address_latch = 0x00;
		this.ppu_data_buffer = 0x00;
		this.scanline = 0;
		this.cycle = 0;
		this.bg_next_tile_id = 0x00;
		this.bg_next_tile_attrib = 0x00;
		this.bg_next_tile_lsb = 0x00;
		this.bg_next_tile_msb = 0x00;
		this.bg_shifter_pattern_lo = 0x0000;
		this.bg_shifter_pattern_hi = 0x0000;
		this.bg_shifter_attrib_lo = 0x0000;
		this.bg_shifter_attrib_hi = 0x0000;
		this.status.reg = 0x00;
		this.mask.reg = 0x00;
		this.control.reg = 0x00;
		this.vram_addr.reg = 0x0000;
		this.tram_addr.reg = 0x0000;
	}
}