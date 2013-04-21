var Jiggly = (function() {  
	var output = 0;
  var duration = 0;
  var duty = 0;
  var timeout = null;
  var audio = null;
	var pattern = new Array();

  var runHTML5AudioDutyCycle = function () {
    if(audio === null) {
      audio = new Howl({urls : ["http://192.168.123.75:4000/200hz.wav"], 
        								loop: true,
												autoplay: true,
												volume: 0.0}).play();
		}
		audio.volume(duty * 0.01);
	};

	var runWebVibrationDutyCycle = function () {
		if (duration == 0 || duty == 0) {
			return;
		}
		var on_time = (duty * .01) * duration;
		var off_time = duration - on_time;
		pattern = [];
		for (var step = 0; step < 128; step = step + 2) {
			pattern[step + 0] = on_time;
			pattern[step + 1] = off_time;
		};
		navigator.vibrate(pattern);
		// Restart pattern slighly before it's done. Doesn't completely
		// allieviate pauses, but helps
		timeout = window.setTimeout(runWebVibrationDutyCycle, (64 * duration) * .9);
	};

	return {
		// Make output methods bit flags since we can feasibly run more
		// than 1 at once.
		outputMethods : { WEBVIBRATION			: 1,
											HTML5AUDIO				: 2,
											WEBAUDIO					: 4},

		setOutputMethod : function (o) {
			output = o;
		},

		runDutyCycle : function() {
			if ((output & this.outputMethods.WEBVIBRATION) > 0) {
				runWebVibrationDutyCycle();
			} 
			if ((output & this.outputMethods.HTML5AUDIO) > 0) {
				runHTML5AudioDutyCycle();
			} 
			if ((output & this.outputMethods.WEBAUDIO) > 0) {
				// Implement this as an oscillator generator at some point
			}
		},

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
