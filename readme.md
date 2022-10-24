## Instructions

Download the files of this repo to your local environment cd into the root directory i.e. frontend.
Then run the two followong commands at the terminal

docker build -t myimage .

docker run -d --name mycontainer -p 80:80 myimage

Then go to: http://127.0.0.1:80/docs

Then test out the API and/or build an application on it/ integrate with the  react front end.

Detailed steps for deploying on azure app service is given here: https://learn.microsoft.com/en-us/training/modules/deploy-run-container-app-service/

