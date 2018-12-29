(ns pd-api.handler
  (:require [compojure.core :refer [routes wrap-routes]]
            [compojure.route :as route]
            [pd-api.env :refer [defaults]]
            [pd-api.service.routes :refer [service-routes]]
            [pd-api.middleware :as middleware]
            [mount.core :as mount]))

(mount/defstate init-app
                :start ((or (:init defaults) identity))
                :stop ((or (:stop defaults) identity)))

(def app-routes
  (routes
    #'service-routes
    (route/not-found
      "page not found")))


(defn app [] (middleware/wrap-base #'app-routes))
