(ns pd-api.service.handlers
  (:require [buddy.auth :refer [authenticated?]]
            [buddy.auth.accessrules :refer [restrict]]
            [clojure.string :as str]
            [compojure.api.meta :refer [restructure-param]]
            [pd-api.db.core :refer [*db*] :as db]
            [pd-api.service.schema :refer [ProviderFields]]
            [ring.util.http-response :refer :all]
            [slingshot.slingshot :refer [try+ throw+]]
            [schema.core :as s]))


(defn access-error [_ _]
  (unauthorized {:error "unauthorized"}))


(defn wrap-restricted [handler rule]
  (restrict handler {:handler  rule
                     :on-error access-error}))


(defmethod restructure-param :auth-rules
  [_ rule acc]
  (update-in acc [:middleware] conj [wrap-restricted rule]))


(defmethod restructure-param :current-user
  [_ binding acc]
  (update-in acc [:letks] into [binding `(:identity ~'+compojure-api-request+)]))


(defn select-fields
  [fields docs]
  (if (empty? fields)
    docs
    (let [fs (map keyword fields)]
      (map #(select-keys % fs) docs))))


(defn validate-fields
  [fields]
  (try
    (s/validate ProviderFields fields)
    (catch RuntimeException _
      (throw
        (ex-info "Oh no!"
                 {:status 400
                  :body   {:message "Invalid field(s) specified in field query param"}})))))


(defn fetch-providers
  [params fields term size from]
  (try+
    (let [fs (if (empty? fields) [] (str/split fields #","))
          _ (validate-fields fs)
          body (db/search params term size from)
          docs (select-fields fs (:providers body))]
      (ok (assoc body :providers docs)))
    (catch [:status 400] {:keys [body]}
      (bad-request body))
    (catch [:status 406] _
      (not-acceptable))
    (catch Exception _
      (internal-server-error))))
