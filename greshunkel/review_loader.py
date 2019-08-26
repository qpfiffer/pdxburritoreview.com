import json, os, requests, uuid, yaml

REVIEW_DIR = "./built/data/"

class ReviewLoader(object):
    def __init__(self, reviews_file, outfile):
        self.raw_reviews = yaml.safe_load(reviews_file)
        self.reviews = []
        self.regions = self.raw_reviews
        self.locations = []
        self.outfile = outfile

    def write(self):
        os.makedirs(REVIEW_DIR, exist_ok=True)
        with open("{}/reviews.json".format(REVIEW_DIR), "w") as reviews_file:
            json.dump(self.raw_reviews, reviews_file)
        yaml.dump(self.raw_reviews, self.outfile)

    def geocode(self, address):
        request_url = 'https://api.geocod.io/v1.3/geocode?q={address}&api_key={api_key}'
        API_KEY = os.environ['GEOCODIO_API_KEY']
        try:
            resp = requests.get(request_url.format(address=address, api_key=API_KEY))
            resp.raise_for_status()
        except Exception as e:
            print("Could not geocode Property {address}: {e}".format(e=e, address=address))
            return None

        json = resp.json()
        lat = json["results"][0]["location"]["lat"]
        lng = json["results"][0]["location"]["lng"]

        return lat, lng

    def process(self):
        for region in self.raw_reviews:
            new_list = sorted(self.raw_reviews[region], key=lambda k: k['name'])
            self.raw_reviews[region] = new_list
            for store in self.raw_reviews[region]:
                if 'uuid' not in store:
                    store['uuid'] = str(uuid.uuid4())
                if ('lat' not in store or 'lng' not in store) and 'address' in store:
                    lat, lng = self.geocode(store['address'])
                    print("{}: {}, {}".format(store['address'], lat, lng))
                    store['lat'] = lat
                    store['lng'] = lng
                store['region'] = region
                self.locations.append(store)
        self.write()
