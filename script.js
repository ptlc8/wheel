var legumes = [[{name:"🥕 carotte",color:"#ffa500"},{name:"🍠 betterave",color:"#b814b8"},{name:"🌶 piment",color:"#f21818"},{name:"🥦 brocoli",color:"#32ae32"},{name:"🧅 oignon",color:"#f5deb3"},{name:"🍅 tomate",color:"#f35116"}],[{name:"🧇 Gauffres",color:"#ffa500"},{name:"🥞 Pancakes",color:"#ee7a1b"},{name:"🥐 Croissant ",color:"#f2cf21"},{name:"🍨 Glace",color:"#f3aae6"},{name:"🧁 Cupcakes",color:"#fd68f8"}],[{name:"👚 Ichika",color:"#fda3ff"},{name:"🎀 Nino",color:"#fc4dff"},{name:"🎧 Miku",color:"#ff0f83"},{name:"⭐ Itsuki",color:"#e32b2e"},{name:"🌱 Yotsuba",color:"#f06f38"}]][parseInt(Math.random()*3)];
var wheel;
var angle = 0;
var intervalId = undefined;
window.addEventListener("load", function() {
	wheel = document.getElementById("wheel");
	wheel.width = wheel.height = 800;
	loadFromHash();
	window.addEventListener("hashchange", loadFromHash);
	drawWheel();
	wheel.addEventListener("click", launch);
	window.addEventListener("keydown", function(e) {
		if (e.keyCode==32) launch();
	});
	document.getElementById("add-entry").addEventListener("click", function() {
        var color = "#"+Number(parseInt(Math.pow(256,3)*Math.random())).toString(16);
		legumes.push({name:"",color});
		refreshEntries();
		refreshHash();
	});
	document.getElementById("share-button").addEventListener("click", function() {
		if (navigator.share) {
			navigator.share({
				title: "Roue de choix",
				text: "",
				url: window.location.href,
			});
		} else {
			let el = document.createElement('textarea');
			el.value = window.location.href;
			document.body.appendChild(el);
			el.select();
			document.execCommand('copy');
			document.body.removeChild(el);
			alert("L'URL de partage a été copiée");
		}
	});
	refreshEntries();
});
function refreshEntries() {
	var entriesSet = document.getElementById("entries");
	var entries = entriesSet.getElementsByClassName("entry");
	e = entries;
	let i = 0;
	for (; i < legumes.length; i++) {
		let fixedI = i;
		if (entries[i]) {
			entries[i].getElementsByClassName("name")[0].value = legumes[i].name;
			entries[i].getElementsByClassName("color")[0].color = legumes[i].color;
		} else {
			entriesSet.appendChild(createElement("fieldset", {className:"entry"}, [
				createElement("input", {className:"name",placeholder:"Proposition",value:legumes[i].name},[],{change:function(e){
					legumes[fixedI].name = e.target.value;
					drawWheel();
					refreshHash();
				}}),
				createElement("input", {className:"color",type:"color",value:legumes[i].color},[],{change:function(e){
					legumes[fixedI].color = e.target.value;
					drawWheel();
					refreshHash();
				}}),
				createElement("span", {className:"close-button"}, "❌", {click:function(e) {
					legumes.splice(fixedI, 1);
					refreshEntries();
					drawWheel();
					refreshHash();
				}})
			]));
		}
	}
	for (; i < entries.length; i++) {
		entriesSet.removeChild(entries[i]);
	}
}
function loadFromHash() {
	if (window.location.hash) {
		let hash = window.location.hash;
		if (hash.startsWith("#")) hash = hash.replace("#","");
		legumes = hash.split("&").map(function(e){
			let p = e.split("=").map(decodeURIComponent);
			return {name:p[0],color:p[1]};
		});
	}
	drawWheel();
	refreshEntries();
}
function refreshHash() {
	window.location.hash = legumes.map(l=>encodeURIComponent(l.name)+"="+encodeURIComponent(l.color)).join("&");
}
function mod(a,b) {
	return (a%b+b)%b;
}
function launch() {
	var _2turns = 15.18, _4turns = 30.26;
	let speed = _2turns + (_4turns-_2turns)*Math.random(); // rad/s
	var tps = 60;
	if (intervalId) clearInterval(intervalId);
	intervalId = setInterval(function() {
		angle += speed/tps;
		speed *= 49/50;
		drawWheel(angle);
		if (speed <= 0.1) {
			clearInterval(intervalId);
			intervalId = undefined;
			popup(legumes[parseInt(mod(angle/Math.PI/2*(-legumes.length),legumes.length))].name);
		}
	}, 1000/tps);
}
function drawWheel() {
	var ctx = wheel.getContext("2d");
	var a = Math.PI*2/legumes.length;
	ctx.font = "40px Arial";
	ctx.textAlign = "center";
	for (let i = 0; i < legumes.length; i++) {
		ctx.fillStyle = legumes[i].color;
		ctx.beginPath();
		ctx.moveTo(400,400);
		ctx.arc(400,400, 400, angle+i*a, angle+(i+1)*a);
		ctx.fill();
		ctx.translate(400,400);
		ctx.rotate(angle+i*a+a/2);
		ctx.fillStyle = "black";
		ctx.fillText(legumes[i].name, 200, 10, 400);
		ctx.rotate(-angle-i*a-a/2);
		ctx.translate(-400,-400);
	}
}
function popup(text) {
	var pop = createElement("div",{className:"popup-container"},[
		createElement("div",{className:"popup"},[
			createElement("span",{className:"title"},text),
			createElement("button",{className:"good"},"Réessayer",{click:launch}),
			createElement("button",{className:"bad"},"Fermer")
		])
	], {click: function(){
		this.parentElement.removeChild(this);
	}});
	document.body.appendChild(pop);
}

function createElement(tag, properties={}, inner=[], eventListeners={}) {
    let el = document.createElement(tag);
    for (let p of Object.keys(properties)) if (p!="style" && p!="dataset") el[p] = properties[p];
    if (properties.style) for (let p of Object.keys(properties.style)) el.style[p] = properties.style[p];
    if (properties.dataset) for (let p of Object.keys(properties.dataset)) el.dataset[p] = properties.dataset[p];
    if (typeof inner == "object") for (let i of inner) el.appendChild(typeof i == "string" ? document.createTextNode(i) : i);
    else el.innerText = inner;
    for (let l of Object.keys(eventListeners)) el.addEventListener(l, eventListeners[l]);
    return el;
}