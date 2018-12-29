#!/usr/bin/env python
import csv
import json
import json_lines
import configparser
from elasticsearch import Elasticsearch
from elasticsearch.helpers import bulk

fieldnames = ("drg_definition",
              "provider_id",
              "provider_name",
              "provider_street_address",
              "provider_city",
              "provider_state",
              "provider_zip_code",
              "hospital_referral_region_description",
              "total_discharges",
              "average_covered_charges",
              "average_total_payments",
              "average_medicare_payments")

csv_file = open("data.csv", "r")
json_file = open("data.json", "w")

reader = csv.DictReader(csv_file, fieldnames)
# skip header
next(reader)
for row in reader:
    # remove $ sign from these fields
    row["average_covered_charges"] = row["average_covered_charges"][1:]
    row["average_total_payments"] = row["average_total_payments"][1:]
    row["average_medicare_payments"] = row["average_medicare_payments"][1:]

    json.dump(row, json_file)
    json_file.write("\n")


config = configparser.ConfigParser()
config.read('conf.ini')
es_host = config["default"]["es_host"]
es_port = config["default"]["es_port"]
es_index = config["default"]["es_index"]

# connect to es
es = Elasticsearch([{"host": es_host, "port": es_port}])

# delete index if it already exists
if es.indices.exists(es_index):
    es.indices.delete(index=es_index)

# index settings
settings = {
    "mappings": {
        "_doc": {
            "properties": {
                "drg_definition": {"type": "text"},
                "provider_id": {"type": "text"},
                "provider_name": {"type": "text"},
                "provider_street_address": {"type": "text"},
                "provider_city": {"type": "text"},
                "provider_state": {"type": "keyword"},
                "provider_zip_code": {"type": "text"},
                "hospital_referral_region_description": {"type": "text"},
                "total_discharges": {"type": "integer"},
                "average_covered_charges": {"type": "double"},
                "average_total_payments": {"type": "double"},
                "average_medicare_payments": {"type": "double"}
            }
        }
    }
}

# create index
es.indices.create(index=es_index, body=settings)


def gen_data():
    with open("data.json", "rb") as f:
        for line in json_lines.reader(f, broken=True):
            yield {
                "_index": es_index,
                "_type": "_doc",
                "_source": line
            }


bulk(es, gen_data())
print("Import Completed!")
