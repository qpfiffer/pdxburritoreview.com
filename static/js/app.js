// vim: set ts=2 sw=2 noet :
var store = {
	state: {
		shouldShowReviewPane: false,
		activeReviewUUID: null
	},
	setShouldShowReviewPane (val) {
		this.state.shouldShowReviewPane = val;
	},
	setActiveReviewUUID (val) {
		this.state.activeReviewUUID = val;
	}
}

Vue.component('ReviewPane', {
	methods: {
		showReviewPaneF: function() {
			store.setShouldShowReviewPane(true);
		},
	},
	data: function() {
		const self = this;
		return {
			shouldShowReviewPane: store.state.shouldShowReviewPane
		}
	},
	template:
		`<div v-if="shouldShowReviewPane" v-on:show-review-pane="showReviewPaneF" class="review_pane">
			 <h3>Name of place</h3>
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
			console.log("CHANGED")
			return this.state.activeReviewUUID === this.value.uuid
		},
		onClick(e) {
			e.preventDefault();
			const self = this;
			const latLngs = [ self.value.mapMarker.getLatLng() ];
			const markerBounds = L.latLngBounds(latLngs);
			self.map.fitBounds(markerBounds);

			self.$emit('show-review-pane');
			self.$emit('deactivate');
			store.setActiveReviewUUID(self.value.uuid);
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
					if (store.lat && store.lng)
						store.mapMarker = L.marker([store.lat, store.lng]).addTo(self.map);
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
			L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
				attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
				maxZoom: 18,
				id: 'mapbox.streets',
				accessToken: 'pk.eyJ1IjoicXBmaWZmZXIiLCJhIjoiY2p4bWdobmphMDNvOTNicWhmbm9jaXJhNSJ9.W5lmNhX-Fdl1ejdoIhVmDg'
			}).addTo(self.map);
		}
	},
	created: function() {
		this.load();
		this.buildMap();
	}
});
