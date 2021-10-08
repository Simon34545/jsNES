class Mapper {
	nPRGBanks;
	nCHRBanks;
	
	constructor(prgBanks, chrBanks) {
		this.nPRGBanks = prgBanks;
		this.nCHRBanks = chrBanks;
	}
	
	cpuMapRead(addr, mapped_addr) {};
	cpuMapWrite(addr, mapped_addr) {};
	ppuMapRead(addr, mapped_addr) {};
	ppuMapWrite(addr, mapped_addr) {};
}