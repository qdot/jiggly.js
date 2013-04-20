var Jiggly = (function() {  
	var duration = 0;
	var duty = 0;
	var timeout = null;
	var html5buffer = null;
	var audio = null;

	var runHTML5AudioDutyCycle = function () {
		if(html5buffer === null) {
			var data = []; // just an array
			for (var i=0; i<100000; i++) data[i] = Math.round(255 * Math.random()); // fill data with random samples
			html5buffer = new RIFFWAVE(data); // create the html5buffer file
			audio = new Audio(html5buffer.dataURI); // create the HTML5 audio element
			audio.volume = 0;
			audio.loop = true;
			audio.play(); // some noise		
		}
		audio.volume = duty * 0.01;
	};

	var runWebVibrationDutyCycle = function () {
		if (duration == 0 || duty == 0) {
			return;
		}
		var on_time = (duty * .01) * duration;
		var off_time = duration - ((duty * .01) * duration);
		var t = 0;
		var pattern = new Array();
		var step = 0;
		while (step < 128) {
			pattern[step + 0] = on_time;
			pattern[step + 1] = off_time;
			step = step + 2;
			t = t + duration;
		};
		navigator.vibrate(pattern);
		timeout = window.setTimeout(Jiggly.runDutyCycle, t * .9);
	};

	return {
		outputMethods : { WEBVIBRATOR				: 0,
											HTML5AUDIO				: 1,
											WEBAUDIO					: 2},

		setOutputMethod : function (output) {
			if (output == WEBVIBRATOR) {
				Jiggly.runDutyCycle = runWebVibratorDutyCycle;
			} else if (output == HTML5AUDIO) {
			} else if (output == WEBAUDIO) {
			}
		},

		runDutyCycle : runHTML5AudioDutyCycle,

		runSpeed : function(aDuty, aDuration) {
			duty = aDuty;
			if(typeof(aDuration) === undefined) {
				duration = 0;
			} else {
				duration = aDuration;
			}
			if (timeout) {
				window.clearTimeout(timeout);
			}
			Jiggly.runDutyCycle();
		}
	};
})();
