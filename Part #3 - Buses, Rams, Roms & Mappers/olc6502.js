class olc6502 {
	FLAGS6502 = {
		C: (1 << 0),   // Carry Bit
		Z: (1 << 1),   // Zero
		I: (1 << 2),   // Disable Interrupts
		D: (1 << 3),   // Decimal Mode (unused in this implementation)
		B: (1 << 4),   // Break
		U: (1 << 5),   // Unused
		V: (1 << 6),   // Overflow
		N: (1 << 7),   // Negative
	};
	
	a = 0x00;     // Accumulator Register
	x = 0x00;     // X Register
	y = 0x00;     // Y Register
	stkp = 0x00   // Stack Pointer (points to location on bus)
	pc = 0x0000;  // Program Counter
	status = 0x00;// Status Register
	
	ConnectBus = function(n) { this.bus = n; }
	
	/* Addressing Modes
	IMP = function(){}; IMM = function(){};
	ZP0 = function(){}; ZPX = function(){};
	ZPY = function(){}; REL = function(){};
	ABS = function(){}; ABX = function(){};
	ABY = function(){}; IND = function(){};
	IZX = function(){}; IZY = function(){};
	
	// Opcodes
	ADC = function(){}; AND = function(){}; ASL = function(){}; BCC = function(){};
	BCS = function(){}; BEQ = function(){}; BIT = function(){}; BMI = function(){};
	BNE = function(){}; BPL = function(){}; BRK = function(){}; BVC = function(){};
	BVS = function(){}; CLC = function(){}; CLD = function(){}; CLI = function(){};
	CLV = function(){}; CMP = function(){}; CPX = function(){}; CPY = function(){};
	DEC = function(){}; DEX = function(){}; DEY = function(){}; EOR = function(){};
	INC = function(){}; INX = function(){}; INY = function(){}; JMP = function(){};
	JSR = function(){}; LDA = function(){}; LDX = function(){}; LDY = function(){};
	LSR = function(){}; NOP = function(){}; ORA = function(){}; PHA = function(){};
	PHP = function(){}; PLA = function(){}; PLP = function(){}; ROL = function(){};
	ROR = function(){}; RTI = function(){}; RTS = function(){}; SBC = function(){};
	SEC = function(){}; SED = function(){}; SEI = function(){}; STA = function(){};
	STX = function(){}; STY = function(){}; TAX = function(){}; TAY = function(){};
	TSX = function(){}; TXA = function(){}; TXS = function(){}; TYA = function(){};
	
	XXX = function(){};
	
	clock = function(){};
	reset = function(){};
	irq = function(){};
	nmi = function(){};
	
	fetch = function(){};*/
	fetched = 0x00;
	
	addr_abs = 0x0000;
	addr_rel = 0x00;
	opcode = 0x00;
	cycles = 0;
	
	
	bus;
	/*read = function(a){};
	write = function(a, d){};
	
	// Convenience functions to access status register
	GetFlag = function(f){};
	SetFlag = function(f, v){};*/
	
	fetch() {
		if (!(window.nes.cpu.lookup[window.nes.cpu.opcode][2] == window.nes.cpu.IMP)) {
			window.nes.cpu.fetched = window.nes.cpu.read(window.nes.cpu.addr_abs);
		}
		return window.nes.cpu.fetched;
	}
	
	debugString = '$0000: BRK #$00 {IMM}'
	
	//constructor() {
		read(a) {
			return window.nes.cpu.bus.cpuRead(a, false);
		}
		
		write(a, d) {
			window.nes.cpu.bus.cpuWrite(a, d);
		}
		
		complete() {
			return this.cycles == 0;
		}
		
		clock() {
			// prevent overflows
			window.nes.cpu.stkp = new Uint8Array(1).fill(window.nes.cpu.stkp)[0];
			
			if (window.nes.cpu.cycles == 0) {
				var opcode = window.nes.cpu.read(window.nes.cpu.pc);
				window.nes.cpu.SetFlag(window.nes.cpu.FLAGS6502.U, true);
				window.nes.cpu.pc++;
				
				var oldPC = Number(window.nes.cpu.pc);
				// Get Starting number of cycles
				window.nes.cpu.cycles = window.nes.cpu.lookup[opcode][3];
				
				var additional_cycle1 = (window.nes.cpu.lookup[opcode][2])();
				
				var additional_cycle2 = (window.nes.cpu.lookup[opcode][1])();
				
				window.nes.cpu.cycles += (additional_cycle1 & additional_cycle2);
				
				window.nes.cpu.SetFlag(window.nes.cpu.FLAGS6502.U, true);
				
				var dataLength = window.nes.cpu.pc - oldPC;
				
				var dataString = '';
				var dataValue = 0x00;
				
				for (var i = dataLength - 1; i >= 0; i--) {
					dataValue = (dataValue << 8) | window.nes.cpu.read(oldPC + i);
				}
				
				dataString = dataLength ? ((dataLength ? '$' : '') + dataValue.toString(16).padStart(dataLength * 2, '0').toUpperCase()).padStart(4, '#') : '';
				
				window.nes.cpu.debugString = ('$' + ((oldPC - 1).toString(16)).padStart(4, '0').toUpperCase() + ': ' + String(window.nes.cpu.lookup[opcode][1]).substring(0, 3) + ' ' + dataString + ' {' + String(window.nes.cpu.lookup[opcode][2]).substring(0, 3) + '}');
				
			}
			
			window.nes.cpu.cycles--;
		}
		
		GetFlag(f) {
			return ((window.nes.cpu.status & f) > 0) ? 1 : 0;	
		}
		
		SetFlag(f, v) {
			if (v) {
				window.nes.cpu.status |= f;
			} else {
				window.nes.cpu.status &= ~f;
			}
		}
		
		// Addressing Modes
		
		IMP() {
			window.nes.cpu.fetched = window.nes.cpu.a;
			return 0;
		}
		
		IMM() {
			window.nes.cpu.addr_abs = window.nes.cpu.pc++;
			return 0;
		}
		
		ZP0() {
			window.nes.cpu.addr_abs = window.nes.cpu.read(window.nes.cpu.pc);
			window.nes.cpu.pc++;
			window.nes.cpu.addr_abs &= 0x00FF;
			return 0;
		}
		
		ZPX() {
			window.nes.cpu.addr_abs = window.nes.cpu.read(window.nes.cpu.pc + window.nes.cpu.x);
			window.nes.cpu.pc++;
			window.nes.cpu.addr_abs &= 0x00FF;
			return 0;
		}
		
		ZPY() {
			window.nes.cpu.addr_abs = window.nes.cpu.read(window.nes.cpu.pc + window.nes.cpu.y);
			window.nes.cpu.pc++;
			window.nes.cpu.addr_abs &= 0x00FF;
			return 0;
		}
		
		ABS() {
			var lo = window.nes.cpu.read(window.nes.cpu.pc);
			window.nes.cpu.pc++;
			var hi = window.nes.cpu.read(window.nes.cpu.pc);
			window.nes.cpu.pc++;
			
			window.nes.cpu.addr_abs = (hi << 8) | lo;
			
			return 0;
		}
		
		ABX() {
			var lo = window.nes.cpu.read(window.nes.cpu.pc);
			window.nes.cpu.pc++;
			var hi = window.nes.cpu.read(window.nes.cpu.pc);
			window.nes.cpu.pc++;
			
			window.nes.cpu.addr_abs = (hi << 8) | lo;
			window.nes.cpu.addr_abs += window.nes.cpu.x;
			
			if ((window.nes.cpu.addr_abs & 0xFF00) != (hi << 8)) {
				return 1;
			} else {
				return 0;
			}
		}
		
		ABY() {
			var lo = window.nes.cpu.read(window.nes.cpu.pc);
			window.nes.cpu.pc++;
			var hi = window.nes.cpu.read(window.nes.cpu.pc);
			window.nes.cpu.pc++;
			
			window.nes.cpu.addr_abs = (hi << 8) | lo;
			window.nes.cpu.addr_abs += window.nes.cpu.y;
			
			if ((window.nes.cpu.addr_abs & 0xFF00) != (hi << 8)) {
				return 1;
			} else {
				return 0;
			}
		}
		
		IND() {
			var ptr_lo = window.nes.cpu.read(window.nes.cpu.pc);
			window.nes.cpu.pc++;
			var ptr_hi = window.nes.cpu.read(window.nes.cpu.pc);
			window.nes.cpu.pc++;
			
			var ptr = (ptr_hi << 8) | ptr_lo;
			
			if (ptr_lo == 0x00FF) { // Simulate page boundary hardware bug
				window.nes.cpu.addr_abs = (window.nes.cpu.read(ptr & 0xFF00) << 8) | window.nes.cpu.read(ptr + 0);
			} else { //Behave normally
				window.nes.cpu.addr_abs = (window.nes.cpu.read(ptr + 1) << 8) | window.nes.cpu.read(ptr + 0);
			}
			
			return 0;
		}
		
		IZX() {
			var t = window.nes.cpu.read(window.nes.cpu.pc);
			window.nes.cpu.pc++;
			
			var lo = window.nes.cpu.read((t + window.nes.cpu.x) & 0x00FF);
			var hi = window.nes.cpu.read((t + window.nes.cpu.x + 1) & 0x00FF);
			
			window.nes.cpu.addr_abs = (hi << 8) | lo;
			
			return 0;
		}
		
		IZY() {
			var t = window.nes.cpu.read(window.nes.cpu.pc);
			window.nes.cpu.pc++;
			
			var lo = window.nes.cpu.read(t & 0x00FF);
			var hi = window.nes.cpu.read((t + 1) & 0x00FF);
			
			window.nes.cpu.addr_abs = (hi << 8) | lo;
			window.nes.cpu.addr_abs += window.nes.cpu.y;
			
			if ((window.nes.cpu.addr_abs & 0xFF00) != (hi << 8)) {
				return 1;
			} else {
				return 0;
			}
		}
		
		REL() {
			window.nes.cpu.addr_rel = window.nes.cpu.read(window.nes.cpu.pc);
			window.nes.cpu.pc++;
			if (window.nes.cpu.addr_rel & 0x80) {
				window.nes.cpu.addr_rel |= 0xFF00;
			}
			return 0;
		}
		
		// Instructions
		
		fetch() {
			if (!(window.nes.cpu.lookup[window.nes.cpu.opcode][2] == window.nes.cpu.IMP)) {
				window.nes.cpu.fetched = window.nes.cpu.read(window.nes.cpu.addr_abs);
			}
			return window.nes.cpu.fetched;
		}
		
		AND() {
			window.nes.cpu.fetch();
			window.nes.cpu.a = window.nes.cpu.a & fetched;
			window.nes.cpu.SetFlag(window.nes.cpu.FLAGS6502.Z, window.nes.cpu.a == 0x00);
			window.nes.cpu.SetFlag(window.nes.cpu.FLAGS6502.N, window.nes.cpu.a & 0x80);
			return 1;
		}
		
		BCS() {
			if (window.nes.cpu.GetFlag(window.nes.cpu.FLAGS6502.C) == 1) {
				window.nes.cpu.cycles++;
				var toOverflow = new Uint16Array(1);
				toOverflow[0] = window.nes.cpu.pc + window.nes.cpu.addr_rel;
				window.nes.cpu.addr_abs = toOverflow[0];
				
				if ((window.nes.cpu.addr_abs & 0xFF00) != (window.nes.cpu.pc & 0xFF00)) {
					window.nes.cpu.cycles++;
				}
				
				window.nes.cpu.pc = window.nes.cpu.addr_abs;
			}
			return 0;
		}
		
		BCC() {
			if (window.nes.cpu.GetFlag(window.nes.cpu.FLAGS6502.C) == 0) {
				window.nes.cpu.cycles++;
				var toOverflow = new Uint16Array(1);
				toOverflow[0] = window.nes.cpu.pc + window.nes.cpu.addr_rel;
				window.nes.cpu.addr_abs = toOverflow[0];
				
				if ((window.nes.cpu.addr_abs & 0xFF00) != (window.nes.cpu.pc & 0xFF00)) {
					window.nes.cpu.cycles++;
				}
				
				window.nes.cpu.pc = window.nes.cpu.addr_abs;
			}
			return 0;
		}
		
		BEQ() {
			if (window.nes.cpu.GetFlag(window.nes.cpu.FLAGS6502.Z) == 1) {
				window.nes.cpu.cycles++;
				var toOverflow = new Uint16Array(1);
				toOverflow[0] = window.nes.cpu.pc + window.nes.cpu.addr_rel;
				window.nes.cpu.addr_abs = toOverflow[0];
				
				if ((window.nes.cpu.addr_abs & 0xFF00) != (window.nes.cpu.pc & 0xFF00)) {
					window.nes.cpu.cycles++;
				}
				
				window.nes.cpu.pc = window.nes.cpu.addr_abs;
			}
			return 0;
		}
		
		BMI() {
			if (window.nes.cpu.GetFlag(window.nes.cpu.FLAGS6502.N) == 1) {
				window.nes.cpu.cycles++;
				var toOverflow = new Uint16Array(1);
				toOverflow[0] = window.nes.cpu.pc + window.nes.cpu.addr_rel;
				window.nes.cpu.addr_abs = toOverflow[0];
				
				if ((window.nes.cpu.addr_abs & 0xFF00) != (window.nes.cpu.pc & 0xFF00)) {
					window.nes.cpu.cycles++;
				}
				
				window.nes.cpu.pc = window.nes.cpu.addr_abs;
			}
			return 0;
		}
		
		BNE() {
			if (window.nes.cpu.GetFlag(window.nes.cpu.FLAGS6502.Z) == 0) {
				window.nes.cpu.cycles++;
				var toOverflow = new Uint16Array(1);
				toOverflow[0] = window.nes.cpu.pc + window.nes.cpu.addr_rel;
				window.nes.cpu.addr_abs = toOverflow[0];
				
				if ((window.nes.cpu.addr_abs & 0xFF00) != (window.nes.cpu.pc & 0xFF00)) {
					window.nes.cpu.cycles++;
				}
				
				window.nes.cpu.pc = window.nes.cpu.addr_abs;
			}
			return 0;
		}
		
		BPL() {
			if (window.nes.cpu.GetFlag(window.nes.cpu.FLAGS6502.N) == 0) {
				window.nes.cpu.cycles++;
				var toOverflow = new Uint16Array(1);
				toOverflow[0] = window.nes.cpu.pc + window.nes.cpu.addr_rel;
				window.nes.cpu.addr_abs = toOverflow[0];
				
				if ((window.nes.cpu.addr_abs & 0xFF00) != (window.nes.cpu.pc & 0xFF00)) {
					window.nes.cpu.cycles++;
				}
				
				window.nes.cpu.pc = window.nes.cpu.addr_abs;
			}
			return 0;
		}
		
		BVC() {
			if (window.nes.cpu.GetFlag(window.nes.cpu.FLAGS6502.V) == 0) {
				window.nes.cpu.cycles++;
				var toOverflow = new Uint16Array(1);
				toOverflow[0] = window.nes.cpu.pc + window.nes.cpu.addr_rel;
				window.nes.cpu.addr_abs = toOverflow[0];
				
				if ((window.nes.cpu.addr_abs & 0xFF00) != (window.nes.cpu.pc & 0xFF00)) {
					window.nes.cpu.cycles++;
				}
				
				window.nes.cpu.pc = window.nes.cpu.addr_abs;
			}
			return 0;
		}
		
		BVS() {
			if (window.nes.cpu.GetFlag(window.nes.cpu.FLAGS6502.V) == 1) {
				window.nes.cpu.cycles++;
				var toOverflow = new Uint16Array(1);
				toOverflow[0] = window.nes.cpu.pc + window.nes.cpu.addr_rel;
				window.nes.cpu.addr_abs = toOverflow[0];
				
				if ((window.nes.cpu.addr_abs & 0xFF00) != (window.nes.cpu.pc & 0xFF00)) {
					window.nes.cpu.cycles++;
				}
				
				window.nes.cpu.pc = window.nes.cpu.addr_abs;
			}
			return 0;
		}
		
		CLC() {
			window.nes.cpu.SetFlag(window.nes.cpu.FLAGS6502.C, false);
			return 0;
		}
		
		CLD() {
			window.nes.cpu.SetFlag(window.nes.cpu.FLAGS6502.D, false);
			return 0;
		}
		
		ADC() {
			window.nes.cpu.fetch();
			var temp = window.nes.cpu.a + window.nes.cpu.fetched + window.nes.cpu.GetFlag(window.nes.cpu.FLAGS6502.C);
			window.nes.cpu.SetFlag(window.nes.cpu.FLAGS6502.C, temp > 255);
			window.nes.cpu.SetFlag(window.nes.cpu.FLAGS6502.Z, (temp & 0x00FF) == 0);
			window.nes.cpu.SetFlag(window.nes.cpu.FLAGS6502.N, temp & 0x80);
			window.nes.cpu.SetFlag(window.nes.cpu.FLAGS6502.V, (~(window.nes.cpu.a ^ window.nes.cpu.fetched) & (window.nes.cpu.a ^ temp)) & 0x0080);
			window.nes.cpu.a = temp & 0x00FF;
			return 1;
		}
		
		SBC() {
			window.nes.cpu.fetch();
			
			var value = (window.nes.cpu.fetched) ^ 0x00FF;
			
			var temp = window.nes.cpu/a + value + window.nes.cpu.GetFlag(window.nes.cpu.FLAGS6502.C);
			window.nes.cpu.SetFlag(window.nes.cpu.FLAGS6502.C, temp & 0xFF00);
			window.nes.cpu.SetFlag(window.nes.cpu.FLAGS6502.Z, ((temp & 0x00FF) == 0));
			window.nes.cpu.SetFlag(window.nes.cpu.FLAGS6502.V, (temp ^ window.nes.cpu.a) & (temp ^ value) & 0x0080);
			window.nes.cpu.SetFlag(window.nes.cpu.FLAGS6502.N, temp & 0x0080);
			window.nes.cpu.a = temp & 0x00FF;
			return 1;
		}
		
		PHA() {
			window.nes.cpu.write(0x0100 + window.nes.cpu.stkp, window.nes.cpu.a);
			window.nes.cpu.stkp--;
			return 0;
		}
		
		PLA() {
			window.nes.cpu.stkp++;
			window.nes.cpu.a = window.nes.cpu.read(0x0100 + stkp);
			window.nes.cpu.SetFlag(window.nes.cpu.FLAGS6502.Z, window.nes.cpu.a == 0x00);
			window.nes.cpu.SetFlag(window.nes.cpu.FLAGS6502.N, window.nes.cpu.a & 0x80);
			return 0;
		}
		
		reset() {
			window.nes.cpu.a = 0;
			window.nes.cpu.x = 0;
			window.nes.cpu.y = 0;
			window.nes.cpu.stkp = 0xFD;
			window.nes.cpu.status = 0x00 | window.nes.cpu.FLAGS6502.U;
			
			window.nes.cpu.addr_abs = 0xFFFC;
			var lo = window.nes.cpu.read(window.nes.cpu.addr_abs + 0);
			var hi = window.nes.cpu.read(window.nes.cpu.addr_abs + 1);
			
			window.nes.cpu.pc = (hi << 8) | lo;
			
			window.nes.cpu.addr_rel = 0x0000;
			window.nes.cpu.addr_abs = 0x0000;
			window.nes.cpu.fetched = 0x00;
			
			window.nes.cpu.cycles = 8;
			
		}
		
		irq() {
			if (window.nes.cpu.GetFlag(window.nes.cpu.FLAGS6502.I) == 0) {
				window.nes.cpu.write(0x0100 + window.nes.cpu.stkp, (window.nes.cpu.pc >> 8) & 0x00FF);
				window.nes.cpu.stkp--;
				window.nes.cpu.write(0x0100 + window.nes.cpu.stkp, window.nes.cpu.pc & 0x00FF);
				window.nes.cpu.stkp--;
				
				window.nes.cpu.SetFlag(window.nes.cpu.FLAGS6502.B, 0);
				window.nes.cpu.SetFlag(window.nes.cpu.FLAGS6502.U, 1);
				window.nes.cpu.SetFlag(window.nes.cpu.FLAGS6502.I, 1);
				window.nes.cpu.write(0x0100 + window.nes.cpu.stkp, window.nes.cpu.status);
				window.nes.cpu.stkp--;
				
				window.nes.cpu.addr_abs = 0xFFFE;
				var lo = window.nes.cpu.read(window.nes.cpu.addr_abs + 0);
				var hi = window.nes.cpu.read(window.nes.cpu.addr_abs + 1);
				window.nes.cpu.pc = (hi << 8) | lo;
				
				window.nes.cpu.cycles = 7;
			}
		}
		
		nmi() {
			window.nes.cpu.write(0x0100 + window.nes.cpu.stkp, (window.nes.cpu.pc >> 8) & 0x00FF);
			window.nes.cpu.stkp--;
			window.nes.cpu.write(0x0100 + window.nes.cpu.stkp, window.nes.cpu.pc & 0x00FF);
			window.nes.cpu.stkp--;
			
			window.nes.cpu.SetFlag(window.nes.cpu.FLAGS6502.B, 0);
			window.nes.cpu.SetFlag(window.nes.cpu.FLAGS6502.U, 1);
			window.nes.cpu.SetFlag(window.nes.cpu.FLAGS6502.I, 1);
			window.nes.cpu.write(0x0100 + window.nes.cpu.stkp, window.nes.cpu.status);
			window.nes.cpu.stkp--;
			
			window.nes.cpu.addr_abs = 0xFFFA;
			var lo = window.nes.cpu.read(window.nes.cpu.addr_abs + 0);
			var hi = window.nes.cpu.read(window.nes.cpu.addr_abs + 1);
			window.nes.cpu.pc = (hi << 8) | lo;
			
			window.nes.cpu.cycles = 8;
		}
		
		RTI() {
			window.nes.cpu.stkp++;
			window.nes.cpu.status = window.nes.cpu.read(0x0100 + stkp);
			window.nes.cpu.status &= ~window.nes.cpu.FLAGS6502.B;
			window.nes.cpu.status &= ~window.nes.cpu.FLAGS6502.U;
			
			window.nes.cpu.stkp++;
			window.nes.cpu.pc = window.nes.cpu.read(0x0100 + stkp);
			window.nes.cpu.stkp++;
			window.nes.cpu.pc |= window.nes.cpu.read(0x0100 + stkp) << 8;
			return 0;
		}
		
		ASL() {
			window.nes.cpu.fetch();
			var temp = window.nes.cpu.fetched << 1;
			window.nes.cpu.SetFlag(window.nes.cpu.FLAGS6502.C, (temp & 0xFF00) > 0);
			window.nes.cpu.SetFlag(window.nes.cpu.FLAGS6502.Z, (temp & 0x00FF) == 0x00);
			window.nes.cpu.SetFlag(window.nes.cpu.FLAGS6502.N, temp & 0x80);
			if (window.nes.cpu.lookup[window.nes.cpu.opcode][2] == window.nes.cpu.IMP) {
				window.nes.cpu.a = temp & 0x00FF;
			} else {
				window.nes.cpu.write(window.nes.cpu.addr_abs, temp & 0x00FF);
			}
			return 0;
		}
		
		BIT() {
			window.nes.cpu.fetch();
			var temp = window.nes.cpu.a & window.nes.cpu.fetched;
			window.nes.cpu.SetFlag(window.nes.cpu.FLAGS6502.Z, (temp & 0x00FF) == 0x00);
			window.nes.cpu.SetFlag(window.nes.cpu.FLAGS6502.N, window.nes.cpu.fetched & (1 << 7));
			window.nes.cpu.SetFlag(window.nes.cpu.FLAGS6502.V, window.nes.cpu.fetched & (1 << 6));
			return 0;
		}
		
		BRK() {
			window.nes.cpu.pc++;
			
			window.nes.cpu.SetFlag(window.nes.cpu.FLAGS6502.I, 1);
			window.nes.cpu.write(0x0100 + window.nes.cpu.stkp, (window.nes.cpu.pc >> 8) & 0x00FF);
			window.nes.cpu.stkp--;
			window.nes.cpu.write(0x0100 + window.nes.cpu.stkp, window.nes.cpu.pc & 0x00FF);
			window.nes.cpu.stkp--;
			
			window.nes.cpu.SetFlag(window.nes.cpu.FLAGS6502.B, 1);
			window.nes.cpu.write(0x0100 + window.nes.cpu.stkp, window.nes.cpu.status);
			window.nes.cpu.stkp--;
			window.nes.cpu.SetFlag(window.nes.cpu.FLAGS6502.B, 0);
			
			window.nes.cpu.pc = window.nes.cpu.read(0xFFFE) | (window.nes.cpu.read(0xFFFF) << 8);
			return 0;
		}
		
		CLI() {
			window.nes.cpu.SetFlag(window.nes.cpu.FLAGS6502.I, false);
			return 0;
		}
		
		CLV() {
			window.nes.cpu.SetFlag(window.nes.cpu.FLAGS6502.V, false);
			return 0;
		}
		
		CMP() {
			window.nes.cpu.fetch();
			var temp = window.nes.cpu.a - window.nes.cpu.fetched;
			window.nes.cpu.SetFlag(window.nes.cpu.FLAGS6502.C, window.nes.cpu.a >= window.nes.cpu.fetched);
			window.nes.cpu.SetFlag(window.nes.cpu.FLAGS6502.Z, (temp & 0x00FF) == 0x0000);
			window.nes.cpu.SetFlag(window.nes.cpu.FLAGS6502.N, temp & 0x0080);
			return 1;
		}
		
		CPX() {
			window.nes.cpu.fetch();
			var temp = window.nes.cpu.x - window.nes.cpu.fetched;
			window.nes.cpu.SetFlag(window.nes.cpu.FLAGS6502.C, window.nes.cpu.x >= window.nes.cpu.fetched);
			window.nes.cpu.SetFlag(window.nes.cpu.FLAGS6502.Z, (temp & 0x00FF) == 0x0000);
			window.nes.cpu.SetFlag(window.nes.cpu.FLAGS6502.N, temp & 0x0080);
			return 0;
		}
		
		CPY() {
			window.nes.cpu.fetch();
			var temp = window.nes.cpu.y - window.nes.cpu.fetched;
			window.nes.cpu.SetFlag(window.nes.cpu.FLAGS6502.C, window.nes.cpu.y >= window.nes.cpu.fetched);
			window.nes.cpu.SetFlag(window.nes.cpu.FLAGS6502.Z, (temp & 0x00FF) == 0x0000);
			window.nes.cpu.SetFlag(window.nes.cpu.FLAGS6502.N, temp & 0x0080);
			return 0;
		}
		
		DEC() {
			window.nes.cpu.fetch();
			var temp = window.nes.cpu.fetched - 1;
			window.nes.cpu.write(window.nes.cpu.addr_abs, temp & 0x00FF);
			window.nes.cpu.SetFlag(window.nes.cpu.FLAGS6502.Z, (temp & 0x00FF) == 0x0000);
			window.nes.cpu.SetFlag(window.nes.cpu.FLAGS6502.N, temp & 0x0080);
			return 0;
		}
		
		DEX() {
			window.nes.cpu.x--;
			SetFlag(window.nes.cpu.FLAGS6502.Z, window.nes.cpu.x == 0x00);
			SetFlag(window.nes.cpu.FLAGS6502.N, window.nes.cpu.x & 0x80);
			return 0;
		}
		
		DEY() {
			window.nes.cpu.y--;
			window.nes.cpu.SetFlag(window.nes.cpu.FLAGS6502.Z, window.nes.cpu.y == 0x00);
			window.nes.cpu.SetFlag(window.nes.cpu.FLAGS6502.N, window.nes.cpu.y & 0x80);
			return 0;
		}
		
		EOR() {
			window.nes.cpu.fetch();
			window.nes.cpu.a = window.nes.cpu.a ^ window.nes.cpu.fetched;	
			window.nes.cpu.SetFlag(window.nes.cpu.FLAGS6502.Z, window.nes.cpu.a == 0x00);
			window.nes.cpu.SetFlag(window.nes.cpu.FLAGS6502.N, window.nes.cpu.a & 0x80);
			return 1;
		}
		
		INC() {
			window.nes.cpu.fetch();
			var temp = window.nes.cpu.fetched + 1;
			window.nes.cpu.write(window.nes.cpu.addr_abs, temp & 0x00FF);
			window.nes.cpu.SetFlag(window.nes.cpu.FLAGS6502.Z, (temp & 0x00FF) == 0x0000);
			window.nes.cpu.SetFlag(window.nes.cpu.FLAGS6502.N, temp & 0x0080);
			return 0;
		}
		
		INX() {
			window.nes.cpu.x++;
			window.nes.cpu.SetFlag(window.nes.cpu.FLAGS6502.Z, window.nes.cpu.x == 0x00);
			window.nes.cpu.SetFlag(window.nes.cpu.FLAGS6502.N, window.nes.cpu.x & 0x80);
			return 0;
		}
		
		INY() {
			window.nes.cpu.y++;
			window.nes.cpu.SetFlag(window.nes.cpu.FLAGS6502.Z, window.nes.cpu.y == 0x00);
			window.nes.cpu.SetFlag(window.nes.cpu.FLAGS6502.N, window.nes.cpu.y & 0x80);
			return 0;
		}
		
		JMP() {
			window.nes.cpu.pc = window.nes.cpu.addr_abs;
			return 0;
		}
		
		JSR() {
			window.nes.cpu.pc--;
			
			window.nes.cpu.write(0x0100 + window.nes.cpu.stkp, (window.nes.cpu.pc >> 8) & 0x00FF);
			window.nes.cpu.stkp--;
			window.nes.cpu.write(0x0100 + window.nes.cpu.stkp, window.nes.cpu.pc & 0x00FF);
			window.nes.cpu.stkp--;
			
			window.nes.cpu.pc = window.nes.cpu.addr_abs;
			return 0;
		}
		
		LDA() {
			window.nes.cpu.fetch();
			window.nes.cpu.a = window.nes.cpu.fetched;
			window.nes.cpu.SetFlag(window.nes.cpu.FLAGS6502.Z, window.nes.cpu.a == 0x00);
			window.nes.cpu.SetFlag(window.nes.cpu.FLAGS6502.N, window.nes.cpu.a & 0x80);
			return 1;
		}
		
		LDX() {
			window.nes.cpu.fetch();
			window.nes.cpu.x = window.nes.cpu.fetched;
			window.nes.cpu.SetFlag(window.nes.cpu.FLAGS6502.Z, window.nes.cpu.x == 0x00);
			window.nes.cpu.SetFlag(window.nes.cpu.FLAGS6502.N, window.nes.cpu.x & 0x80);
			return 1;
		}
		
		LDY() {
			window.nes.cpu.fetch();
			window.nes.cpu.y = window.nes.cpu.fetched;
			window.nes.cpu.SetFlag(window.nes.cpu.FLAGS6502.Z, window.nes.cpu.y == 0x00);
			window.nes.cpu.SetFlag(window.nes.cpu.FLAGS6502.N, window.nes.cpu.y & 0x80);
			return 1;
		}
		
		LSR() {
			window.nes.cpu.fetch();
			window.nes.cpu.SetFlag(window.nes.cpu.FLAGS6502.C, window.nes.cpu.fetched & 0x0001);
			var temp = window.nes.cpu.fetched >> 1;	
			window.nes.cpu.SetFlag(window.nes.cpu.FLAGS6502.Z, (temp & 0x00FF) == 0x0000);
			window.nes.cpu.SetFlag(window.nes.cpu.FLAGS6502.N, temp & 0x0080);
			if (window.nes.cpu.lookup[window.nes.cpu.opcode][2] == window.nes.cpu.IMP) {
				window.nes.cpu.a = temp & 0x00FF;
			} else {
				window.nes.cpu.write(window.nes.cpu.addr_abs, temp & 0x00FF);
			}
			return 0;
		}
		
		NOP() {
			// Sadly not all NOPs are equal, Ive added a few here
			// based on https://wiki.nesdev.com/w/index.php/CPU_unofficial_opcodes
			// and will add more based on game compatibility, and ultimately
			// I'd like to cover all illegal opcodes too
			switch (window.nes.cpu.opcode) {
				case 0x1C:
					break;
				case 0x3C:
					break;
				case 0x5C:
					break;
				case 0x7C:
					break;
				case 0xDC:
					break;
				case 0xFC:
					return 1;
					break;
			}
			return 0;
		}
		
		ORA() {
			window.nes.cpu.fetch();
			window.nes.cpu.a = window.nes.cpu.a | window.nes.cpu.fetched;
			window.nes.cpu.SetFlag(window.nes.cpu.FLAGS6502.Z, window.nes.cpu.a == 0x00);
			window.nes.cpu.SetFlag(window.nes.cpu.FLAGS6502.N, window.nes.cpu.a & 0x80);
			return 1;
		}
		
		PHP() {
			window.nes.cpu.write(0x0100 + window.nes.cpu.stkp, window.nes.cpu.status | window.nes.cpu.FLAGS6502.B | window.nes.cpu.FLAGS6502.U);
			window.nes.cpu.SetFlag(window.nes.cpu.FLAGS6502.B, 0);
			window.nes.cpu.SetFlag(window.nes.cpu.FLAGS6502.U, 0);
			window.nes.cpu.stkp--;
			return 0;
		}
		
		PLP() {
			window.nes.cpu.stkp++;
			window.nes.cpu.status = window.nes.cpu.read(0x0100 + window.nes.cpu.stkp);
			window.nes.cpu.SetFlag(window.nes.cpu.FLAGS6502.U, 1);
			return 0;
		}

		ROL() {
			window.nes.cpu.fetch();
			var temp = (window.nes.cpu.fetched << 1) | window.nes.cpu.GetFlag(window.nes.cpu.FLAGS6502.C);
			window.nes.cpu.SetFlag(window.nes.cpu.FLAGS6502.C, temp & 0xFF00);
			window.nes.cpu.SetFlag(window.nes.cpu.FLAGS6502.Z, (temp & 0x00FF) == 0x0000);
			window.nes.cpu.SetFlag(window.nes.cpu.FLAGS6502.N, temp & 0x0080);
			if (window.nes.cpu.lookup[window.nes.cpu.opcode][2] == window.nes.cpu.IMP) {
				window.nes.cpu.a = temp & 0x00FF;
			} else {
				window.nes.cpu.write(window.nes.cpu.addr_abs, temp & 0x00FF);
			}
			return 0;
		}

		ROR() {
			window.nes.cpu.fetch();
			var temp = (window.nes.cpu.GetFlag(window.nes.cpu.FLAGS6502.C) << 7) | (window.nes.cpu.fetched >> 1);
			window.nes.cpu.SetFlag(window.nes.cpu.FLAGS6502.C, window.nes.cpu.fetched & 0x01);
			window.nes.cpu.SetFlag(window.nes.cpu.FLAGS6502.Z, (temp & 0x00FF) == 0x00);
			window.nes.cpu.SetFlag(window.nes.cpu.FLAGS6502.N, temp & 0x0080);
			if (window.nes.cpu.lookup[window.nes.cpu.opcode][2] == window.nes.cpu.IMP) {
				window.nes.cpu.a = temp & 0x00FF;
			} else {
				window.nes.cpu.write(window.nes.cpu.addr_abs, temp & 0x00FF);
			}
			return 0;
		}


		RTS() {
			window.nes.cpu.stkp++;
			window.nes.cpu.pc = window.nes.cpu.read(0x0100 + window.nes.cpu.stkp);
			window.nes.cpu.stkp++;
			window.nes.cpu.pc |= window.nes.cpu.read(0x0100 + window.nes.cpu.stkp) << 8;
			
			window.nes.cpu.pc++;
			return 0;
		}
		
		SEC() {
			window.nes.cpu.SetFlag(window.nes.cpu.FLAGS6502.C, true);
			return 0;
		}
		
		SED() {
			window.nes.cpu.SetFlag(window.nes.cpu.FLAGS6502.D, true);
			return 0;
		}
		
		SEI() {
			window.nes.cpu.SetFlag(window.nes.cpu.FLAGS6502.I, true);
			return 0;
		}
		
		STA() {
			window.nes.cpu.write(window.nes.cpu.addr_abs, window.nes.cpu.a);
			return 0;
		}
		
		STX() {
			window.nes.cpu.write(window.nes.cpu.addr_abs, window.nes.cpu.x);
			return 0;
		}
		
		STY() {
			window.nes.cpu.write(window.nes.cpu.addr_abs, window.nes.cpu.y);
			return 0;
		}
		
		TAX() {
			window.nes.cpu.x = window.nes.cpu.a;
			window.nes.cpu.SetFlag(window.nes.cpu.FLAGS6502.Z, window.nes.cpu.x == 0x00);
			window.nes.cpu.SetFlag(window.nes.cpu.FLAGS6502.N, window.nes.cpu.x & 0x80);
			return 0;
		}
		
		TAY() {
			window.nes.cpu.y = window.nes.cpu.a;
			window.nes.cpu.SetFlag(window.nes.cpu.FLAGS6502.Z, window.nes.cpu.y == 0x00);
			window.nes.cpu.SetFlag(window.nes.cpu.FLAGS6502.N, window.nes.cpu.y & 0x80);
			return 0;
		}
		
		TSX() {
			window.nes.cpu.x = window.nes.cpu.stkp;
			window.nes.cpu.SetFlag(window.nes.cpu.FLAGS6502.Z, window.nes.cpu.x == 0x00);
			window.nes.cpu.SetFlag(window.nes.cpu.FLAGS6502.N, window.nes.cpu.x & 0x80);
			return 0;
		}
		
		TXA() {
			window.nes.cpu.a = window.nes.cpu.x;
			window.nes.cpu.SetFlag(window.nes.cpu.FLAGS6502.Z, window.nes.cpu.a == 0x00);
			window.nes.cpu.SetFlag(window.nes.cpu.FLAGS6502.N, window.nes.cpu.a & 0x80);
			return 0;
		}
		
		TXS() {
			window.nes.cpu.stkp = window.nes.cpu.x;
			return 0;
		}
		
		TYA() {
			window.nes.cpu.a = window.nes.cpu.y;
			window.nes.cpu.SetFlag(window.nes.cpu.FLAGS6502.Z, window.nes.cpu.a == 0x00);
			window.nes.cpu.SetFlag(window.nes.cpu.FLAGS6502.N, window.nes.cpu.a & 0x80);
			return 0;
		}
		
		// This function captures illegal opcodes
		XXX() {
			return 0;
		}
		
		lookup = [
			[ "BRK", this.BRK, this.IMM, 7 ],[ "ORA", this.ORA, this.IZX, 6 ],[ "???", this.XXX, this.IMP, 2 ],[ "???", this.XXX, this.IMP, 8 ],[ "???", this.NOP, this.IMP, 3 ],[ "ORA", this.ORA, this.ZP0, 3 ],[ "ASL", this.ASL, this.ZP0, 5 ],[ "???", this.XXX, this.IMP, 5 ],[ "PHP", this.PHP, this.IMP, 3 ],[ "ORA", this.ORA, this.IMM, 2 ],[ "ASL", this.ASL, this.IMP, 2 ],[ "???", this.XXX, this.IMP, 2 ],[ "???", this.NOP, this.IMP, 4 ],[ "ORA", this.ORA, this.ABS, 4 ],[ "ASL", this.ASL, this.ABS, 6 ],[ "???", this.XXX, this.IMP, 6 ],
			[ "BPL", this.BPL, this.REL, 2 ],[ "ORA", this.ORA, this.IZY, 5 ],[ "???", this.XXX, this.IMP, 2 ],[ "???", this.XXX, this.IMP, 8 ],[ "???", this.NOP, this.IMP, 4 ],[ "ORA", this.ORA, this.ZPX, 4 ],[ "ASL", this.ASL, this.ZPX, 6 ],[ "???", this.XXX, this.IMP, 6 ],[ "CLC", this.CLC, this.IMP, 2 ],[ "ORA", this.ORA, this.ABY, 4 ],[ "???", this.NOP, this.IMP, 2 ],[ "???", this.XXX, this.IMP, 7 ],[ "???", this.NOP, this.IMP, 4 ],[ "ORA", this.ORA, this.ABX, 4 ],[ "ASL", this.ASL, this.ABX, 7 ],[ "???", this.XXX, this.IMP, 7 ],
			[ "JSR", this.JSR, this.ABS, 6 ],[ "AND", this.AND, this.IZX, 6 ],[ "???", this.XXX, this.IMP, 2 ],[ "???", this.XXX, this.IMP, 8 ],[ "BIT", this.BIT, this.ZP0, 3 ],[ "AND", this.AND, this.ZP0, 3 ],[ "ROL", this.ROL, this.ZP0, 5 ],[ "???", this.XXX, this.IMP, 5 ],[ "PLP", this.PLP, this.IMP, 4 ],[ "AND", this.AND, this.IMM, 2 ],[ "ROL", this.ROL, this.IMP, 2 ],[ "???", this.XXX, this.IMP, 2 ],[ "BIT", this.BIT, this.ABS, 4 ],[ "AND", this.AND, this.ABS, 4 ],[ "ROL", this.ROL, this.ABS, 6 ],[ "???", this.XXX, this.IMP, 6 ],
			[ "BMI", this.BMI, this.REL, 2 ],[ "AND", this.AND, this.IZY, 5 ],[ "???", this.XXX, this.IMP, 2 ],[ "???", this.XXX, this.IMP, 8 ],[ "???", this.NOP, this.IMP, 4 ],[ "AND", this.AND, this.ZPX, 4 ],[ "ROL", this.ROL, this.ZPX, 6 ],[ "???", this.XXX, this.IMP, 6 ],[ "SEC", this.SEC, this.IMP, 2 ],[ "AND", this.AND, this.ABY, 4 ],[ "???", this.NOP, this.IMP, 2 ],[ "???", this.XXX, this.IMP, 7 ],[ "???", this.NOP, this.IMP, 4 ],[ "AND", this.AND, this.ABX, 4 ],[ "ROL", this.ROL, this.ABX, 7 ],[ "???", this.XXX, this.IMP, 7 ],
			[ "RTI", this.RTI, this.IMP, 6 ],[ "EOR", this.EOR, this.IZX, 6 ],[ "???", this.XXX, this.IMP, 2 ],[ "???", this.XXX, this.IMP, 8 ],[ "???", this.NOP, this.IMP, 3 ],[ "EOR", this.EOR, this.ZP0, 3 ],[ "LSR", this.LSR, this.ZP0, 5 ],[ "???", this.XXX, this.IMP, 5 ],[ "PHA", this.PHA, this.IMP, 3 ],[ "EOR", this.EOR, this.IMM, 2 ],[ "LSR", this.LSR, this.IMP, 2 ],[ "???", this.XXX, this.IMP, 2 ],[ "JMP", this.JMP, this.ABS, 3 ],[ "EOR", this.EOR, this.ABS, 4 ],[ "LSR", this.LSR, this.ABS, 6 ],[ "???", this.XXX, this.IMP, 6 ],
			[ "BVC", this.BVC, this.REL, 2 ],[ "EOR", this.EOR, this.IZY, 5 ],[ "???", this.XXX, this.IMP, 2 ],[ "???", this.XXX, this.IMP, 8 ],[ "???", this.NOP, this.IMP, 4 ],[ "EOR", this.EOR, this.ZPX, 4 ],[ "LSR", this.LSR, this.ZPX, 6 ],[ "???", this.XXX, this.IMP, 6 ],[ "CLI", this.CLI, this.IMP, 2 ],[ "EOR", this.EOR, this.ABY, 4 ],[ "???", this.NOP, this.IMP, 2 ],[ "???", this.XXX, this.IMP, 7 ],[ "???", this.NOP, this.IMP, 4 ],[ "EOR", this.EOR, this.ABX, 4 ],[ "LSR", this.LSR, this.ABX, 7 ],[ "???", this.XXX, this.IMP, 7 ],
			[ "RTS", this.RTS, this.IMP, 6 ],[ "ADC", this.ADC, this.IZX, 6 ],[ "???", this.XXX, this.IMP, 2 ],[ "???", this.XXX, this.IMP, 8 ],[ "???", this.NOP, this.IMP, 3 ],[ "ADC", this.ADC, this.ZP0, 3 ],[ "ROR", this.ROR, this.ZP0, 5 ],[ "???", this.XXX, this.IMP, 5 ],[ "PLA", this.PLA, this.IMP, 4 ],[ "ADC", this.ADC, this.IMM, 2 ],[ "ROR", this.ROR, this.IMP, 2 ],[ "???", this.XXX, this.IMP, 2 ],[ "JMP", this.JMP, this.IND, 5 ],[ "ADC", this.ADC, this.ABS, 4 ],[ "ROR", this.ROR, this.ABS, 6 ],[ "???", this.XXX, this.IMP, 6 ],
			[ "BVS", this.BVS, this.REL, 2 ],[ "ADC", this.ADC, this.IZY, 5 ],[ "???", this.XXX, this.IMP, 2 ],[ "???", this.XXX, this.IMP, 8 ],[ "???", this.NOP, this.IMP, 4 ],[ "ADC", this.ADC, this.ZPX, 4 ],[ "ROR", this.ROR, this.ZPX, 6 ],[ "???", this.XXX, this.IMP, 6 ],[ "SEI", this.SEI, this.IMP, 2 ],[ "ADC", this.ADC, this.ABY, 4 ],[ "???", this.NOP, this.IMP, 2 ],[ "???", this.XXX, this.IMP, 7 ],[ "???", this.NOP, this.IMP, 4 ],[ "ADC", this.ADC, this.ABX, 4 ],[ "ROR", this.ROR, this.ABX, 7 ],[ "???", this.XXX, this.IMP, 7 ],
			[ "???", this.NOP, this.IMP, 2 ],[ "STA", this.STA, this.IZX, 6 ],[ "???", this.NOP, this.IMP, 2 ],[ "???", this.XXX, this.IMP, 6 ],[ "STY", this.STY, this.ZP0, 3 ],[ "STA", this.STA, this.ZP0, 3 ],[ "STX", this.STX, this.ZP0, 3 ],[ "???", this.XXX, this.IMP, 3 ],[ "DEY", this.DEY, this.IMP, 2 ],[ "???", this.NOP, this.IMP, 2 ],[ "TXA", this.TXA, this.IMP, 2 ],[ "???", this.XXX, this.IMP, 2 ],[ "STY", this.STY, this.ABS, 4 ],[ "STA", this.STA, this.ABS, 4 ],[ "STX", this.STX, this.ABS, 4 ],[ "???", this.XXX, this.IMP, 4 ],
			[ "BCC", this.BCC, this.REL, 2 ],[ "STA", this.STA, this.IZY, 6 ],[ "???", this.XXX, this.IMP, 2 ],[ "???", this.XXX, this.IMP, 6 ],[ "STY", this.STY, this.ZPX, 4 ],[ "STA", this.STA, this.ZPX, 4 ],[ "STX", this.STX, this.ZPY, 4 ],[ "???", this.XXX, this.IMP, 4 ],[ "TYA", this.TYA, this.IMP, 2 ],[ "STA", this.STA, this.ABY, 5 ],[ "TXS", this.TXS, this.IMP, 2 ],[ "???", this.XXX, this.IMP, 5 ],[ "???", this.NOP, this.IMP, 5 ],[ "STA", this.STA, this.ABX, 5 ],[ "???", this.XXX, this.IMP, 5 ],[ "???", this.XXX, this.IMP, 5 ],
			[ "LDY", this.LDY, this.IMM, 2 ],[ "LDA", this.LDA, this.IZX, 6 ],[ "LDX", this.LDX, this.IMM, 2 ],[ "???", this.XXX, this.IMP, 6 ],[ "LDY", this.LDY, this.ZP0, 3 ],[ "LDA", this.LDA, this.ZP0, 3 ],[ "LDX", this.LDX, this.ZP0, 3 ],[ "???", this.XXX, this.IMP, 3 ],[ "TAY", this.TAY, this.IMP, 2 ],[ "LDA", this.LDA, this.IMM, 2 ],[ "TAX", this.TAX, this.IMP, 2 ],[ "???", this.XXX, this.IMP, 2 ],[ "LDY", this.LDY, this.ABS, 4 ],[ "LDA", this.LDA, this.ABS, 4 ],[ "LDX", this.LDX, this.ABS, 4 ],[ "???", this.XXX, this.IMP, 4 ],
			[ "BCS", this.BCS, this.REL, 2 ],[ "LDA", this.LDA, this.IZY, 5 ],[ "???", this.XXX, this.IMP, 2 ],[ "???", this.XXX, this.IMP, 5 ],[ "LDY", this.LDY, this.ZPX, 4 ],[ "LDA", this.LDA, this.ZPX, 4 ],[ "LDX", this.LDX, this.ZPY, 4 ],[ "???", this.XXX, this.IMP, 4 ],[ "CLV", this.CLV, this.IMP, 2 ],[ "LDA", this.LDA, this.ABY, 4 ],[ "TSX", this.TSX, this.IMP, 2 ],[ "???", this.XXX, this.IMP, 4 ],[ "LDY", this.LDY, this.ABX, 4 ],[ "LDA", this.LDA, this.ABX, 4 ],[ "LDX", this.LDX, this.ABY, 4 ],[ "???", this.XXX, this.IMP, 4 ],
			[ "CPY", this.CPY, this.IMM, 2 ],[ "CMP", this.CMP, this.IZX, 6 ],[ "???", this.NOP, this.IMP, 2 ],[ "???", this.XXX, this.IMP, 8 ],[ "CPY", this.CPY, this.ZP0, 3 ],[ "CMP", this.CMP, this.ZP0, 3 ],[ "DEC", this.DEC, this.ZP0, 5 ],[ "???", this.XXX, this.IMP, 5 ],[ "INY", this.INY, this.IMP, 2 ],[ "CMP", this.CMP, this.IMM, 2 ],[ "DEX", this.DEX, this.IMP, 2 ],[ "???", this.XXX, this.IMP, 2 ],[ "CPY", this.CPY, this.ABS, 4 ],[ "CMP", this.CMP, this.ABS, 4 ],[ "DEC", this.DEC, this.ABS, 6 ],[ "???", this.XXX, this.IMP, 6 ],
			[ "BNE", this.BNE, this.REL, 2 ],[ "CMP", this.CMP, this.IZY, 5 ],[ "???", this.XXX, this.IMP, 2 ],[ "???", this.XXX, this.IMP, 8 ],[ "???", this.NOP, this.IMP, 4 ],[ "CMP", this.CMP, this.ZPX, 4 ],[ "DEC", this.DEC, this.ZPX, 6 ],[ "???", this.XXX, this.IMP, 6 ],[ "CLD", this.CLD, this.IMP, 2 ],[ "CMP", this.CMP, this.ABY, 4 ],[ "NOP", this.NOP, this.IMP, 2 ],[ "???", this.XXX, this.IMP, 7 ],[ "???", this.NOP, this.IMP, 4 ],[ "CMP", this.CMP, this.ABX, 4 ],[ "DEC", this.DEC, this.ABX, 7 ],[ "???", this.XXX, this.IMP, 7 ],
			[ "CPX", this.CPX, this.IMM, 2 ],[ "SBC", this.SBC, this.IZX, 6 ],[ "???", this.NOP, this.IMP, 2 ],[ "???", this.XXX, this.IMP, 8 ],[ "CPX", this.CPX, this.ZP0, 3 ],[ "SBC", this.SBC, this.ZP0, 3 ],[ "INC", this.INC, this.ZP0, 5 ],[ "???", this.XXX, this.IMP, 5 ],[ "INX", this.INX, this.IMP, 2 ],[ "SBC", this.SBC, this.IMM, 2 ],[ "NOP", this.NOP, this.IMP, 2 ],[ "???", this.SBC, this.IMP, 2 ],[ "CPX", this.CPX, this.ABS, 4 ],[ "SBC", this.SBC, this.ABS, 4 ],[ "INC", this.INC, this.ABS, 6 ],[ "???", this.XXX, this.IMP, 6 ],
			[ "BEQ", this.BEQ, this.REL, 2 ],[ "SBC", this.SBC, this.IZY, 5 ],[ "???", this.XXX, this.IMP, 2 ],[ "???", this.XXX, this.IMP, 8 ],[ "???", this.NOP, this.IMP, 4 ],[ "SBC", this.SBC, this.ZPX, 4 ],[ "INC", this.INC, this.ZPX, 6 ],[ "???", this.XXX, this.IMP, 6 ],[ "SED", this.SED, this.IMP, 2 ],[ "SBC", this.SBC, this.ABY, 4 ],[ "NOP", this.NOP, this.IMP, 2 ],[ "???", this.XXX, this.IMP, 7 ],[ "???", this.NOP, this.IMP, 4 ],[ "SBC", this.SBC, this.ABX, 4 ],[ "INC", this.INC, this.ABX, 7 ],[ "???", this.XXX, this.IMP, 7 ],
		];
	//}
	
	INSTRUCTION = {
		name,
		operate: null,
		addrmode: null,
		cylces: 0
	};
	
	//lookup = {};
}