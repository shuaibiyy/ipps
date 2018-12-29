(ns pd-api.test.db.core
  (:require [midje.sweet :refer :all]
            [pd-api.config :refer [env]]
            [pd-api.db.core :refer :all]))


(facts "about range queries"
       (fact "range queries can be constructed with both bounds"
             (range-query :foo 5 10) => {:range {:foo {:gte 5 :lte 10}}})

       (fact "range queries can be constructed with only one bound"
             (range-query :foo 5 nil) => {:range {:foo {:gte 5}}}
             (range-query :foo nil 10) => {:range {:foo {:lte 10}}})

       (fact "range queries are not constructed when no bound is specified"
             (range-query :foo nil nil) => nil))


(facts "about match queries"
       (fact "match queries can be constructed for a single key"
             (match-queries [:foo] "yeti") => [{:match {:foo {:query "yeti"}}}])

       (fact "match queries can be constructed for multiple keys"
             (match-queries [:foo :bar] "yeti") => [{:match {:foo {:query "yeti"}}}
                                                    {:match {:bar {:query "yeti"}}}])

       (fact "match queries is not constructed when no key is specified"
             (match-queries [] "yeti") => []))


(facts "about term queries"
       (fact "match queries can be constructed for a single key"
             (term-queries [:foo] "yeti") => [{:term {:foo "yeti"}}])

       (fact "match queries can be constructed for multiple keys"
             (term-queries [:foo :bar] "yeti") => [{:term {:foo "yeti"}}
                                                   {:term {:bar "yeti"}}])

       (fact "match queries is not constructed when no key is specified"
             (term-queries [] "yeti") => []))


(facts "about range queries"
       (fact "range queries can be constructed for an arbitrary selection of keys"
             (range-queries {:min_discharges                5 :max_discharges 10
                             :min_average_covered_charges   6 :max_average_covered_charges 11
                             :min_average_medicare_payments 7 :max_average_medicare_payments 12})
             =>
             [{:range {:total_discharges {:gte 5 :lte 10}}}
              {:range {:average_covered_charges {:gte 6 :lte 11}}}
              {:range {:average_medicare_payments {:gte 7 :lte 12}}}]

             (range-queries {:min_discharges                5
                             :max_average_covered_charges   11
                             :min_average_medicare_payments 7})
             =>
             [{:range {:total_discharges {:gte 5}}}
              {:range {:average_covered_charges {:lte 11}}}
              {:range {:average_medicare_payments {:gte 7}}}]

             (range-queries {}) => []))


(facts "about search queries"
       (fact "search queries can be constructed with all params"
             (query {:min_discharges                5 :max_discharges 10
                     :min_average_covered_charges   6 :max_average_covered_charges 11
                     :min_average_medicare_payments 7 :max_average_medicare_payments 12
                     :state                         "AL"} "foo" 20 10)
             =>
             {:query {:bool {:filter {:bool {:should [{:match {:drg_definition {:query "foo"}}}
                                                      {:match {:provider_name {:query "foo"}}}
                                                      {:match {:provider_street_address {:query "foo"}}}
                                                      {:match {:provider_city {:query "foo"}}}
                                                      {:match {:hospital_referral_region_description {:query "foo"}}}]}}
                             :must   [{:range {:total_discharges {:gte 5 :lte 10}}}
                                      {:range {:average_covered_charges {:gte 6 :lte 11}}}
                                      {:range {:average_medicare_payments {:gte 7 :lte 12}}}
                                      {:term {:provider_state "AL"}}]}}
              :size  20
              :from  10})

       (facts "search queries can be constructed with arbitrary selections of keys"
              (query {:min_discharges                5
                      :max_average_medicare_payments 10} nil 20 10)
              =>
              {:query {:bool {:filter {:bool {:should []}}
                              :must   [{:range {:total_discharges {:gte 5}}}
                                       {:range {:average_medicare_payments {:lte 10}}}]}}
               :size  20
               :from  10}

              (query {:max_average_covered_charges 100 :state "AL"} nil 20 10)
              => {:query {:bool {:filter {:bool {:should []}}
                                 :must   [{:range {:average_covered_charges {:lte 100}}}
                                          {:term {:provider_state "AL"}}]}}
                  :size  20
                  :from  10}

              (query {} "foo" 20 10)
              =>
              {:query {:bool {:filter {:bool {:should [{:match {:drg_definition {:query "foo"}}}
                                                       {:match {:provider_name {:query "foo"}}}
                                                       {:match {:provider_street_address {:query "foo"}}}
                                                       {:match {:provider_city {:query "foo"}}}
                                                       {:match {:hospital_referral_region_description {:query "foo"}}}]}}
                              :must   []}}
               :size  20
               :from  10}

              (query {} nil 20 10) => {:query {:bool {:must [] :filter {:bool {:should []}}}} :size 20 :from 10}))
