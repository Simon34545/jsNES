class Bus {
	cpu;
	ppu;
	cpuRam;
	cart;
	
	controller;
	controller_state;
	
	constructor() {
		this.cpu = new olc6502();
		this.ppu = new olc2C02();
		this.cpuRam = new Uint8Array(2048);
		
		this.controller = new Uint8Array(2);
		this.controller_state = new Uint8Array(2);
		
		this.cpu.ConnectBus(this);
	}
	
	cpuWrite(addr, data) {
		if (this.cart.cpuWrite(addr, data)) {
			
		} else if (addr >= 0x0000 && addr <= 0x1FFF) {
			this.cpuRam[addr & 0x07FF] = data;
		} else if (addr >= 0x2000 && addr <= 0x3FFF) {
			this.ppu.cpuWrite(addr & 0x0007, data);
		} else if (addr >= 0x4016 && addr <= 0x4017) {
			this.controller_state[addr & 0x0001] = this.controller[addr & 0x0001];
		}
	}
	
	cpuRead(addr, bReadOnly) {
		var data = 0x00;
		
		var result = this.cart.cpuRead(addr, data);
		if (result[1]) {
			data = result[0]
		} else if (addr >= 0x0000 && addr <= 0x1FFF) {
			data = this.cpuRam[addr & 0x07FF];
		} else if (addr >= 0x2000 && addr <= 0x3FFF) {
			data = this.ppu.cpuRead(addr & 0x0007, bReadOnly);
		} else if (addr >= 0x4016 && addr <= 0x4017) {
			data = ((this.controller_state[addr & 0x0001] & 0x80) > 0) ? 1 : 0;
			this.controller_state[addr & 0x0001] <<= 1;
		}
		
		return data;
	}
	
	insertCartridge(cartridge) {
		this.cart = cartridge;
		this.ppu.ConnectCartridge(cartridge);
	}
	
	reset() {
		this.cart.reset();
		this.cpu.reset();
		this.ppu.reset();
		this.nSystemClockCounter = 0;
	}
	
	clock() {
		this.ppu.clock();
		
		if (this.nSystemClockCounter % 3 == 0) {
			this.cpu.clock();
		}
		
		if (this.ppu.nmi) {
			this.ppu.nmi = false;
			this.cpu.nmi();
		}
		
		this.nSystemClockCounter++;
	}
	
	nSystemClockCounter = 0;
}