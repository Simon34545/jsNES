class uint8 {
	constructor(v = 0x00) {
		this.value = new Uint8Array(1);
		this.value[0] = v;
	}
	
	get v() {
		return this.value[0];
	}
	
	set v(num) {
		this.value[0] = num;
	}
}

class uint16 {
	constructor(v = 0x0000) {
		this.value = new Uint16Array(1);
		this.value[0] = v;
	}
	
	get v() {
		return this.value[0];
	}
	
	set v(num) {
		this.value[0] = num;
	}
}

class uint32 {
	constructor(v = 0x00000000) {
		this.value = new Uint32Array(1);
		this.value[0] = v;
	}
	
	get v() {
		return this.value[0];
	}
	
	set v(num) {
		this.value[0] = num;
	}
}

class uint5 {
	constructor(v = 0b00000) {
		this.value = v;
	}
	
	get v() {
		return this.value;
	}
	
	set v(num) {
		this.value = num & 0b00000;
	}
}

class uint3 {
	constructor(v = 0b000) {
		this.value = v;
	}
	
	get v() {
		return this.value;
	}
	
	set v(num) {
		this.value = num & 0b000;
	}
}

class bit {
	constructor(v = 0) {
		this.value = v ? 1 : 0;
	}
	
	get v() {
		return this.value;
	}
	
	set v(num) {
		this.value = num ? 1 : 0
	}
}