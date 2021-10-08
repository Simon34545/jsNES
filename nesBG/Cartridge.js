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
	MIRROR = {
		HORIZONTAL: 0,
		VERTICAL: 1,
		ONESCREEN_LO: 2,
		ONESCREEN_HI: 3,
	}	
	
	PRGMemory = new Uint8Array();
	CHRMemory = new Uint8Array();
	
	mapperID = 0;
	PRGBanks = 0;
	CHRBanks = 0;
	
	mapper = null;
	mirror = 0;
	
	constructor(fileName) {
		let file = nesroms[fileName];
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
		header.unused = new Uint8Array(5);
		
		header.unused[0] = file[11];
		header.unused[1] = file[12];
		header.unused[2] = file[13];
		header.unused[3] = file[14];
		header.unused[4] = file[15];
		
		read_idx = 16;
		
		if (header.mapper1 & 0x04) {
			read_idx = 512;
		}
		
		this.mapperID = ((header.mapper2.v >> 4) << 4) | (header.mapper1 >> 4);
		this.mirror = (header.mapper1.v & 0x01) ? this.MIRROR.VERTICAL : this.MIRROR.HORIZONTAL;
		
		let fileType = 1;
		
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
			this.CHRMemory = new Uint8Array(this.CHRBanks * 8192);
			for (let i = 0; i < this.CHRMemory.length; i++) {
				this.CHRMemory[i] = file[read_idx + i];
			}
			read_idx += this.CHRMemory.length;
		}
		
		if (fileType == 2) {
			
		}
		
		switch(this.mapperID) {
		case 0: this.mapper = new Mapper_000(this.PRGBanks, this.CHRBanks); break;
		}
	}
	
	cpuRead(addr, data) {
		let mapped_addr = new uint32();
		if (this.mapper.cpuMapRead(addr, mapped_addr)) {
			data.v = this.PRGMemory[mapped_addr.v];
			return true;
		} else {
			return false;
		}
	}
	
	cpuWrite(addr, data) {
		let mapped_addr = new uint32();
		if (this.mapper.cpuMapWrite(addr, mapped_addr)) {
			this.PRGMemory[mapped_addr.v] = data;
			return true;
		} else {
			return false;
		}
	}
	
	ppuRead(addr, data) {
		let mapped_addr = new uint32();
		if (this.mapper.ppuMapRead(addr, mapped_addr)) {
			data.v = this.CHRMemory[mapped_addr.v];
			return true;
		} else {
			return false;
		}
	}
	
	ppuWrite(addr, data) {
		let mapped_addr = new uint32();
		if (this.mapper.ppuMapWrite(addr, mapped_addr)) {
			this.CHRMemory[mapped_addr.v] = data;
			return true;
		} else {
			return false;
		}
	}
}