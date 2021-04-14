class Mapper {
	nPRGBanks;
	nCHRBanks;
	
	constructor(prgBanks, chrBanks) {
		this.nPRGBanks = prgBanks;
		this.nCHRBanks = chrBanks;
		
		this.reset()
	}
	
	cpuMapRead(addr, mapped_addr) {};
	cpuMapWrite(addr, mapped_addr, data) {};
	ppuMapRead(addr, mapped_addr) {};
	ppuMapWrite(addr, mapped_addr) {};
	
	reset() {};
}