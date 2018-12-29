# IPPS Providers UI 

This project was bootstrapped with [Create React App](https://github.com/facebookincubator/create-react-app).

In the following sections, you'll find some information on how to perform common tasks.<br>
You can find the most recent and detailed version of the Create React App guide [here](https://github.com/facebookincubator/create-react-app/blob/master/packages/react-scripts/template/README.md).

## Structure

The code is structured in folders that are each loosely tied to a feature.
Feature folders enclose their own actions, reducers, components, and stylesheets.
Also, a feature's folder may contain its children components for the sake of convenience.

## Prerequisites

### Authentication

This project uses [Auth0](https://auth0.com/). You'll need to have an Auth0 SPA configured to allow your origin e.g. localhost:3000 for authentication callback, CORS requests and Cross-Origin authentication.
In order to configure the project to use your Auth0 configuration, you'll need to create an `.env` file by copying [`.env.test`](./.env.test) and filling in the missing Auth0 values.

### API

The API for this project can be found in the [pd-api](../pd-api) folder. The API must be running in order for the frontend to work properly.
The project can be configured with the API's URL by copying [`.env.test`](./.env.test) to `.env` and filling in the value for the `REACT_APP_API_URL` property. 

## Running

Install dependencies:

    npm install
    
Run the app in development mode:

    npm start

Open [http://localhost:3000](http://localhost:3000) to view it in the browser. The page will reload if you make edits.

## Testing

Tests are written using [Jest](https://jestjs.io/) and [Enzyme](https://github.com/airbnb/enzyme).
Test files are always located in the same folder as the code they are testing.

Launch the test runner in an interactive watch mode:

    npm test

To run tests once and finish the process, set an environment variable called `CI`:

    CI=true npm test

## Deployment on S3

Hosting the website on S3 is done in 3 stages:
1. Building and packaging source files and assets.
2. Storing the `build` folder generated in the [Packaging](#1-building-and-packaging) step in an S3 bucket that has website hosting enabled.
3. Creating a Cloudfront distribution to provide access to the website.

### Deployment Prerequisites

* AWS account credentials
* S3 bucket with website hosting enabled
* [Terraform](https://www.terraform.io/) (tested against v0.11.11)

### 1. Building and Packaging

    npm run build 

Builds the app for production to the `build` folder.<br>
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br>
The app is ready to be deployed!

### 2. Storing on S3

    S3_BUCKET=<bucket_name> npm run deploy

### 3. Creating a Cloudfront Distribution

This project uses [Terraform](https://www.terraform.io/) to automate the cloudfront distribution creation steps.
The terraform configuration can be found in the [deploy](./deploy) directory.

The terraform configuration assumes the user is deploying the website to a domain name and S3 bucket that have the same name.
For example, the user has a domain named `foobar.com` and a corresponding S3 bucket named `foobar.com`. 

This terraform configuration deploys a static website to S3. It also stores the terraform state remotely in an S3 bucket.
Terraform commands are run via a Makefile created to simplify [state management](https://www.terraform.io/docs/state/).
The Makefile by default sets up a copy of the remote state if it does not exist and runs a terraform command depending on the target.

Before running the Makefile, your AWS credentials must be configured or made available to terraform through environment variables.
See [terraform authentication docs](https://www.terraform.io/docs/providers/aws/#authentication) for more info.

Initialize Terraform:
```
terraform init
```

Create distribution:
```
STATE_BUCKET="<s3_bucket>" TF_VAR_acm_certificate_arn="<acm_certificate_arn>" TF_VAR_s3_bucket_name="<s3_bucker>" make apply 
```

There are also terraform [plan](https://www.terraform.io/docs/commands/plan.html) and [destroy](https://www.terraform.io/docs/commands/destroy.html) targets available in the Makefile.

__The Makefile idea (and the Makefile itself) is taken from this [blog post](http://karlcode.owtelse.com/blog/2015/09/01/working-with-terraform-remote-statefile/).__

## License

MIT
