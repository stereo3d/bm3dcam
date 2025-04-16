/* --- A place where you can add your own code -- */
var recording = false;
var camIP_L = "192.168.1.103";
var camIP_R = "192.168.1.104";
var apiBase = "/control/api/v1/"
var focusMin = 0.0;
var focusMax = 1.0;

function storedata(form, formdata) {
	var inputs = form.elements;
	var obj = {};
	for (i = 0; i < inputs.length; i++) {
		if (inputs[i].nodeName === "INPUT" && inputs[i].type === "text") {
			obj[inputs[i].name] = inputs[i].value;
		}
	}
	thoriumapi.localstorage.setItem(app.name, JSON.stringify(obj));
	thoriumapi.showToast("Data Saved to Local Storage");
}

function clearForm(e) {
	var form = document.getElementById("form-settings");
	var inputs = form.elements;
	for (i = 0; i < inputs.length; i++) {
		if (inputs[i].nodeName === "INPUT" && inputs[i].type === "text") {

			inputs[i].value = "";
		}
	}
		thoriumapi.showToast("Data Cleared");
}

function loaddata(e) {
	var storedValue = thoriumapi.localstorage.getItem(app.name);
	var obj = JSON.parse(storedValue);
	if (obj) {
		for (const [key, value] of Object.entries(obj)) {
			const inputRef = document.getElementsByName(key);
			if ((inputRef) && (inputRef.length > 0)) {
				inputRef[0].value = value;
				console.log(inputRef[0]);
				if (inputRef[0].id == "input-form-1188-ipLeft") {
					camIP_L = value;
				};
				if (inputRef[0].id == "input-form-1188-ipRight") {
					camIP_R = value;
			    }
			}	
		}
	}
		thoriumapi.showToast("Data Loaded");
}

function toggleRecord() {
  var recButton = document.getElementById("recbutton");
    var parameter = new Object()
  	apiPath = "transports/0/record";

  if ( recButton.classList.contains("text-danger") ) {
	// record off
	recButton.classList.add("text-success");
	recButton.classList.remove("text-danger");
	parameter.recording = false;
	sendAPI(apiPath, parameter);
  } else {
	// record on
	recButton.classList.add("text-danger");
	recButton.classList.remove("text-success");
	parameter.recording = true;
	sendAPI(apiPath, parameter);
  }
  console.log(recButton.classList);
};

function getAPI(apiPath) {
    // call back return ajax
	// https://stackoverflow.com/questions/26649354/how-to-get-return-value-from-ajax-function-into-a-variable
	apiURL = "http://"+camIP_L+apiBase+apiPath;
	console.log("getAPI: ", apiURL);
	
	var parameter = ""

	return $.ajax({
		type: "GET",
		dataType: "json",
		url: apiURL,
		contentType: 'application/json',
	})
}

function showSystem(){
	apiPath = "system/format"
	getAPI(apiPath).done( function(data) {
		var parameter = data;
		console.log("parameter: ", parameter);
		var systeminfofield = document.getElementById("p-systeminfo");
		systeminfofield.innerText = JSON.stringify(parameter, null, 4);
	});
}

function showAperture(){
	apiPath = "lens/iris"
	getAPI(apiPath).done( function(data) {
		var parameter = data;
		console.log("parameter: ", parameter);
		var field = document.getElementById("lb-iris");
		field.innerText = parameter.apertureStop.toFixed(2)
	});
}

function showZoom(){
	apiPath = "lens/zoom"
	getAPI(apiPath).done( function(data) {
		var parameter = data;
		console.log("parameter: ", parameter);
		var field = document.getElementById("lb-zoom");
		field.innerText = parameter.focalLength.toFixed(0)
	});
}


function sendAPI(apiPath, parameter) {

	let jsonString = JSON.stringify(parameter);
	console.log("jsonString: ",jsonString);

	apiURL = "http://"+camIP_L+apiBase+apiPath;
	
	$.ajax({
		type: "PUT",
		url: apiURL,
		contentType: 'application/json',
		data: JSON.stringify(parameter), // access in body
	}).done(function () {
		console.log('SUCCESS');
	}).fail(function (msg) {
		console.log('FAIL');
	}).always(function (msg) {
		console.log('ALWAYS');
	});
	
	apiURL = "http://"+camIP_R+apiBase+apiPath;
	
	$.ajax({
		type: "PUT",
		url: apiURL,
		contentType: 'application/json',
		data: JSON.stringify(parameter), // access in body
	}).done(function () {
		console.log('SUCCESS');
	}).fail(function (msg) {
		console.log('FAIL');
	}).always(function (msg) {
		console.log('ALWAYS');
	});
	
	console.log("fired: ",parameter);
}

function changeIris(e){
	apiPath = "lens/iris";
	var parameter = new Object()
	parameter.normalised = e.value/100;
	sendAPI(apiPath, parameter);
	console.log("change Iris", parameter);
	// update aperture
	setTimeout(function() {
	showAperture();
	}, 2000);
}

function changeZoom(e){
	apiPath = "lens/zoom";
	var parameter = new Object()
	parameter.normalised = e.value/100;
	sendAPI(apiPath, parameter);
	console.log("change Zoom");
		// update zoom
	setTimeout(function() {
	showZoom();
	}, 2000);
}

function changeFocus(e){
	apiPath = "lens/focus";
	var parameter = new Object()
	parameter.normalised = e.value/100;
	sendAPI(apiPath, parameter);
	console.log("change Focus");
}

function transitionFocus(e){
	transitionValue = focusMin + (focusMax-focusMin)*e.value/100;

	apiPath = "lens/focus";
	var parameter = new Object()
	parameter.normalised = transitionValue/100;
	sendAPI(apiPath, parameter);
	console.log("change transition: ", parameter);
}

function setAutoExposure(picker){
	var col = picker.cols[0];
	apiPath = "video/autoExposure";
	var parameter = new Object()
	parameter.mode = col.value;
	parameter.type = "Shutter,Iris"
	sendAPI(apiPath, parameter);
	console.log("change Autoexposure", parameter);
}

function setCodec(picker){
 // not implemented
}

function setFPS(picker){
 // not implemented
}

function setShutter(picker){
	var col = picker.cols[0];
	apiPath = "video/shutter";
	var parameter = new Object()
	parameter.shutterSpeed = parseInt(col.value);
	sendAPI(apiPath, parameter);
	console.log("changed shutter speed: ", parameter);
}

function setWB(value){
	// set white balance
	apiPath = "video/whiteBalance";
	var parameter = new Object()
	parameter.whiteBalance = value;
	sendAPI(apiPath,parameter);
    console.log("set WB to: ", value);
}

function setGain(value){
	// set gain
	apiPath = "video/gain";
	var parameter = new Object()
	parameter.gain = value;
	sendAPI(apiPath,parameter);
    console.log("set Gain to: ", value);
}

function setTint(value){
	// set Tint
	apiPath = "video/whiteBalanceTint";
	var parameter = new Object()
	parameter.whiteBalanceTint = value;
	sendAPI(apiPath,parameter);
    console.log("set WB tint to: ", value);
}

function setAutoWB() {
	// set Auto WB
	apiPath = "video/whiteBalance/doAuto";
	var parameter = new Object()
	// parameter.whiteBalance = value;
	sendAPI(apiPath,parameter);
    console.log("Auuto set WB");
	}

$(document). on ("click", "#button-wb-auto", function(e){
 setAutoWB();
}) ;

app.on("stepperChange", function(e,v) {
	console.log("stepper change fired",e.el.id,v);
	var stepperid = e.el.id;
	if (stepperid == "stepper-gain") {
     setGain(v);
	}
	if (stepperid == "stepper-wb") {
	 setWB(v);
	}
	if (stepperid == "stepper-tint") {
	 setTint(v);
	}
});

app.on("rangeChange",  function(e) {
	console.log("range change fired",e.el.id);

	if (e.el.id == "obj-zoom"){
		changeZoom(e)
	};

	if (e.el.id == "obj-focus1"){
		changeFocus(e)
		// set transition minimum
		focusMin = parseFloat(e.value);
		console.log("fmin: ",e.value);
	};
	if (e.el.id == "obj-focus2"){
		changeFocus(e)
		// set transition maximum
		focusMax = parseFloat(e.value);
		console.log("fmax: ",e.value);
		
	};
	if (e.el.id == "obj-focusoffset"){
		focusSlider = app.range.get('#obj-focus1');
		changeFocus(focusSlider)
	};
		if (e.el.id == "obj-transition"){
		transitionFocus(e)
	};

	if (e.el.id == "obj-iris"){
		changeIris(e)
	};
});



app.on('appLoaded', function(e)  {
	
	//Add your code here
	var picker1 = app.picker.create({
        inputEl: '#codec-picker',
        cols: [
          {
            textAlign: 'center',
            values: ["BRaw:Q0",
                "BRaw:Q1",
                "BRaw:Q3",
                "BRaw:Q5",
                "BRaw:3_1",
                "BRaw:5_1",
                "BRaw:8_1",
                "BRaw:12_1"],
		    displayvalues: ["BRaw:Q0",
                "BRaw:Q1",
                "BRaw:Q3",
                "BRaw:Q5",
                "BRaw:3_1",
                "BRaw:5_1",
                "BRaw:8_1",
                "BRaw:12_1"],
				onChange: function (picker) {
			    setCodec(picker)
			}
          }
        ]
}
);

	var picker2 = app.picker.create({
        inputEl: '#fps-picker',
        cols: [
          {
            textAlign: 'center',
            values: ["23.98",
                "24",
                "25",
                "29.97",
                "30",
                "50",
                "59.94",
                "60"],
		    displayvalues: ["23.98",
                "24",
                "25",
                "29.97",
                "30",
                "50",
                "59.94",
                "60"],
			onChange: function (picker) {
			setFPS(picker)
			}
          }
        ]
}
);

	var picker3 = app.picker.create({
        inputEl: '#audio-picker1',
        cols: [
          {
            textAlign: 'center',
            values: ["None", "Camera - Left", "Camera - Right", "Camera - Mono", "3.5mm Left - Line", 
			"3.5mm Right - Line", "3.5mm Mono - Line", "3.5mm Left - Mic", "3.5mm Right - Mic", "3.5mm Mono - Mic"]
          }
        ]
}
);

	var picker4 = app.picker.create({
        inputEl: '#audio-picker2',
        cols: [
          {
            textAlign: 'center',
            values: ["None", "Camera - Left", "Camera - Right", "Camera - Mono", "3.5mm Left - Line", 
			"3.5mm Right - Line", "3.5mm Mono - Line", "3.5mm Left - Mic", "3.5mm Right - Mic", "3.5mm Mono - Mic"]
          }
        ]
}
);

	var picker5 = app.picker.create({
        inputEl: '#afModePicker',
        cols: [
          {
            textAlign: 'center',
            values: ["Off", "Continuous", "OneShot"],
			onChange: function (picker) {
				setAutoExposure(picker)
			}
          }
        ]
}
);

	var picker6 = app.picker.create({
        inputEl: '#afPriorityPicker',
        cols: [
          {
            textAlign: 'center',
            values: ["", "Iris", "Shutter", "Iris,Shutter", "Shutter,Iris"],
			onChange: function (picker6) {
            	console.log("set Priority")
            }
          }
        ]
}
);

	var picker7 = app.picker.create({
        inputEl: '#shutterPicker',
        cols: [
          {
            textAlign: 'center',
            values: ["24", "25", "30", "48", "50", "60", "72", "75", "90", "96", "100", "125", "150"],
			displayvalues: ["1/24", "1/25", "1/30", "1/48", "1/50", "1/60", "1/72", "1/75", "1/90", "1/96", "1/100", "1/125", "1/150"],
			onChange: function (picker7) {
				setShutter(picker7);
            	console.log("set Shutter")
            }
          }
        ]
}
);

});


$(document).on("click", "#left-panel-page-content", function(e) {
	e.preventDefault();
	//Add your code here
	navigator.mediaDevices.enumerateDevices().then(devices => {
  devices.forEach(device => {
    if (device.kind === 'videoinput') {
      console.log('Camera found:', device.label, device.deviceId);
    }
  });
});
	showSystem();
});