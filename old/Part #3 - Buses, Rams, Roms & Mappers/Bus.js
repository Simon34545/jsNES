class Bus {
	cpu;
	ppu;
	cpuRam;
	cart;
	
	constructor() {
		this.cpu = new olc6502();
		this.ppu = new olc2C02();
		this.cpuRam = new Uint8Array(2048);
		
		this.cpu.ConnectBus(this);
	}
	
	cpuWrite(addr, data) {
		if (this.cart.cpuWrite(addr, data)) {
			
		} else if (addr >= 0x0000 && addr <= 0x1FFF) {
			this.cpuRam[addr & 0x07FF] = data;
		} else if (addr >= 0x2000 && addr <= 0x3FFF) {
			this.ppu.cpuWrite(addr & 0x0007, data);
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
		}
		
		return data;
	}
	
	insertCartridge(cartridge) {
		this.cart = cartridge;
		this.ppu.ConnectCartridge(cartridge);
	}
	
	reset() {
		this.cpu.reset();
		this.nSystemClockCounter = 0;
	}
	
	clock() {
		this.ppu.clock();
		
		if (this.nSystemClockCounter % 3 == 0) {
			this.cpu.clock();
		}
		
		this.nSystemClockCounter++;
	}
	
	nSystemClockCounter = 0;
}