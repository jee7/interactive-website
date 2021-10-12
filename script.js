(function() {
    "use strict";

	let clock = {
		lastTime: 0,
		elapsedTime: 0,
		startDate: null,
		deltaTime: 0,
		
		update: function() {
			let now = performance.now() / 1000;
			this.deltaTime = now - this.lastTime;
			this.elapsedTime += this.deltaTime;
			this.lastTime = now;
		}
	}
	
	let clockElement1;
	let clockElement2;

	function update() {
		clock.update()

		updateClocks()
		
		setTimeout(update, 30);
	}
  
	function updateClocks() {
            
		// This may drift over a long time
		let date = new Date(clock.startDate.getTime());
		date.setMilliseconds(date.getMilliseconds() + clock.elapsedTime * 1000);
		updateClockFromDate(date, clockElement1);
		
		// This is probably wasteful (creates a new object every update)
		updateClockFromDate(new Date(), clockElement2);
		
	};
	
	/* // Logic seems to work
	function hourTest(h) {
		let newH = h % 12;
		let elpl = newH != h ? 'PL' : 'EL';
		newH = newH == 0 ? 12 : newH;
		console.log(newH, elpl);
	}
	for (var i = 0; i < 24; i++) hourTest(i);
	*/
	
	function updateClockFromDate(date, element) {
		let h = date.getHours() % 12;
		let m = date.getMinutes();
		let s = date.getSeconds();
		let ms = date.getMilliseconds();
		
		
		let elpl = h != date.getHours() ? 'PL' : 'EL';
		h = h == 0 ? 12 : h;

		if (h < 10) {
			h = "0" + h;
		}

		if (m < 10) {
			m = "0" + m;
		}

		if (s < 10) {
			s = "0" + s;
		}
		
		if (ms < 100) {
			ms = ("00" + ms).substr(-3);
		}

		element.innerHTML = h + ":" + m + ":" + s + "." + ms + " " + elpl;
	}
    //clock

    document.addEventListener("DOMContentLoaded", function() {
		
		clock.startDate = new Date();
        
        clockElement1 = document.getElementById("clock1");
		clockElement2 = document.getElementById("clock2");
       
        update(); // Call the initial update once the document content is loaded
        
    });
    
    // forms
    
    document.getElementById("form").addEventListener("submit", estimateDelivery);
    
    let e = document.getElementById("delivery");
    e.innerHTML = "0,00 &euro;";
    
    function estimateDelivery(event) {
        event.preventDefault();
        
        let linn = document.getElementById("linn");
		let deliveryMethod = document.querySelector('input[name="deliveryMethod"]:checked');
		let firstName = document.querySelector('input[name="fname"]');
		let lastName = document.querySelector('input[name="lname"]');
        
        if (linn.value === "") {
            
            alert("Palun valige linn nimekirjast");
            
            linn.focus();
            
            return;
            
        } else if (deliveryMethod.value == "") {
	
			alert("Tarneviis valimata!")
			
			return;
	
		} else if (firstName.value == "" || lastName.value == "") {
			
			alert("Palun täida nii ees- kui perekonnanime väli!")
			
			return;
			
		} else if (firstName.value.match(/[0-9]/) || lastName.value.match(/[0-9]/)) {
			
			alert("Ees- ja perekonnanimi ei tohi sisaldada numbreid!")
			
			return;
			
        } else {
			
			let price = 0;
            
			let deliveryExtras = document.querySelectorAll(".deliveryExtra");
			for (let deliveryExtra of deliveryExtras) {
				price += deliveryExtra.checked ? parseFloat(deliveryExtra.dataset.price) : 0;
			}

			let deliveryDestination = document.querySelector(".deliveryDestination");
			let deliveryDestinationPrice = document.querySelector(".deliveryDestination option[value=" + deliveryDestination.value + "]")
			price += parseFloat(deliveryDestinationPrice.dataset.price);
			
			price += parseFloat(deliveryMethod.dataset.price);
			
            e.innerHTML = price.toFixed(2).replace('.', ',') + " &euro;";
            
        }        
        
        console.log("Tarne hind on arvutatud");
    }
    
})();

// map

let mapAPIKey = "AqLLRE37SJGqIxXEYxezPUa6fF2oCzl3cvG4n05FtFIVBrotBYxchpMYYpwuxBak";

let map;

function GetMap() {
    
    "use strict";

    let tartuUniversityPoint = new Microsoft.Maps.Location(
		58.38104, 
		26.71992
	);
	
	let elvaGymnasiumPoint = new Microsoft.Maps.Location(
		58.2170683,
		26.4102554
	);
	
	let locations = [
		tartuUniversityPoint,
		elvaGymnasiumPoint
	];
	

    let rectangle = Microsoft.Maps.LocationRect.fromLocations(locations);
	rectangle.height *= 3;
	rectangle.center.latitude += 0.1;
	
    map = new Microsoft.Maps.Map("#map", {
        credentials: mapAPIKey,
        bounds: rectangle,
        mapTypeId: Microsoft.Maps.MapTypeId.road,
        disablePanning: true,
		disableZooming: true,
    });
	

	let pins = [
		{
			pin: new Microsoft.Maps.Pushpin(tartuUniversityPoint, {title: 'Tartu Ülikool'}),
			metadata: {
				title: 'Tartu Ülikool',
				description: '<img class="map-image" src="ut.jpg">',
			}
		},
		{
			pin: new Microsoft.Maps.Pushpin(elvaGymnasiumPoint, {title: 'Elva Gümnaasium',}),
			metadata: {
				title: 'Elva Gümnaasium',
				description: '<img class="map-image" src="elva.jpg">',
			}
		}
	];
	
	// Empty infobox for use on different pushpins
	let infobox = new Microsoft.Maps.Infobox(map.getCenter(), {
		visible: false
	});
	infobox.setMap(map);
	
	for (let pin of pins) {
		pin.pin.metadata = pin.metadata;
		
		map.entities.push(pin.pin);
		Microsoft.Maps.Events.addHandler(pin.pin, 'click', pushpinClicked);
	}

	function pushpinClicked(event) {
		// From the example in: https://docs.microsoft.com/en-us/bingmaps/v8-web-control/map-control-concepts/infoboxes/infobox-when-pushpin-clicked
		
		console.log(event.target);
		//Make sure the infobox has metadata to display.
        if (event.target.metadata) {
			let data = event.target.metadata;
            //Set the infobox options with the metadata of the pushpin.
            infobox.setOptions({
                location: event.target.getLocation(),
                title: data.title,
                description: data.description,
                visible: true
            });
        }
	}

	
}

// https://dev.virtualearth.net/REST/v1/Locations?q=1000 Vin Scully Ave, Los Angeles,CA&key=YOUR_KEY_HERE

