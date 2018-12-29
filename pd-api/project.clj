(defproject pd-api "0.1.0-SNAPSHOT"

  :description "FIXME: write description"
  :url "http://example.com/FIXME"

  :dependencies [[buddy "1.3.0"]
                 [cheshire "5.6.3"]
                 [clojurewerkz/elastisch "3.0.0"]
                 [clj-time "0.14.0"]
                 [com.auth0/jwks-rsa "0.2.0"]
                 [com.auth0/mvc-auth-commons "0.1.2"]
                 [commons-codec/commons-codec "1.10"]
                 [compojure "1.6.0"]
                 [cprop "0.1.10"]
                 [danlentz/clj-uuid "0.1.6"]
                 [funcool/struct "1.0.0"]
                 [luminus-immutant "0.2.3"]
                 [luminus-nrepl "0.1.4"]
                 [metosin/compojure-api "2.0.0-alpha7"]
                 [metosin/ring-http-response "0.8.2"]
                 [midje "1.9.4"]
                 [mount "0.1.11"]
                 [org.clojure/clojure "1.8.0"]
                 [org.clojure/tools.cli "0.3.5"]
                 [org.clojure/tools.logging "0.3.1"]
                 [prismatic/schema-generators "0.1.1"]
                 [ring-middleware-format "0.7.2"]
                 [ring-webjars "0.1.1"]
                 [ring/ring-core "1.6.0-RC1"]
                 [ring/ring-defaults "0.2.3"]
                 [ring-cors "0.1.10"]
                 [selmer "1.10.6"]]

  :min-lein-version "2.0.0"

  :jvm-opts ["-server" "-Dconf=.lein-env"]
  :source-paths ["src/clj"]
  :test-paths ["test/clj"]
  :resource-paths ["resources"]
  :target-path "target/%s/"
  :main ^:skip-aot pd-api.core

  :plugins [[lein-cprop "1.0.1"]
            [lein-cloverage "1.0.10"]
            [lein-immutant "2.1.0"]]

  :profiles {:uberjar       {:omit-source    true
                             :aot            :all
                             :uberjar-name   "pd-api.jar"
                             :source-paths   ["env/prod/clj"]
                             :resource-paths ["env/prod/resources"]}
             :dev           [:project/dev :profiles/dev]
             :test          [:project/test :profiles/test]
             :project/dev   {:dependencies   [[prone "1.1.4"]
                                              [ring/ring-mock "0.3.0"]
                                              [ring/ring-devel "1.5.1"]
                                              [org.clojure/data.generators "0.1.2"]]
                             :plugins        [[lein-midje "3.2.1"]]
                             :source-paths   ["env/dev/clj"]
                             :resource-paths ["env/dev/resources"]
                             :repl-options   {:init-ns user}}
             :project/test  {:resource-paths ["env/test/resources"]}
             :profiles/dev  {}
             :profiles/test {}})
