from yaml import safe_load

class ReviewLoader(object):
    def __init__(self, reviews_file):
        self.raw_reviews = safe_load(reviews_file)
        self.reviews = []
        self.regions = self.raw_reviews

    def process(self):
        for region in self.raw_reviews:
            for region_str, all_stores in region.items():
                for store in all_stores:
                    copy = dict(store)
                    copy['region'] = region_str
