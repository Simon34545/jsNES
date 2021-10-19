class INSTRUCTION {
	constructor(n, o, a, c) {
		this.name = n;
		this.operate = o;
		this.addrmode = a;
		this.cycles = c;
	}
}

class nes6502 {
	FLAGS6502 = {
		C: (1 << 0),
		Z: (1 << 1),
		I: (1 << 2),
		D: (1 << 3),
		B: (1 << 4),
		U: (1 << 5),
		V: (1 << 6),
		N: (1 << 7),
	};
	
	a = new uint8();
	x = new uint8();
	y = new uint8();
	stkp = new uint8();
	pc = new uint16();
	status = new uint8();
	
	bus = null;
	fetched = new uint8();
	addr_abs = new uint16();
	addr_rel = new uint16();
	opcode = new uint8();
	cycles = new uint8();
	
	ConnectBus(n) {
		this.bus = n;
	}
	
	read(a) {
		return this.bus.cpuRead(a, false);
	}
	
	write(a, d) {
		this.bus.cpuWrite(a, d);
	}
	
	GetFlag(f) {
		return ((this.status.v & f) > 0) ? 1 : 0;
	}
	
	SetFlag(f, v) {
		if (v) {
			this.status.v |= f;
		} else {
			this.status.v &= (~f) & 0xFF;
		}
	}
	
	clock() {
		if (this.cycles.v === 0) {
			this.opcode.v = this.read(this.pc.v);
			
			this.SetFlag(this.FLAGS6502.U, true);
			
			this.pc.v++;
			
			this.cycles.v = this.lookup[this.opcode.v].cycles;
			
			let additionalCycle1 = this[this.lookup[this.opcode.v].addrmode]();
			
			let additionalCycle2 = this[this.lookup[this.opcode.v].operate]();
			
			this.cycles.v += (additionalCycle1 & additionalCycle2);
			
			this.SetFlag(this.FLAGS6502.U, true);
			//let status_str = "P:24 SP:" + hex(this.stkp.v, 2);
			//let status_str = "P:" + (this.GetFlag(this.FLAGS6502.N) ? "N" : "n") + (this.GetFlag(this.FLAGS6502.V) ? "V" : "v") + (this.GetFlag(this.FLAGS6502.U) ? "U" : "u") + (this.GetFlag(this.FLAGS6502.B) ? "B" : "b") + (this.GetFlag(this.FLAGS6502.D) ? "D" : "d") + (this.GetFlag(this.FLAGS6502.I) ? "I" : "i") + (this.GetFlag(this.FLAGS6502.Z) ? "Z" : "z") + (this.GetFlag(this.FLAGS6502.C) ? "C" : "c")
			//this.log += "A:" + hex(this.a.v, 2) + " X:" + hex(this.x.v, 2) + " Y:" + hex(this.y.v, 2) + " S:" + hex(this.stkp.v, 2) + " " + status_str + "\n";
			//this.log += hex(this.pc.v, 4).padEnd(48, ' ') + "A:" + hex(this.a.v, 2) + " X:" + hex(this.x.v, 2) + " Y:" + hex(this.y.v, 2) + " " + status_str + "\n";
		}
		
		this.cycles.v--;
	}
	
	reset() {
		this.a.v = 0;
		this.x.v = 0;
		this.y.v = 0;
		this.stkp.v = 0xFD;
		this.status.v = 0x00;// | this.FLAGS6502.U;
		
		this.addr_abs.v = 0xFFFC;
		let lo = this.read(this.addr_abs.v + 0);
		let hi = this.read(this.addr_abs.v + 1);
		
		this.pc.v = (hi << 8) | lo;
		
		this.addr_rel.v = 0x0000;
		this.addr_abs.v = 0x0000;
		this.fetched.v = 0x00;
		
		this.cycles.v = 8;
	}
	
	irq() {
		if (this.GetFlag(this.FLAGS6502.I) === 0) {
			this.write(0x0100 + this.stkp.v, (this.pc.v >> 8) & 0x00FF);
			this.stkp.v--;
			this.write(0x0100 + this.stkp.v, this.pc.v & 0x00FF);
			this.stkp.v--;
			
			this.SetFlag(this.FLAGS6502.B, 0);
			this.SetFlag(this.FLAGS6502.U, 1);
			this.SetFlag(this.FLAGS6502.I, 1);
			this.write(0x0100 + this.stkp.v, this.status.v);
			this.stkp.v--;
			
			this.addr_abs.v = 0xFFFE;
			let lo = this.read(this.addr_abs.v + 0);
			let hi = this.read(this.addr_abs.v + 1);
			this.pc.v = (hi << 8) | lo;
			
			this.cycles.v = 7;
		}
	}
	
	nmi() {
		this.write(0x0100 + this.stkp.v, (this.pc.v >> 8) & 0x00FF);
		this.stkp.v--;
		this.write(0x0100 + this.stkp.v, this.pc.v & 0x00FF);
		this.stkp.v--;
		
		this.SetFlag(this.FLAGS6502.B, 0);
		this.SetFlag(this.FLAGS6502.U, 1);
		this.SetFlag(this.FLAGS6502.I, 1);
		this.write(0x0100 + this.stkp.v, this.status.v);
		this.stkp.v--;
		
		this.addr_abs.v = 0xFFFA;
		let lo = this.read(this.addr_abs.v + 0);
		let hi = this.read(this.addr_abs.v + 1);
		this.pc.v = (hi << 8) | lo;
		
		this.cycles.v = 8;
	}
	
	fetch() {
		if (!(this.lookup[this.opcode.v].addrmode === "IMP")) {
			this.fetched.v = this.read(this.addr_abs.v);
		}
		return this.fetched.v;
	}
	
	IMP() {
		this.fetched.v = this.a.v;
		return 0;
	}
	
	IMM() {
		this.addr_abs.v = this.pc.v++;
		return 0;
	}
	
	ZP0() {
		this.addr_abs.v = this.read(this.pc.v);
		this.pc.v++;
		this.addr_abs.v &= 0x00FF;
		return 0;
	}
	
	ZPX() {
		this.addr_abs.v = (this.read(this.pc.v) + this.x.v);
		this.pc.v++;
		this.addr_abs.v &= 0x00FF;
		return 0;
	}
	
	ZPY() {
		this.addr_abs.v = (this.read(this.pc.v) + this.y.v);
		this.pc.v++;
		this.addr_abs.v &= 0x00FF;
		return 0;
	}
	
	REL() {
		this.addr_rel.v = this.read(this.pc.v);
		this.pc.v++;
		if (this.addr_rel.v & 0x80) {
			this.addr_rel.v |= 0xFF00;
		}
		return 0
	}
	
	ABS() {
		let lo = this.read(this.pc.v);
		this.pc.v++;
		let hi = this.read(this.pc.v);
		this.pc.v++;
		
		this.addr_abs.v = (hi << 8) | lo;
		
		return 0;
	}
	
	ABX() {
		let lo = this.read(this.pc.v);
		this.pc.v++;
		let hi = this.read(this.pc.v);
		this.pc.v++;
		
		this.addr_abs.v = (hi << 8) | lo;
		this.addr_abs.v += this.x.v;
		
		if ((this.addr_abs.v & 0xFF00) !== (hi << 8)) {
			return 1;
		} else {
			return 0;
		}
	}
	
	ABY() {
		let lo = this.read(this.pc.v);
		this.pc.v++;
		let hi = this.read(this.pc.v);
		this.pc.v++;
		
		this.addr_abs.v = (hi << 8) | lo;
		this.addr_abs.v += this.y.v;
		
		if ((this.addr_abs.v & 0xFF00) !== (hi << 8)) {
			return 1;
		} else {
			return 0;
		}
	}
	
	IND() {
		let ptr_lo = this.read(this.pc.v);
		this.pc.v++;
		let ptr_hi = this.read(this.pc.v);
		this.pc.v++;
		
		let ptr = new uint16((ptr_hi << 8) | ptr_lo);
		
		if (ptr_lo === 0x00FF) { // Simulate page boundary hardware bug
			this.addr_abs.v = (this.read(ptr.v & 0xFF00) << 8) | this.read(ptr.v + 0);
		} else {
			this.addr_abs.v = (this.read(ptr.v + 1) << 8) | this.read(ptr.v + 0);
		}
		
		return 0;
	}
	
	IZX() {
		let t = this.read(this.pc.v);
		this.pc.v++;
		
		let lo = this.read((t + this.x.v) & 0x00FF);
		let hi = this.read((t + this.x.v + 1) & 0x00FF);
		
		this.addr_abs.v = (hi << 8) | lo;
		
		return 0;
	}
	
	IZY() {
		let t = this.read(this.pc.v);
		this.pc.v++;
		
		let lo = this.read(t & 0x00FF);
		let hi = this.read((t + 1) & 0x00FF);
		
		this.addr_abs.v = (hi << 8) | lo;
		this.addr_abs.v += this.y.v;
		
		if ((this.addr_abs.v & 0xFF00) !== (hi << 8)) {
			return 1;
		} else {
			return 0;
		}
	}
	
	
	
	
	
	ADC() {
		this.fetch();
		
		let temp = this.a.v + this.fetched.v + this.GetFlag(this.FLAGS6502.C);
		
		this.SetFlag(this.FLAGS6502.C, temp > 255);
		
		this.SetFlag(this.FLAGS6502.Z, (temp & 0x00FF) === 0);
		
		this.SetFlag(this.FLAGS6502.V, (~(this.a.v ^ this.fetched.v) & (this.a.v ^ temp)) & 0x0080);
		
		this.SetFlag(this.FLAGS6502.N, temp & 0x80);
		
		this.a.v = temp & 0x00FF;
		
		return 1;
	}
	
	AND() {
		this.fetch();
		this.a.v = this.a.v & this.fetched.v;
		this.SetFlag(this.FLAGS6502.Z, this.a.v === 0x00);
		this.SetFlag(this.FLAGS6502.N, this.a.v & 0x80);
		return 1;
	}
	
	ASL() {
		this.fetch();
		let temp = this.fetched.v << 1;
		this.SetFlag(this.FLAGS6502.C, (temp & 0xFF00) > 0);
		this.SetFlag(this.FLAGS6502.Z, (temp & 0x00FF) === 0x00);
		this.SetFlag(this.FLAGS6502.N, temp & 0x80);
		if (this.lookup[this.opcode.v].addrmode === "IMP") {
			this.a.v = temp & 0x00FF;
		} else {
			this.write(this.addr_abs.v, temp & 0x00FF);
		}
		return 0;
	}
	
	BCC() {
		if (this.GetFlag(this.FLAGS6502.C) === 0) {
			this.cycles.v++;
			this.addr_abs.v = this.pc.v + this.addr_rel.v;
			
			if ((this.addr_abs.v & 0xFF00) !== (this.pc.v & 0xFF00)) {
				this.cycles.v++;
			}
			
			this.pc.v = this.addr_abs.v;
		}
		return 0;
	}
	
	BCS() {
		if (this.GetFlag(this.FLAGS6502.C) === 1) {
			this.cycles.v++;
			this.addr_abs.v = this.pc.v + this.addr_rel.v;
			
			if ((this.addr_abs.v & 0xFF00) !== (this.pc.v & 0xFF00)) {
				this.cycles.v++;
			}
			
			this.pc.v = this.addr_abs.v;
		}
		return 0;
	}
	
	BEQ() {
		if (this.GetFlag(this.FLAGS6502.Z) === 1) {
			this.cycles.v++;
			this.addr_abs.v = this.pc.v + this.addr_rel.v;
			
			if ((this.addr_abs.v & 0xFF00) !== (this.pc.v & 0xFF00)) {
				this.cycles.v++;
			}
			
			this.pc.v = this.addr_abs.v;
		}
		return 0;
	}
	
	BIT() {
		this.fetch();
		let temp = this.a.v & this.fetched.v;
		this.SetFlag(this.FLAGS6502.Z, (temp & 0x00FF) === 0x00);
		this.SetFlag(this.FLAGS6502.N, this.fetched.v & (1 << 7));
		this.SetFlag(this.FLAGS6502.V, this.fetched.v & (1 << 6));
		return 0;
	}
	
	BMI() {
		if (this.GetFlag(this.FLAGS6502.N) === 1) {
			this.cycles.v++;
			this.addr_abs.v = this.pc.v + this.addr_rel.v;
			
			if ((this.addr_abs.v & 0xFF00) !== (this.pc.v & 0xFF00)) {
				this.cycles.v++;
			}
			
			this.pc.v = this.addr_abs.v;
		}
		return 0;
	}
	
	BNE() {
		if (this.GetFlag(this.FLAGS6502.Z) === 0) {
			this.cycles.v++;
			this.addr_abs.v = this.pc.v + this.addr_rel.v;
			
			if ((this.addr_abs.v & 0xFF00) !== (this.pc.v & 0xFF00)) {
				this.cycles.v++;
			}
			
			this.pc.v = this.addr_abs.v;
		}
		return 0;
	}
	
	BPL() {
		if (this.GetFlag(this.FLAGS6502.N) === 0) {
			this.cycles.v++;
			this.addr_abs.v = this.pc.v + this.addr_rel.v;
			
			if ((this.addr_abs.v & 0xFF00) !== (this.pc.v & 0xFF00)) {
				this.cycles.v++;
			}
			
			this.pc.v = this.addr_abs.v;
		}
		return 0;
	}
	
	BRK() {
		this.pc.v++;
		
		this.SetFlag(this.FLAGS6502.I, 1);
		this.write(0x0100 + this.stkp.v, (this.pc.v >> 8) & 0x00FF);
		this.stkp.v--;
		this.write(0x0100 + this.stkp.v, this.pc.v & 0x00FF);
		this.stkp.v--;
		
		this.SetFlag(this.FLAGS6502.B, 1);
		this.write(0x0100 + this.stkp.v, this.status.v);
		this.stkp.v--;
		this.SetFlag(this.FLAGS6502.B, 0);
		
		this.pc.v = this.read(0xFFFE) | (this.read(0xFFFF) << 8);
		return 0;
	}
	
	BVC() {
		if (this.GetFlag(this.FLAGS6502.V) === 0) {
			this.cycles.v++;
			this.addr_abs.v = this.pc.v + this.addr_rel.v;
			
			if ((this.addr_abs.v & 0xFF00) !== (this.pc.v & 0xFF00)) {
				this.cycles.v++;
			}
			
			this.pc.v = this.addr_abs.v;
		}
		return 0;
	}
	
	BVS() {
		if (this.GetFlag(this.FLAGS6502.V) === 1) {
			this.cycles.v++;
			this.addr_abs.v = this.pc.v + this.addr_rel.v;
			
			if ((this.addr_abs.v & 0xFF00) !== (this.pc.v & 0xFF00)) {
				this.cycles.v++;
			}
			
			this.pc.v = this.addr_abs.v;
		}
		return 0;
	}
	
	CLC() {
		this.SetFlag(this.FLAGS6502.C, false);
		return 0;
	}
	
	CLD() {
		this.SetFlag(this.FLAGS6502.D, false);
		return 0;
	}
	
	CLI() {
		this.SetFlag(this.FLAGS6502.I, false);
		return 0;
	}
	
	CLV() {
		this.SetFlag(this.FLAGS6502.V, false);
		return 0;
	}
	
	CMP() {
		this.fetch();
		let temp = this.a.v - this.fetched.v;
		this.SetFlag(this.FLAGS6502.C, this.a.v >= this.fetched.v);
		this.SetFlag(this.FLAGS6502.Z, (temp & 0x00FF) === 0x0000);
		this.SetFlag(this.FLAGS6502.N, temp & 0x0080);
		return 1;
	}
	
	CPX() {
		this.fetch();
		let temp = this.x.v - this.fetched.v;
		this.SetFlag(this.FLAGS6502.C, this.x.v >= this.fetched.v);
		this.SetFlag(this.FLAGS6502.Z, (temp & 0x00FF) === 0x0000);
		this.SetFlag(this.FLAGS6502.N, temp & 0x0080);
		return 0;
	}
	
	CPY() {
		this.fetch();
		let temp = this.y.v - this.fetched.v;
		this.SetFlag(this.FLAGS6502.C, this.y.v >= this.fetched.v);
		this.SetFlag(this.FLAGS6502.Z, (temp & 0x00FF) === 0x0000);
		this.SetFlag(this.FLAGS6502.N, temp & 0x0080);
		return 0;
	}
	
	DEC() {
		this.fetch();
		let temp = this.fetched.v - 1;
		this.write(this.addr_abs.v, temp & 0x00FF);
		this.SetFlag(this.FLAGS6502.Z, (temp & 0x00FF) === 0x0000);
		this.SetFlag(this.FLAGS6502.N, temp & 0x0080);
		return 0;
	}
	
	DEX() {
		this.x.v--;
		this.SetFlag(this.FLAGS6502.Z, this.x.v === 0x00);
		this.SetFlag(this.FLAGS6502.N, this.x.v & 0x80);
		return 0;
	}
	
	DEY() {
		this.y.v--;
		this.SetFlag(this.FLAGS6502.Z, this.y.v === 0x00);
		this.SetFlag(this.FLAGS6502.N, this.y.v & 0x80);
		return 0;
	}
	
	EOR() {
		this.fetch();
		this.a.v = this.a.v ^ this.fetched.v;
		this.SetFlag(this.FLAGS6502.Z, this.a.v === 0x00);
		this.SetFlag(this.FLAGS6502.N, this.a.v & 0x80);
		return 1;
	}
	
	INC() {
		this.fetch();
		let temp = this.fetched.v + 1;
		this.write(this.addr_abs.v, temp & 0x00FF);
		this.SetFlag(this.FLAGS6502.Z, (temp & 0x00FF) === 0x0000);
		this.SetFlag(this.FLAGS6502.N, temp & 0x0080);
		return 0;
	}
	
	INX() {
		this.x.v++;
		this.SetFlag(this.FLAGS6502.Z, this.x.v === 0x00);
		this.SetFlag(this.FLAGS6502.N, this.x.v & 0x80);
		return 0;
	}
	
	INY() {
		this.y.v++;
		this.SetFlag(this.FLAGS6502.Z, this.y.v === 0x00);
		this.SetFlag(this.FLAGS6502.N, this.y.v & 0x80);
		return 0;
	}
	
	JMP() {
		this.pc.v = this.addr_abs.v;
		return 0;
	}
	
	JSR() {
		this.pc.v--;
		
		this.write(0x0100 + this.stkp.v, (this.pc.v >> 8) & 0x00FF);
		this.stkp.v--;
		this.write(0x0100 + this.stkp.v, this.pc.v & 0x00FF);
		this.stkp.v--;
		
		this.pc.v = this.addr_abs.v;
		return 0;
	}
	
	LDA() {
		this.fetch();
		this.a.v = this.fetched.v;
		this.SetFlag(this.FLAGS6502.Z, this.a.v === 0x00);
		this.SetFlag(this.FLAGS6502.N, this.a.v & 0x80);
		return 1;
	}
	
	LDX() {
		this.fetch();
		this.x.v = this.fetched.v;
		this.SetFlag(this.FLAGS6502.Z, this.x.v === 0x00);
		this.SetFlag(this.FLAGS6502.N, this.x.v & 0x80);
		return 1;
	}
	
	LDY() {
		this.fetch();
		this.y.v = this.fetched.v;
		this.SetFlag(this.FLAGS6502.Z, this.y.v === 0x00);
		this.SetFlag(this.FLAGS6502.N, this.y.v & 0x80);
		return 1;
	}
	
	LSR() {
		this.fetch();
		this.SetFlag(this.FLAGS6502.C, this.fetched.v & 0x0001);
		let temp = this.fetched.v >> 1;
		this.SetFlag(this.FLAGS6502.Z, (temp & 0x00FF) === 0x0000);
		this.SetFlag(this.FLAGS6502.N, temp & 0x0080);
		if (this.lookup[this.opcode.v].addrmode === "IMP") {
			this.a.v = temp & 0x00FF;
		} else {
			this.write(this.addr_abs.v, temp & 0x00FF);
		}
		return 0;
	}
	
	NOP() {
		switch(this.opcode.v) {
		case 0x1C:
		case 0x3C:
		case 0x5C:
		case 0x7C:
		case 0xDC:
		case 0xFC:
			return 1;
			break;
		}
		return 0;
	}
	
	ORA() {
		this.fetch();
		this.a.v = this.a.v | this.fetched.v;
		this.SetFlag(this.FLAGS6502.Z, this.a.v === 0x00);
		this.SetFlag(this.FLAGS6502.N, this.a.v & 0x80);
		return 1;
	}
	
	PHA() {
		this.write(0x0100 + this.stkp.v, this.a.v);
		this.stkp.v--;
		return 0;
	}
	
	PHP() {
		this.write(0x0100 + this.stkp.v, this.status.v | this.FLAGS6502.B | this.FLAGS6502.U);
		this.SetFlag(this.FLAGS6502.B, 0);
		this.SetFlag(this.FLAGS6502.U, 0);
		this.stkp.v--;
		return 0;
	}
	
	PLA() {
		this.stkp.v++;
		this.a.v = this.read(0x0100 + this.stkp.v);
		this.SetFlag(this.FLAGS6502.Z, this.a.v === 0x00);
		this.SetFlag(this.FLAGS6502.N, this.a.v & 0x80);
		return 0;
	}
	
	PLP() {
		this.stkp.v++;
		this.status.v = this.read(0x0100 + this.stkp.v);
		this.SetFlag(this.FLAGS6502.U, 1);
		return 0
	}
	
	ROL() {
		this.fetch();
		let temp = (this.fetched.v << 1) | this.GetFlag(this.FLAGS6502.C);
		this.SetFlag(this.FLAGS6502.C, temp & 0xFF00);
		this.SetFlag(this.FLAGS6502.Z, (temp & 0x00FF) === 0x0000);
		this.SetFlag(this.FLAGS6502.N, temp & 0x0080);
		if (this.lookup[this.opcode.v].addrmode === "IMP") {
			this.a.v = temp & 0x00FF;
		} else {
			this.write(this.addr_abs.v, temp & 0x00FF);
		}
		return 0;
	}
	
	ROR() {
		this.fetch();
		let temp = (this.GetFlag(this.FLAGS6502.C) << 7) | (this.fetched.v >> 1);
		this.SetFlag(this.FLAGS6502.C, this.fetched.v & 0x01);
		this.SetFlag(this.FLAGS6502.Z, (temp & 0x00FF) === 0x00);
		this.SetFlag(this.FLAGS6502.N, temp & 0x0080);
		if (this.lookup[this.opcode.v].addrmode === "IMP") {
			this.a.v = temp & 0x00FF;
		} else {
			this.write(this.addr_abs.v, temp & 0x00FF);
		}
		return 0;
	}
	
	RTI() {
		this.stkp.v++;
		this.status.v = this.read(0x0100 + this.stkp.v);
		this.status.v &= ~this.FLAGS6502.B;
		this.status.v &= ~this.FLAGS6502.U;
		
		this.stkp.v++;
		this.pc.v = this.read(0x0100 + this.stkp.v);
		this.stkp.v++;
		this.pc.v |= this.read(0x0100 + this.stkp.v) << 8;
		return 0;
	}
	
	RTS() {
		this.stkp.v++;
		this.pc.v = this.read(0x0100 + this.stkp.v);
		this.stkp.v++;
		this.pc.v |= this.read(0x0100 + this.stkp.v) << 8;
		
		this.pc.v++;
		return 0;
	}
	
	SBC() {
		this.fetch();
		
		let value = this.fetched.v ^ 0x00FF;
		
		let temp = this.a.v + value + this.GetFlag(this.FLAGS6502.C);
		
		this.SetFlag(this.FLAGS6502.C, temp & 0xFF00);
		this.SetFlag(this.FLAGS6502.Z, ((temp & 0x00FF) === 0));
		this.SetFlag(this.FLAGS6502.V, (temp ^ this.a.v) & (temp ^ value) & 0x0080);
		this.SetFlag(this.FLAGS6502.N, temp & 0x0080);
		this.a.v = temp & 0x00FF;
		return 1;
	}
	
	SEC() {
		this.SetFlag(this.FLAGS6502.C, true);
		return 0;
	}
	
	SED() {
		this.SetFlag(this.FLAGS6502.D, true);
		return 0;
	}
	
	SEI() {
		this.SetFlag(this.FLAGS6502.I, true);
		return 0;
	}
	
	STA() {
		this.write(this.addr_abs.v, this.a.v);
		return 0;
	}
	
	STX() {
		this.write(this.addr_abs.v, this.x.v);
		return 0;
	}
	
	STY() {
		this.write(this.addr_abs.v, this.y.v);
		return 0;
	}
	
	TAX() {
		this.x.v = this.a.v;
		this.SetFlag(this.FLAGS6502.Z, this.x.v === 0x00);
		this.SetFlag(this.FLAGS6502.N, this.x.v & 0x80);
		return 0;
	}
	
	TAY() {
		this.y.v = this.a.v;
		this.SetFlag(this.FLAGS6502.Z, this.y.v === 0x00);
		this.SetFlag(this.FLAGS6502.N, this.y.v & 0x80);
		return 0;
	}
	
	TSX() {
		this.x.v = this.stkp.v;
		this.SetFlag(this.FLAGS6502.Z, this.x.v === 0x00);
		this.SetFlag(this.FLAGS6502.N, this.x.v & 0x80);
		return 0;
	}
	
	TXA() {
		this.a.v = this.x.v;
		this.SetFlag(this.FLAGS6502.Z, this.a.v === 0x00);
		this.SetFlag(this.FLAGS6502.N, this.a.v & 0x80);
		return 0;
	}
	
	TXS() {
		this.stkp.v = this.x.v;
		return 0;
	}
	
	TYA() {
		this.a.v = this.y.v;
		this.SetFlag(this.FLAGS6502.Z, this.a.v === 0x00);
		this.SetFlag(this.FLAGS6502.N, this.a.v & 0x80);
		return 0;
	}
	
	XXX() {
		return 0;
	}
	
	complete() {
		return this.cycles.v === 0;
	}
	
	disassemble(start, stop) {
		let addr = start;
		let value = 0x00, lo = 0x00, hi = 0x00;
		let mapLines = [];
		let line_addr = 0;
		
		while (addr <= stop) {
			let line_addr = addr;
			
			let sInst = "$" + hex(addr, 4) + ": ";
			
			let opcode = this.bus.cpuRead(addr, true); addr++;
			sInst += this.lookup[opcode].name + " ";
			
			if (this.lookup[opcode].addrmode === "IMP") {
				sInst += " {IMP}";
			} else if (this.lookup[opcode].addrmode === "IMM") {
				value = this.bus.cpuRead(addr, true); addr++;
				sInst += "#$" + hex(value, 2) + " {IMM}";
			} else if (this.lookup[opcode].addrmode === "ZP0") {
				lo = this.bus.cpuRead(addr, true); addr++;
				hi = 0x00;												
				sInst += "$" + hex(lo, 2) + " {ZP0}";
			} else if (this.lookup[opcode].addrmode === "ZPX") {
				lo = this.bus.cpuRead(addr, true); addr++;
				hi = 0x00;														
				sInst += "$" + hex(lo, 2) + ", X {ZPX}";
			} else if (this.lookup[opcode].addrmode === "ZPY") {
				lo = this.bus.cpuRead(addr, true); addr++;
				hi = 0x00;														
				sInst += "$" + hex(lo, 2) + ", Y {ZPY}";
			} else if (this.lookup[opcode].addrmode === "IZX") {
				lo = this.bus.cpuRead(addr, true); addr++;
				hi = 0x00;								
				sInst += "($" + hex(lo, 2) + ", X) {IZX}";
			} else if (this.lookup[opcode].addrmode === "IZY") {
				lo = this.bus.cpuRead(addr, true); addr++;
				hi = 0x00;								
				sInst += "($" + hex(lo, 2) + "), Y {IZY}";
			} else if (this.lookup[opcode].addrmode === "ABS") {
				lo = this.bus.cpuRead(addr, true); addr++;
				hi = this.bus.cpuRead(addr, true); addr++;
				sInst += "$" + hex((hi << 8) | lo, 4) + " {ABS}";
			} else if (this.lookup[opcode].addrmode === "ABX") {
				lo = this.bus.cpuRead(addr, true); addr++;
				hi = this.bus.cpuRead(addr, true); addr++;
				sInst += "$" + hex((hi << 8) | lo, 4) + ", X {ABX}";
			} else if (this.lookup[opcode].addrmode === "ABY") {
				lo = this.bus.cpuRead(addr, true); addr++;
				hi = this.bus.cpuRead(addr, true); addr++;
				sInst += "$" + hex((hi << 8) | lo, 4) + ", Y {ABY}";
			} else if (this.lookup[opcode].addrmode === "IND") {
				lo = this.bus.cpuRead(addr, true); addr++;
				hi = this.bus.cpuRead(addr, true); addr++;
				sInst += "($" + hex((hi << 8) | lo, 4) + ") {IND}";
			} else if (this.lookup[opcode].addrmode === "REL") {
				value = this.bus.cpuRead(addr, true); addr++;
				sInst += "$" + hex(value, 2) + " [$" + hex(addr + uncomplement(value & 0x00FF, 8), 4) + "] {REL}";
			}
			
			mapLines[line_addr] = sInst;
		}
		
		return mapLines;
	}
	
	constructor() {
		this.lookup = [
			new INSTRUCTION("BRK", "BRK", "IMM", 7), new INSTRUCTION("ORA", "ORA", "IZX", 6), new INSTRUCTION("???", "XXX", "IMP", 2), new INSTRUCTION("???", "XXX", "IMP", 8), new INSTRUCTION("???", "NOP", "IMP", 3), new INSTRUCTION("ORA", "ORA", "ZP0", 3), new INSTRUCTION("ASL", "ASL", "ZP0", 5), new INSTRUCTION("???", "XXX", "IMP", 5), new INSTRUCTION("PHP", "PHP", "IMP", 3), new INSTRUCTION("ORA", "ORA", "IMM", 2), new INSTRUCTION("ASL", "ASL", "IMP", 2), new INSTRUCTION("???", "XXX", "IMP", 2), new INSTRUCTION("???", "NOP", "IMP", 4), new INSTRUCTION("ORA", "ORA", "ABS", 4), new INSTRUCTION("ASL", "ASL", "ABS", 6), new INSTRUCTION("???", "XXX", "IMP", 6), 
			new INSTRUCTION("BPL", "BPL", "REL", 2), new INSTRUCTION("ORA", "ORA", "IZY", 5), new INSTRUCTION("???", "XXX", "IMP", 2), new INSTRUCTION("???", "XXX", "IMP", 8), new INSTRUCTION("???", "NOP", "IMP", 4), new INSTRUCTION("ORA", "ORA", "ZPX", 4), new INSTRUCTION("ASL", "ASL", "ZPX", 6), new INSTRUCTION("???", "XXX", "IMP", 6), new INSTRUCTION("CLC", "CLC", "IMP", 2), new INSTRUCTION("ORA", "ORA", "ABY", 4), new INSTRUCTION("???", "NOP", "IMP", 2), new INSTRUCTION("???", "XXX", "IMP", 7), new INSTRUCTION("???", "NOP", "IMP", 4), new INSTRUCTION("ORA", "ORA", "ABX", 4), new INSTRUCTION("ASL", "ASL", "ABX", 7), new INSTRUCTION("???", "XXX", "IMP", 7), 
			new INSTRUCTION("JSR", "JSR", "ABS", 6), new INSTRUCTION("AND", "AND", "IZX", 6), new INSTRUCTION("???", "XXX", "IMP", 2), new INSTRUCTION("???", "XXX", "IMP", 8), new INSTRUCTION("BIT", "BIT", "ZP0", 3), new INSTRUCTION("AND", "AND", "ZP0", 3), new INSTRUCTION("ROL", "ROL", "ZP0", 5), new INSTRUCTION("???", "XXX", "IMP", 5), new INSTRUCTION("PLP", "PLP", "IMP", 4), new INSTRUCTION("AND", "AND", "IMM", 2), new INSTRUCTION("ROL", "ROL", "IMP", 2), new INSTRUCTION("???", "XXX", "IMP", 2), new INSTRUCTION("BIT", "BIT", "ABS", 4), new INSTRUCTION("AND", "AND", "ABS", 4), new INSTRUCTION("ROL", "ROL", "ABS", 6), new INSTRUCTION("???", "XXX", "IMP", 6), 
			new INSTRUCTION("BMI", "BMI", "REL", 2), new INSTRUCTION("AND", "AND", "IZY", 5), new INSTRUCTION("???", "XXX", "IMP", 2), new INSTRUCTION("???", "XXX", "IMP", 8), new INSTRUCTION("???", "NOP", "IMP", 4), new INSTRUCTION("AND", "AND", "ZPX", 4), new INSTRUCTION("ROL", "ROL", "ZPX", 6), new INSTRUCTION("???", "XXX", "IMP", 6), new INSTRUCTION("SEC", "SEC", "IMP", 2), new INSTRUCTION("AND", "AND", "ABY", 4), new INSTRUCTION("???", "NOP", "IMP", 2), new INSTRUCTION("???", "XXX", "IMP", 7), new INSTRUCTION("???", "NOP", "IMP", 4), new INSTRUCTION("AND", "AND", "ABX", 4), new INSTRUCTION("ROL", "ROL", "ABX", 7), new INSTRUCTION("???", "XXX", "IMP", 7), 
			new INSTRUCTION("RTI", "RTI", "IMP", 6), new INSTRUCTION("EOR", "EOR", "IZX", 6), new INSTRUCTION("???", "XXX", "IMP", 2), new INSTRUCTION("???", "XXX", "IMP", 8), new INSTRUCTION("???", "NOP", "IMP", 3), new INSTRUCTION("EOR", "EOR", "ZP0", 3), new INSTRUCTION("LSR", "LSR", "ZP0", 5), new INSTRUCTION("???", "XXX", "IMP", 5), new INSTRUCTION("PHA", "PHA", "IMP", 3), new INSTRUCTION("EOR", "EOR", "IMM", 2), new INSTRUCTION("LSR", "LSR", "IMP", 2), new INSTRUCTION("???", "XXX", "IMP", 2), new INSTRUCTION("JMP", "JMP", "ABS", 3), new INSTRUCTION("EOR", "EOR", "ABS", 4), new INSTRUCTION("LSR", "LSR", "ABS", 6), new INSTRUCTION("???", "XXX", "IMP", 6), 
			new INSTRUCTION("BVC", "BVC", "REL", 2), new INSTRUCTION("EOR", "EOR", "IZY", 5), new INSTRUCTION("???", "XXX", "IMP", 2), new INSTRUCTION("???", "XXX", "IMP", 8), new INSTRUCTION("???", "NOP", "IMP", 4), new INSTRUCTION("EOR", "EOR", "ZPX", 4), new INSTRUCTION("LSR", "LSR", "ZPX", 6), new INSTRUCTION("???", "XXX", "IMP", 6), new INSTRUCTION("CLI", "CLI", "IMP", 2), new INSTRUCTION("EOR", "EOR", "ABY", 4), new INSTRUCTION("???", "NOP", "IMP", 2), new INSTRUCTION("???", "XXX", "IMP", 7), new INSTRUCTION("???", "NOP", "IMP", 4), new INSTRUCTION("EOR", "EOR", "ABX", 4), new INSTRUCTION("LSR", "LSR", "ABX", 7), new INSTRUCTION("???", "XXX", "IMP", 7), 
			new INSTRUCTION("RTS", "RTS", "IMP", 6), new INSTRUCTION("ADC", "ADC", "IZX", 6), new INSTRUCTION("???", "XXX", "IMP", 2), new INSTRUCTION("???", "XXX", "IMP", 8), new INSTRUCTION("???", "NOP", "IMP", 3), new INSTRUCTION("ADC", "ADC", "ZP0", 3), new INSTRUCTION("ROR", "ROR", "ZP0", 5), new INSTRUCTION("???", "XXX", "IMP", 5), new INSTRUCTION("PLA", "PLA", "IMP", 4), new INSTRUCTION("ADC", "ADC", "IMM", 2), new INSTRUCTION("ROR", "ROR", "IMP", 2), new INSTRUCTION("???", "XXX", "IMP", 2), new INSTRUCTION("JMP", "JMP", "IND", 5), new INSTRUCTION("ADC", "ADC", "ABS", 4), new INSTRUCTION("ROR", "ROR", "ABS", 6), new INSTRUCTION("???", "XXX", "IMP", 6), 
			new INSTRUCTION("BVS", "BVS", "REL", 2), new INSTRUCTION("ADC", "ADC", "IZY", 5), new INSTRUCTION("???", "XXX", "IMP", 2), new INSTRUCTION("???", "XXX", "IMP", 8), new INSTRUCTION("???", "NOP", "IMP", 4), new INSTRUCTION("ADC", "ADC", "ZPX", 4), new INSTRUCTION("ROR", "ROR", "ZPX", 6), new INSTRUCTION("???", "XXX", "IMP", 6), new INSTRUCTION("SEI", "SEI", "IMP", 2), new INSTRUCTION("ADC", "ADC", "ABY", 4), new INSTRUCTION("???", "NOP", "IMP", 2), new INSTRUCTION("???", "XXX", "IMP", 7), new INSTRUCTION("???", "NOP", "IMP", 4), new INSTRUCTION("ADC", "ADC", "ABX", 4), new INSTRUCTION("ROR", "ROR", "ABX", 7), new INSTRUCTION("???", "XXX", "IMP", 7), 
			new INSTRUCTION("???", "NOP", "IMP", 2), new INSTRUCTION("STA", "STA", "IZX", 6), new INSTRUCTION("???", "NOP", "IMP", 2), new INSTRUCTION("???", "XXX", "IMP", 6), new INSTRUCTION("STY", "STY", "ZP0", 3), new INSTRUCTION("STA", "STA", "ZP0", 3), new INSTRUCTION("STX", "STX", "ZP0", 3), new INSTRUCTION("???", "XXX", "IMP", 3), new INSTRUCTION("DEY", "DEY", "IMP", 2), new INSTRUCTION("???", "NOP", "IMP", 2), new INSTRUCTION("TXA", "TXA", "IMP", 2), new INSTRUCTION("???", "XXX", "IMP", 2), new INSTRUCTION("STY", "STY", "ABS", 4), new INSTRUCTION("STA", "STA", "ABS", 4), new INSTRUCTION("STX", "STX", "ABS", 4), new INSTRUCTION("???", "XXX", "IMP", 4), 
			new INSTRUCTION("BCC", "BCC", "REL", 2), new INSTRUCTION("STA", "STA", "IZY", 6), new INSTRUCTION("???", "XXX", "IMP", 2), new INSTRUCTION("???", "XXX", "IMP", 6), new INSTRUCTION("STY", "STY", "ZPX", 4), new INSTRUCTION("STA", "STA", "ZPX", 4), new INSTRUCTION("STX", "STX", "ZPY", 4), new INSTRUCTION("???", "XXX", "IMP", 4), new INSTRUCTION("TYA", "TYA", "IMP", 2), new INSTRUCTION("STA", "STA", "ABY", 5), new INSTRUCTION("TXS", "TXS", "IMP", 2), new INSTRUCTION("???", "XXX", "IMP", 5), new INSTRUCTION("???", "NOP", "IMP", 5), new INSTRUCTION("STA", "STA", "ABX", 5), new INSTRUCTION("???", "XXX", "IMP", 5), new INSTRUCTION("???", "XXX", "IMP", 5), 
			new INSTRUCTION("LDY", "LDY", "IMM", 2), new INSTRUCTION("LDA", "LDA", "IZX", 6), new INSTRUCTION("LDX", "LDX", "IMM", 2), new INSTRUCTION("???", "XXX", "IMP", 6), new INSTRUCTION("LDY", "LDY", "ZP0", 3), new INSTRUCTION("LDA", "LDA", "ZP0", 3), new INSTRUCTION("LDX", "LDX", "ZP0", 3), new INSTRUCTION("???", "XXX", "IMP", 3), new INSTRUCTION("TAY", "TAY", "IMP", 2), new INSTRUCTION("LDA", "LDA", "IMM", 2), new INSTRUCTION("TAX", "TAX", "IMP", 2), new INSTRUCTION("???", "XXX", "IMP", 2), new INSTRUCTION("LDY", "LDY", "ABS", 4), new INSTRUCTION("LDA", "LDA", "ABS", 4), new INSTRUCTION("LDX", "LDX", "ABS", 4), new INSTRUCTION("???", "XXX", "IMP", 4), 
			new INSTRUCTION("BCS", "BCS", "REL", 2), new INSTRUCTION("LDA", "LDA", "IZY", 5), new INSTRUCTION("???", "XXX", "IMP", 2), new INSTRUCTION("???", "XXX", "IMP", 5), new INSTRUCTION("LDY", "LDY", "ZPX", 4), new INSTRUCTION("LDA", "LDA", "ZPX", 4), new INSTRUCTION("LDX", "LDX", "ZPY", 4), new INSTRUCTION("???", "XXX", "IMP", 4), new INSTRUCTION("CLV", "CLV", "IMP", 2), new INSTRUCTION("LDA", "LDA", "ABY", 4), new INSTRUCTION("TSX", "TSX", "IMP", 2), new INSTRUCTION("???", "XXX", "IMP", 4), new INSTRUCTION("LDY", "LDY", "ABX", 4), new INSTRUCTION("LDA", "LDA", "ABX", 4), new INSTRUCTION("LDX", "LDX", "ABY", 4), new INSTRUCTION("???", "XXX", "IMP", 4), 
			new INSTRUCTION("CPY", "CPY", "IMM", 2), new INSTRUCTION("CMP", "CMP", "IZX", 6), new INSTRUCTION("???", "NOP", "IMP", 2), new INSTRUCTION("???", "XXX", "IMP", 8), new INSTRUCTION("CPY", "CPY", "ZP0", 3), new INSTRUCTION("CMP", "CMP", "ZP0", 3), new INSTRUCTION("DEC", "DEC", "ZP0", 5), new INSTRUCTION("???", "XXX", "IMP", 5), new INSTRUCTION("INY", "INY", "IMP", 2), new INSTRUCTION("CMP", "CMP", "IMM", 2), new INSTRUCTION("DEX", "DEX", "IMP", 2), new INSTRUCTION("???", "XXX", "IMP", 2), new INSTRUCTION("CPY", "CPY", "ABS", 4), new INSTRUCTION("CMP", "CMP", "ABS", 4), new INSTRUCTION("DEC", "DEC", "ABS", 6), new INSTRUCTION("???", "XXX", "IMP", 6), 
			new INSTRUCTION("BNE", "BNE", "REL", 2), new INSTRUCTION("CMP", "CMP", "IZY", 5), new INSTRUCTION("???", "XXX", "IMP", 2), new INSTRUCTION("???", "XXX", "IMP", 8), new INSTRUCTION("???", "NOP", "IMP", 4), new INSTRUCTION("CMP", "CMP", "ZPX", 4), new INSTRUCTION("DEC", "DEC", "ZPX", 6), new INSTRUCTION("???", "XXX", "IMP", 6), new INSTRUCTION("CLD", "CLD", "IMP", 2), new INSTRUCTION("CMP", "CMP", "ABY", 4), new INSTRUCTION("NOP", "NOP", "IMP", 2), new INSTRUCTION("???", "XXX", "IMP", 7), new INSTRUCTION("???", "NOP", "IMP", 4), new INSTRUCTION("CMP", "CMP", "ABX", 4), new INSTRUCTION("DEC", "DEC", "ABX", 7), new INSTRUCTION("???", "XXX", "IMP", 7), 
			new INSTRUCTION("CPX", "CPX", "IMM", 2), new INSTRUCTION("SBC", "SBC", "IZX", 6), new INSTRUCTION("???", "NOP", "IMP", 2), new INSTRUCTION("???", "XXX", "IMP", 8), new INSTRUCTION("CPX", "CPX", "ZP0", 3), new INSTRUCTION("SBC", "SBC", "ZP0", 3), new INSTRUCTION("INC", "INC", "ZP0", 5), new INSTRUCTION("???", "XXX", "IMP", 5), new INSTRUCTION("INX", "INX", "IMP", 2), new INSTRUCTION("SBC", "SBC", "IMM", 2), new INSTRUCTION("NOP", "NOP", "IMP", 2), new INSTRUCTION("???", "SBC", "IMP", 2), new INSTRUCTION("CPX", "CPX", "ABS", 4), new INSTRUCTION("SBC", "SBC", "ABS", 4), new INSTRUCTION("INC", "INC", "ABS", 6), new INSTRUCTION("???", "XXX", "IMP", 6), 
			new INSTRUCTION("BEQ", "BEQ", "REL", 2), new INSTRUCTION("SBC", "SBC", "IZY", 5), new INSTRUCTION("???", "XXX", "IMP", 2), new INSTRUCTION("???", "XXX", "IMP", 8), new INSTRUCTION("???", "NOP", "IMP", 4), new INSTRUCTION("SBC", "SBC", "ZPX", 4), new INSTRUCTION("INC", "INC", "ZPX", 6), new INSTRUCTION("???", "XXX", "IMP", 6), new INSTRUCTION("SED", "SED", "IMP", 2), new INSTRUCTION("SBC", "SBC", "ABY", 4), new INSTRUCTION("NOP", "NOP", "IMP", 2), new INSTRUCTION("???", "XXX", "IMP", 7), new INSTRUCTION("???", "NOP", "IMP", 4), new INSTRUCTION("SBC", "SBC", "ABX", 4), new INSTRUCTION("INC", "INC", "ABX", 7), new INSTRUCTION("???", "XXX", "IMP", 7), 
		];
	}
}