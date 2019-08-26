[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/alvarcarto/g-proxy)

# g-proxy

> Google authentication for internal services

This proxy handles sessions and makes it easy to secure internal services
behind a Google Authentication. It acts as a gatekeeper to make sure only authenticated users
are allowed to make requests to the origin. All requests are proxied to the origin as is, except
for `/login` and `/logout` paths.

![](docs/gproxy.svg)

The origin will receive following headers from the proxy:

* `x-key: <secret>` Where secret is a shared secret between the proxy and origin. If the secret is correct, the origin can trust other headers.
* `x-user-name: John Doe` Name of the authenticated user.
* `x-user-email: john.doe@company.com` Email of the authenticated user.
* `x-user-photo-url: https://gstatic.google.com/profile.jpg` Profile picture url for the authenticated user.


## FAQ

### How to log out?

You redirect the user to `/logout` path, which will be handled at proxy level and causes session
to be terminated.


## Get started

1. Install node environment
1. Follow instructions in https://github.com/bitly/oauth2_proxy to create Google OAuth2 client id and secret
1. `npm i`
1. `cp .env.sample .env` and fill the blanks
1. `npm start`
