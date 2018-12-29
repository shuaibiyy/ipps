(ns pd-api.middleware
  (:require [clojure.java.io :as io]
            [clojure.walk :refer [keywordize-keys]]
            [pd-api.env :refer [defaults]]
            [ring.util.http-response :refer [unauthorized]]
            [immutant.web.middleware :refer [wrap-session]]
            [ring.middleware.cors :refer [wrap-cors]]
            [ring.middleware.defaults :refer [site-defaults wrap-defaults]]
            [buddy.auth.accessrules :refer [restrict]]
            [buddy.auth :refer [authenticated?]]
            [clojure.string :as str]
            [cheshire.core :as json]
            [clojure.tools.logging :as log])
  (:import (com.auth0.jwt JWTVerifier JWTExpiredException)
           (org.apache.commons.codec.binary Base64)
           (com.auth0.jwk UrlJwkProvider)))


(def auth-config
  (try
    (clojure.edn/read-string (slurp (io/resource "auth/config.edn")))
    (catch Exception _
      (log/error "Unable to read auth/config.edn file. View README for instructions on how to create one."))))


(defn- on-error [request response]
  {:status  403
   :headers {}
   :body    (str "Access to " (:uri request) " is not authorized")})


(defn- wrap-restricted [handler]
  (restrict handler {:handler  authenticated?
                     :on-error on-error}))


(defn- auth-bearer-token [req]
  "Extracts a token from an Authorization header."
  (second (str/split (get-in req [:headers "authorization"] "") #"\s")))


(defn- jwt-kid [token]
  "Extracts the key identifier (kid) of a JWT token"
  (try
    (-> token
        (clojure.string/split #"\.")                        ;; split into header, body, signature
        first                                               ;; get the header
        Base64/decodeBase64                                 ;; read it into a byte array
        String.                                             ;; byte array to string
        json/decode
        keywordize-keys
        :kid)
    (catch Exception e nil)))


(defn- pub-key [token]
  "Gets the public key for a JWT token from a JWKS"
  (let [provider (UrlJwkProvider. (:issuer auth-config))
        kid (jwt-kid token)]
    (when kid
      (let [jwk (.get provider kid)]
        (.getPublicKey jwk)))))


(defn verify [token]
  "Verifies a JWT token"
  (let [key (pub-key token)
        {audience :audience
         issuer   :issuer} auth-config]
    (.verify (JWTVerifier. key audience issuer) token)))


(def +unprotected-methods+ #{:options})


(def +unprotected-uris+ #{"/swagger.json" "/swagger-ui" "/api/health"})


(defn- unprotected? [req]
  (or (+unprotected-methods+ (:request-method req))
      (some #(str/starts-with? (:uri req) %) +unprotected-uris+)))


(defn- wrap-token-verification [handler config]
  (fn [req]
    (if (unprotected? req)
      (handler req)
      (let [access-token (auth-bearer-token req)]
        (if access-token
          (try
            (let [user (verify access-token)]
              (handler (assoc req :user (keywordize-keys (into {} user)))))
            (catch JWTExpiredException e
              (log/error (.getMessage e))
              (unauthorized "Token expired. You need to re-login"))
            (catch Exception e
              (log/error (.getMessage e))
              (unauthorized "Invalid access token")))
          (unauthorized "No access token provided"))))))


(defn wrap-base [handler]
  (-> ((:middleware defaults) handler)
      (wrap-token-verification auth-config)
      (wrap-cors :access-control-allow-origin [#".*"]
                 :access-control-allow-methods [:get :put :post :delete])
      (wrap-session {:cookie-attrs {:http-only true}})
      (wrap-defaults
        (-> site-defaults
            (assoc-in [:security :anti-forgery] false)
            (dissoc :session)))))
