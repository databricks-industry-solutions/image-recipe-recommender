## Instructions

### To run this locally

Install Docker Desktop on your machine

Download the files of this repo to your local environment cd into the root directory i.e. backend.
Then run the following two commands at the terminal

docker build -t myimage .

docker run -d --name mycontainer -p 80:80 myimage

Then go to: http://127.0.0.1:80/docs

Then test out the API and/or build an application on it/ integrate with the  react front end.

### To Deploy this to Azure App Service

Detailed steps for deploying on azure app service is given here: https://learn.microsoft.com/en-us/training/modules/deploy-run-container-app-service/ and here: https://code.visualstudio.com/docs/containers/app-service
