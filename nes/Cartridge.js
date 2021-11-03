class Header {
	name = new Uint8Array(4);
	prg_rom_chunks = new uint8();
	chr_rom_chunks = new uint8();
	mapper1 = new uint8();
	mapper2 = new uint8();
	prg_ram_size = new uint8();
	tv_system1 = new uint8;
	tv_system2 = new uint8;
	unused = new Uint8Array(5);
}

class Cartridge {
	PRGMemory = new Uint8Array();
	CHRMemory = new Uint8Array();
	
	mapperID = 0;
	PRGBanks = 0;
	CHRBanks = 0;
	
	mapper = null;
	hw_mirror = 0;
	
	imageValid = false;
	errorCode = 'An error occured while loading the rom!';
	
	mode = 0; // (0: NTSC; 2: PAL; 1/3: dual compatible)
	
	constructor(file) {
		let read_idx = 0;
		
		let header = new Header();
		header.name[0] = file[0];
		header.name[1] = file[1];
		header.name[2] = file[2];
		header.name[3] = file[3];
		
		header.prg_rom_chunks.v = file[4];
		header.chr_rom_chunks.v = file[5];
		header.mapper1.v = file[6];
		header.mapper2.v = file[7];
		header.prg_ram_size.v = file[8];
		header.tv_system1.v = file[9];
		header.tv_system2.v = file[10];
		
		header.unused[0] = file[11];
		header.unused[1] = file[12];
		header.unused[2] = file[13];
		header.unused[3] = file[14];
		header.unused[4] = file[15];
		
		read_idx = 16;
		
		if (header.mapper1 & 0x04) {
			read_idx = 512;
		}
		
		this.mapperID = ((header.mapper2.v >> 4) << 4) | (header.mapper1.v >> 4);
		this.hw_mirror = (header.mapper1.v & 0x01) ? MIRROR.VERTICAL : MIRROR.HORIZONTAL;
		
		let fileType = 1;
		if ((header.mapper2.v & 0x0C) == 0x08) fileType = 2;
		
		if (fileType == 0) {
			
		}
		
		if (fileType == 1) {
			this.PRGBanks = header.prg_rom_chunks.v;
			this.PRGMemory = new Uint8Array(this.PRGBanks * 16384);
			for (let i = 0; i < this.PRGMemory.length; i++) {
				this.PRGMemory[i] = file[read_idx + i];
			}
			read_idx += this.PRGMemory.length;
			
			this.CHRBanks = header.chr_rom_chunks.v;
			if (this.CHRBanks == 0) {
				this.CHRMemory = new Uint8Array(8192);
			} else {
				this.CHRMemory = new Uint8Array(this.CHRBanks * 8192);
			}
			
			for (let i = 0; i < this.CHRMemory.length; i++) {
				this.CHRMemory[i] = file[read_idx + i];
			}
			
			read_idx += this.CHRMemory.length;
		}
		
		if (fileType == 2) {
			this.PRGBanks = ((header.prg_ram_size.v & 0x07) << 8) | header.prg_rom_chunks.v;
			this.PRGMemory = new Uint8Array(this.PRGBanks * 16384);
			for (let i = 0; i < this.PRGMemory.length; i++) {
				this.PRGMemory[i] = file[read_idx + i];
			}
			read_idx += this.PRGMemory.length;
			
			this.CHRBanks = ((header.prg_ram_size.v & 0x38) << 8) | header.prg_rom_chunks.v;
			this.CHRMemory = new Uint8Array(this.CHRBanks * 8192);
			for (let i = 0; i < this.CHRMemory.length; i++) {
				this.CHRMemory[i] = file[read_idx + i];
			}
			read_idx += this.CHRMemory.length;
		}
		
		switch(this.mapperID) {
		case  0: this.mapper = new Mapper_000(this.PRGBanks, this.CHRBanks); break;
		case  1: this.mapper = new Mapper_001(this.PRGBanks, this.CHRBanks); break;
		case  2: this.mapper = new Mapper_002(this.PRGBanks, this.CHRBanks); break;
		case  3: this.mapper = new Mapper_003(this.PRGBanks, this.CHRBanks); break;
		case  4: this.mapper = new Mapper_004(this.PRGBanks, this.CHRBanks); break;
		case  7: this.mapper = new Mapper_007(this.PRGBanks, this.CHRBanks); break;
		case 31: this.mapper = new Mapper_031(this.PRGBanks, this.CHRBanks); break;
		case 66: this.mapper = new Mapper_066(this.PRGBanks, this.CHRBanks); break;
		default: this.errorCode = 'Mapper ' + this.mapperID + ' not supported!'; return;
		}
		
		this.mode1 = header.tv_system1 & 0x1;
		this.mode2 = header.tv_system2 & 0x3;
		
		this.imageValid = true;
	}
	
	mapped_addr = new uint32();
	
	cpuRead(addr, data) {
		this.mapped_addr.v = 0;
		if (this.mapper.cpuMapRead(addr, this.mapped_addr, data)) {
			if (this.mapped_addr.v === -1) {
				return true;
			} else {
				data.v = this.PRGMemory[this.mapped_addr.v];
			}
			//console.log("mapped to " + hex(this.mapped_addr.v, 8) + " out of " + hex(this.PRGMemory.length, 8))
			return true;
		} else {
			return false;
		}
	}
	
	cpuWrite(addr, data) {
		this.mapped_addr.v = 0;
		if (this.mapper.cpuMapWrite(addr, this.mapped_addr, data)) {
			if (this.mapped_addr.v === -1) {
				return true;
			} else {
				this.PRGMemory[this.mapped_addr.v] = data.v;
			}
			return true;
		} else {
			return false;
		}
	}
	
	ppuRead(addr, data) {
		this.mapped_addr.v = 0;
		if (this.mapper.ppuMapRead(addr, this.mapped_addr)) {
			data.v = this.CHRMemory[this.mapped_addr.v];
			return true;
		} else {
			return false;
		}
	}
	
	ppuWrite(addr, data) {
		this.mapped_addr.v = 0;
		if (this.mapper.ppuMapWrite(addr, this.mapped_addr)) {
			this.CHRMemory[this.mapped_addr.v] = data.v;
			return true;
		} else {
			return false;
		}
	}
	
	reset() {
		if (this.mapper != null) {
			this.mapper.reset();
		}
	}
	
	Mirror() {
		let m = this.mapper.mirror();
		if (m === MIRROR.HARDWARE) {
			return this.hw_mirror;
		} else {
			return m;
		}
	}
	
	GetMapper() {
		return this.mapper;
	}
}