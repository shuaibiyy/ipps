(ns pd-api.service.schema
  (:require [schema.core :refer [defschema maybe enum Str optional-key Int]]))


(defschema ProviderFields [(enum "provider_name"
                                 "provider_street_address"
                                 "provider_city"
                                 "provider_state"
                                 "provider_zip_code"
                                 "hospital_referral_region_description"
                                 "total_discharges"
                                 "average_covered_charges"
                                 "average_total_payments"
                                 "average_medicare_payments")])


(defschema Provider {(optional-key :drg_definition)                       (maybe Str)
                     (optional-key :provider_id)                          (maybe Str)
                     (optional-key :provider_name)                        (maybe Str)
                     (optional-key :provider_street_address)              (maybe Str)
                     (optional-key :provider_city)                        (maybe Str)
                     (optional-key :provider_state)                       (maybe Str)
                     (optional-key :provider_zip_code)                    (maybe Str)
                     (optional-key :hospital_referral_region_description) (maybe Str)
                     (optional-key :total_discharges)                     (maybe Str)
                     (optional-key :average_covered_charges)              (maybe Str)
                     (optional-key :average_total_payments)               (maybe Str)
                     (optional-key :average_medicare_payments)            (maybe Str)})


(defschema ProvidersResponse {:total     Int
                              :providers [Provider]})
