(ns pd-api.test.service.routes
  (:require [cheshire.core :as cheshire]
            [clj-uuid :as uuid]
            [midje.sweet :refer :all]
            [pd-api.db.core :as db]
            [pd-api.handler :refer :all]
            [pd-api.middleware :refer [verify]]
            [pd-api.service.schema :as s]
            [ring.mock.request :refer :all]
            [schema.core :refer [defschema maybe Str]]
            [schema-generators.generators :as g]))


(defn parse-body [{:keys [:body]}]
  (cheshire/parse-string (slurp body) true))


(defn get-req
  "Performs a GET mock request"
  [url]
  ((app)
    (-> (request :get url)
        (header :authorization (str "Bearer " (uuid/v4))))))


(defschema ProviderTestSchema {:drg_definition                       (maybe Str)
                               :provider_id                          (maybe Str)
                               :provider_name                        (maybe Str)
                               :provider_street_address              (maybe Str)
                               :provider_city                        (maybe Str)
                               :provider_state                       (maybe Str)
                               :provider_zip_code                    (maybe Str)
                               :hospital_referral_region_description (maybe Str)
                               :total_discharges                     (maybe Str)
                               :average_covered_charges              (maybe Str)
                               :average_total_payments               (maybe Str)
                               :average_medicare_payments            (maybe Str)})


(facts "about API routes"
       (against-background (verify anything) => {})

       (facts "misc"
              (fact "health route works"
                    (let [response (get-req "/api/health")]
                      (:status response) => 200))

              (fact "not-found route is not found"
                    (let [response (get-req "/invalid")]
                      (:status response) => 404))

              (fact "unauthenticated request fails"
                    (:status ((app) (request :get "/api/providers"))) => 401))

       (facts "providers"
              (fact "can be indexed without query parameters"
                    (-> (get-req "/api/providers")
                        :status) => 200
                    (provided
                      (db/search anything anything anything anything) => (g/generate s/ProvidersResponse)))

              (fact "are indexed using defaults when no query parameters are specified"
                    (-> (get-req "/api/providers")
                        :status) => 200
                    (provided
                      (db/search
                        {:max_discharges                nil
                         :min_discharges                nil
                         :max_average_covered_charges   nil
                         :min_average_covered_charges   nil
                         :min_average_medicare_payments nil
                         :max_average_medicare_payments nil
                         :state                         nil}
                        nil
                        20
                        0)
                      => (g/generate s/ProvidersResponse)))

              (fact "query params are propagated"
                    (-> (get-req
                          (str "/api/providers?max_discharges=1"
                               "&min_discharges=2"
                               "&max_average_covered_charges=3"
                               "&min_average_covered_charges=4"
                               "&min_average_medicare_payments=5"
                               "&max_average_medicare_payments=6"
                               "&state=AL"
                               "&term=foo"
                               "&size=10"
                               "&from=25"))
                        :status) => 200
                    (provided
                      (db/search
                        {:max_discharges                1
                         :min_discharges                2
                         :max_average_covered_charges   3.0
                         :min_average_covered_charges   4.0
                         :min_average_medicare_payments 5.0
                         :max_average_medicare_payments 6.0
                         :state                         "AL"}
                        "foo"
                        10
                        25)
                      => (g/generate s/ProvidersResponse)))

              (fact "can be indexed with selected fields"
                    (-> (get-req "/api/providers?fields=provider_name,provider_city")
                        parse-body
                        :providers
                        first
                        keys) => (just #{:provider_name :provider_city})
                    (provided
                      (db/search anything anything anything anything)
                      =>
                      {:total     5
                       :providers (g/sample 5 ProviderTestSchema)}))

              (fact "are indexed with all fields when no field is supplied"
                    (-> (get-req "/api/providers?fields=")
                        parse-body
                        :providers
                        first
                        keys) => (just (set (keys ProviderTestSchema)))
                    (provided
                      (db/search anything anything anything anything)
                      =>
                      {:total     1
                       :providers (g/sample 1 ProviderTestSchema)}))

              (fact "throws a 400 when a single invalid field is supplied"
                    (let [res (get-req "/api/providers?fields=provider_name,foo")]
                      (:status res) => 400
                      (parse-body res) => {:message "Invalid field(s) specified in field query param"}))))
