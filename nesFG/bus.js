class Bus {
	cpu = new nes6502();
	ppu = new nes2C02();
	
	cart = null;
	
	cpuRam = new Uint8Array(2048);
	
	controller = new Uint8Array(2);
	controller_state = new Uint8Array(2);
	
	systemClockCounter = 0;
	
	dma_page = new uint8();
	dma_addr = new uint8();
	dma_data = new uint8();
	
	dma_dummy = true;
	dma_transfer = false;
	
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
		} else if (addr == 0x4014) {
			this.dma_page.v = data.v;
			this.dma_addr.v = 0x00;
			this.dma_transfer = true;
		} else if (addr >= 0x4016 && addr <= 0x4017) {
			this.controller_state[addr & 0x0001] = this.controller[addr & 0x0001];
		}
	}
	
	cpuRead(addr, readOnly = false) {
		let data = new uint8();
		
		if (this.cart.cpuRead(addr, data)) {
			
		} else if (addr >= 0x0000 && addr <= 0x1FFF) {
			data.v = this.cpuRam[addr & 0x07FF];
		} else if (addr >= 0x2000 && addr <= 0x3FFF) {
			data.v = this.ppu.cpuRead(addr & 0x0007, readOnly);
		} else if (addr >= 0x4016 && addr <= 0x4017) {
			data.v = (this.controller_state[addr & 0x0001] & 0x80) > 0;
			this.controller_state[addr & 0x0001] <<= 1;
		}
		
		return data.v;
	}
	
	insertCartridge(cartridge) {
		this.cart = cartridge;
		this.ppu.ConnectCartridge(cartridge);
	}
	
	reset() {
		this.cart.reset();
		this.cpu.reset();
		this.ppu.reset();
		this.systemClockCounter = 0;
		this.dma_page.v = 0x00;
		this.dma_addr.v = 0x00;
		this.dma_data.v = 0x00;
		this.dma_dummy = true;
		this.dma_transfer = false;
	}
	
	clock() {
		this.ppu.clock();
		if (this.systemClockCounter % 3 == 0) {
			if (this.dma_transfer) {
				if (this.dma_dummy) {
					if (this.systemClockCounter % 2 == 1) {
						this.dma_dummy = false;
					}
				} else {
					if (this.systemClockCounter % 2 == 0) {
						this.dma_data.v = this.cpuRead(this.dma_page.v << 8 | this.dma_addr.v);
					} else {
						this.ppu.pOAM(this.dma_addr.v, this.dma_data.v);
						this.dma_addr.v++;
						
						if (this.dma_addr.v == 0x00) {
							this.dma_transfer = false;
							this.dma_dummy = true;
						}
					}
				}
			} else {
				this.cpu.clock();
			}
		}
		
		if (this.ppu.nmi) {
			this.ppu.nmi = false;
			this.cpu.nmi();
		}
		
		this.systemClockCounter++;
	}
}