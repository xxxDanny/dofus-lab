import re
from app import app, db
from app.database import base
from app.database.model_item_translation import ModelItemTranslation
from app.database.model_set_translation import ModelSetTranslation
from app.database.model_set import ModelSet
from app.database.model_item import ModelItem

url_base = "https://dofus-lab.s3.us-east-2.amazonaws.com/item/"

mappings = []

for item in db.session.query(ModelItem):
    info = {
        "uuid": item.uuid,
        "image_url": url_base + re.search("\d+\.png", item.image_url)[0],
    }
    mappings.append(info)

db.session.bulk_update_mappings(ModelItem, mappings)
db.session.flush()
db.session.commit()