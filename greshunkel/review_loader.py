from yaml import safe_load
import json, os

REVIEW_DIR = "./built/data/"

class ReviewLoader(object):
    def __init__(self, reviews_file):
        self.raw_reviews = safe_load(reviews_file)
        self.reviews = []
        self.regions = self.raw_reviews
        self.locations = []

    def write(self):
        os.makedirs(REVIEW_DIR, exist_ok=True)
        with open("{}/reviews.json".format(REVIEW_DIR), "w") as reviews_file:
            json.dump(self.raw_reviews, reviews_file)

    def process(self):
        for region in self.raw_reviews:
            for region_str, all_stores in region.items():
                for store in all_stores:
                    store['region'] = region_str
                    self.locations.append(store)
        self.write()
