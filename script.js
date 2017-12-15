// Initialize Firebase
var config = {
  apiKey: "AIzaSyA-ZJSaOVAMKC7QRY3Y3VCnxfwnBh5RE6E",
  authDomain: "train-schedule-4ce2e.firebaseapp.com",
  databaseURL: "https://train-schedule-4ce2e.firebaseio.com",
  projectId: "train-schedule-4ce2e",
  storageBucket: "train-schedule-4ce2e.appspot.com",
  messagingSenderId: "174065040401"
};

firebase.initializeApp(config);

// Create a variable to reference the database
var database = firebase.database();


//Math to get next train
function getNextTrain(tFrequency, firstTime) {

    // First Time (pushed back 1 year to make sure it comes before current time)
    var firstTimeConverted = moment(firstTime, "hh:mm").subtract(1, "years");

    // Current Time
    var currentTime = moment();

    // Difference between the times
    var diffTime = moment().diff(moment(firstTimeConverted), "minutes");

    // Time apart (remainder)
    var tRemainder = diffTime % tFrequency;

    // Minute Until Train
    var tMinutesTillTrain = tFrequency - tRemainder;

    return tMinutesTillTrain;

}



$(document).ready(function() {

    // Initial Values
    var name = "";
    var destination = "";
    var time = 0;
    var frequency = 0;
    var nextTrain = 0;
    var tempTime = 0;
    var minutesUntilNextTrain = 0;

	// Firebase watcher + initial loader
	database.ref().orderByChild("dateAdded").limitToLast(10).on("child_added", function(snapshot) {

	  // Log everything that's coming out of snapshot
	  name = snapshot.val().name;
	  destination = snapshot.val().destination;
	  time = snapshot.val().time;
	  frequency = snapshot.val().frequency;

    //Update math to get the next train time
    minutesUntilNextTrain = getNextTrain(frequency,time);

    // Next Train
    var nextTrain = moment().add(minutesUntilNextTrain, "minutes");

	  // Change the HTML to reflect
	  $(".train-schedule").append("<tr class='" + name + "'><td>" + name + "</td><td>" + destination + "</td><td>" + frequency + "</td><td>" + moment(nextTrain).format("hh:mm") + "</td><td>" + minutesUntilNextTrain + "</td></tr>");


	  // Handle the errors
	}, function(errorObject) {
	  console.log("Errors handled: " + errorObject.code);
	});


    // Capture Form Input
    $("#add-train").on("click", function() {
      // Don't refresh the page!
      event.preventDefault();

      name = $("#name-input").val().trim();
      destination = $("#destination-input").val().trim();
      time = $("#time-input").val().trim();
      frequency = $("#frequency-input").val().trim();

      //Do the math to get the next train time
      minutesUntilNextTrain = getNextTrain(frequency,time);

      // Next Train
      var nextTrain = moment().add(minutesUntilNextTrain, "minutes");


      // Save train to db
      database.ref("/" + name).set({
        name: name,
        destination: destination,
       	time: tempTime,
        frequency: frequency
      });

      //Clear form once submitted
      $("#name-input").val("");
      $("#destination-input").val("");
      $("#time-input").val("");
      $("#frequency-input").val("");

    });

});

