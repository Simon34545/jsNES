class sequencer {
	sequence = 0x0000000;
	new_seq = 0x00000000;
	seq_pos = 0x00000000;
	timer = 0x0000;
	reload = 0x0000;
	output = 0x00;
	
	clock(funcManip) {
		if (true) {
			this.timer--;
			if (this.timer == -1) {
				this.timer = (this.reload + 1) & 0xFFFF;
				this.sequence = this.new_seq;
				funcManip(this);
			}
		}
		
		return this.output;
	}
}

class envelope {
	start = 0;
	divider = 0;
	reload = 0;
	decay_counter = 0;
	loop = 0;
	constant = 0;
	
	clock() {
		if (this.start) {
			this.start = 0;
			this.decay_counter = 15;
			this.divider = this.reload;
		} else {
			if (this.divider == 0) {
				this.divider = this.reload;
				
				if (this.decay_counter == 0) {
					if (this.loop) {
						this.decay_counter = 15;
					}
				} else {
					this.decay_counter--;
				}
			}
			
			this.divider--;
		}
	}
}

class sweeper {
	divider = 0;
	reload_flag = 0;
	period = 0;
	target_period = 0;
	enable = 0;
	negate = 0;
	shift_count = 0;
	mute = 0;
	
	which = 0;
	channel = null;
	
	clock() {
		let changeAmount = this.channel.reload >> this.shift_count;
		if (this.negate) {
			changeAmount *= -1;
		}
		changeAmount -= this.which;
		
		this.target_period = this.channel.reload + changeAmount;
		
		if (this.channel.reload < 8 || this.target_period > 0x7FF) {
			this.mute = 1;
		} else {
			this.mute = 0;
		}
		
		if (this.divider == 0 && this.enable && !this.mute) {
			this.channel.reload = this.target_period;
		}
		
		if (this.divider == 0 || this.reload_flag) {
			this.divider = this.period + 1;
			this.reload_flag = 0;
		} else {
			this.divider--;
		}
	}
}

class length_counter {
	counter = 0;
	halt = 0;
	enable = 0;
	
	clock() {
		if (!this.enable) {
			this.counter = 0;
		}
		
		if (this.counter && !this.halt) {
			this.counter--;
		}
	}
}

class linear_counter {
	counter = 0;
	reload = 0;
	reload_flag = 0;
	control = 0;
	
	clock() {
		if (this.reload_flag) {
			this.counter = this.reload;
		} else if (this.counter != 0) {
			this.counter--;
		}
		
		if (!this.control) {
			this.reload_flag = 0;
		}
	}
}

class lfsr {
	shift_register = 0x0001;
	mode = 0;
	timer = 0;
	reload = 0;
	
	clock() {
		this.timer--;
		if (this.timer == -1) {
			this.timer = (this.reload + 1) & 0xFFFF;
			
			let feedback = (this.shift_register & 0x1) ^ (this.mode ? (this.shift_register >> 6 & 0x1) : (this.shift_register >> 1 & 0x1))
			
			this.shift_register >>= 1;
			this.shift_register |= feedback << 14;
		}
	}
}

class nes2A03 {	
	cpuWrite(addr, data) {
		switch (addr) {
		case 0x4000:
			switch ((data & 0xC0) >> 6) {
			case 0x00: this.pulse1_seq.new_seq = 0b00000001; break;
			case 0x01: this.pulse1_seq.new_seq = 0b00000011; break;
			case 0x02: this.pulse1_seq.new_seq = 0b00001111; break;
			case 0x03: this.pulse1_seq.new_seq = 0b11111100; break;
			}
			
			this.pulse1_env.loop = (data >> 5) & 0x1;
			this.pulse1_cnt.halt = (data >> 5) & 0x1;
			
			this.pulse1_env.constant = (data >> 4) & 0x1;
			
			this.pulse1_env.reload = data & 0x0F;
			break;
			
		case 0x4001:
			this.pulse1_swp.enable = data >> 7;
			
			this.pulse1_swp.period = (data >> 4) & 0x7;
			
			this.pulse1_swp.negate = (data >> 3) & 0x1;
			
			this.pulse1_swp.shift_count = data & 0x7;
			
			this.pulse1_swp.reload_flag = 1;
			break;
			
		case 0x4002:
			this.pulse1_seq.reload = (this.pulse1_seq.reload & 0xFF00) | data;
			break;
			
		case 0x4003:
			if (this.pulse1_cnt.enable) this.pulse1_cnt.counter = this.length_lookup[(data & 0xF8) >> 3];
			this.pulse1_seq.seq_pos = 0;
			
			this.pulse1_env.start = 1;
			
			this.pulse1_seq.reload = (data & 0x07) << 8 | (this.pulse1_seq.reload & 0x00FF);
			break;
			
		case 0x4004:
			switch ((data & 0xC0) >> 6) {
			case 0x00: this.pulse2_seq.new_seq = 0b00000001; break;
			case 0x01: this.pulse2_seq.new_seq = 0b00000011; break;
			case 0x02: this.pulse2_seq.new_seq = 0b00001111; break;
			case 0x03: this.pulse2_seq.new_seq = 0b11111100; break;
			}
			
			this.pulse2_env.loop = (data >> 5) & 0x1;
			this.pulse2_cnt.halt = (data >> 5) & 0x1;
			
			this.pulse2_env.constant = (data >> 4) & 0x1;
			
			this.pulse2_env.reload = data & 0x0F;
			break;
			
		case 0x4005:
			this.pulse2_swp.enable = data >> 7;
			
			this.pulse2_swp.period = (data >> 4) & 0x7;
			
			this.pulse2_swp.negate = (data >> 3) & 0x1;
			
			this.pulse2_swp.shift_count = data & 0x7;
			
			this.pulse2_swp.reload_flag = 1;
			break;
			
		case 0x4006:
			this.pulse2_seq.reload = (this.pulse2_seq.reload & 0xFF00) | data;
			break;
			
		case 0x4007:
			if (this.pulse2_cnt.enable) this.pulse2_cnt.counter = this.length_lookup[(data & 0xF8) >> 3];
			this.pulse2_seq.seq_pos = 0;
			
			this.pulse2_env.start = 1;
			
			this.pulse2_seq.reload = (data & 0x07) << 8 | (this.pulse2_seq.reload & 0x00FF);
			break;
			
		case 0x4008:
			this.triang_lnc.control = data >> 7;
			this.triang_cnt.halt = data >> 7;
			
			this.triang_lnc.reload = data & 0x7F;
			break;
			
		case 0x400A:
			this.triang_seq.reload = (this.triang_seq.reload & 0xFF00) | data;
			break;
			
		case 0x400B:
			if (this.triang_cnt.enable) this.triang_cnt.counter = this.length_lookup[(data & 0xF8) >> 3];			
			this.triang_lnc.reload_flag = 1;
			
			this.triang_seq.reload = (data & 0x07) << 8 | (this.triang_seq.reload & 0x00FF);
			break;
			
		case 0x400C:
			this.pnoise_env.loop = (data >> 5) & 0x1;
			this.pnoise_cnt.halt = (data >> 5) & 0x1;
			
			this.pnoise_env.constant = (data >> 4) & 0x1;
			
			this.pnoise_env.reload = data & 0x0F;
			break;
			
		case 0x400E:
			this.pnoise_lfs.reload = this.pnoise_lookup[data & 0xF];
			this.pnoise_lfs.mode = data >> 7;
			break;
			
		case 0x400F:
			if (this.pnoise_cnt.enable) this.pnoise_cnt.counter = this.length_lookup[(data & 0xF8) >> 3];			
			this.pnoise_env.start = 1;
			break;
			
		case 0x4015:
			this.pulse1_cnt.enable = (data >> 0) & 0x01;
			this.pulse2_cnt.enable = (data >> 1) & 0x01;
			this.triang_cnt.enable = (data >> 2) & 0x01;
			this.pnoise_cnt.enable = (data >> 3) & 0x01;
			
			this.pulse1_cnt.counter *= (data >> 0) & 0x01;
			this.pulse2_cnt.counter *= (data >> 1) & 0x01;
			this.triang_cnt.counter *= (data >> 2) & 0x01;
			this.pnoise_cnt.counter *= (data >> 3) & 0x01;
			break;
			
		case 0x4017:
			this.seq_mode = data >> 7;
			this.irq_inhb = (data >> 6) & 0x1;
			this.mirqWroteTo = true;
			this.resetWait = 3;
			this.temp = 1;
			break;
		}
	}
	
	cpuRead(addr, readOnly) {
		let data = 0x00;
		
		if (addr == 0x4015) {
			data = this.irq_flag << 6 | ((this.pnoise_cnt.counter > 0) << 3) |  ((this.triang_cnt.counter > 0) << 2) | ((this.pulse2_cnt.counter > 0) << 1) | (this.pulse1_cnt.counter > 0);
			
			if (!readOnly) {
				this.irq_flag = false;
			}
		}
		
		return data;
	}
	
	clock() {
		let quarterFrameClock = false;
		let halfFrameClock = false;
		
		this.globalTime += (0.3333333333 / 1789773);
		
		if (this.clock_counter % 3 == 0) {
			
			/*if (this.resetWait > -1) {
				this.resetWait--;
			} else if (this.resetWait == -1) {
				this.frame_clock_counter = 0;
				this.resetWait = -2;
			}*/
			
			if (!(this.cpu_clock_counter & 1)) {
				this.frame_clock_counter++;
				
				/*quarterFrameClock = this.mirqWroteTo;
				halfFrameClock = this.mirqWroteTo;
				this.mirqWroteTo = false;
				
				if (this.temp) {
					this.resetWait--;
					this.temp = 0;
				}*/
				
				if (this.seq_mode) {
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
					
					if (this.frame_clock_counter == 18641) {
						quarterFrameClock = true;
						halfFrameClock = true;
						this.frame_clock_counter = 0;
					}
				} else {
					if (this.frame_clock_counter == 0) {
						this.irq_flag = this.irq_inhb ? false : true;
					}
					
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
					
					if (this.frame_clock_counter == 14914) {
						this.irq_flag = this.irq_inhb ? false : true;
					}
					
					if (this.frame_clock_counter == 14915) {
						quarterFrameClock = true;
						halfFrameClock = true;
						this.irq_flag = this.irq_inhb ? false : true;
						this.frame_clock_counter = 0;
					}
				}
				
				if (quarterFrameClock) {
					this.pulse1_env.clock();
					this.pulse2_env.clock();
					
					this.triang_lnc.clock();
					this.pnoise_env.clock();
				}
				
				if (halfFrameClock) {
					this.pulse1_cnt.clock();
					this.pulse1_swp.clock();
					this.pulse2_cnt.clock();
					this.pulse2_swp.clock();
					
					this.triang_cnt.clock();
					this.pnoise_cnt.clock();
				}
				
				this.pulse1_seq.clock(function(s) {
					s.output = (s.sequence & (0b10000000 >> s.seq_pos)) >> (7 - s.seq_pos);
					s.seq_pos -= 1;
					if (s.seq_pos == -1) s.seq_pos = 7;
				});
				
				if (this.pulse1_seq.output && !this.pulse1_swp.mute && this.pulse1_cnt.counter && this.pulse1_seq.reload > 7) {
					this.pulse1_sample = this.pulse1_env.constant ? this.pulse1_env.reload : this.pulse1_env.decay_counter;
				} else {
					this.pulse1_sample = 0;
				}
				
				this.pulse2_seq.clock(function(s) {
					s.output = (s.sequence & (0b10000000 >> s.seq_pos)) >> (7 - s.seq_pos);
					s.seq_pos -= 1;
					if (s.seq_pos == -1) s.seq_pos = 7;
				});
				
				if (this.pulse2_seq.output && !this.pulse2_swp.mute && this.pulse2_cnt.counter && this.pulse1_seq.reload > 7) {
					this.pulse2_sample = this.pulse2_env.constant ? this.pulse2_env.reload : this.pulse2_env.decay_counter;
				} else {
					this.pulse2_sample = 0;
				}
				
				this.pnoise_lfs.clock();
				
				if (!(this.pnoise_lfs.shift_register & 0x1) && this.pnoise_cnt.counter) {
					this.pnoise_sample = this.pnoise_env.constant ? this.pnoise_env.reload : this.pnoise_env.decay_counter;
				} else {
					this.pnoise_sample = 0;
				}
			}
			
			if (this.triang_lnc.counter != 0 && this.triang_cnt.counter != 0) {
				this.triang_seq.clock(function(s) {
					if (s.new_seq == 0) {
						s.seq_pos--;
						if (s.seq_pos == -1) {
							s.seq_pos = 0;
							s.new_seq = 1;
						}
					} else {
						s.seq_pos++;
						if (s.seq_pos == 16) {
							s.seq_pos = 15;
							s.new_seq = 0;
						}
					}
				});
			}
			
			this.triang_sample = this.triang_seq.seq_pos;
			
			this.temp = 0;
			this.cpu_clock_counter++;
		}
		
		this.clock_counter++;
	}
	
	reset() {
		
	}
	
	GetOutputSample() {
		let pulse_out = (95.98) / ((8128 / (this.pulse1_sample + this.pulse2_sample)) + 100);
		let tnd_out = (159.79) / (((1) / ((this.triang_sample / 8227) + (this.pnoise_sample / 12241) + (0 / 22638))) + 100);
		
		return pulse_out + tnd_out;
	}
	
	constructor() {
		this.pulse1_swp.channel = this.pulse1_seq;
		this.pulse1_swp.which = 1;
		
		this.pulse2_swp.channel = this.pulse2_seq;
		this.pulse2_swp.which = 0;
		
		this.triang_seq.seq_pos = 0;
	}
	
	resetWait = -2;
	temp = 0;
	
	pnoise_lookup = [4, 8, 16, 32, 64, 96, 128, 160, 202, 254, 380, 508, 762, 1016, 2034, 4068];
	length_lookup = [10,254, 20,  2, 40,  4, 80,  6, 160,  8, 60, 10, 14, 12, 26, 14,
									 12, 16, 24, 18, 48, 20, 96, 22, 192, 24, 72, 26, 16, 28, 32, 30];
	
	globalTime = 0;
	cpu_clock_counter = 0;
	
	irq_flag = false;
	mirqWroteTo = false;
	
	seq_mode = 0;
	irq_inhb = 0;
	
	clock_counter = 0;
	frame_clock_counter = 0;
	
	pulse1_seq = new sequencer();
	pulse1_env = new envelope();
	pulse1_swp = new sweeper();
	pulse1_cnt = new length_counter();
	pulse1_sample = 0;
	
	pulse2_seq = new sequencer();
	pulse2_env = new envelope();
	pulse2_swp = new sweeper();
	pulse2_cnt = new length_counter();
	pulse2_sample = 0;
	
	triang_seq = new sequencer();
	triang_lnc = new linear_counter();
	triang_cnt = new length_counter();
	triang_sample = 0;
	
	pnoise_lfs = new lfsr();
	pnoise_env = new envelope();
	pnoise_cnt = new length_counter();
	pnoise_sample = 0;
}