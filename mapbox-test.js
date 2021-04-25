
require('dotenv').config();



async function geocoder(location) {
	try {	
		let response = await geocodingClient
		  .forwardGeocode({
		    query: location,
		    limit: 1
		  })
		  .send();

		console.log(response.body.features[0].geometry.coordinates);
	} catch(err) {
		console.log(err.message);
	}
}

geocoder('Alaska, US');