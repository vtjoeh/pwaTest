//Initialize the xAPI on page load to make the xapi object available.
//Creating a persistent Cookie with navigator ID is not necessary, 
//just done as an example for how to distinguish between unique navigators.


console.log('loading.....'); 




async function init() {
	try {
		xapi = await getXAPI();
		xapistatus.textContent = "jsxapi available";
		unique_id = createPersistentCookie();
		content.textContent = "Navigator ID: " + unique_id;
		setupSubscriptions();
		statusSubscription(); 
		getCurrent();
		updateSerial();
	} catch(e) {
		content.textContent = e.message;
		xapistatus.textContent = "error getting jsxapi object";
	}
}

window.onload = async function() {
	init();
};

//Persistent Cookie example for Unique Navigator ID:
//Searches for an existing cookie, if not found generates a new UUID and stores it.
function createPersistentCookie() {
	value_or_null = (document.cookie.match(/^(?:.*;)?\s*uniqueId\s*=\s*([^;]+)(?:.*)?$/)||[,null])[1]
	var ret_val;
	if(value_or_null == null) {
		var expiration_date = new Date();
		var cookie_string = '';
		expiration_date.setFullYear(expiration_date.getFullYear() + 1);
		cookie_string = "uniqueId=" + uuidv4() +"; path=/; expires=" + expiration_date.toUTCString();
		document.cookie = cookie_string;
	}
	return (document.cookie.match(/^(?:.*;)?\s*uniqueId\s*=\s*([^;]+)(?:.*)?$/)||[,null])[1];
}

function uuidv4() {
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
		return v.toString(16);
	});
}

//Event handlers for button presses below.
//Xapi Command to set the LedControl Color to Green
const greenButton = document.getElementById('greenButton');
const content = document.getElementById('content');
const xapistatus = document.getElementById('xapistatus');
greenButton.addEventListener('click', async function(e) {
	try {		
		//Example of an xapi xCommand
		xapi.Command.UserInterface.LedControl.Color.Set({ Color: 'Green' });
	} catch(e) {
		content.textContent = e.message;
	}
});

//Xapi Command to set the LedControl Color to Yellow
const yellowButton = document.getElementById('yellowButton');
yellowButton.addEventListener('click', async function(e) {
	try {
	   	//Example of an xapi xCommand
		xapi.Command.UserInterface.LedControl.Color.Set({ Color: 'Yellow' });
  	} catch(e) {
		content.textContent = e.message;
   	}
});

//Xapi Command to set the LedControl Color to Red
const redButton = document.getElementById('redButton');
redButton.addEventListener('click', async function(e) {
	console.log('Red Button Pushed'); 
	updateTextBox({"buttonPushed" : "red"}); 
   try {
	   //Example of an xapi xCommand
		xapi.Command.UserInterface.LedControl.Color.Set({ Color: 'Red' });
   	} catch(e) {
		content.textContent = e.message;
   	}
});

//Xapi Command to set the LedControl Color to Purple
console.log('line 83')
const purpleButton = document.getElementById('purpleButton');
purpleButton.addEventListener('click', async function(e) {
	console.log('Purple Button Pushed');
   try {
	   //Example of an xapi xCommand
		xapi.Command.UserInterface.LedControl.Color.Set({ Color: 'Purple' });
   	} catch(e) {
		content.textContent = e.message;
   	}
});



const manualButton = document.getElementById('manualButton');
manualButton.addEventListener('click', async function(e) {
   try {
		//Example xapi xConfiguration
		xapi.Config.UserInterface.LedControl.Mode.set('Manual');
		content.textContent = `Set Led Control to Manual`;	

   	} catch(e) {
		content.textContent = e.message;
   	}
});

const autoButton = document.getElementById('autoButton');
autoButton.addEventListener('click', async function(e) {
   try {
		xapi.Config.UserInterface.LedControl.Mode.set('Auto');
		content.textContent = `Set Led Control to Auto - LED will be set to Off if Calendar is not setup`;

   	} catch(e) {
		content.textContent = e.message;
   	}
});

//Currently the Audio xAPI is not enabled for Persistent WebApp Mode
//Attempts to toggle mute, expected to fail.
const failButton = document.getElementById('failCase');
failButton.addEventListener('click', async function(e) {
   try {
		xapi.Command.Audio.Volume.ToggleMute();

   } catch(e) {
		content.textContent = e.message;
   }
   
});

//Gets the current xStatus of LedControl Color and displays on the page.
function getCurrent() {
	//Example xapi xStatus
	xapi.Status.UserInterface.LedControl.Color.get().then((color) => {
		setLedColor(color)
    })
    .catch(function(error) {
		console.log(error);
    });
}

function setLedColor(color) {
	console.log("COLOR: " + color)
	updateTextBox({"updateColor" : color}); 
	switch(color) {
		case 'Green':
		case 'Yellow':
		case 'Red':
		case 'Blue':
		case 'Purple':
		case 'Orange':
			 document.getElementById('ledRect').style.fill = color;
			 break;
		case 'Off':
			document.getElementById('ledRect').style.fill = 'black';
			break;
		default: 
			console.log("Unexpected color")
			document.getElementById('ledRect').style.fill = 'grey';
	}
}

//Gets the Serial number of the device using the peripheralSerial replacement tag
function updateSerial() {
	const params = new URLSearchParams(window.location.search);
	const serialNumber = params.get('serialnumber')	
	var serialResult;
	serialNumber === null ? serialResult = 'peripheralSerial not set' : serialResult = serialNumber
	document.getElementById('deviceSerial').innerHTML = "Device Serial: " + serialResult;
}

//Gets the current xStatus of LedControl Color and displays on the page.
function setupSubscriptions() {
	//Example xapi xStatus
	xapi.Status.UserInterface.LedControl.Color.on(color => {
		setLedColor(color)
	});
}

updateTextBox("loaded"); 
function updateTextBox(lastStatus){
	let text = JSON.stringify(lastStatus, null, 10); 
	let statusUpdateNode = document.getElementById('statusUpdate');
	
	statusUpdateNode.insertBefore(document.createElement("br"), statusUpdateNode.firstChild);	
	
	let node = document.createTextNode(text); 

	statusUpdateNode.insertBefore(node, statusUpdateNode.firstChild); 
}

function getQueryString() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);

    if (urlParams.has('test')) {
		let test = urlParams.get('test');
		updateTextBox(test); 
	}

}

function statusSubscription(){
	xapi.Status.SystemUnit.on(lastStatus=>{
		console.log('lastStatus', lastStatus); 
		updateTextBox(lastStatus); 
	}); 

	xapi.Status.Bookings.on(lastStatus=>{
		console.log('lastStatus', lastStatus); 
		updateTextBox(lastStatus); 
	});

	xapi.Status.UserInterface.on(lastStatus=>{
		console.log('lastStatus', lastStatus); 
		updateTextBox(lastStatus); 
	}); 

	xapi.Status.Peripherals.on(lastStatus=>{
		console.log('lastStatus', lastStatus); 
		updateTextBox(lastStatus); 
	}); 

	xapi.Status.RoomAnalytics.on(lastStatus=>{
		console.log('lastStatus', lastStatus); 
		updateTextBox(lastStatus); 
	}); 

	xapi.Config.on(configUpdate=>{
		console.log('configUpdate: ', configUpdate); 
		updateTextBox(configUpdate); 
	}); 


}
