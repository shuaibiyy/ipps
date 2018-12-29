(ns pd-api.db.core
  (:require [clojure.tools.logging :as log]
            [clojurewerkz.elastisch.query :as q]
            [clojurewerkz.elastisch.rest :as esr]
            [clojurewerkz.elastisch.rest.document :as esd]
            [clojurewerkz.elastisch.rest.response :as esrsp]
            [mount.core :refer [defstate]]
            [pd-api.config :refer [env]]))


(defstate ^:dynamic *db*
          :start (esr/connect (env :es-url)
                              {:content-type       :json
                               :connection-manager (clj-http.conn-mgr/make-reusable-conn-manager {:timeout 10})}))


(defn range-query
  "Create an Elasticsearch (ES) range query."
  [key min_val max_val]
  (let [opts (merge (when min_val
                      {:gte min_val})
                    (when max_val
                      {:lte max_val}))]
    (when opts
      (q/range key opts))))


(defn range-queries
  [{:keys [min_discharges max_discharges
           min_average_covered_charges max_average_covered_charges
           min_average_medicare_payments max_average_medicare_payments]}]
  (remove nil?
          (into []
                [(range-query :total_discharges min_discharges max_discharges)
                 (range-query :average_covered_charges min_average_covered_charges max_average_covered_charges)
                 (range-query :average_medicare_payments min_average_medicare_payments max_average_medicare_payments)])))


(defn match-queries
  "Create an ES match query that searches on the specified keys."
  [keys search-term]
  (map #(when % (q/match % search-term)) keys))


(defn term-queries
  "Create an ES term query that searches on the specified keys."
  [keys search-term]
  (map #(when % (q/term % search-term)) keys))


(defn query
  "Build an Elasticsearch bool query."
  [{:keys [state] :as params} search-term size from]
  (let [must-clause (concat
                      (range-queries params)
                      (when state (term-queries [:provider_state] state)))
        filter-clause (if search-term
                        (match-queries
                          [:drg_definition
                           :provider_name
                           :provider_street_address
                           :provider_city
                           :hospital_referral_region_description]
                          search-term)
                        [])]
    {:query {:bool {:must   must-clause
                    :filter {:bool {:should filter-clause}}}}
     :size  size
     :from  from}))


(defn search
  "Search for documents in ES."
  [params search-term size from]
  (try
    (let [es-query (query params search-term size from)
          _ (log/info es-query)
          res (esd/search *db* (env :es-index) "_doc" es-query)
          num-hits (esrsp/total-hits res)
          hits (esrsp/hits-from res)
          docs (map :_source hits)]
      (log/info "Found" num-hits "matches")
      {:total num-hits :providers docs})
    (catch Exception ex
      (log/error ex)
      (throw ex))))
