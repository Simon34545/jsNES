class Mapper_000 {
	nPRGBanks;
	nCHRBanks;
	
	constructor(prgBanks, chrBanks) {
		this.nPRGBanks = prgBanks;
		this.nCHRBanks = chrBanks;
	}
	
	cpuMapRead(addr, mapped_addr) {
		if (addr >= 0x8000 && addr <= 0xFFFF) {
			mapped_addr = addr & (this.nPRGBanks > 1 ? 0x7FFF : 0x3FFF);
			return [mapped_addr, true];
		}
		
		
		return [mapped_addr, false];
	}
	
	cpuMapWrite(addr, mapped_addr) {
		if (addr >= 0x8000 && addr <= 0xFFFF) {
			mapped_addr = addr & (this.nPRGBanks > 1 ? 0x7FFF : 0x3FFF);
			return [mapped_addr, true];
		}
		
		return [mapped_addr, false];
	}
	
	ppuMapRead(addr, mapped_addr) {
		if (addr >= 0x0000 && addr <= 0x1FFF) {
			mapped_addr = addr;
			return [mapped_addr, true];
		}
		
		return [mapped_addr, false];
	}
	
	ppuMapWrite(addr, mapped_addr) {
		/*if (addr >= 0x0000 && addr <= 0x1FFF) {
			
			return [mapped_addr, true];
		}*/
		
		return [mapped_addr, false];
	}
}