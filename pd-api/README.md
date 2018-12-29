# IPPS Providers API

Written in [Clojure](https://clojure.org/) using [Compojure-api](https://github.com/metosin/compojure-api).

## Prerequisites

* [Leiningen 2.0][1] 2.0 or above
* [Elasticsearch 6.x][2]

[1]: https://github.com/technomancy/leiningen
[2]: https://github.com/elastic/elasticsearch

### Authentication

This project uses [Auth0](https://auth0.com/). You'll need to have an Auth0 SPA configured for the frontend to authenticate with the backend.
In order to configure the project to use your Auth0 configuration, you'll need to create two files in the [auth](./resources/auth) folder:
1. `config.edn` by simply copying [`config.edn.tpl`](./resources/auth/config.edn.tpl) located in the same folder and filling in the missing values.
2. `jwks.json` typically located at `https://YOUR_AUTH0_DOMAIN/.well-known/jwks.json`. Read [Auth0 docs](https://auth0.com/docs/jwks) for more info.

## Running

### Database Importer

The importer is a Python script that imports the providers data into Elasticsearch (ES). It is located in the [importer](./importer) folder.
The importer performs 3 main steps:
1. Exports the CSV data into a JSON file.
2. Creates an ES index and mapping for the data.
3. Bulk imports the data into ES.

Before running the importer, ensure the properties in [conf.ini](./importer/conf.ini) are correct.

#### Importer Prerequisites

* Python 3.6.x or 2.7.x

Install dependencies:

    cd importer
    pip install -r requirements.txt

#### Run Importer

    python import.py

After the importer is run, the database should be ready for use.

### API

Start your Elasticsearch (ES) and create a file called `profiles.clj` in the root directory of the API with the following content (substituting `<es_url>` with your ES URL):
```clojure
{:profiles/dev  {:env {:es-url   "http://localhost:9200"
                       :es-index "pd"}}}
```
There's a helper script for running ES in a docker container:

    ./db.sh run

To start a web server for the application, run:

    lein run

Alternatively, start a repl:

    lein repl

and execute this expression in the repl to start the server:
```clojure
(restart)
```

## Testing

Tests are written using [Midje](https://github.com/marick/Midje). They can be found in the [test](./test) folder.
Only Leiningen is required to run the tests.

    lein midje

Tests can be run in watch mode by executing these expressions in the repl:
```clojure
(use 'midje.repl)

(autotest)
```
or run at the command line:

    lein midje :autotest

## Deployment

First you'd need to create an uberjar:

    lein uberjar

Then run the uberjar on your server:

     ES_URL=http://<es_host>:<es_port> ES_INDEX=pd java -jar target/uberjar/pd-api.jar

There's also a [Dockerfile](./Dockerfile) available for container deployment.

## License

MIT
