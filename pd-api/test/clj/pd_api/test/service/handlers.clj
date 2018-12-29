(ns pd-api.test.service.handlers
  (:require [midje.sweet :refer :all]
            [pd-api.service.handlers :refer :all]))


(facts "about selecting fields"
       (fact "it works when fields exist"
             (select-fields [:b :d] [{:a "foo" :b "bar" :c "baz" :d "bro"}
                                     {:a "lor" :b "em" :c "ipsum" :d "dolor"}])
             =>
             [{:b "bar" :d "bro"} {:b "em" :d "dolor"}])

       (fact "it works when fields might not exist"
             (select-fields [:b :d :e] [{:a "foo" :b "bar" :c "baz"}
                                        {:a "lor" :b "em" :c "ipsum"}])
             =>
             [{:b "bar"} {:b "em"}])

       (fact "it works with non-keyword fields"
             (select-fields ["b" "d"] [{:a "foo" :b "bar" :c "baz" :d "bro"}])
             =>
             [{:b "bar" :d "bro"}])

       (fact "it is skipped when fields are empty"
             (select-fields [] [{:a "foo" :b "bar"}
                                {:a "lor" :b "em"}])
             =>
             [{:a "foo" :b "bar"}
              {:a "lor" :b "em"}]

             (select-fields nil [{:a "foo" :b "bar"}
                                 {:a "lor" :b "em"}])
             =>
             [{:a "foo" :b "bar"}
              {:a "lor" :b "em"}]))


(facts "about validating fields"
       (fact "it validates correctly"
             (validate-fields ["provider_name", "provider_city"]) => ["provider_name", "provider_city"]
             (validate-fields []) => [])

       (fact "it throws correctly when invalid"
             (validate-fields ["foo"]) => (throws RuntimeException)))
