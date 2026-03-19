var el = {
	setup: {},
	update: {},
}

class Element {
	constructor(el) {
		this.id = typeof el == "string" ? el : el.id;
		this.el = document.getElementById(this.id);
		this.lastHTML = null;
		this.lastDisplay = null;
		this.lastClasses = null;
	}

	get style() {
		return this.el.style;
	}

	setTxt(txt) {
		if (this.lastHTML === txt) return;
		this.el.textContent = txt;
		this.lastHTML = txt;
	}
	static setTxt(id, txt) {
		new Element(id).setTxt(txt);
	}

	setHTML(html) {
		if (this.lastHTML === html) return;
		this.el.innerHTML = html;
		this.lastHTML = html;
	}
	static setHTML(id, html) {
		new Element(id).setHTML(html);
	}
	
	addHTML(html) {
		this.el.innerHTML += html;
	}
	static addHTML(id, html) {
		new Element(id).addHTML(html);
	}

	setDisplay(bool) {
		let disp = bool ? "" : "none";
		if (this.lastDisplay === disp) return;
		this.el.style.display = disp;
		this.lastDisplay = disp;
	}
	static setDisplay(id, bool) {
		new Element(id).setDisplay(bool);
	}

	addClass(name) {
		this.el.classList.add(name);
	}
	static addClass(id, name) {
		new Element(id).addClass(name);
	}

	removeClass(name) {
		this.el.classList.remove(name);
	}
	static removeClass(id, name) {
		new Element(id).removeClass(name);
	}

	clearClasses() {
		this.el.className = "";
	}
	static clearClasses(id) {
		new Element(id).clearClasses();
	}

	setClasses(data) {
		let list = Object.keys(data).filter(x => data[x]).sort().join(" ");
		if (this.lastClasses === list) return;
		this.el.className = list;
		this.lastClasses = list;
	}
	static setClasses(id, data) {
		new Element(id).setClasses(data);
	}

	setVisible(bool) {
		this.el.style.visibility = bool ? "visible" : "hidden";
	}
	static setVisible(id, bool) {
		new Element(id).setVisible(bool);
	}

	setOpacity(value) {
		this.el.style.opacity = value;
	}
	static setOpacity(id, value) {
		new Element(id).setOpacity(value);
	}

	changeStyle(type, input) {
		this.el.style[type] = input;
	}
	static changeStyle(id, type, input) {
		new Element(id).changeStyle(type, input);
	}

	isChecked() {
		return this.el.checked;
	}
	static isChecked(id) {
		return new Element(id).isChecked();
	}

	static allFromClass(name) {
		return Array.from(document.getElementsByClassName(name)).map(x => new Element(x.id));
	}

	setAttr(name, input) {
		this.el.setAttribute(name, input);
	}
	static setAttr(id, name, input) {
		new Element(id).setAttribute(name, input);
	}

	setTooltip(input) {
		this.setAttr("tooltip", input);
	}
	static setTooltip(id, input) {
		new Element(id).setAttr("tooltip", input);
	}

	setSize(h, w) {
		this.el.style["min-height"] = h + "px";
		this.el.style["min-width"] = w + "px";
	}
	static setSize(id, h, w) {
		new Element(id).setSize(h, w);
	}
}

function setupHTML() {
	for (let x in el.setup) el.setup[x]()
	
    tmp.el = {}
	let all = document.querySelectorAll("[id]")
	for (let i=0;i<all.length;i++) {
		let x = all[i]
		tmp.el[x.id] = new Element(x)
	}
}

function updateHTML() {
    for (let x in el.update) el.update[x]()
}