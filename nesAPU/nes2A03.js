class sequencer {
	sequence = 0x00000000;
	timer = 0x0000;
	reload = 0x0000;
	output = 0x00;
	
	clock(enable, funcManip) {
		if (enable) {
			this.timer--;
			if (this.timer == -1) {
				this.timer = (this.reload + 1) & 0xFFFF;
				funcManip(this);
				this.output = this.sequence & 0x00000001;
			}
		}
		
		return this.output;
	}
}

function approxsin(t) {
	let j = t * 0.15915;
	j = j - Math.floor(j);
	return 20.785 * j * (j - 0.5) * (j - 1);
}

class oscpulse {
	frequency = 0;
	dutycycle = 0;
	amplitude = 1;
	pi = 3.14159;
	harmonics = 20;
	
	sample(t) {
		let a = 0;
		let b = 0;
		let p = this.dutycycle * 2 * this.pi;
		
		for (let n = 1; n < this.harmonics; n++) {
			let c = n * this.frequency * 2 * this.pi * t;
			a += -approxsin(c) / n;
			b += -approxsin(c - p * n) / n;
		}
		
		return (2 * this.amplitude / this.pi) * (a - b);
	}
}

class nes2A03 {	
	cpuWrite(addr, data) {
		switch (addr) {
		case 0x4000:
			switch ((data & 0xC0) >> 6) {
			case 0x00: this.pulse1_seq.sequence = 0b00000001; this.pulse1_osc.dutycycle = 0.125; break;
			case 0x01: this.pulse1_seq.sequence = 0b00000011; this.pulse1_osc.dutycycle = 0.250; break;
			case 0x02: this.pulse1_seq.sequence = 0b00001111; this.pulse1_osc.dutycycle = 0.500; break;
			case 0x03: this.pulse1_seq.sequence = 0b11111100; this.pulse1_osc.dutycycle = 0.750; break;
			}
			break;
			
		case 0x4001:
			break;
			
		case 0x4002:
			this.pulse1_seq.reload = (this.pulse1_seq.reload & 0xFF00) | data;
			break;
			
		case 0x4003:
			this.pulse1_seq.reload = (data & 0x07) << 8 | (this.pulse1_seq.reload & 0x00FF);
			this.pulse1_seq.timer = this.pulse1_seq.reload
			break;
			
		case 0x4004:
			break;
			
		case 0x4005:
			break;
			
		case 0x4006:
			break;
			
		case 0x4007:
			break;
			
		case 0x4008:
			break;
			
		case 0x400C:
			break;
			
		case 0x400E:
			break;
			
		case 0x4015:
			this.pulse1_enable = data & 0x01;
			break;
			
		case 0x400F:
			break;
		}
	}
	
	cpuRead(addr) {
		return 0x00;
	}
	
	clock() {
		let quarterFrameClock = false;
		let halfFrameClock = false;
		
		this.globalTime += (0.3333333333 / 1789773);
		
		if (this.clock_counter % 6 == 0) {
			this.frame_clock_counter++;
			
			if (this.frame_clock_counter == 3729) {
				quarterFrameClock = true;
			}
			
			if (this.frame_clock_counter == 7457) {
				quarterFrameClock = true;
				halfFrameClock = true;
			}
			
			if (this.frame_clock_counter == 11186) {
				quarterFrameClock = true;
			}
			
			if (this.frame_clock_counter == 14916) {
				quarterFrameClock = true;
				halfFrameClock = true;
				this.frame_clock_counter = 0;
			}
			
			if (quarterFrameClock) {
				// adjust volume envelope
			}
			
			if (halfFrameClock) {
				// adjust note length and frequency sweepers
			}
			
			//this.pulse1_seq.clock(this.pulse1_enable, function(s) {
			//	s.sequence = ((s.sequence & 0x0001) << 7) | ((s.sequence & 0x00FE) >> 1);
			//});
			//
			//this.pulse1_sample = this.pulse1_seq.output;
			
			this.pulse1_osc.frequency = 1789773 / (16 * (this.pulse1_seq.reload + 1));
			this.pulse1_sample = this.pulse1_osc.sample(this.globalTime);
		}
		
		this.clock_counter++;
	}
	
	reset() {
		
	}
	
	GetOutputSample() {
		return this.pulse1_sample;
	}
	
	globalTime = 0;
	
	clock_counter = 0;
	frame_clock_counter = 0;
	
	pulse1_osc = new oscpulse();
	pulse1_seq = new sequencer();
	pulse1_enable = false;
	pulse1_sample = 0;
}