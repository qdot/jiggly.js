$(document).ready(function() {
	var duration = 0;
	var duty = 0;

	Jiggly.setOutputMethod(Jiggly.outputMethods.WEBVIBRATION | Jiggly.outputMethods.HTML5AUDIO);

  $("#durationSlider").bind("change",function() {
    $("#durationDisplay").val( $("#durationSlider").val() + "ms");
		duration = parseInt($("#durationSlider").val());
		Jiggly.runSpeed(duty, duration);
  });

  $("#dutySlider").change(function() {
    $("#dutyDisplay").val( $("#dutySlider").val() + "%");
		duty = parseInt($("#dutySlider").val());
		Jiggly.runSpeed(duty, duration);
	});
});
