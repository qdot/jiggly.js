$(document).ready(function() {
	var outputMethod = 0;
	var duty = 0;
	var duration = 0;

	if(!navigator.vibrate) {
		$("#WebVibrationOutput").prop('disabled', true);
		$("#WebVibrationText").html("WebVibration not supported on this browser");
	}

	$("#WebVibrationOutput").bind("change", function() {
		if($("#WebVibrationOutput").prop('checked')) {
			outputMethod = outputMethod | Jiggly.outputMethods.WEBVIBRATION;
		} else {
			outputMethod = outputMethod & ~Jiggly.outputMethods.WEBVIBRATION;
		}
		Jiggly.setOutputMethod(outputMethod);
	});

	$("#HTML5AudioOutput").bind("change", function() {
		if($("#HTML5AudioOutput").prop('checked')) {
			outputMethod = outputMethod | Jiggly.outputMethods.HTML5AUDIO;
		} else {
			outputMethod = outputMethod & ~Jiggly.outputMethods.HTML5AUDIO;
		}
		Jiggly.setOutputMethod(outputMethod);
	});

  $("#durationSlider").bind("change",function() {
    $("#durationDisplay").val( $("#durationSlider").val() + "ms");
		duration = parseInt($("#durationSlider").val());
		Jiggly.runSpeed(duty, duration);
  });

  $("#dutySlider").bind("change", function() {
    $("#dutyDisplay").val( $("#dutySlider").val() + "%");
		duty = parseInt($("#dutySlider").val());
		Jiggly.runSpeed(duty, duration);
	});

	$("#rampButton").click(function() {
		var a = [];
		for(var i = 0; i <= 10; i += 1) {
			a[i] = [i * 10, 100, 50];
			a[19-i] = [i * 10, 100, 50];
		}
		Jiggly.runPattern(a);
	});
});
