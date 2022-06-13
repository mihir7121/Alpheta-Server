
# Alpheta Server

The backend server for Alpheta, written in NodeJS.

## Configuring

In order to configure the server, add a `.env` file in the project root with the following format:

```
OPENSEA_API_KEY=
PORT=17655
JWT_SECRET=
MONGO_USER=
MONGO_PASS=
MONGO_URI=
```

Fill in these details as required. Note that the `MONGO_URI` is without the username and password. These are passed in as separate environment variables.

### Running

If you are running for the first time, navigate to the project directory and run the following command:

```
npm install
```

This will install all necessary modules for the server to run. 

Next, to start the server, run:
```
npm start
```