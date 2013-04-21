var Jiggly = (function() {  
  var output = 0;
  var duration = 0;
  var duty = 0;
  var dc_timeout = null;
  var pattern_timeout = undefined;
  var audio = undefined;
  var pwm_pattern = new Array();
	var user_pattern = undefined;

	var setNewPattern = function (aPattern) {
		if (pattern_timeout !== undefined) {
			window.clearTimeout(pattern_timeout);
		}
		if (dc_timeout !== undefined) {
			window.clearTimeout(dc_timeout);
		}
		user_pattern = aPattern;
		user_pattern.reverse();
		cyclePattern();
	};

	var cyclePattern = function() {
		if(user_pattern !== undefined && user_pattern.length == 0) {
			pattern_timeout = undefined;
			return;
		}
		var current = user_pattern.pop();
		// duration value set
		if(current.length == 3) {
			duration = current[2];
		}
		duty = current[0];
		Jiggly.runDutyCycle();
		pattern_timeout = window.setTimeout(cyclePattern, current[1]);
	};

  var runHTML5AudioDutyCycle = function () {
    if(audio === undefined) {
      audio = new Howl({urls : ["200hz.wav"], 
                        loop: true,
                        autoplay: true,
                        volume: 0.0}).play();
    }
		console.log(duty);
		if(duty == 0) {
			Howler.mute();
		} else {
			audio.volume(duty * 0.01);
			Howler.unmute();
		}
  };

  var runWebVibrationDutyCycle = function () {
		if(duty == 0) {
			navigator.vibrate([0]);
		} else {
			var on_time = (duty * .01) * duration;
			var off_time = duration - on_time;
			pwm_pattern = [];
			for (var step = 0; step < 128; step = step + 2) {
				pwm_pattern[step + 0] = on_time;
				pwm_pattern[step + 1] = off_time;
			};
			navigator.vibrate(pwm_pattern);
		}
    // Restart pattern slighly before it's done. Doesn't completely
    // allieviate pauses, but helps
    dc_timeout = window.setTimeout(runWebVibrationDutyCycle, (64 * duration) * .9);
  };

  return {
    // Make output methods bit flags since we can feasibly run more
    // than 1 at once.
    outputMethods : { WEBVIBRATION      : 1,
                      HTML5AUDIO        : 2,
                      WEBAUDIO          : 4},

    setOutputMethod : function (o) {
      if(!navigator.vibrate && (o & this.outputMethods.WEBVIBRATION)) {
        console.log("WebVibration not supported!");
        o = o & ~this.outputMethods.WEBVIBRATION;
      }
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
      if (dc_timeout) {
        window.clearTimeout(dc_timeout);
      }
      Jiggly.runDutyCycle();
    },

    runPattern : function(aPattern) {
			setNewPattern(aPattern);
    }
  };
})();
