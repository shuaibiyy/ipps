(ns pd-api.env
  (:require [clojure.tools.logging :as log]))

(def defaults
  {:init
   (fn []
     (log/info "\n-=[pd-api started successfully]=-"))
   :stop
   (fn []
     (log/info "\n-=[pd-api has shut down successfully]=-"))
   :middleware identity})
