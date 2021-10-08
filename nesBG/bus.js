class Bus {
	cpu = new nes6502();
	ppu = new nes2C02();
	
	cart = null;
	
	cpuRam = new Uint8Array(2048);
	
	systemClockCounter = 0;
	
	constructor() {
		for (let i = 0; i < this.cpuRam.length; i++) {
			this.cpuRam[i] = 0x00;
		}
		
		this.cpu.ConnectBus(this);
	}
	
	cpuWrite(addr, data) {
		data = new uint8(data);
		if (this.cart.cpuWrite(addr, data)) {
			
		} else if (addr >= 0x0000 && addr <= 0x1FFF) {
			this.cpuRam[addr & 0x07FF] = data.v;
		} else if (addr >= 0x2000 && addr <= 0x3FFF) {
			this.ppu.cpuWrite(addr & 0x0007, data.v);
		}
	}
	
	cpuRead(addr, readOnly = false) {
		let data = new uint8();
		
		if (this.cart.cpuRead(addr, data)) {
			
		} else if (addr >= 0x0000 && addr <= 0x1FFF) {
			data.v = this.cpuRam[addr & 0x07FF];
		} else if (addr >= 0x2000 && addr <= 0x3FFF) {
			data.v = this.ppu.cpuRead(addr & 0x0007, readOnly);
		}
		
		return data.v;
	}
	
	insertCartridge(cartridge) {
		this.cart = cartridge;
		this.ppu.ConnectCartridge(cartridge);
	}
	
	reset() {
		this.cpu.reset();
		this.systemClockCounter = 0;
	}
	
	clock() {
		this.ppu.clock();
		if (this.systemClockCounter % 3 == 0) {
			this.cpu.clock();
		}
		
		if (this.ppu.nmi) {
			this.ppu.nmi = false;
			this.cpu.nmi();
		}
		
		this.systemClockCounter++;
	}
}