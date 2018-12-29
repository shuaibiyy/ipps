# Inpatient Prospective Payment System Providers

A simple app to view data on [prospective payment system providers](https://data.cms.gov/Medicare-Inpatient/Inpatient-Prospective-Payment-System-IPPS-Provider/97k6-zzx3).

The [UI](./pd-ui) is written using [React](https://reactjs.org/), [Redux](https://redux.js.org/) & [Ant Design](https://ant.design/); while the [API](./pd-api) is written in [Clojure](https://clojure.org/). Instructions for running the [UI](./pd-ui) and [API](./pd-api) can be found in their respective READMEs.

## API

The API provides a single endpoint: `GET <hostname>/api/providers` that accepts the query parameters below.

### Query Parameters

| Parameter                       | Description                                     |
|---------------------------------|-------------------------------------------------|
| `max_discharges`                | The maximum number of Total Discharges          |
| `min_discharges`                | The minimum number of Total Discharges          |
| `max_average_covered_charges`   | The maximum Average Covered Charges             | 
| `min_average_covered_charges`   | The minimum Average Covered Charges             |
| `max_average_medicare_payments` | The maximum Average Medicare Payment            |
| `min_average_medicare_payments` | The minimum Average Medicare Payment            |
| `state`                         | The exact state that the provider is from       |
| `size`                          | The number of results to return       |
| `from`                          | The index from which to begin returning results |
| `term`                          | Query to search across `provider_name`, `hospital_referral_region_description`, & address fields |

### Response

The `/api/providers` endpoint responds with a list of providers, where each provider contains the properties listed on the [data.cms.gov site](https://data.cms.gov/Medicare-Inpatient/Inpatient-Prospective-Payment-System-IPPS-Provider/97k6-zzx3):
```
[
  'provider_name',
  'provider_street_address',
  'provider_city',
  'provider_state',
  'provider_zip_code',
  'hospital_referral_region_description',
  'total_discharges',
  'average_covered_charges',
  'average_total_payments',
  'average_medicare_payments'
]
```

## Database

The database used is [Elasticsearch (ES)](https://www.elastic.co/products/elasticsearch). ES provides state of the art search capabilities coupled with excellent performance. Currently, the search features of ES have barely been exploited, as the API only allows searching by keyword and filtering of results based on numeric ranges or keywords. There are a lot more ES features that can easily be incorporated, such as search keyword highlighting, autocomplete suggestions, typo correction etc.

### Limitation on Pagination

By default, Elasticsearch applies a limit on the number of documents that are paginated. This is done for performance reasons as allowing users to jump to random and very high page numbers can incur some serious performance penalties. This penalty is one paid especially by distributed systems as explained in an [ES documentation section](https://www.elastic.co/guide/en/elasticsearch/guide/current/pagination.html) titled "Deep Paging in Distributed Systems" in this documentation. There are several ways of implementing pagination in ES; see [here](https://www.elastic.co/guide/en/elasticsearch/reference/current/search-request-search-after.html), [here](https://www.elastic.co/guide/en/elasticsearch/reference/current/search-request-scroll.html), and [here](https://www.elastic.co/guide/en/elasticsearch/guide/current/pagination.html). I opted to go with the `from` parameter method and keep the maximum number of pageable results as the default, which is 10,000 documents.

Due to the page limit, users will have to use the search and filter functions to narrow down results that run over 10,000 in number. Nonetheless, I don't think pagination makes for a great user experience; searching and filtering are arguably better.

## UI Features

### Search

The UI provides a field to search on providers' fields, namely: provider name, street address, city, state, hospital referral region description, and DRG definition. The search returns a provider if any of its aforementioned fields contains a word that matches the search term.

### Filters

The UI provides sliders that can be used to set the minimum and maximum of values for these fields: total discharges, average covered charges, average medicare payments. The application fetches only the providers with values that are within all the requested ranges.

Also available is a select box to restrict providers to a particular state.

### Field Exclusion

The UI allows users to exclude provider fields of their choosing. I opted for allowing exclusion rather that requiring inclusion as the latter can get a bit tiresome pretty quickly. This, of course, is based on the assumption that the user finds the majority of fields useful.

### Sorting

This is a limited feature, as users can currently only sort results on a single page. There are 20 results per page by default. The API supports requesting for dynamic result sizes, but that feature is not available on the UI. Users can sort results by provider name, total discharges, average covered charges, average medicare payments, and average total payments.

### Jump to Page

Users can jump to any page within a maximum of 500 pages. The decision behind this is mentioned in the [Limitation on Pagination](#limitation-on-pagination) section.

## Authentication

I implemented authentication for the application using [Auth0](https://auth0.com/); a platform that provides authentication and authorization as a service. Auth0 is well-known for offering and advocating for superior security tooling and practices. They offer libraries for the frontend and backend to simplify integration. On the frontend, I used [Lock](https://auth0.com/docs/libraries/lock/v11); and on the backend, I used the [jwks-rsa](https://github.com/auth0/jwks-rsa-java) Java library. Using a Java library in a Clojure project is quite convenient.

The application allows login and signup via a Google account or username and password.

Note that the API does not provide a login endpoint. An API token can be retrieved by logging in via the UI and copying the `Bearer` token from an API request's `Authorization` header, which is visible in any developer console.

# License

MIT
