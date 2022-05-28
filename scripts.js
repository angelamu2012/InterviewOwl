const displays = document.querySelectorAll('.note-display');
const transitionDuration = 900;

displays.forEach(display => {
  let note = parseFloat(display.dataset.note);
  //  let note = localStorage.getItem("volume");
	console.log("note" + note);
  let [int, dec] = display.dataset.note.split('.');
  [int, dec] = [Number(int), Number(dec)];

  strokeTransition(display, note);

  increaseNumber(display, int, 'int');
  increaseNumber(display, dec, 'dec');
});

function strokeTransition(display, note) {
  let progress = display.querySelector('.circle__progress--fill');
  let radius = progress.r.baseVal.value;
  let circumference = 2 * Math.PI * radius;
  let offset = circumference * (10 - note) / 10;

  progress.style.setProperty('--initialStroke', circumference);
  progress.style.setProperty('--transitionDuration', `${transitionDuration}ms`);

  setTimeout(() => progress.style.strokeDashoffset = offset, 100);
}

function increaseNumber(display, number, className) {
  let element = display.querySelector(`.percent__${className}`),
      decPoint = className === 'int' ? '.' : '',
      interval = transitionDuration / number,
      counter = 0;

  let increaseInterval = setInterval(() => {
    if (counter === number) { window.clearInterval(increaseInterval); }

    element.textContent = counter + decPoint;
    counter++;
  }, interval);
}

	var fillerCount = 0
    var volStr = "";
	var pauses = "";
	var volume = "";
	var startTime = 0;
	var beginTime = 0;
	var endTime = 0;
	var zeroThresh = 100;
	var meter = null;
	var volList = [];
	var zeroArr = []
	var talkingSpeedArr = [];
	var talkingPace = 0;
	var nonZeroArr = [];
	var pauseCount = 0;
	var zeroCount = 0;
	var WIDTH = 500;
	var recordingStarted = false;
	var noteContent = $('#saidwords').val();

	// initialize SpeechRecognition object
	let recognition = new webkitSpeechRecognition();
	recognition.maxAlternatives = 1;
	recognition.continuous = true;

	// Detect the said words
	recognition.onresult = e => {

		var current = event.resultIndex;

	    // Get a transcript of what was said.
		var transcript = event.results[current][0].transcript;
		pauseCount++;
		// Add the current transcript with existing said values
		//var speed = (WordCount(transcript) - 1)/((endTime - beginTime)/1000);
		//console.log("transcript len"  + (WordCount(transcript) - 1));
		//talkingSpeedArr.push[speed];
		noteContent += ' ' + transcript;
		//noteContent += ' ' + transcript + " (elapsed time " + ((endTime - beginTime)/1000) + " speed " + speed + " length " + (WordCount(transcript) - 1) + ")";
		$('#saidwords').val(noteContent);
		//beginTime = endTime;
		//console.log("beginTime " + beginTime);
	}

	// Stop recording
	function stopSpeech(){
		displayInsights();

	  	// Change status
	  	$('#status').text('Recording Stopped.');
	  	recordingStarted = false;

	  	// Stop recognition
	  	recognition.stop();

	}

	// Start recording
	function startSpeech(){

	  	try{ // calling it twice will throw..
	    	$('#status').text('Recording Started.'); 
	    	$('#saidwords').val('');
	    	recordingStarted = true;

	    	// Start recognition
	    	recognition.start();

	  	}
	  	catch(e){}
	}

	navigator.getUserMedia({audio: true}, startUserMedia, function(e) {
	  __log('No live audio input: ' + e);
	});

	function startUserMedia(stream) {
	  	const ctx = new AudioContext();
	  	const analyser = ctx.createAnalyser();
	  	const streamNode = ctx.createMediaStreamSource(stream);
	  	streamNode.connect(analyser);

	  	// Create a new volume meter and connect it.
	  	meter = createAudioMeter(ctx);
	  	streamNode.connect(meter);

		drawLoop();
	}

	// Create pitch bar
	function drawLoop( time ) {

	  	var pitchVolume = meter.volume*WIDTH*1.4;

	  	var width = 0;

	  	// Pitch detection minimum volume
	  	var minimum_volume = 130;

	  	// Get width if Recording started
	  	if(recordingStarted){
		
			var volumeValue = Math.trunc(meter.volume*1000);
			volList.push(volumeValue);
			
	    	if(pitchVolume < minimum_volume){
	       		width = 0;
	    	}else if(pitchVolume >= minimum_volume && pitchVolume < (minimum_volume+20) ){
	       		width = 10;
	    	}else if(pitchVolume >= (minimum_volume+20) && pitchVolume < (minimum_volume+40)){
	       		width = 20;
	    	}else if(pitchVolume >= (minimum_volume+40) && pitchVolume < (minimum_volume+60)){
	       		width = 30;
	    	}else if(pitchVolume >= (minimum_volume+60) && pitchVolume < (minimum_volume+80)){
	       		width = 40;
	    	}else if(pitchVolume >= (minimum_volume+80) && pitchVolume < (minimum_volume+100)){
	       		width = 50;
	    	}else if(pitchVolume >= (minimum_volume+100) && pitchVolume < (minimum_volume+120)){
	       		width = 60;
	    	}else if(pitchVolume >= (minimum_volume+120) && pitchVolume < (minimum_volume+140)){
	       		width = 70;
	    	}else if(pitchVolume >= (minimum_volume+140) && pitchVolume < (minimum_volume+160)){
	       		width = 80;
	    	}else if(pitchVolume >= (minimum_volume+160) && pitchVolume < (minimum_volume+180)){
	       		width = 90;
	    	}else if(pitchVolume >= (minimum_volume+180)){
	       		width = 100;
	    	}
	  	}

	  	// Update width
	  	document.getElementById('voiceVolume').style.width = width+'%';
		
	  	rafID = window.requestAnimationFrame( drawLoop );
	}
	
	function analyzePauses()
	{
		analyzeStartTime();
		console.log("start time " + startTime);
		
		for (var i = startTime; i < volList.length; i++) 
		{
			if (volList[i] < zeroThresh)
			{
				zeroArr.push(i);
			}
			else
			{
				nonZeroArr.push(volList[i]);
			}
		}
		
		for (var i = 0; i < zeroArr.length-1; i++) 
		{
			if (zeroArr[i+1] - zeroArr[i] > 75)
			{
				zeroCount++;
				console.log("pause index " + i);
			}
		}
		console.log("volList.length " + volList.length);
		console.log("volList " + volList);
		
		console.log("nonZeroArr.length " + nonZeroArr.length);
		console.log("nonZeroArr " + nonZeroArr);

		console.log("zeroArr.length " + zeroArr.length);
		console.log("zeroArr " + zeroArr);
		console.log("zeroCount " + zeroCount);
		console.log("volList.length " + volList.length);
		console.log("ratio " + zeroArr.length/volList.length);

		if ((zeroArr.length/volList.length) < 0.2)
		{
			pauses = "small";
		}
		else if ((zeroArr.length/volList.length) > 0.2 && (zeroArr.length/volList.length) < 0.4)
		{
			pauses = "medium";
		}
		else
		{
			pauses = "frequent";
		}	
	}
	
	function analyzeStartTime()
	{
		for (; startTime < volList.length; startTime++) 
		{
			if (volList[startTime] > zeroThresh)
			{
				return startTime;
			}
		}
		return startTime;
	}
	
	function analyzeVolume()
	{
		var sum = 0;
		var val100 = 0;
		var val125 = 0;
		var val150 = 0;
		var val175 = 0;
		var val200 = 0;
		var val225 = 0;
		var val250 = 0;		

		for (var i = 0; i < nonZeroArr.length; i++)
		{
			sum += nonZeroArr[i];
			if (nonZeroArr[i] < 125) 
			{
				val100++;
			}
			else if (nonZeroArr[i] < 150) 
			{
				val125++;
			}
			else if (nonZeroArr[i] < 175) 
			{
				val150++;
			}
			else if (nonZeroArr[i] < 200) 
			{
				val175++;
			}
			else if (nonZeroArr[i] < 225) 
			{
				val200++;
			}
			else if (nonZeroArr[i] < 250) 
			{
				val225++;
			}
			else
			{
				val250++;
			}
		}
		
		var avg = sum/nonZeroArr.length;
		
		var volumeFactor = 0;
		if (nonZeroArr.length === 0)
		{
			volumeFactor = 0;
		}
		else if (val250 + val225 > val200 + val175 + val150 + val125 + val100)
		{
			//volume = "very loud";
			volumeFactor = 200;
		}
		else if (val250 + val225 + val200 > val175 + val150 + val125 + val100)
		{
			//volume = "loud";
			volumeFactor = 180;
		}
		else if (val250 + val225 + val200 + val175 > val150 + val125 + val100)
		{
			//volume = "medium";
			volumeFactor = 160;
		}
		else if (val250 + val225 + val200 + val175 + val150 < val125 + val100)
		{
			//volume = "quiet";
			volumeFactor = 140;
		}
		else
		{
			volumeFactor = 160;
		}

		if (nonZeroArr.length === 0)
		{
			volume = "0.0";
		}
		else if (0.5*(volumeFactor + avg) < 160)
		{
			//volume = "quiet";
			volume = "2.5";
		}
		else if (0.5*(volumeFactor + avg) < 180)
		{
			//volume = "medium";
			volume = "5.0";
		}
		else if (0.5*(volumeFactor + avg) < 200)
		{
			//volume = "loud";
			volume = "7.5";
		}
		else 
		{
			//volume = "very loud";
			volume = "10.0";
		}	

		console.log("val100 " + val100 + ", val125 " + val125 + ", val150 " + val150 + ", val175 " + val175 + ", val200 " + val200 + ", val225 " + val225 + ", val250 " + val250);
		console.log("avg " + avg);
		console.log("volumeFactor " + volumeFactor);		
	}
	
	function analyzePace()
	{
		var sum = 0;
		for (var i = 0; i < talkingSpeedArr.length; i++)
		{
			sum += talkingSpeedArr[i];
		}
		talkingPace = sum/talkingSpeedArr.length;
	}
	
	function WordCount(str) 
	{ 
		return str.split(" ").length;
	}
	
	function fillerWords()
	{
		fillerCount = 0;
        var fillerwords = ["like", "so", "well", "actually", "basically", "stuff", "literally", "totally", "according"];
        var words = noteContent.split(" ");
        var fillerwordsused = [];
        for(var i=0;i<words.length;i++){
            for(var j=0;j<fillerwords.length;j++){
                if(words[i]==fillerwords[j]){
                    fillerwordsused.push(words[i]);
                    fillerCount++;
                }
            }
		}
		console.log("Your transcript:\n "+noteContent);
        console.log("");
		console.log("Number of times you used a filler word:\n "+fillerCount);
        console.log("");
		var fillerWordStr = "";
        console.log("The filler words that you used:")
        for(var k=0;k<fillerwordsused.length;k++){
            console.log(fillerwordsused[k]);
			fillerWordStr += " " + fillerwordsused[k];
        }
		if (fillerCount>0)
		{
			return " Number of times you used a filler word:\n "+ fillerCount + ". You used the following filler words: " + fillerWordStr;
		}
		else 
		{
			return " Good job! You did not use any filler words."
		}
	}
	
	function displayInsights()
	{
		fillerWords();
	    //analyzeSpeechPauses();
		analyzePauses();
		analyzeVolume();
		
		var message = "Insights: Thank you for using our application! ";
		if (startTime > 500)
		{
			message += "There was a bit of a slow start. ";
		}
		message += "While you spoke, there were around " + pauseCount + " extended pauses or silences and a " + pauses + " amount of pauses in general between words and sentences. While extended pauses should be limited, leaving enough time between each word or sentence may help you further engage your audience. ";
		message += "your volume level was " + volume + ".";
		message += fillerWords();
		$('#insights').text(message);	
		localStorage.setItem("volume", volume);
		localStorage.setItem("pauseCount", pauseCount*1.0);
		localStorage.setItem("fillerCount",fillerCount*1.0);
		localStorage.setItem("insightsPara",message);
	}
