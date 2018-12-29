(ns pd-api.service.routes
  (:require [ring.util.http-response :refer :all]
            [compojure.api.meta :refer [restructure-param]]
            [compojure.api.sweet :refer :all]
            [buddy.auth :refer [authenticated?]]
            [pd-api.service.schema :refer :all]
            [pd-api.service.handlers :refer :all]
            [schema.core :as s]))


(defapi service-routes
  {:swagger {:ui   "/swagger-ui"
             :spec "/swagger.json"
             :data {:info {:version "1.0.0"
                           :title   "Inpatient Prospective Payment System Providers API"}}}}

  (GET "/authenticated" []
    :auth-rules authenticated?
    :current-user user
    (ok {:user user}))

  (context "/api" []

    (GET "/health" []
      :return String
      :query-params []
      :summary "Health check"
      (ok "API is up and running!"))

    (GET "/providers" {}
      :summary "Fetch providers"
      :return ProvidersResponse
      :query-params [{max_discharges :- s/Int nil}
                     {min_discharges :- s/Int nil}
                     {max_average_covered_charges :- Double nil}
                     {min_average_covered_charges :- Double nil}
                     {min_average_medicare_payments :- Double nil}
                     {max_average_medicare_payments :- Double nil}
                     {state :- String nil}
                     {fields :- String nil}
                     {term :- String nil}
                     {size :- s/Int 20}
                     {from :- s/Int 0}]
      (fetch-providers
        {:max_discharges                max_discharges
         :min_discharges                min_discharges
         :max_average_covered_charges   max_average_covered_charges
         :min_average_covered_charges   min_average_covered_charges
         :min_average_medicare_payments min_average_medicare_payments
         :max_average_medicare_payments max_average_medicare_payments
         :state                         state}
        fields
        term
        size
        from))))
