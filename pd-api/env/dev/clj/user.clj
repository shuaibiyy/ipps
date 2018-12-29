(ns user
  (:require [mount.core :as mount]
            [pd-api.config :refer [env]]
            pd-api.core))

(defn start []
  (do (mount/start-without #'pd-api.core/repl-server)))

(defn stop []
  (mount/stop-except #'pd-api.core/repl-server))

(defn restart []
  (stop)
  (start))
