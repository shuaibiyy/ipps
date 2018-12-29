(ns pd-api.env
  (:require [selmer.parser :as parser]
            [clojure.tools.logging :as log]
            [pd-api.dev-middleware :refer [wrap-dev]]))

(def defaults
  {:init
   (fn []
     (parser/cache-off!)
     (log/info "\n-=[pd-api started successfully using the development profile]=-"))
   :stop
   (fn []
     (log/info "\n-=[pd-api has shut down successfully]=-"))
   :middleware wrap-dev})
