class Bus {
	cpu = new nes6502();
	ppu = new nes2C02();
	apu = new nes2A03();
	
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
	
	data = new uint8();
	
	SetSampleFrequency(sample_rate) {
		this.audioTimePerSystemSample = 1 / sample_rate;
		this.audioTimePerNESClock = 1 / 5369318;
	}
	
	audioSample = 0;
	audioTime = 0;
	
	audioTimePerSystemSample = 0;
	audioTimePerNESClock = 0;
	
	constructor() {
		for (let i = 0; i < this.cpuRam.length; i++) {
			this.cpuRam[i] = 0x00;
		}
		
		this.cpu.ConnectBus(this);
	}
	
	cpuWrite(addr, data) {
		this.data.v = data;
		if (this.cart.cpuWrite(addr, this.data)) {
			
		} else if (addr >= 0x0000 && addr <= 0x1FFF) {
			this.cpuRam[addr & 0x07FF] = this.data.v;
		} else if (addr >= 0x2000 && addr <= 0x3FFF) {
			this.ppu.cpuWrite(addr & 0x0007, this.data.v);
		} else if ((addr >= 0x4000 && addr <= 0x4013) || addr == 0x4015 || addr == 0x4017) {
			this.apu.cpuWrite(addr, data);
		} else if (addr == 0x4014) {
			this.dma_page.v = this.data.v;
			this.dma_addr.v = 0x00;
			this.dma_transfer = true;
		} else if (addr >= 0x4016 && addr <= 0x4017) {
			this.controller_state[addr & 0x0001] = this.controller[addr & 0x0001];
		}
	}
	
	cpuRead(addr, readOnly = false) {
		this.data.v = 0;
		
		if (this.cart.cpuRead(addr, this.data)) {
			
		} else if (addr >= 0x0000 && addr <= 0x1FFF) {
			this.data.v = this.cpuRam[addr & 0x07FF];
		} else if (addr >= 0x2000 && addr <= 0x3FFF) {
			this.data.v = this.ppu.cpuRead(addr & 0x0007, readOnly);
		} else if (addr >= 0x4016 && addr <= 0x4017) {
			this.data.v = (this.controller_state[addr & 0x0001] & 0x80) > 0;
			this.controller_state[addr & 0x0001] <<= 1;
		}
		
		return this.data.v;
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
		
		this.apu.clock();
		
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
		
		let audioSampleReady = false;
		this.audioTime += this.audioTimePerNESClock;
		if (this.audioTime >= this.audioTimePerSystemSample) {
			this.audioTime -= this.audioTimePerSystemSample;
			this.audioSample = this.apu.GetOutputSample();
			audioSampleReady = true;
		}
		
		if (this.ppu.nmi) {
			this.ppu.nmi = false;
			this.cpu.nmi();
		}
		
		if (this.cart.GetMapper().irqState()) {
			this.cart.GetMapper().irqClear();
			this.cpu.irq();
		}
		
		this.systemClockCounter++;
		return audioSampleReady;
	}
}