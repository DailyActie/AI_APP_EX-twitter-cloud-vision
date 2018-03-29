const socket = io.connect();

async function fetchVisionResult (imageUrl) {
	try {
		const apiKey = ''
		const response = await fetch('https://vision.googleapis.com/v1/images:annotate?key=' + apiKey, {
			method: 'post',
			body: JSON.stringify({
				"requests": [
				{
					"image": {
						"source": {
							"imageUri": imageUrl
						}
					},
					"features": [
					{
						"type": "FACE_DETECTION"
					}
					]
				}
				]
			})
		})
		const data = await response.json()
		return data
	} catch (e) {
		throw e
	}
}

const app = new Vue({
	el: '#app',
	data: () => ({
		tweets: []
	}),
	created () {
		socket.on('tweet', (item) => {
			item.text = item.hasOwnProperty('full_text') ? item.full_text : item.text
			item.first_image = item.entities.media[0]
			item.visionResult = {
				scanning: true,
				error: false,
				faces_detected: 0,
				faceAnnotations: []
			}
			fetchVisionResult(item.first_image.media_url)
			.then((res) => {
				const responses = res.responses[0]
				if (responses.hasOwnProperty('faceAnnotations')) {
					item.visionResult.faces_detected = responses.faceAnnotations.length
					item.visionResult.faceAnnotations = responses.faceAnnotations
				}
				item.visionResult.error = false
				item.visionResult.scanning = false
			})
			.catch((e) => {
				item.visionResult.scanning = false
				item.visionResult.error = true
				console.error(e)
			})
			const msg = `New tweet from: ${item.user.name}`
			this.$toasted.show(msg, {
				className: 'toast-class',
				theme: 'primary',
				duration: 2500,
				position: "bottom-right",
				type: 'info'
			})
			this.tweets.unshift(item)
		})
	}
})

Vue.use(VueLazyload, {
	loading: './spinner.gif'
})
Vue.use(Toasted)