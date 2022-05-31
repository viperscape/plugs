# API Key Service
This is a basic template for generating and storing API keys, for some imagined service. You can run this in parallel on different systems for load balancing, ideally after verification you can pass the request on to some backend service.
This should sit behind a SSL reverse proxy, such as Nginx

## Persistent Storage
This example uses [Azure Tables](https://azure.microsoft.com/en-us/services/storage/tables/) as a backend store. It's also one of the *simplest* cloud scaling data stores to set up.
The created and verified API keys are cached in memory for faster, future comparison.
Each key is encrypted using bcrypt hashing algorithm, considered a best practice.

## License
Copyright 2022 Chris Gill

Licensed under the [Apache License, Version 2.0](LICENSE)