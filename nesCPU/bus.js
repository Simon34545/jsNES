class Bus {
	cpu = new nes6502;
	
	ram = new Uint8Array(64 * 1024);
	
	constructor() {
		for (let i = 0; i < this.ram.length; i++) {
			this.ram[i] = 0x00;
		}
		
		this.cpu.ConnectBus(this);
	}
	
	write(addr, data) {
		if (addr >= 0x0000 && addr <= 0xFFFF) {
			this.ram[addr] = data;
		}
	}
	
	read(addr, readOnly = false) {
		if (addr >= 0x0000 && addr <= 0xFFFF) {
			return this.ram[addr];
		}
		
		return 0x00;
	}
}