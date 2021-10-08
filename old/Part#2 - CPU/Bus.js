class Bus {
	cpu = undefined;
	ram = undefined;
	
	constructor() {
		this.cpu = new olc6502();
		this.ram = new Uint8Array(64 * 1024);
		
		this.cpu.ConnectBus(this);
	}
	
	write = function(addr, data) {
		if (addr >= 0x0000 && addr <= 0xFFFF) {
			this.ram[addr] = data;
		}
	}
	
	read = function(addr, bReadOnly) {
		if (addr >= 0x0000 && addr <= 0xFFFF) {
			return this.ram[addr];
		}
		
		return 0x00;
	}
}