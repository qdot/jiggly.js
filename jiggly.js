var Jiggly = (function() {  
	var duration = 0;
	var duty = 0;
	var timeout = null;

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

		runDutyCycle : runWebVibrationDutyCycle,

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
