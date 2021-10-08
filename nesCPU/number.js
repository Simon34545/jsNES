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