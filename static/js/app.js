// vim: set ts=2 sw=2 noet :
var store = {
	state: {
		shouldShowReviewPane: false,
		activePlace: {
			address: '',
			name: '',
			breakfast: '',
			heavy: '',
			price: '',
			reviews: [],
		},
		activeReviewUUID: null
	},
	setShouldShowReviewPane (val) {
		this.state.shouldShowReviewPane = val;
	},
	setActiveReviewUUID (val) {
		this.state.activeReviewUUID = val;
	},
	setActivePlace (val) {
		this.state.activePlace = val;
	}
}

Vue.component('ReviewPane', {
	methods: {
		showReviewPaneF(val) {
			store.setShouldShowReviewPane(val);
		},
		isActive() {
			return this.state.shouldShowReviewPane
		},
	},
	data: function() {
		const self = this;
		return {
			state: store.state
		}
	},
	template:
		`<div v-bind:class="{active: isActive()}" class="review_pane">
			 <a v-on:click="showReviewPaneF(false)" href="#" class="close"></a>
			 <h2>{{ state.activePlace.name }}</h2>
			 <code>{{ state.activePlace.address }}</code>
			 <div class="horizontal_line"></div>
			 <ul class="review_stars">
			   <li>Breakfast Only: {{ state.activePlace.breakfast }}</li>
			   <li>Price: <code>{{ state.activePlace.price }} / 5</code></li>
			   <li>Heavy: <code>{{ state.activePlace.heavy }} / 5</code></li>
			   <li>Speed: <code>{{ state.activePlace.speed }} / 5</code></li>
			   <li>Tasty: <code>{{ state.activePlace.tasty }} / 5</code></li>
			 </ul>
			 <div class="horizontal_line"></div>
			 <h3>Reviews</h3>
			 <div v-for="review in state.activePlace.reviews" class="review">
			   <p>{{ review.text }}</p>
			   <p>- {{ review.author }}</p>
			 </div>
		 </div>`
});

Vue.component('BurritoStoreLI', {
	props: ['map', 'value'],
	data: () => {
		const self = this;
		return {
			state: store.state
		}
	},
	methods: {
		isActive() {
			return this.state.activeReviewUUID === this.value.uuid
		},
		onClick(e) {
			e.preventDefault();
			const self = this;

			const latLngs = [ self.value.mapMarker.getLatLng() ];
			const markerBounds = L.latLngBounds(latLngs);
			self.map.fitBounds(markerBounds);

			store.setActiveReviewUUID(self.value.uuid);
			store.setShouldShowReviewPane(true);
			store.setActivePlace(self.value);
		}
	},
	template: `<li class="location">
							 <a v-bind:class="{active: isActive()}" v-on:click="onClick" href="#">{{value.name}}</a>
						 </li>`
});
const app = new Vue({
	el: "#app",
	data: {
		loading: true,
		neighborhoods: [
			['NW', 'Northwest'],
			['NE', 'Northeast'],
			['SE', 'Southeast'],
			['SW', 'Southwest'],
			['Downtown', 'Downtown'],
		],
		sharedState: store,
		reviews: [],
		map: null,
	},
	methods: {
		addPoints: function() {
			const self = this;
			for (const key in self.reviews) {
				const region = self.reviews[key];
				for (let store of region) {
					if (store.lat && store.lng) {
						const latLngs = [store.lat, store.lng];
						let marker = L.marker(latLngs);
						marker.on('click', function() {
							const markerBounds = L.latLngBounds([marker.getLatLng()]);
							self.map.fitBounds(markerBounds);

							self.sharedState.setActiveReviewUUID(store.uuid);
							self.sharedState.setShouldShowReviewPane(true);
							self.sharedState.setActivePlace(store);
						});
						store.mapMarker = marker.addTo(self.map);
					}
				}
			}
		},
		load: function() {
			const self = this;
			fetch("/data/reviews.json").then(function(data) {
				data.text().then(function(asText) {
					const parsedData = JSON.parse(asText);
					self.reviews = parsedData;
					self.loading = false;
					// Probably a race condition here waiting on map load, but whatever.
					self.addPoints();
				})
			});
		},
		buildMap: function() {
			const self = this;
			self.map = L.map('map').setView([45.5155, -122.6793], 13);
			L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', 
				{attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'}
			).addTo(self.map);
			//L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
			//	attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
			//	maxZoom: 18,
			//	id: 'mapbox.streets',
			//	accessToken: 'pk.eyJ1IjoicXBmaWZmZXIiLCJhIjoiY2p4bWdobmphMDNvOTNicWhmbm9jaXJhNSJ9.W5lmNhX-Fdl1ejdoIhVmDg'
			//}).addTo(self.map);
		}
	},
	created: function() {
		this.load();
		this.buildMap();
	}
});
