OAuth 2 Overview

# OAuth 2 Overview

OAuth provides client applications secure delegated access to Skyswitch Telco API resources on behalf of a resource owner. Resource owners authorize clients to access their Telco API resources. OAuth allows access tokens to be issued to clients, with the approval of the resource owner. The client then uses the access token to access the protected resources hosted by the Telco API.

## Roles

### Resource Owner

An entity capable of granting access to a protected resource. In the case of the Telco API, this is any reseller of SkySwitch.

### Client

An application making protected resource requests on behalf of the resource owner and with the resource owner's authorization. This could be the SkySwitch-hosted interface for the Telco API, or a customer-developed interface which interacts with the Telco API.

### Resource Server

The resource server is the API used to access the resource owner's information. This is the Telco API.

## Client ID & Secret

After registering your application with SkySwitch, you will receive a client ID and a client secret, used by the Telco API to authenticate the client. The client ID is considered public information. The client secret must be kept confidential.

Contact the Skyswitch Control Tower to get the client ID and client secret.

## Authorization

The first step of OAuth 2 is to get authorization from the user. While the OAuth 2 specification  provides several "grant types" for different use cases, the Telco API supports the password grant type.

### Resource Owner Password Credentials

The resource owner's credentials (i.e., username and password) can be used directly to obtain an access token.  The credentials should only be used when there is a high degree of trust between the resource owner and the client.

Even though this grant type requires direct client access to the resource owner credentials, the resource owner credentials are used for a single request and are exchanged for an access token.  This grant type eliminates the need for the client to store the resource owner credentials for future use, by exchanging the credentials with a long-lived access token or refresh token.

## Scopes

Scopes let the client specify exactly what type of access it needs to the resource owner's account. Scopes limit the access of OAuth tokens. They do not grant any additional permission beyond that which the resource owner already has.

| Scope         | Description                                                                                                                                                                                        |
| :------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| account       | Allows client to interact with the resource owner's accounts. This includes the account associated with the resource owner and any child accounts.                                                 |
| user          | Allows application to manage users.                                                                                                                                                                |
| catalog       | Allows client to view catalog of purchasable phone numbers.                                                                                                                                        |
| phone\_number | Allows client to manage the resource owner's inventory. This includes purchasing phone numbers from the catalog, adding BYOT phone numbers and disconnecting phone numbers.                        |
| routing       | Allows client to manage the routing of the resource owner's phone numbers. This includes routing and unrouting phone numbers.                                                                      |
| e911          | Allows client to manage the e911 services of the resource owner. This includes adding, creating, updating and deleting e911 services for phone numbers.                                            |
| billing       | Allows client to manage the billing information for the resource owner's account(s).                                                                                                               |
| lnp           | Allows client to manage local number portability requests belonging to the resource owner. This includes creating new requests, as well as reading, supplementing and canceling existing requests. |
| back\_office  | Allows client to perform back office functionality on behalf of the resource owner. This functionality is reserved for SkySwitch staff.                                                            |
| carrier       | Allows application to manage carriers.                                                                                                                                                             |
| pbx           | Allows application to manage pbx.                                                                                                                                                                  |
| entitlement   | Allows application to manage entitlements services.                                                                                                                                                |
| uc\_config    | Allows application to manage uc config services.                                                                                                                                                   |
| messaging     | Allows application to manage messaging services.                                                                                                                                                   |
| report        | Allows application to manage reports services.                                                                                                                                                     |
| branding      | Allows application to manage branding services.                                                                                                                                                    |
| port-in       | Allows application to manage port-in services.                                                                                                                                                     |
| ten\_dlc      | Allows application to manage 10-dlc services.                                                                                                                                                      |
| tollfree\_a2p | Allows application to manage toll-free A2P services.                                                                                                                                               |

## Authorization Header

For API calls other than those in this Auth section, the access token must be passed as a bearer token in an Authorization header.

```shell Authorization Header
curl -X GET \
  https://api.skyswitch.com/resource \
  -H 'Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6Ijc1Njk3N2ViOWQxNDEyM2NhODQwNWNjOGZlZDRmNWEwMzMxODFhODg0YzNhY2EzYTRjYzVmNmQ4OWUxYzFlMThkMDdjNDIzODk5OTcxYTM0In0.eyJhdWQiOiI1IiwianRpIjoiNzU2OTc3ZWI5ZDE0MTIzY2E4NDA1Y2M4ZmVkNGY1YTAzMzE4MWE4ODRjM2FjYTNhNGNjNWY2ZDg5ZTFjMWUxOGQwN2M0MjM4OTk5NzFhMzQiLCJpYXQiOjE1NzE4NDYzNDIsIm5iZiI6MTU3MTg0NjM0MiwiZXhwIjoxNTcxODY3OTQyLCJzdWIiOiI3MTgiLCJzY29wZXMiOlsiKiJdfQ.abS1c36zgy1KHnj2d7Gq-aL3zrNq8D1u1AcF6dXRhwZOaWy2yQEYx_tqGY9O-lb_vpL_OOu9hLcprnTwxIiU6Li6f7TLv3lZsKD2bQMB05ie9CLhFd6CrDNnOt5k-RgM3zRIWrjsbv1uN_B9BHm4zkTza2ee0cXuyrVkRungKyKnxwDQAU-zNTv1Q8PH2eBE_rgNbinOeU5fXxJxk4oYVMbct9ihg-ZMjtlUzIXaZZBifh6fOvwB6eDUO3EG-QMiAb1Cq5XNtGuAtXw_NJO9AbYauVtJm-keCOwBdTbNaAGEwz6RWvlw08BZRWl-GbXSz4TtrM8sPaAqm3-8JkhJUmyURzkDN9dh4G-mtaTThaSMdKvAllVM8NKY4BUgc_dGIhjrY2kYDy7YtW9KymAEEYrJlhk5rCHmEAoh0tjfhmiNuQKdFXaRL2UN8uxE65jVB67gZgZRpBpZYwtL7Zp1DYLIp9m3pwXVVU9sz44cpJa0UTt_CGnITPZn7yffJ4bnUNLn9-U4SzlAmguZtdEpWux3Tzpwmjk_NG7_guAX7Ze-Tel6MHnUflgwQU3eNpZvf95JunsMmC_g2piVN44tJYmdrmqQoj8uCBkybCW34GokrkBEbKMHvQSBv3oEL55SpmydoQQs1cmtfnbV0BSlUytxWrzaqjqSn7lsZMHhr-I' \
```

Obtain Access Token

# Obtain Access Token

Allows a registered application to obtain an OAuth 2 Bearer Token, which can be used to make API requests on the resource owner's behalf.

[block:callout]
{
  "type": "warning",
  "title": "Special Characters",
  "body": "In retrieving for an access token, make sure to use --data-urlencode (instead of -d) if your credentials contain special characters."
}
[/block]

# OpenAPI definition

```json
{
  "openapi": "3.1.0",
  "info": {
    "title": "Authentication",
    "version": "1.0"
  },
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "security": [
    {}
  ],
  "paths": {
    "/oauth/token": {
      "post": {
        "summary": "Obtain Access Token",
        "description": "Allows a registered application to obtain an OAuth 2 Bearer Token, which can be used to make API requests on the resource owner's behalf.",
        "operationId": "obtain-access-token",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": [
                  "grant_type",
                  "client_id",
                  "client_secret"
                ],
                "properties": {
                  "grant_type": {
                    "type": "string",
                    "description": "The grant type to be used. Currently only 'password' and 'refresh_token' are supported."
                  },
                  "client_id": {
                    "type": "string",
                    "description": "The SkySwitch assigned client id for the application."
                  },
                  "client_secret": {
                    "type": "string",
                    "description": "The secret associated with the client. A mechanism for authorizing the client."
                  },
                  "username": {
                    "type": "string",
                    "description": "The resource owner's username. Required in retrieving an access token."
                  },
                  "password": {
                    "type": "string",
                    "description": "The resource owner's password.  Required in retrieving an access token."
                  },
                  "scope": {
                    "type": "string",
                    "description": "Space separated list of scopes. You may use asterisk (*) to use all scopes.  Required in retrieving an access token."
                  },
                  "refresh_token": {
                    "type": "string",
                    "description": "The refresh token previously received from the api. Used for refreshing a token."
                  }
                }
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "200",
            "content": {
              "application/json": {
                "examples": {
                  "Access Token": {
                    "value": "{\n  \"token_type\":\"Bearer\",\n  \"expires_in\":21600,\n  \"access_token\":\"eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6ImVjMmMxNjA0MmY1MjU1YjAwMTU1MWVlMmEzMGRhODIwMmEwMjY1OTI0N2MxODFjNTYxZDk4MjI2MzRiMmJlZmRhNTJmYjE4NTQwNjg3OGM1In0.eyJhdWQiOiIyNSIsImp0aSI6ImVjMmMxNjA0MmY1MjU1YjAwMTU1MWVlMmEzMGRhODIwMmEwMjY1OTI0N2MxODFjNTYxZDk4MjI2MzRiMmJlZmRhNTJmYjE4NTQwNjg3OGM1IiwiaWF0IjoxNTcyMjUxNzg0LCJuYmYiOjE1NzIyNTE3ODQsImV4cCI6MTU3MjI3MzM4NCwic3ViIjoiMTg5OSIsInNjb3BlcyI6W119.Y3QrA2nvjIvA4lb0Q8ktBc26JnrmKy_rzvi2n5uE3RCGqxv8S2llGOHuv_nJtpE8sWZlqxk-Fjd-Zme_gUcV9doFgLk2GXR0qpZmZSIHuwwVf58QsyL2BzieYEqsh7NG6DdfU4ImpzH8e5R1VMBcAH_ckEBz71Mbg7YeXq1xlWv82sT2uHb2UCgj_ZeV_v7qfxmTK93Z6sVep10JyMrc8quyUlRlB03DrYy2AYLqxc4dRtW2xUwbm33ufmtgXC4c5z-Cv977jSFJX2SxOTDbe0Sk7Bgl4J5qADhwthVk5N5IqxcZ_iwlJCxXL35ZBUyw2aUz17qWrUUzkrwYirSAKDZYwMan3WZw6Lqjhv8JOQKeCTyoIFNjYmbeQf_0mcym2mnamANuy2lsqaz2G6vYkQY9bKIC6jVbE23LhedjRuuBaYcWzi-PSCzLE3HQBEHS5SSlIb_4qGqexQs1i33QsMfjzKMO6dU10LsXi23M1YM1K5UEnbpd_sVf4R_bEDtI-NO_P3cCoqnM5FIaZJzqN9oBnUrHbgM16O0xeLVG6ulYKZ3Vty6mrqIzRSmUgndOa-D3d5bUT4V-Ohni3RMp5ZsD1ut5h0ACAuC6VRK1r_fhpdvOhMv5lVB0zY6CDCqQ0L60ahiSOXlyqlkrcIOBp7ydIWmEya0ChvCOzmNqLZw\",\n  \"refresh_token\":\"def5020031e62869a95d76aeb7032d69baebe4acb6fff8447306ab0a2c8f3f47e9e7894ab67a17757f6c032dac6a9487560354621a6daf8cb9af825f73ac3e31ff041125ff95befcb69cd1f59583eb60fcd9853e0407b88c665e5f4343e014f7d675039f2af5238296efad0760ef62c26cbed6128fd0e08734516c2baa943c0a657c812c57cf96a6143257fccfbe9e0254a9871d7632188e110e22175bd185a4b31eea735e972c7cfb94be94b29272783f2f8aae9e7cf31a091fd4def6946bf7ff2a76537e7fed4a4b90271a764590050b84fd2deaeea44ff12b3b805972bd1789358f91e173fb4ffac1b380a81cc66de4c556fc66011aa9b9d199047e616f66623f0b68f197a6cf860777d0fb06ca54f9be8166accd2b5372bce313a0216bc1a8e4f138681c62d8acc5452c53058d6c4aa7c11059461b32db3b3900f21b400828d1001f793f071638e1af4e742f036f4d7b4df19b4fc607b5f5c2f9443151a9b345509a02\"\n}"
                  },
                  "Refresh Token": {
                    "value": "{\n \t \"access_token\":\"sbPyarhcOxmLVwuUfKSz8i5uOadIBgmtNDGmQBSZ\",\n \t \"token_type\":\"Bearer\",\n\t \"expires_in\":21600,\n\t \"refresh_token\":\"ZbRnNDXia3Crv3K6pGySVJ6KeU5C530BHbcGh41W\"\n}"
                  }
                },
                "schema": {
                  "oneOf": [
                    {
                      "title": "Access Token",
                      "type": "object",
                      "properties": {
                        "token_type": {
                          "type": "string",
                          "example": "Bearer"
                        },
                        "expires_in": {
                          "type": "integer",
                          "example": 21600,
                          "default": 0
                        },
                        "access_token": {
                          "type": "string",
                          "example": "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6ImVjMmMxNjA0MmY1MjU1YjAwMTU1MWVlMmEzMGRhODIwMmEwMjY1OTI0N2MxODFjNTYxZDk4MjI2MzRiMmJlZmRhNTJmYjE4NTQwNjg3OGM1In0.eyJhdWQiOiIyNSIsImp0aSI6ImVjMmMxNjA0MmY1MjU1YjAwMTU1MWVlMmEzMGRhODIwMmEwMjY1OTI0N2MxODFjNTYxZDk4MjI2MzRiMmJlZmRhNTJmYjE4NTQwNjg3OGM1IiwiaWF0IjoxNTcyMjUxNzg0LCJuYmYiOjE1NzIyNTE3ODQsImV4cCI6MTU3MjI3MzM4NCwic3ViIjoiMTg5OSIsInNjb3BlcyI6W119.Y3QrA2nvjIvA4lb0Q8ktBc26JnrmKy_rzvi2n5uE3RCGqxv8S2llGOHuv_nJtpE8sWZlqxk-Fjd-Zme_gUcV9doFgLk2GXR0qpZmZSIHuwwVf58QsyL2BzieYEqsh7NG6DdfU4ImpzH8e5R1VMBcAH_ckEBz71Mbg7YeXq1xlWv82sT2uHb2UCgj_ZeV_v7qfxmTK93Z6sVep10JyMrc8quyUlRlB03DrYy2AYLqxc4dRtW2xUwbm33ufmtgXC4c5z-Cv977jSFJX2SxOTDbe0Sk7Bgl4J5qADhwthVk5N5IqxcZ_iwlJCxXL35ZBUyw2aUz17qWrUUzkrwYirSAKDZYwMan3WZw6Lqjhv8JOQKeCTyoIFNjYmbeQf_0mcym2mnamANuy2lsqaz2G6vYkQY9bKIC6jVbE23LhedjRuuBaYcWzi-PSCzLE3HQBEHS5SSlIb_4qGqexQs1i33QsMfjzKMO6dU10LsXi23M1YM1K5UEnbpd_sVf4R_bEDtI-NO_P3cCoqnM5FIaZJzqN9oBnUrHbgM16O0xeLVG6ulYKZ3Vty6mrqIzRSmUgndOa-D3d5bUT4V-Ohni3RMp5ZsD1ut5h0ACAuC6VRK1r_fhpdvOhMv5lVB0zY6CDCqQ0L60ahiSOXlyqlkrcIOBp7ydIWmEya0ChvCOzmNqLZw"
                        },
                        "refresh_token": {
                          "type": "string",
                          "example": "def5020031e62869a95d76aeb7032d69baebe4acb6fff8447306ab0a2c8f3f47e9e7894ab67a17757f6c032dac6a9487560354621a6daf8cb9af825f73ac3e31ff041125ff95befcb69cd1f59583eb60fcd9853e0407b88c665e5f4343e014f7d675039f2af5238296efad0760ef62c26cbed6128fd0e08734516c2baa943c0a657c812c57cf96a6143257fccfbe9e0254a9871d7632188e110e22175bd185a4b31eea735e972c7cfb94be94b29272783f2f8aae9e7cf31a091fd4def6946bf7ff2a76537e7fed4a4b90271a764590050b84fd2deaeea44ff12b3b805972bd1789358f91e173fb4ffac1b380a81cc66de4c556fc66011aa9b9d199047e616f66623f0b68f197a6cf860777d0fb06ca54f9be8166accd2b5372bce313a0216bc1a8e4f138681c62d8acc5452c53058d6c4aa7c11059461b32db3b3900f21b400828d1001f793f071638e1af4e742f036f4d7b4df19b4fc607b5f5c2f9443151a9b345509a02"
                        }
                      }
                    },
                    {
                      "title": "Refresh Token",
                      "type": "object",
                      "properties": {
                        "access_token": {
                          "type": "string",
                          "example": "sbPyarhcOxmLVwuUfKSz8i5uOadIBgmtNDGmQBSZ"
                        },
                        "token_type": {
                          "type": "string",
                          "example": "Bearer"
                        },
                        "expires_in": {
                          "type": "integer",
                          "example": 21600,
                          "default": 0
                        },
                        "refresh_token": {
                          "type": "string",
                          "example": "ZbRnNDXia3Crv3K6pGySVJ6KeU5C530BHbcGh41W"
                        }
                      }
                    }
                  ]
                }
              }
            }
          }
        },
        "deprecated": false,
        "security": [],
        "x-readme": {
          "code-samples": [
            {
              "language": "shell",
              "code": "curl -X POST https://api.skyswitch.com/oauth/token \\\n  -d grant_type='password' \\\n  -d client_id='client_id' \\\n  -d client_secret='client_secret' \\\n  -d username='username' \\\n  -d password='password' \\\n  -d scope='back_office account user catalog phone_number pbx routing e911 lnp carrier uc_config log sms mms entitlement messaging report'",
              "name": "Access Token: Selected Scopes"
            },
            {
              "language": "shell",
              "code": "curl -X POST https://api.skyswitch.com/oauth/token \\\n  -d grant_type='password' \\\n  -d client_id='client_id' \\\n  -d client_secret='client_secret' \\\n  -d username='username' \\\n  -d password='password' \\\n  -d scope='*' ",
              "name": "Access Token: All Scopes"
            },
            {
              "language": "shell",
              "code": "curl 'https://api.skyswitch.com/oauth/token' \\\n  -d grant_type='refresh_token' \\\n  -d client_id='client_id' \\\n  -d client_secret='client_secret' \\\n  -d refresh_token='zWPg7GBNfCD4vW2uSkFrdK5pjuiovIAmQPhFm6PL' ",
              "name": "Refresh Token"
            }
          ],
          "samples-languages": [
            "shell"
          ]
        }
      }
    }
  },
  "x-readme": {
    "headers": [],
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "x-readme-fauxas": true,
  "_id": "61d5522500a25500238c5339:61d55256fa4789000fa7d567"
}
```

Describe Access Token

# Describe Access Token

Determine information about the token the client possess.

# OpenAPI definition

```json
{
  "openapi": "3.1.0",
  "info": {
    "title": "Authentication",
    "version": "1.0"
  },
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "security": [
    {}
  ],
  "paths": {
    "/oauth/token": {
      "get": {
        "summary": "Describe Access Token",
        "description": "Determine information about the token the client possess.",
        "operationId": "describe-access-token",
        "parameters": [
          {
            "name": "Authorization",
            "in": "header",
            "description": "e.g.: Bearer access_token",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "200",
            "content": {
              "application/json": {
                "examples": {
                  "Result": {
                    "value": "{\n  \"username\": \"user@domain.com\",\n  \"scopes\": [\n    \"back_office\",\n    \"accounts\",\n    \"catalog\",\n    \"phone_numbers\",\n    \"pbx\",\n    \"routing\",\n    \"e911\",\n    \"billing\",\n    \"lnp\",\n    \"profile\",\n    \"user\",\n    \"carrier\"\n  ],\n  \"expires\": 1462006322\n}"
                  }
                },
                "schema": {
                  "type": "object",
                  "properties": {
                    "username": {
                      "type": "string",
                      "example": "user@domain.com"
                    },
                    "scopes": {
                      "type": "array",
                      "items": {
                        "type": "string",
                        "example": "back_office"
                      }
                    },
                    "expires": {
                      "type": "integer",
                      "example": 1462006322,
                      "default": 0
                    }
                  }
                }
              }
            }
          },
          "400": {
            "description": "400",
            "content": {
              "application/json": {
                "examples": {
                  "Result": {
                    "value": "{}"
                  }
                },
                "schema": {
                  "type": "object",
                  "properties": {}
                }
              }
            }
          }
        },
        "deprecated": false,
        "x-readme": {
          "code-samples": [
            {
              "language": "shell",
              "code": "curl --get 'https://telco-api.skyswitch.com/oauth/token' \\\n  -H 'Authorization: Bearer t1IGdXc9IZBzkX1lgRNA07pMbzStPWCn9texz8V4' "
            }
          ],
          "samples-languages": [
            "shell"
          ]
        }
      }
    }
  },
  "x-readme": {
    "headers": [],
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "x-readme-fauxas": true,
  "_id": "61d5522500a25500238c5339:61d553f9ce74e1003ac5a5bc"
}
```

Describe Access Token

# Describe Access Token

Determine information about the token the client possess.

# OpenAPI definition

```json
{
  "openapi": "3.1.0",
  "info": {
    "title": "Authentication",
    "version": "1.0"
  },
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "security": [
    {}
  ],
  "paths": {
    "/oauth/token": {
      "get": {
        "summary": "Describe Access Token",
        "description": "Determine information about the token the client possess.",
        "operationId": "describe-access-token",
        "parameters": [
          {
            "name": "Authorization",
            "in": "header",
            "description": "e.g.: Bearer access_token",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "200",
            "content": {
              "application/json": {
                "examples": {
                  "Result": {
                    "value": "{\n  \"username\": \"user@domain.com\",\n  \"scopes\": [\n    \"back_office\",\n    \"accounts\",\n    \"catalog\",\n    \"phone_numbers\",\n    \"pbx\",\n    \"routing\",\n    \"e911\",\n    \"billing\",\n    \"lnp\",\n    \"profile\",\n    \"user\",\n    \"carrier\"\n  ],\n  \"expires\": 1462006322\n}"
                  }
                },
                "schema": {
                  "type": "object",
                  "properties": {
                    "username": {
                      "type": "string",
                      "example": "user@domain.com"
                    },
                    "scopes": {
                      "type": "array",
                      "items": {
                        "type": "string",
                        "example": "back_office"
                      }
                    },
                    "expires": {
                      "type": "integer",
                      "example": 1462006322,
                      "default": 0
                    }
                  }
                }
              }
            }
          },
          "400": {
            "description": "400",
            "content": {
              "application/json": {
                "examples": {
                  "Result": {
                    "value": "{}"
                  }
                },
                "schema": {
                  "type": "object",
                  "properties": {}
                }
              }
            }
          }
        },
        "deprecated": false,
        "x-readme": {
          "code-samples": [
            {
              "language": "shell",
              "code": "curl --get 'https://telco-api.skyswitch.com/oauth/token' \\\n  -H 'Authorization: Bearer t1IGdXc9IZBzkX1lgRNA07pMbzStPWCn9texz8V4' "
            }
          ],
          "samples-languages": [
            "shell"
          ]
        }
      }
    }
  },
  "x-readme": {
    "headers": [],
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "x-readme-fauxas": true,
  "_id": "61d5522500a25500238c5339:61d553f9ce74e1003ac5a5bc"
}
```

Describe Access Token

# Describe Access Token

Determine information about the token the client possess.

# OpenAPI definition

```json
{
  "openapi": "3.1.0",
  "info": {
    "title": "Authentication",
    "version": "1.0"
  },
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "security": [
    {}
  ],
  "paths": {
    "/oauth/token": {
      "get": {
        "summary": "Describe Access Token",
        "description": "Determine information about the token the client possess.",
        "operationId": "describe-access-token",
        "parameters": [
          {
            "name": "Authorization",
            "in": "header",
            "description": "e.g.: Bearer access_token",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "200",
            "content": {
              "application/json": {
                "examples": {
                  "Result": {
                    "value": "{\n  \"username\": \"user@domain.com\",\n  \"scopes\": [\n    \"back_office\",\n    \"accounts\",\n    \"catalog\",\n    \"phone_numbers\",\n    \"pbx\",\n    \"routing\",\n    \"e911\",\n    \"billing\",\n    \"lnp\",\n    \"profile\",\n    \"user\",\n    \"carrier\"\n  ],\n  \"expires\": 1462006322\n}"
                  }
                },
                "schema": {
                  "type": "object",
                  "properties": {
                    "username": {
                      "type": "string",
                      "example": "user@domain.com"
                    },
                    "scopes": {
                      "type": "array",
                      "items": {
                        "type": "string",
                        "example": "back_office"
                      }
                    },
                    "expires": {
                      "type": "integer",
                      "example": 1462006322,
                      "default": 0
                    }
                  }
                }
              }
            }
          },
          "400": {
            "description": "400",
            "content": {
              "application/json": {
                "examples": {
                  "Result": {
                    "value": "{}"
                  }
                },
                "schema": {
                  "type": "object",
                  "properties": {}
                }
              }
            }
          }
        },
        "deprecated": false,
        "x-readme": {
          "code-samples": [
            {
              "language": "shell",
              "code": "curl --get 'https://telco-api.skyswitch.com/oauth/token' \\\n  -H 'Authorization: Bearer t1IGdXc9IZBzkX1lgRNA07pMbzStPWCn9texz8V4' "
            }
          ],
          "samples-languages": [
            "shell"
          ]
        }
      }
    }
  },
  "x-readme": {
    "headers": [],
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "x-readme-fauxas": true,
  "_id": "61d5522500a25500238c5339:61d553f9ce74e1003ac5a5bc"
}
```

List sub-accounts

# List sub-accounts

Retrieve sub-account information.

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/sub-accounts": {
      "get": {
        "summary": "List sub-accounts",
        "description": "Retrieve sub-account information.",
        "security": [
          {
            "api_auth": [
              "account"
            ]
          }
        ],
        "tags": [
          "Accounts"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "The account identifier",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "recursive",
            "schema": {
              "type": "integer",
              "default": 0
            }
          },
          {
            "in": "query",
            "name": "include_lineage",
            "description": "If set to 1 the lineage of the sub account matching the filter will be included. If set to 0 only the sub account(s) matching the filter is returned.",
            "schema": {
              "type": "integer",
              "default": 1
            }
          },
          {
            "in": "query",
            "name": "name",
            "schema": {
              "type": "string",
              "default": ""
            }
          },
          {
            "in": "query",
            "name": "account_number",
            "schema": {
              "type": "integer",
              "default": ""
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success.",
            "content": {
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": {
                    "type": "object",
                    "properties": {
                      "id": {
                        "type": "string"
                      },
                      "parent_id": {
                        "type": "string"
                      },
                      "name": {
                        "type": "string"
                      },
                      "account_number": {
                        "type": "string"
                      },
                      "organizational": {
                        "type": "string"
                      },
                      "created_at": {
                        "type": "string",
                        "format": "date-time"
                      },
                      "updated_at": {
                        "type": "string",
                        "format": "date-time"
                      },
                      "deleted_at": {
                        "type": "string",
                        "format": "date-time"
                      },
                      "children": {
                        "type": "array",
                        "items": {
                          "type": "object"
                        }
                      }
                    }
                  }
                },
                "example": [
                  {
                    "id": "e22b3bf9-e5d7-3b44-89b2-b27ca65750ba",
                    "parent_id": "ac8dd0e0-501d-11e6-95ba-c3e4bed7a5a2",
                    "name": "ABC Company",
                    "account_number": "13391",
                    "organizational": 1,
                    "created_at": "2016-07-25T00:09:00.000000Z",
                    "updated_at": "2016-07-25T00:09:00.000000Z",
                    "deleted_at": null,
                    "children": [
                      {
                        "id": "2304c780-52ab-11e6-a563-03612c7024d0",
                        "parent_id": "e22b3bf9-e5d7-3b44-89b2-b27ca65750ba",
                        "name": "ACME",
                        "account_number": "20409",
                        "organizational": 0,
                        "created_at": "2016-07-25T00:09:00.000000Z",
                        "updated_at": "2016-07-25T00:09:00.000000Z",
                        "deleted_at": null,
                        "children": []
                      }
                    ]
                  }
                ]
              }
            }
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "Accounts"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

List users

# List users

List users

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/users": {
      "get": {
        "summary": "List users",
        "description": "List users",
        "security": [
          {
            "api_auth": [
              "user"
            ]
          }
        ],
        "tags": [
          "Users"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "Account identifier",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "name",
            "description": "Filter by name",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "email",
            "description": "Filter by email address",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "suspended",
            "description": "Filter to return suspended users only. Valid values are 0 or 1.",
            "schema": {
              "type": "boolean"
            }
          },
          {
            "in": "query",
            "name": "search",
            "description": "Filter all results by a string",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "include_ext_identifiers",
            "description": "Include external identifiers",
            "schema": {
              "type": "boolean"
            }
          },
          {
            "in": "query",
            "name": "recursive",
            "description": "Filter to return all the users that belongs to the reseller account. Valid values are 0 or 1.",
            "schema": {
              "type": "boolean"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success.",
            "content": {
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": {
                    "type": "object",
                    "properties": {
                      "id": {
                        "type": "integer"
                      },
                      "uuid": {
                        "type": "string"
                      },
                      "name": {
                        "type": "string"
                      },
                      "email": {
                        "type": "string"
                      },
                      "username": {
                        "type": "string"
                      },
                      "deleted": {
                        "type": "boolean"
                      },
                      "account_id": {
                        "type": "string"
                      },
                      "account_name": {
                        "type": "string"
                      },
                      "external_identifiers": {
                        "type": "array"
                      },
                      "is_agent": {
                        "type": "boolean"
                      }
                    }
                  }
                },
                "example": [
                  {
                    "id": 3,
                    "uuid": null,
                    "name": "Benedick Chan",
                    "email": "ben@skyswitch.com",
                    "username": null,
                    "deleted": false,
                    "account_id": "ebe4dfd0-5020-11e6-82df-0519a30363ed",
                    "account_name": "Root",
                    "external_identifiers": [
                      {
                        "id": "1",
                        "local_table": "users",
                        "local_id": "47a41a63-e51d-4c58-b818-544cb9c10c4a",
                        "external_field_id": "1",
                        "external_id": "1234",
                        "external_field": {
                          "id": "1",
                          "system": "some string",
                          "name": "some string"
                        }
                      }
                    ]
                  }
                ]
              }
            }
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "Users"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

List users for the Sync Tool

# List users for the Sync Tool

List users for the Sync Tool. This endpoint is used to retrieve a list of users without filtering by account.

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/sync/users": {
      "get": {
        "summary": "List users for the Sync Tool",
        "description": "List users for the Sync Tool. This endpoint is used to retrieve a list of users without filtering by account.",
        "security": [
          {
            "api_auth": [
              "user"
            ]
          }
        ],
        "tags": [
          "Users"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "Account identifier",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "name",
            "description": "Filter by name",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "email",
            "description": "Filter by email address",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "suspended",
            "description": "Filter to return suspended users only. Valid values are 0 or 1.",
            "schema": {
              "type": "boolean"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success.",
            "content": {
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": {
                    "type": "object",
                    "properties": {
                      "id": {
                        "type": "integer"
                      },
                      "uuid": {
                        "type": "string"
                      },
                      "name": {
                        "type": "string"
                      },
                      "email": {
                        "type": "string"
                      },
                      "username": {
                        "type": "string"
                      },
                      "deleted": {
                        "type": "boolean"
                      },
                      "account_id": {
                        "type": "string"
                      },
                      "account_name": {
                        "type": "string"
                      },
                      "external_identifiers": {
                        "type": "array"
                      },
                      "is_agent": {
                        "type": "boolean"
                      }
                    }
                  }
                },
                "example": [
                  {
                    "id": 3,
                    "uuid": null,
                    "name": "Benedick Chan",
                    "email": "ben@skyswitch.com",
                    "username": null,
                    "deleted": false,
                    "account_id": "ebe4dfd0-5020-11e6-82df-0519a30363ed",
                    "account_name": "Root",
                    "external_identifiers": [
                      {
                        "id": "1",
                        "local_table": "users",
                        "local_id": "47a41a63-e51d-4c58-b818-544cb9c10c4a",
                        "external_field_id": "1",
                        "external_id": "1234",
                        "external_field": {
                          "id": "1",
                          "system": "some string",
                          "name": "some string"
                        }
                      }
                    ]
                  }
                ]
              }
            }
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "Users"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

Create user

# Create user

Create a new user

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/users": {
      "post": {
        "summary": "Create user",
        "description": "Create a new user",
        "security": [
          {
            "api_auth": [
              "user"
            ]
          }
        ],
        "tags": [
          "Users"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "Account identifier",
            "schema": {
              "type": "string"
            }
          }
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": [
                  "name"
                ],
                "properties": {
                  "name": {
                    "type": "string",
                    "description": "Name of user"
                  },
                  "email": {
                    "type": "string",
                    "description": "Email address of the user"
                  },
                  "password": {
                    "type": "string",
                    "description": "Password of the user"
                  },
                  "password_confirmation": {
                    "type": "string",
                    "description": "Repeated password of user for confirmation"
                  },
                  "username": {
                    "type": "string",
                    "description": "user name"
                  },
                  "reuse": {
                    "type": "boolean",
                    "description": "Flag to restore suspended user with the same email address. Valid values are 0 or 1."
                  },
                  "external_identifiers": {
                    "type": "array",
                    "items": {
                      "type": "object",
                      "required": [
                        "system",
                        "fields"
                      ],
                      "properties": {
                        "system": {
                          "type": "string",
                          "description": "System name"
                        },
                        "fields": {
                          "type": "object",
                          "required": [
                            "name",
                            "value"
                          ],
                          "properties": {
                            "name": {
                              "type": "string",
                              "description": "Field name"
                            },
                            "value": {
                              "type": "string",
                              "description": "Field value"
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        "responses": {
          "201": {
            "description": "Success."
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "Users"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

Get user

# Get user

Get a user

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/users/{user_id}": {
      "get": {
        "summary": "Get user",
        "description": "Get a user",
        "security": [
          {
            "api_auth": [
              "user"
            ]
          }
        ],
        "tags": [
          "Users"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "Account identifier",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "path",
            "name": "user_id",
            "required": true,
            "description": "User identifier",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success.",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "id": {
                      "type": "integer"
                    },
                    "name": {
                      "type": "string"
                    },
                    "email": {
                      "type": "string"
                    },
                    "account_id": {
                      "type": "string"
                    },
                    "account_name": {
                      "type": "string"
                    }
                  }
                },
                "example": {
                  "id": 3,
                  "name": "John Doe",
                  "email": "john.doe@gmail.com",
                  "account_id": "a22b3bf9-e5d7-3b44-89b2-b27ca657503",
                  "account_name": "ABC Company"
                }
              }
            }
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "Users"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

Update user

# Update user

Create a new user

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/users/{user_id}": {
      "put": {
        "summary": "Update user",
        "description": "Create a new user",
        "security": [
          {
            "api_auth": [
              "user"
            ]
          }
        ],
        "tags": [
          "Users"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "Account identifier",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "path",
            "name": "user_id",
            "required": true,
            "description": "User identifier",
            "schema": {
              "type": "integer"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success."
          }
        },
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "name": {
                    "type": "string",
                    "description": "Name of user"
                  },
                  "email": {
                    "type": "string",
                    "description": "Email address of the user"
                  },
                  "password": {
                    "type": "string",
                    "description": "Password of the user"
                  },
                  "password_confirmation": {
                    "type": "string",
                    "default": "",
                    "description": "Repeated password of user for confirmation."
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "Users"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

Delete user

# Delete user

Delete a user

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/users/{user_id}": {
      "delete": {
        "summary": "Delete user",
        "description": "Delete a user",
        "security": [
          {
            "api_auth": [
              "user"
            ]
          }
        ],
        "tags": [
          "Users"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "Account identifier",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "path",
            "name": "user_id",
            "required": true,
            "description": "User identifier",
            "schema": {
              "type": "integer"
            }
          }
        ],
        "responses": {
          "204": {
            "description": "Success."
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "Users"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

Update user details in Fusion Auth

# Update user details in Fusion Auth

Updates FusionAuth user.data and registrations for the user.

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/users/{user_id}/fa": {
      "put": {
        "summary": "Update user details in Fusion Auth",
        "description": "Updates FusionAuth user.data and registrations for the user.",
        "security": [
          {
            "api_auth": [
              "user"
            ]
          }
        ],
        "tags": [
          "Users"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "Account identifier",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "path",
            "name": "user_id",
            "required": true,
            "description": "User identifier",
            "schema": {
              "type": "integer"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success."
          }
        },
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "nsUid": {
                    "type": "string",
                    "description": "the pbx username that will be assigned to the given user"
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "Users"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

Restore user

# Restore user

Restore a user

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/users/{user_id}/restore": {
      "delete": {
        "summary": "Restore user",
        "description": "Restore a user",
        "security": [
          {
            "api_auth": [
              "user"
            ]
          }
        ],
        "tags": [
          "Users"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "Account identifier",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "path",
            "name": "user_id",
            "required": true,
            "description": "User identifier",
            "schema": {
              "type": "integer"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success."
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "Users"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

Add multiple byot phone number

# Add multiple byot phone number

Add a multiple byot phone number

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/inventory/byot": {
      "put": {
        "summary": "Add multiple byot phone number",
        "description": "Add a multiple byot phone number",
        "security": [
          {
            "api_auth": [
              "back_office"
            ]
          }
        ],
        "tags": [
          "Inventory"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "The account identifier",
            "schema": {
              "type": "string"
            }
          }
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": [
                  "phone_numbers"
                ],
                "properties": {
                  "phone_numbers": {
                    "type": "array",
                    "description": "List of phone numbers",
                    "items": {
                      "type": "string"
                    }
                  }
                }
              },
              "example": {
                "phone_numbers": [
                  "12345678803",
                  "12345678901"
                ]
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Success."
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "Inventory"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

Add byot phone number

# Add byot phone number

Add a byot phone number

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/inventory/byot/{phone_number}": {
      "put": {
        "summary": "Add byot phone number",
        "description": "Add a byot phone number",
        "security": [
          {
            "api_auth": [
              "back_office"
            ]
          }
        ],
        "tags": [
          "Inventory"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "The account identifier",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "path",
            "name": "phone_number",
            "required": true,
            "description": "Phone number",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success."
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "Inventory"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

Add multiple offnet phone number

# Add multiple offnet phone number

Add a multiple offnet phone number

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/inventory/off-net": {
      "put": {
        "summary": "Add multiple offnet phone number",
        "description": "Add a multiple offnet phone number",
        "security": [
          {
            "api_auth": [
              "back_office"
            ]
          }
        ],
        "tags": [
          "Inventory"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "The account identifier",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success."
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "Inventory"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

Add off-net phone number

# Add off-net phone number

Add an off-net phone number

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/inventory/offnet/{phone_number}": {
      "put": {
        "summary": "Add off-net phone number",
        "description": "Add an off-net phone number",
        "security": [
          {
            "api_auth": [
              "back_office"
            ]
          }
        ],
        "tags": [
          "Inventory"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "The account identifier",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "path",
            "name": "phone_number",
            "required": true,
            "description": "Phone number",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success."
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "Inventory"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

List phone numbers

# List phone numbers

Retrieve a list of phone numbers owned by the account.

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/phone-numbers": {
      "get": {
        "summary": "List phone numbers",
        "description": "Retrieve a list of phone numbers owned by the account.",
        "security": [
          {
            "api_auth": [
              "phone_number"
            ]
          }
        ],
        "tags": [
          "Inventory"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "The account identifier",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "carrier_id",
            "description": "Filter by carrier.",
            "schema": {
              "type": "string",
              "default": ""
            }
          },
          {
            "in": "query",
            "name": "phone_number",
            "description": "Filter by substring of phone number.",
            "schema": {
              "type": "string",
              "default": ""
            }
          },
          {
            "in": "query",
            "name": "npa",
            "description": "Filter by NPA.",
            "schema": {
              "type": "string",
              "default": ""
            }
          },
          {
            "in": "query",
            "name": "nxx",
            "description": "Filter by NXX.",
            "schema": {
              "type": "string",
              "default": ""
            }
          },
          {
            "in": "query",
            "name": "tier",
            "description": "Filter by tier. A|B|C|D.",
            "schema": {
              "type": "string",
              "default": ""
            }
          },
          {
            "in": "query",
            "name": "origin",
            "description": "Filter by origin. stock|byot|port-in.",
            "schema": {
              "type": "string",
              "default": ""
            }
          },
          {
            "in": "query",
            "name": "type",
            "description": "Filter by type. local|toll-free.",
            "schema": {
              "type": "string",
              "default": ""
            }
          },
          {
            "in": "query",
            "name": "description",
            "description": "Filter by description.",
            "schema": {
              "type": "string",
              "default": ""
            }
          },
          {
            "in": "query",
            "name": "recursive",
            "description": "Filter to include phone numbers of children accounts. 0|1.",
            "schema": {
              "type": "integer",
              "default": ""
            }
          },
          {
            "in": "query",
            "name": "per_page",
            "description": "The number of entries or page size of records to be retrieved. Default is 100.",
            "schema": {
              "type": "integer",
              "default": ""
            }
          },
          {
            "in": "query",
            "name": "page",
            "description": "The page index relative to the parameter per_page to be retrieved. Default is 1 (i.e., first page).",
            "schema": {
              "type": "integer",
              "default": ""
            }
          },
          {
            "in": "query",
            "name": "phone_numbers",
            "description": "Comma-separated phone numbers to be searched.",
            "schema": {
              "type": "string",
              "default": ""
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success.",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "pagination": {
                      "$ref": "#/components/schemas/Pagination"
                    },
                    "data": {
                      "type": "array",
                      "items": {
                        "type": "object",
                        "properties": {
                          "base_origin": {
                            "type": "string"
                          },
                          "account_id": {
                            "type": "string"
                          },
                          "rate_center": {
                            "type": "string"
                          },
                          "state": {
                            "type": "string"
                          },
                          "activated_at": {
                            "type": "string"
                          },
                          "description": {
                            "type": "string"
                          },
                          "phone_number": {
                            "type": "string"
                          },
                          "origin": {
                            "type": "string"
                          },
                          "type": {
                            "type": "string"
                          },
                          "carrier_id": {
                            "type": "string"
                          },
                          "tier": {
                            "type": "string"
                          },
                          "t38": {
                            "type": "boolean"
                          },
                          "on_network": {
                            "type": "boolean"
                          }
                        }
                      }
                    }
                  },
                  "example": {
                    "pagination": {
                      "count": 1000,
                      "per_page": 1,
                      "page": 5
                    },
                    "data": [
                      {
                        "base_origin": "port-in",
                        "account_id": "022b3bf9-e5d7-3b44-89b2-b27ca65750b8",
                        "rate_center": "TWINCITIES",
                        "state": "MN",
                        "activated_at": "2020-08-07 16:03:22",
                        "description": "Test number",
                        "phone_number": "16122558888",
                        "origin": "stock",
                        "type": "local",
                        "carrier_id": 30,
                        "tier": "A",
                        "t38": true,
                        "on_network": true
                      }
                    ]
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "Inventory"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    },
    "schemas": {
      "Pagination": {
        "type": "object",
        "properties": {
          "count": {
            "type": "integer"
          },
          "per_page": {
            "type": "integer"
          },
          "page": {
            "type": "integer"
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

Disconnect phone number

# Disconnect phone number

Unroute and suspends the phone number.

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/phone-numbers/{phone_number}": {
      "delete": {
        "summary": "Disconnect phone number",
        "description": "Unroute and suspends the phone number.",
        "security": [
          {
            "api_auth": [
              "phone_number"
            ]
          }
        ],
        "tags": [
          "Inventory"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "The account identifier",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "path",
            "name": "phone_number",
            "required": true,
            "description": "The phone number",
            "schema": {
              "type": "string",
              "default": ""
            }
          }
        ],
        "responses": {
          "204": {
            "description": "Success."
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "Inventory"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

Detach company from phone number

# Detach company from phone number

Detach an assigned company from a phone number.

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/phone-numbers/{phone_number}/companies": {
      "delete": {
        "summary": "Detach company from phone number",
        "description": "Detach an assigned company from a phone number.",
        "security": [
          {
            "api_auth": [
              "phone_number"
            ]
          }
        ],
        "tags": [
          "Inventory"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "The account identifier",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "path",
            "name": "phone_number",
            "required": true,
            "description": "The phone number",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "204": {
            "description": "Success."
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "Inventory"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

Attach company to phone number

# Attach company to phone number

Attach a company to a phone number.

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/phone-numbers/{phone_number}/companies/{company_id}": {
      "put": {
        "summary": "Attach company to phone number",
        "description": "Attach a company to a phone number.",
        "security": [
          {
            "api_auth": [
              "phone_number"
            ]
          }
        ],
        "tags": [
          "Inventory"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "The account identifier",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "path",
            "name": "phone_number",
            "required": true,
            "description": "The phone number",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "path",
            "name": "company_id",
            "required": true,
            "description": "The company identifier",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success."
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "Inventory"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

Get phone number

# Get phone number

Retrieves a phone number owned by the account.

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/phone-numbers/{phone_number}": {
      "get": {
        "summary": "Get phone number",
        "description": "Retrieves a phone number owned by the account.",
        "security": [
          {
            "api_auth": [
              "phone_number"
            ]
          }
        ],
        "tags": [
          "Inventory"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "phone_number",
            "required": true,
            "description": "The phone number",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success.",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "account_id": {
                      "type": "string"
                    },
                    "rate_center": {
                      "type": "string"
                    },
                    "state": {
                      "type": "string"
                    },
                    "phone_number": {
                      "type": "string"
                    },
                    "origin": {
                      "type": "string"
                    },
                    "type": {
                      "type": "string"
                    },
                    "carrier_id": {
                      "type": "string"
                    },
                    "tier": {
                      "type": "string"
                    },
                    "t38": {
                      "type": "boolean"
                    },
                    "on_network": {
                      "type": "boolean"
                    }
                  }
                },
                "example": {
                  "account_id": "022b3bf9-e5d7-3b44-89b2-b27ca65750b8",
                  "rate_center": "ELIZABETH",
                  "state": "PA",
                  "phone_number": "14123878008",
                  "origin": "stock",
                  "type": "local",
                  "carrier_id": "30",
                  "tier": "A",
                  "t38": true,
                  "on_network": true
                }
              }
            }
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "Inventory"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

Purchase phone numbers

# Purchase phone numbers

Purchase multiple phone numbers from the catalog.

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/phone-numbers": {
      "post": {
        "summary": "Purchase phone numbers",
        "description": "Purchase multiple phone numbers from the catalog.",
        "security": [
          {
            "api_auth": [
              "phone_number"
            ]
          }
        ],
        "tags": [
          "Catalog, Reservations & Purchase"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "The account identifier",
            "schema": {
              "type": "string"
            }
          }
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": [
                  "phone_numbers",
                  "carrier_id"
                ],
                "properties": {
                  "phone_numbers": {
                    "type": "array",
                    "description": "List of phone numbers that will be purchased.",
                    "items": {
                      "type": "string"
                    }
                  }
                }
              },
              "example": {
                "phone_numbers": [
                  12345678901,
                  12345678902
                ],
                "carrier_id": 30
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Success."
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "Catalog, Reservations & Purchase"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

Purchase phone number

# Purchase phone number

Purchase a specific number from the catalog.

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/phone-numbers/{phone_number}": {
      "put": {
        "summary": "Purchase phone number",
        "description": "Purchase a specific number from the catalog.",
        "security": [
          {
            "api_auth": [
              "phone_number"
            ]
          }
        ],
        "tags": [
          "Catalog, Reservations & Purchase"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "The account identifier",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "path",
            "name": "phone_number",
            "required": true,
            "description": "Phone number being purchased",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success."
          }
        },
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": [
                  "carrier_id"
                ],
                "properties": {
                  "carrier_id": {
                    "type": "string",
                    "description": "Identifier of the carrier to which the phone number belongs as indicated by the catalog."
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "Catalog, Reservations & Purchase"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

List catalog exchanges

# List catalog exchanges

Retrieve exchanges with purchasable phone numbers.

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/catalog/exchanges": {
      "get": {
        "summary": "List catalog exchanges",
        "description": "Retrieve exchanges with purchasable phone numbers.",
        "security": [
          {
            "api_auth": [
              "catalog"
            ]
          }
        ],
        "tags": [
          "Catalog, Reservations & Purchase"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "The account identifier",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "carrier_id",
            "description": "Filter by carrier.",
            "schema": {
              "type": "integer"
            }
          },
          {
            "in": "query",
            "name": "npa",
            "description": "Filter by NPA. (Integer, 3 digits)",
            "schema": {
              "type": "integer"
            }
          },
          {
            "in": "query",
            "name": "nxx",
            "description": "Filter by NXX. (Integer, 3 digits)",
            "schema": {
              "type": "integer"
            }
          },
          {
            "in": "query",
            "name": "rate_center",
            "description": "Filter by rate center name as abbreviated in LERG.",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "state",
            "description": "Filter by 2 character state abbreviation. (String, 2 character abbreviation)",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "tier",
            "description": "Filter by tier. A|B|C|D",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "t38",
            "description": "Filter by t38 support. 0|1",
            "schema": {
              "type": "integer"
            }
          },
          {
            "in": "query",
            "name": "on_network",
            "description": "Filter by on or off network. 0|1",
            "schema": {
              "type": "integer"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success.",
            "content": {
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": {
                    "type": "object",
                    "properties": {
                      "origin": {
                        "type": "string"
                      },
                      "type": {
                        "type": "string"
                      },
                      "carrier_id": {
                        "type": "string"
                      },
                      "npa": {
                        "type": "string"
                      },
                      "nxx": {
                        "type": "string"
                      },
                      "rate_center": {
                        "type": "string"
                      },
                      "state": {
                        "type": "string"
                      },
                      "tier": {
                        "type": "string"
                      },
                      "t38": {
                        "type": "boolean"
                      },
                      "on_network": {
                        "type": "boolean"
                      }
                    }
                  }
                },
                "example": [
                  {
                    "origin": "ulc",
                    "type": "local",
                    "carrier_id": "30",
                    "npa": "407",
                    "nxx": "431",
                    "rate_center": "SANFORD",
                    "state": "FL",
                    "tier": "A",
                    "t38": true,
                    "on_network": true
                  }
                ]
              }
            }
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "Catalog, Reservations & Purchase"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

List local phone numbers catalog

# List local phone numbers catalog

Retrieve local phone numbers that are available for purchase from the catalog.

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/catalog/phone-numbers/local": {
      "get": {
        "summary": "List local phone numbers catalog",
        "description": "Retrieve local phone numbers that are available for purchase from the catalog.",
        "security": [
          {
            "api_auth": [
              "catalog"
            ]
          }
        ],
        "tags": [
          "Catalog, Reservations & Purchase"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "The account identifier",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "quantity",
            "description": "Limit number of phone numbers to return. 1-100.",
            "schema": {
              "type": "integer",
              "default": 10
            }
          },
          {
            "in": "query",
            "name": "carrier_id",
            "description": "Filter by carrier.",
            "schema": {
              "type": "integer"
            }
          },
          {
            "in": "query",
            "name": "npa",
            "description": "Filter by NPA. (Integer, 3 digits)",
            "schema": {
              "type": "integer"
            }
          },
          {
            "in": "query",
            "name": "nxx",
            "description": "Filter by NXX. (Integer, 3 digits)",
            "schema": {
              "type": "integer"
            }
          },
          {
            "in": "query",
            "name": "rate_center",
            "description": "Filter by rate center name as abbreviated in LERG.",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "state",
            "description": "Filter by 2 character state abbreviation. (String, 2 character abbreviation)",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "tier",
            "description": "Filter by tier. A|B|C|D",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "t38",
            "description": "Filter by t38 support. 0|1",
            "schema": {
              "type": "integer"
            }
          },
          {
            "in": "query",
            "name": "on_network",
            "description": "Filter by on or off network. 0|1",
            "schema": {
              "type": "integer"
            }
          },
          {
            "in": "query",
            "name": "line_number",
            "description": "Filter for the last 4 numbers. Prefix or suffix with an 'x' for wildcard.",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "sequential",
            "description": "Filter numbers to be sequential. Currently supported only for Inteliquent numbers.",
            "schema": {
              "type": "boolean"
            }
          },
          {
            "in": "query",
            "name": "local_calling_area",
            "description": "Filter numbers to include local calling area. Currently supported only for Inteliquent numbers.",
            "schema": {
              "type": "boolean"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success.",
            "content": {
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": {
                    "type": "object",
                    "properties": {
                      "rate_center": {
                        "type": "string"
                      },
                      "state": {
                        "type": "string"
                      },
                      "phone_number": {
                        "type": "string"
                      },
                      "origin": {
                        "type": "string"
                      },
                      "type": {
                        "type": "string"
                      },
                      "carrier_id": {
                        "type": "string"
                      },
                      "tier": {
                        "type": "string"
                      },
                      "t38": {
                        "type": "boolean"
                      },
                      "on_network": {
                        "type": "boolean"
                      }
                    }
                  }
                },
                "example": [
                  {
                    "rate_center": "ADVANCE",
                    "state": "MO",
                    "phone_number": "15733211630",
                    "origin": "stock",
                    "type": "local",
                    "carrier_id": "30",
                    "tier": "B",
                    "t38": true,
                    "on_network": false
                  }
                ]
              }
            }
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "Catalog, Reservations & Purchase"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

List toll-free numbers catalog

# List toll-free numbers catalog

Retrieve toll-free phone numbers that are available for purchase from the catalog.

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/catalog/phone-numbers/toll-free": {
      "get": {
        "summary": "List toll-free numbers catalog",
        "description": "Retrieve toll-free phone numbers that are available for purchase from the catalog.",
        "security": [
          {
            "api_auth": [
              "catalog"
            ]
          }
        ],
        "tags": [
          "Catalog, Reservations & Purchase"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "The account identifier",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "quantity",
            "description": "Limit number of phone numbers to return. 1-100.",
            "schema": {
              "type": "integer",
              "default": 10
            }
          },
          {
            "in": "query",
            "name": "carrier_id",
            "description": "Filter by carrier.",
            "schema": {
              "type": "integer"
            }
          },
          {
            "in": "query",
            "name": "npa",
            "description": "Filter by NPA. (Integer, 3 digits)",
            "schema": {
              "type": "integer"
            }
          },
          {
            "in": "query",
            "name": "tier",
            "description": "Filter by tier. A|B|C|D",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "t38",
            "description": "Filter by t38 support. 0|1",
            "schema": {
              "type": "integer"
            }
          },
          {
            "in": "query",
            "name": "on_network",
            "description": "Filter by on or off network. 0|1",
            "schema": {
              "type": "integer"
            }
          },
          {
            "in": "query",
            "name": "phone_number",
            "description": "Filter by substring in phone number.",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success.",
            "content": {
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": {
                    "type": "object",
                    "properties": {
                      "phone_number": {
                        "type": "string"
                      },
                      "origin": {
                        "type": "string"
                      },
                      "type": {
                        "type": "string"
                      },
                      "carrier_id": {
                        "type": "string"
                      },
                      "tier": {
                        "type": "string"
                      },
                      "t38": {
                        "type": "boolean"
                      },
                      "on_network": {
                        "type": "boolean"
                      }
                    }
                  }
                },
                "example": [
                  {
                    "phone_number": "18554661212",
                    "origin": "stock",
                    "type": "toll-free",
                    "carrier_id": 2,
                    "tier": "A",
                    "t38": true,
                    "on_network": true
                  },
                  {
                    "phone_number": "18554661213",
                    "origin": "stock",
                    "type": "toll-free",
                    "carrier_id": 2,
                    "tier": "A",
                    "t38": true,
                    "on_network": true
                  }
                ]
              }
            }
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "Catalog, Reservations & Purchase"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

List reservations

# List reservations

List reservations

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/phone-numbers/reservations": {
      "get": {
        "summary": "List reservations",
        "description": "List reservations",
        "security": [
          {
            "api_auth": [
              "phone_number"
            ]
          }
        ],
        "tags": [
          "Catalog, Reservations & Purchase"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "The account identifier",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "carrier_id",
            "description": "Carrier identifier",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "phone_number",
            "description": "Full text search on phone number",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "t38",
            "description": "Faxing protocol support. (0|1)",
            "schema": {
              "type": "integer"
            }
          },
          {
            "in": "query",
            "name": "tier",
            "description": "Tier (A|B|C|D).",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "on_network",
            "description": "Is on-network. (0|1)",
            "schema": {
              "type": "integer"
            }
          },
          {
            "in": "query",
            "name": "per_page",
            "schema": {
              "type": "integer"
            }
          },
          {
            "in": "query",
            "name": "page",
            "schema": {
              "type": "integer"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success.",
            "content": {
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": {
                    "type": "object",
                    "properties": {
                      "account_id": {
                        "type": "string"
                      },
                      "expires_at": {
                        "type": "string"
                      },
                      "phone_number": {
                        "type": "string"
                      },
                      "npa": {
                        "type": "string"
                      },
                      "nxx": {
                        "type": "string"
                      },
                      "rate_center": {
                        "type": "string"
                      },
                      "state": {
                        "type": "string"
                      },
                      "carrier_id": {
                        "type": "string"
                      },
                      "tier": {
                        "type": "string"
                      },
                      "t38": {
                        "type": "boolean"
                      },
                      "on_network": {
                        "type": "boolean"
                      }
                    }
                  }
                },
                "example": [
                  {
                    "account_id": "022b3bf9-e5d7-3b44-89b2-b27ca65750b8",
                    "expires_at": "2016-05-31T00:09:00.000000Z",
                    "phone_number": "18639131195",
                    "npa": "863",
                    "nxx": "913",
                    "rate_center": "MULBERRY",
                    "state": "FL",
                    "carrier_id": 1,
                    "tier": "A",
                    "t38": true,
                    "on_network": true
                  }
                ]
              }
            }
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "Catalog, Reservations & Purchase"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

Update phone number details

# Update phone number details

Set some details to the phone number.

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/phone-numbers/{phone_number}/information": {
      "put": {
        "summary": "Update phone number details",
        "description": "Set some details to the phone number.",
        "security": [
          {
            "api_auth": [
              "phone_number"
            ]
          }
        ],
        "tags": [
          "Catalog, Reservations & Purchase"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "The account identifier",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "path",
            "name": "phone_number",
            "required": true,
            "description": "Phone number",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success."
          }
        },
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "description": {
                    "type": "string",
                    "default": "",
                    "description": "Description"
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "Catalog, Reservations & Purchase"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

Get reservation

# Get reservation

Retrieve a phone number under reservation

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/phone-numbers/{phone_number}/reservation": {
      "get": {
        "summary": "Get reservation",
        "description": "Retrieve a phone number under reservation",
        "security": [
          {
            "api_auth": [
              "phone_number"
            ]
          }
        ],
        "tags": [
          "Catalog, Reservations & Purchase"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "The account identifier",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "path",
            "name": "phone_number",
            "required": true,
            "description": "The phone number",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success.",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "account_id": {
                      "type": "string"
                    },
                    "expires_at": {
                      "type": "string"
                    },
                    "phone_number": {
                      "type": "string"
                    },
                    "npa": {
                      "type": "string"
                    },
                    "nxx": {
                      "type": "string"
                    },
                    "rate_center": {
                      "type": "string"
                    },
                    "state": {
                      "type": "string"
                    },
                    "carrier_id": {
                      "type": "string"
                    },
                    "tier": {
                      "type": "string"
                    },
                    "t38": {
                      "type": "boolean"
                    },
                    "on_network": {
                      "type": "boolean"
                    }
                  }
                },
                "example": {
                  "account_id": "022b3bf9-e5d7-3b44-89b2-b27ca65750b8",
                  "expires_at": "2016-05-31T00:09:00.000000Z",
                  "phone_number": "18639131195",
                  "npa": "863",
                  "nxx": "913",
                  "rate_center": "MULBERRY",
                  "state": "FL",
                  "carrier_id": 1,
                  "tier": "A",
                  "t38": true,
                  "on_network": true
                }
              }
            }
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "Catalog, Reservations & Purchase"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

Reserve phone number

# Reserve phone number

This method reserves the phone number to your account for 30 days. Your account can reserve up to 100 phone numbers at a time. Skyswitch may charge a reservation fee in the near future.

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/phone-numbers/{phone_number}/reservation": {
      "put": {
        "summary": "Reserve phone number",
        "description": "This method reserves the phone number to your account for 30 days. Your account can reserve up to 100 phone numbers at a time. Skyswitch may charge a reservation fee in the near future.",
        "security": [
          {
            "api_auth": [
              "phone_number"
            ]
          }
        ],
        "tags": [
          "Catalog, Reservations & Purchase"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "The account identifier",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "path",
            "name": "phone_number",
            "required": true,
            "description": "The phone number",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success."
          }
        },
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": [
                  "carrier_id"
                ],
                "properties": {
                  "carrier_id": {
                    "type": "integer",
                    "description": "Carrier identifier"
                  },
                  "reserve_minutes": {
                    "type": "integer",
                    "description": "Reservation period in minutes"
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "Catalog, Reservations & Purchase"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

Unreserve phone number

# Unreserve phone number

This method unreserves the phone number from your account

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/phone-numbers/{phone_number}/unreserve": {
      "put": {
        "summary": "Unreserve phone number",
        "description": "This method unreserves the phone number from your account",
        "security": [
          {
            "api_auth": [
              "phone_number"
            ]
          }
        ],
        "tags": [
          "Catalog, Reservations & Purchase"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "The account identifier",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "path",
            "name": "phone_number",
            "required": true,
            "description": "The phone number",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success."
          }
        },
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": [
                  "carrier_id"
                ],
                "properties": {
                  "carrier_id": {
                    "type": "integer",
                    "description": "Carrier identifier"
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "Catalog, Reservations & Purchase"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

List toll-free prefixes

# List toll-free prefixes

List supported toll-free prefixes.

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/toll-free-prefixes": {
      "get": {
        "summary": "List toll-free prefixes",
        "description": "List supported toll-free prefixes.",
        "security": [
          {
            "api_auth": [
              "catalog"
            ]
          }
        ],
        "tags": [
          "Catalog, Reservations & Purchase"
        ],
        "parameters": [
          {
            "in": "query",
            "name": "prefix",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success.",
            "content": {
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": {
                    "type": "string"
                  },
                  "example": [
                    "1800",
                    "1833",
                    "1844",
                    "1855",
                    "1866",
                    "1877",
                    "1888"
                  ]
                }
              }
            }
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "Catalog, Reservations & Purchase"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

List auto-attendants

# List auto-attendants

Retrieve the auto-attendants

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/auto-attendants": {
      "get": {
        "summary": "List auto-attendants",
        "description": "Retrieve the auto-attendants",
        "security": [
          {
            "api_auth": [
              "pbx"
            ]
          }
        ],
        "tags": [
          "Voice Route"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "The account identifier",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "domain",
            "required": true,
            "description": "Filter by domain",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success",
            "content": {
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": {
                    "type": "object",
                    "properties": {
                      "user": {
                        "type": "string"
                      },
                      "domain": {
                        "type": "string"
                      },
                      "name": {
                        "type": "string"
                      },
                      "caller_id": {
                        "type": "string"
                      },
                      "caller_id_emergency": {
                        "type": "string"
                      },
                      "email_address": {
                        "type": "string"
                      },
                      "service_code": {
                        "type": "string"
                      }
                    }
                  }
                },
                "example": {
                  "100": {
                    "user": "100",
                    "domain": "skyswitch.15611.service",
                    "name": "John Doe",
                    "caller_id": "4072131863",
                    "caller_id_emergency": "4072131863",
                    "email_address": "john.doe@gmail.com;jane.doe@gmail.com",
                    "service_code": "system-queue"
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "Voice Route"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

List call-queues

# List call-queues

Retrieve the call-queues

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/call-queues": {
      "get": {
        "summary": "List call-queues",
        "description": "Retrieve the call-queues",
        "security": [
          {
            "api_auth": [
              "pbx"
            ]
          }
        ],
        "tags": [
          "Voice Route"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "The account identifier",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "domain",
            "required": true,
            "description": "Filter by domain",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success",
            "content": {
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": {
                    "type": "object",
                    "properties": {
                      "user": {
                        "type": "string"
                      },
                      "domain": {
                        "type": "string"
                      },
                      "name": {
                        "type": "string"
                      },
                      "caller_id": {
                        "type": "string"
                      },
                      "caller_id_emergency": {
                        "type": "string"
                      },
                      "email_address": {
                        "type": "string"
                      },
                      "service_code": {
                        "type": "string"
                      }
                    }
                  }
                },
                "example": {
                  "100": {
                    "user": "100",
                    "domain": "skyswitch.15611.service",
                    "name": "John Doe",
                    "caller_id": "4072131863",
                    "caller_id_emergency": "4072131863",
                    "email_address": "john.doe@gmail.com",
                    "service_code": "system-queue"
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "Voice Route"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

List conferences

# List conferences

Retrieve the conferences

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/conferences": {
      "get": {
        "summary": "List conferences",
        "description": "Retrieve the conferences",
        "security": [
          {
            "api_auth": [
              "pbx"
            ]
          }
        ],
        "tags": [
          "Voice Route"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "The account identifier",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "domain",
            "required": true,
            "description": "Filter by domain",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success",
            "content": {
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": {
                    "type": "object",
                    "properties": {
                      "name": {
                        "type": "string"
                      },
                      "to_user": {
                        "type": "string"
                      },
                      "aor": {
                        "type": "string"
                      }
                    }
                  }
                },
                "example": [
                  {
                    "name": "John Doe Bridge",
                    "to_user": "1111.skyswitch.15611.service",
                    "aor": "sip:1111.skyswitch.15611.service@conference-bridge"
                  },
                  {
                    "name": "Janette Lee Bridge",
                    "to_user": "1112.skyswitch.15611.service",
                    "aor": "sip:1112.skyswitch.15611.service@conference-bridge"
                  }
                ]
              }
            }
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "Voice Route"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

List contact centers

# List contact centers

Retrieve the contact centers

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/contact-centers": {
      "get": {
        "summary": "List contact centers",
        "description": "Retrieve the contact centers",
        "security": [
          {
            "api_auth": [
              "pbx"
            ]
          }
        ],
        "tags": [
          "Voice Route"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "The account identifier",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success",
            "content": {
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": {
                    "type": "object",
                    "properties": {
                      "id": {
                        "type": "string"
                      },
                      "name": {
                        "type": "string"
                      },
                      "domain": {
                        "type": "string"
                      }
                    }
                  }
                },
                "example": [
                  {
                    "id": "b13a382f-6a82-42b7-ac63-7235bf28399f",
                    "name": "Skyswitch Corporate",
                    "domain": "skyswitch.15611.service"
                  }
                ]
              }
            }
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "Voice Route"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

Get route

# Get route

Retrieve the phone number's route

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/phone-numbers/{phone_number}/route": {
      "get": {
        "summary": "Get route",
        "description": "Retrieve the phone number's route",
        "security": [
          {
            "api_auth": [
              "routing"
            ]
          }
        ],
        "tags": [
          "Voice Route"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "The account identifier",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "path",
            "name": "phone_number",
            "required": true,
            "description": "The phone number",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Successful response for pbx route.",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object"
                },
                "examples": {
                  "Pbx Reseller": {
                    "value": {
                      "type": "pbx",
                      "route": {
                        "reseller": "15611",
                        "enable": "yes",
                        "valid_from": "*",
                        "valid_to": "*",
                        "notes": "Routed by Telco-API",
                        "spam_call_action": "voicemail",
                        "treatment": "user",
                        "caller_id_prefix": "US-"
                      }
                    }
                  },
                  "Pbx Domain": {
                    "value": {
                      "type": "pbx",
                      "route": {
                        "domain": "skyswitch.15611.service",
                        "enable": "yes",
                        "valid_from": "*",
                        "valid_to": "*",
                        "notes": "Routed by Telco-API",
                        "spam_call_action": "voicemail",
                        "treatment": "user",
                        "caller_id_prefix": "US-"
                      }
                    }
                  },
                  "Pbx Subscriber": {
                    "value": {
                      "type": "pbx",
                      "route": {
                        "subscriber": "100@skyswitch.15611.service",
                        "enable": "yes",
                        "valid_from": "*",
                        "valid_to": "*",
                        "notes": "Routed by Telco-API",
                        "spam_call_action": "voicemail",
                        "treatment": "user",
                        "caller_id_prefix": "US-",
                        "recording_notice": "no"
                      }
                    }
                  },
                  "Conference": {
                    "value": {
                      "type": "pbx",
                      "route": {
                        "to_user": "1111.skyswitch.15611.service",
                        "enable": "yes",
                        "valid_from": "*",
                        "valid_to": "*",
                        "notes": "Routed by Telco-API",
                        "caller_id_prefix": "[*]",
                        "treatment": "user"
                      }
                    }
                  },
                  "Call Queue": {
                    "value": {
                      "type": "pbx",
                      "route": {
                        "call_queue": "1133@skyswitch.15611.service",
                        "announcement": "start",
                        "enable": "yes",
                        "valid_from": "*",
                        "valid_to": "*",
                        "notes": "Routed by Telco-API",
                        "spam_call_action": "voicemail",
                        "treatment": "callqueue",
                        "caller_id_prefix": "US-"
                      }
                    }
                  },
                  "Auto Attendant": {
                    "value": {
                      "type": "pbx",
                      "route": {
                        "attendant": "1134@skyswitch.15611.service",
                        "enable": "yes",
                        "valid_from": "*",
                        "valid_to": "*",
                        "notes": "Routed by Telco-API",
                        "spam_call_action": "voicemail",
                        "treatment": "attendant",
                        "caller_id_prefix": "US-"
                      }
                    }
                  },
                  "SIP Trunk": {
                    "value": {
                      "type": "pbx",
                      "route": {
                        "sip_trunk": "1skyswitch.15611.service",
                        "trunk_domain": "skyswitch.15611.service",
                        "enable": "yes",
                        "valid_from": "*",
                        "valid_to": "*",
                        "notes": "Routed by Telco-API",
                        "caller_id_prefix": "[*]",
                        "treatment": "trunk"
                      }
                    }
                  },
                  "IFax Portal": {
                    "value": {
                      "type": "ifax",
                      "route": {
                        "pbx_subscribers": [
                          {
                            "subscriber": "100@skyswitch.15611.service"
                          },
                          {
                            "subscriber": "101@skyswitch.15611.service"
                          }
                        ]
                      }
                    }
                  },
                  "IFax Email": {
                    "value": {
                      "type": "ifax",
                      "route": {
                        "email_addresses": [
                          {
                            "email_address": "john.doe@gmail.com",
                            "delivery": "link"
                          },
                          {
                            "email_address": "jane.doe@gmail.com",
                            "delivery": "attachment"
                          }
                        ]
                      }
                    }
                  },
                  "Fax ATA": {
                    "value": {
                      "type": "pbx",
                      "route": {
                        "company": "SOMEDOMAIN.12345.SERVICE",
                        "deliver_offline": 0,
                        "deliver_email_address": [
                          "support@acme.com",
                          "service@abc-company.com"
                        ],
                        "email_confirmation_address": [
                          "john.doe@gmail.com",
                          "jane.doe@yahoo.com"
                        ],
                        "email_confirmation_on_success": 1,
                        "email_confirmation_on_failure": 1,
                        "email_confirmation_format": "text",
                        "fax_confirmation_on_success": 1,
                        "fax_confirmation_on_failure": 1,
                        "fax_confirmation_format": "text",
                        "email_attachment_type": "pdf",
                        "mac_address": "012345678913"
                      }
                    }
                  },
                  "Contact Center": {
                    "value": {
                      "type": "contact-center",
                      "route": {
                        "name": "Skyswitch Corporate",
                        "domain": "skyswitch.15611.service"
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "Voice Route"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

Route phone number

# Route phone number

Route a phone number

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/phone-numbers/{phone_number}/route": {
      "put": {
        "summary": "Route phone number",
        "description": "Route a phone number",
        "security": [
          {
            "api_auth": [
              "routing"
            ]
          }
        ],
        "tags": [
          "Voice Route"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "The account identifier",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "path",
            "name": "phone_number",
            "required": true,
            "description": "The phone number",
            "schema": {
              "type": "string"
            }
          }
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "type": {
                    "type": "string",
                    "description": "pbx, ifax, gateway, forward, fax-ata, conference, contact-center"
                  },
                  "route": {
                    "type": "object"
                  }
                }
              },
              "examples": {
                "Route to Pbx Reseller": {
                  "value": {
                    "type": "pbx",
                    "route": {
                      "treatment": "user",
                      "reseller": "15611",
                      "enable": "yes",
                      "valid_from": "2018-01-01",
                      "valid_to": "2020-12-31",
                      "notes": "Routed by Telco-API",
                      "spam_call_action": "voicemail",
                      "caller_id_prefix": "US-"
                    }
                  }
                },
                "Route to Pbx Domain": {
                  "value": {
                    "type": "pbx",
                    "route": {
                      "treatment": "user",
                      "domain": "skyswitch.15611.service",
                      "enable": "yes",
                      "valid_from": "2018-01-01",
                      "valid_to": "2020-12-31",
                      "notes": "Routed by Telco-API",
                      "spam_call_action": "voicemail",
                      "caller_id_prefix": "US-"
                    }
                  }
                },
                "Route to Pbx Subscriber": {
                  "value": {
                    "type": "pbx",
                    "route": {
                      "treatment": "user",
                      "subscriber": "1120@skyswitch.15611.service",
                      "enable": "yes",
                      "valid_from": "2018-01-01",
                      "valid_to": "2020-12-31",
                      "notes": "Routed by Telco-API",
                      "spam_call_action": "voicemail",
                      "caller_id_prefix": "US-",
                      "recording_notice": "yes"
                    }
                  }
                },
                "Route to Conference": {
                  "value": {
                    "type": "pbx",
                    "route": {
                      "treatment": "conference",
                      "to_user": "1111.skyswitch.15611.service",
                      "to_host": "conference-bridge",
                      "enable": "yes",
                      "valid_from": "2018-01-01",
                      "valid_to": "2020-12-31",
                      "notes": "Routed by Telco-API",
                      "spam_call_action": "voicemail",
                      "caller_id_prefix": "US-"
                    }
                  }
                },
                "Route to Call Queue": {
                  "value": {
                    "type": "pbx",
                    "route": {
                      "treatment": "callqueue",
                      "call_queue": "1133@skyswitch.15611.service",
                      "announcement": "start",
                      "enable": "yes",
                      "valid_from": "2018-01-01",
                      "valid_to": "2020-12-31",
                      "notes": "Routed by Telco-API",
                      "spam_call_action": "voicemail",
                      "caller_id_prefix": "US-"
                    }
                  }
                },
                "Route to Auto Attendant": {
                  "value": {
                    "type": "pbx",
                    "route": {
                      "treatment": "attendant",
                      "attendant": "1134@skyswitch.15611.service",
                      "enable": "yes",
                      "valid_from": "2018-01-01",
                      "valid_to": "2020-12-31",
                      "notes": "Routed by Telco-API",
                      "spam_call_action": "voicemail",
                      "caller_id_prefix": "US-"
                    }
                  }
                },
                "Route to SIP Trunk": {
                  "value": {
                    "type": "pbx",
                    "route": {
                      "treatment": "trunk",
                      "sip_trunk": "TrunkSample",
                      "trunk_domain": "skyswitch.15611.service",
                      "enable": "yes",
                      "valid_from": "2018-01-01",
                      "valid_to": "2020-12-31",
                      "notes": "Routed by Telco-API",
                      "spam_call_action": "voicemail",
                      "caller_id_prefix": "US-"
                    }
                  }
                },
                "IFax Portal": {
                  "value": {
                    "type": "ifax",
                    "route": {
                      "pbx_subscribers": [
                        "100@skyswitch.15611.service",
                        "101@skyswitch.15611.service"
                      ]
                    }
                  }
                },
                "IFax Email": {
                  "value": {
                    "type": "ifax",
                    "route": {
                      "email_addresses": [
                        {
                          "email_address": "john.doe@gmail.com",
                          "delivery": "link"
                        },
                        {
                          "email_address": "jane.doe@gmail.com",
                          "delivery": "attachment"
                        }
                      ]
                    }
                  }
                },
                "Fax ATA": {
                  "value": {
                    "type": "fax-ata",
                    "route": {
                      "mac_address": "012345678913",
                      "deliver_offline": "0",
                      "company": "ACME CO",
                      "deliver_email_address": [
                        "support@acme.com",
                        "service@abc-company.com"
                      ],
                      "email_confirmation_address": [
                        "john.doe@gmail.com",
                        "jane.doe@yahoo.com"
                      ],
                      "email_confirmation_on_success": "1",
                      "email_confirmation_on_failure": "1",
                      "email_confirmation_format": "text",
                      "fax_confirmation_on_success": "1",
                      "fax_confirmation_on_failure": "1",
                      "fax_confirmation_format": "text",
                      "email_attachment_type": "pdf"
                    }
                  }
                },
                "Contact Center": {
                  "value": {
                    "type": "contact-center",
                    "route": {
                      "name": "Skyswitch Corporate",
                      "domain": "skyswitch.15611.service"
                    }
                  }
                }
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Success."
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "Voice Route"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

Unroute phone number

# Unroute phone number

Delete routing for a number.

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/phone-numbers/{phone_number}/route": {
      "delete": {
        "summary": "Unroute phone number",
        "description": "Delete routing for a number.",
        "security": [
          {
            "api_auth": [
              "routing"
            ]
          }
        ],
        "tags": [
          "Voice Route"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "The account identifier",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "path",
            "name": "phone_number",
            "required": true,
            "description": "The phone number",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "204": {
            "description": "Success."
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "Voice Route"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

List trunk groups

# List trunk groups

Retrieve the list of trunk groups.

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/trunk-groups": {
      "get": {
        "summary": "List trunk groups",
        "description": "Retrieve the list of trunk groups.",
        "security": [
          {
            "api_auth": [
              "pbx"
            ]
          }
        ],
        "tags": [
          "Voice Route"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "The account identifier",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success",
            "content": {
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": {
                    "type": "object",
                    "properties": {
                      "id": {
                        "type": "string"
                      },
                      "name": {
                        "type": "string"
                      }
                    }
                  }
                },
                "example": [
                  {
                    "id": "131100",
                    "name": "ACME SBC"
                  },
                  {
                    "id": "424431",
                    "name": "Green Trunk"
                  }
                ]
              }
            }
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "Voice Route"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

Provision user

# Provision user

Provision user

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/messaging/hubusers": {
      "put": {
        "summary": "Provision user",
        "description": "Provision user",
        "security": [
          {
            "api_auth": [
              "messaging"
            ]
          }
        ],
        "tags": [
          "Messaging User Provisioning"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "The account identifier",
            "schema": {
              "type": "string"
            }
          }
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": [
                  "user",
                  "domain",
                  "device_user"
                ],
                "properties": {
                  "user": {
                    "type": "string",
                    "description": "User"
                  },
                  "domain": {
                    "type": "string",
                    "description": "Domain"
                  },
                  "device_user": {
                    "type": "string",
                    "description": "Device name. For ReachUC clients, this is extension number with m suffix. E.g. 1000m"
                  },
                  "name": {
                    "type": "string",
                    "description": "The users name"
                  },
                  "brand": {
                    "type": "string",
                    "description": "Brand name. Leave this blank unless specifically instructed by Skyswitch Development Team."
                  },
                  "group_name": {
                    "type": "string",
                    "description": "Group name. Leave this blank unless specifically instructed by Skyswitch Development Team."
                  },
                  "user_type": {
                    "type": "string",
                    "description": "User type"
                  }
                }
              },
              "example": {
                "user": "1000",
                "domain": "acmecorp.12345.service",
                "name": "John Doe",
                "device_user": "1000m",
                "user_type": "skyswitch-pbx"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "Messaging User Provisioning"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

Get provisioned user

# Get provisioned user

Retrieve details of a provisioned user

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/messaging/hubusers/{user_id}": {
      "get": {
        "summary": "Get provisioned user",
        "description": "Retrieve details of a provisioned user",
        "security": [
          {
            "api_auth": [
              "messaging"
            ]
          }
        ],
        "tags": [
          "Messaging User Provisioning"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "The account identifier",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "path",
            "name": "user_id",
            "required": true,
            "description": "The user identifier",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "name",
            "description": "The name",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "userid": {
                      "type": "integer"
                    },
                    "user": {
                      "type": "string"
                    },
                    "domain": {
                      "type": "string"
                    },
                    "device_user": {
                      "type": "string"
                    },
                    "name": {
                      "type": "string"
                    },
                    "user_type": {
                      "type": "string"
                    }
                  },
                  "example": {
                    "userid": 1,
                    "user": "1000",
                    "domain": "acmecorp.12345.service",
                    "device_user": "1000m",
                    "name": "John Doe",
                    "user_type": "skyswitch-pbx"
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "Messaging User Provisioning"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

Unprovision user

# Unprovision user

Unprovision user

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/messaging/hubusers/{user_id}": {
      "delete": {
        "summary": "Unprovision user",
        "description": "Unprovision user",
        "security": [
          {
            "api_auth": [
              "messaging"
            ]
          }
        ],
        "tags": [
          "Messaging User Provisioning"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "The account identifier",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "path",
            "name": "user_id",
            "required": true,
            "description": "The user identifier",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "204": {
            "description": "Success"
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "Messaging User Provisioning"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

List users

# List users

Retrieve a list of users from the messaging service.

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/messaging/users": {
      "get": {
        "summary": "List users",
        "description": "Retrieve a list of users from the messaging service.",
        "security": [
          {
            "api_auth": [
              "messaging"
            ]
          }
        ],
        "tags": [
          "Messaging User Provisioning"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "The account identifier",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "userid",
            "description": "User identifier",
            "schema": {
              "type": "integer"
            }
          },
          {
            "in": "query",
            "name": "domain",
            "description": "The domain",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "companyid",
            "description": "The company account id",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "user",
            "description": "The user",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "name",
            "description": "The name",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "origin",
            "description": "The origin",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "per_page",
            "description": "Number of items per page",
            "schema": {
              "type": "integer"
            }
          },
          {
            "in": "query",
            "name": "page",
            "description": "Page number",
            "schema": {
              "type": "integer"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "pagination": {
                      "$ref": "#/components/schemas/Pagination"
                    },
                    "data": {
                      "type": "array",
                      "items": {
                        "type": "object",
                        "properties": {
                          "userid": {
                            "type": "integer"
                          },
                          "user": {
                            "type": "string"
                          },
                          "domain": {
                            "type": "string"
                          },
                          "brand": {
                            "type": "string"
                          },
                          "name": {
                            "type": "string"
                          },
                          "origin": {
                            "type": "string"
                          }
                        }
                      }
                    }
                  }
                },
                "examples": {
                  "With Pagination": {
                    "value": {
                      "pagination": {
                        "count": 1000,
                        "per_page": 1,
                        "page": 5
                      },
                      "data": [
                        {
                          "userid": 44,
                          "user": "1002",
                          "domain": "skyswitch.15611.service",
                          "brand": "",
                          "name": "",
                          "origin": ""
                        }
                      ]
                    }
                  },
                  "Without Pagination": {
                    "value": [
                      {
                        "userid": 44,
                        "user": "1002",
                        "uuid": "2905ae40-91de-11ed-1234-123dv8cab4b56",
                        "companyid": "2905ae40-91de-11ed-b899-89218cab4b56",
                        "domain": "skyswitch.15611.service",
                        "brand": "",
                        "name": "",
                        "origin": ""
                      }
                    ]
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "Messaging User Provisioning"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    },
    "schemas": {
      "Pagination": {
        "type": "object",
        "properties": {
          "count": {
            "type": "integer"
          },
          "per_page": {
            "type": "integer"
          },
          "page": {
            "type": "integer"
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

Store user

# Store user

Create or update a user for the messaging service.

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/messaging/users": {
      "put": {
        "summary": "Store user",
        "description": "Create or update a user for the messaging service.",
        "security": [
          {
            "api_auth": [
              "messaging"
            ]
          }
        ],
        "tags": [
          "Messaging User Provisioning"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "The account identifier",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success"
          }
        },
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "userid": {
                    "type": "string",
                    "description": "User identifier. Used for update."
                  },
                  "user": {
                    "type": "string",
                    "description": "User"
                  },
                  "domain": {
                    "type": "string",
                    "description": "Domain name"
                  },
                  "name": {
                    "type": "string",
                    "description": "The users name"
                  },
                  "brand": {
                    "type": "string",
                    "description": "The brand"
                  },
                  "origin": {
                    "type": "string",
                    "description": "The origin"
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "Messaging User Provisioning"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

Delete user

# Delete user

Remove a user from the messaging service.

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/messaging/users/{userid}": {
      "delete": {
        "summary": "Delete user",
        "description": "Remove a user from the messaging service.",
        "security": [
          {
            "api_auth": [
              "messaging"
            ]
          }
        ],
        "tags": [
          "Messaging User Provisioning"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "The account identifier",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "path",
            "name": "userid",
            "required": true,
            "description": "User identifier.",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "204": {
            "description": "Success"
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "Messaging User Provisioning"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

Get mms status

# Get mms status

Retrieve mms of a phone number

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/phone-numbers/{phone_number}/mms": {
      "get": {
        "summary": "Get mms status",
        "description": "Retrieve mms of a phone number",
        "security": [
          {
            "api_auth": [
              "mms"
            ]
          }
        ],
        "tags": [
          "SMS/MMS Provisioning"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "Account identifier",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "path",
            "name": "phone_number",
            "required": true,
            "description": "Phone number",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "carrier_id",
            "schema": {
              "type": "integer"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success.",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "phone_number": {
                      "type": "string"
                    },
                    "status": {
                      "type": "string"
                    }
                  }
                },
                "example": {
                  "phone_number": "19417988854",
                  "status": "enabled"
                }
              }
            }
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "SMS/MMS Provisioning"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

Enable mms

# Enable mms

Enable mms to a phone number

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/phone-numbers/{phone_number}/mms": {
      "put": {
        "summary": "Enable mms",
        "description": "Enable mms to a phone number",
        "security": [
          {
            "api_auth": [
              "mms"
            ]
          }
        ],
        "tags": [
          "SMS/MMS Provisioning"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "Account identifier",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "path",
            "name": "phone_number",
            "required": true,
            "description": "Phone number",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "carrier_id",
            "description": "Carrier identifier",
            "schema": {
              "type": "integer"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success."
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "SMS/MMS Provisioning"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

Disable mms

# Disable mms

Disable mms to a phone number

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/phone-numbers/{phone_number}/mms": {
      "delete": {
        "summary": "Disable mms",
        "description": "Disable mms to a phone number",
        "security": [
          {
            "api_auth": [
              "mms"
            ]
          }
        ],
        "tags": [
          "SMS/MMS Provisioning"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "Account identifier",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "path",
            "name": "phone_number",
            "required": true,
            "description": "Phone number",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success."
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "SMS/MMS Provisioning"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

Get sms status

# Get sms status

Retrieve sms of a phone number

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/phone-numbers/{phone_number}/sms": {
      "get": {
        "summary": "Get sms status",
        "description": "Retrieve sms of a phone number",
        "security": [
          {
            "api_auth": [
              "sms"
            ]
          }
        ],
        "tags": [
          "SMS/MMS Provisioning"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "Account identifier",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "path",
            "name": "phone_number",
            "required": true,
            "description": "Phone number",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "carrier_id",
            "schema": {
              "type": "integer"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success.",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "phone_number": {
                      "type": "string"
                    },
                    "status": {
                      "type": "string"
                    }
                  }
                },
                "example": {
                  "phone_number": "19417988854",
                  "status": "enabled"
                }
              }
            }
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "SMS/MMS Provisioning"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

Enable sms

# Enable sms

Enable sms to a phone number

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/phone-numbers/{phone_number}/sms": {
      "put": {
        "summary": "Enable sms",
        "description": "Enable sms to a phone number",
        "security": [
          {
            "api_auth": [
              "sms"
            ]
          }
        ],
        "tags": [
          "SMS/MMS Provisioning"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "Account identifier",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "path",
            "name": "phone_number",
            "required": true,
            "description": "Phone number",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "carrier_id",
            "description": "Carrier identifier",
            "schema": {
              "type": "integer"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success."
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "SMS/MMS Provisioning"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

Disable sms

# Disable sms

Disable sms to a phone number

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/phone-numbers/{phone_number}/sms": {
      "delete": {
        "summary": "Disable sms",
        "description": "Disable sms to a phone number",
        "security": [
          {
            "api_auth": [
              "sms"
            ]
          }
        ],
        "tags": [
          "SMS/MMS Provisioning"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "Account identifier",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "path",
            "name": "phone_number",
            "required": true,
            "description": "Phone number",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success."
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "SMS/MMS Provisioning"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

Get user by phone number

# Get user by phone number

Retrieves the user of the phone number

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/messaging/aliases": {
      "get": {
        "summary": "Get user by phone number",
        "description": "Retrieves the user of the phone number",
        "security": [
          {
            "api_auth": [
              "messaging"
            ]
          }
        ],
        "tags": [
          "Messaging Assignments"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "The account identifier",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "service",
            "description": "The service name",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "uri",
            "description": "The uri",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success",
            "content": {
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": {
                    "type": "object",
                    "properties": {
                      "addressid": {
                        "type": "integer"
                      },
                      "user_id": {
                        "type": "string"
                      },
                      "group_id": {
                        "type": "string"
                      },
                      "service": {
                        "type": "string"
                      },
                      "uri": {
                        "type": "string"
                      },
                      "priority": {
                        "type": "string"
                      },
                      "name": {
                        "type": "string"
                      },
                      "customdata": {
                        "type": "string"
                      },
                      "users": {
                        "type": "object",
                        "properties": {
                          "userid": {
                            "type": "integer"
                          },
                          "user": {
                            "type": "string"
                          },
                          "domain": {
                            "type": "string"
                          },
                          "brand": {
                            "type": "string"
                          },
                          "name": {
                            "type": "string"
                          }
                        }
                      }
                    }
                  }
                },
                "example": [
                  {
                    "addressid": 1,
                    "userid": "1550",
                    "groupid": "3116",
                    "service": "sms",
                    "uri": "tel:18589643746",
                    "priority": "0",
                    "name": "",
                    "customdata": "",
                    "users": {
                      "userid": 1550,
                      "user": "4607",
                      "domain": "skyswitch.15611.service",
                      "brand": "",
                      "name": ""
                    }
                  }
                ]
              }
            }
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "Messaging Assignments"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

Get user by domain

# Get user by domain

Retrieve a list of SMS-enabled phone numbers given a domain

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/messaging/aliases/domain": {
      "get": {
        "summary": "Get user by domain",
        "description": "Retrieve a list of SMS-enabled phone numbers given a domain",
        "security": [
          {
            "api_auth": [
              "messaging"
            ]
          }
        ],
        "tags": [
          "Messaging Assignments"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "The account identifier",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "domain",
            "required": true,
            "description": "The domain name",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "service",
            "description": "The service name (ams, url)",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "uri",
            "description": "The uri",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success",
            "content": {
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": {
                    "type": "object",
                    "properties": {
                      "uri": {
                        "type": "string"
                      }
                    }
                  }
                },
                "example": [
                  {
                    "uri": "tel:17477778666"
                  }
                ]
              }
            }
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "Messaging Assignments"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

Get phone number by pbx user

# Get phone number by pbx user

Retrieve a list of phone numbers given a pbx user.

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/messaging/aliases/pbxuser": {
      "get": {
        "summary": "Get phone number by pbx user",
        "description": "Retrieve a list of phone numbers given a pbx user.",
        "security": [
          {
            "api_auth": [
              "messaging"
            ]
          }
        ],
        "tags": [
          "Messaging Assignments"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "The account identifier",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "service",
            "description": "The service",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "uri",
            "description": "The uri",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "domain",
            "required": true,
            "description": "The domain",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "user",
            "required": true,
            "description": "The user",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success",
            "content": {
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": {
                    "type": "string"
                  },
                  "example": [
                    "12345678901"
                  ]
                }
              }
            }
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "Messaging Assignments"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

List assignment by pbx user

# List assignment by pbx user

Retrieve a list of assignments given a particular domain and user. A list of phone numbers are first taken from the pbx portal based on the provided domain and user, which are then checked from the uri in the messaging server.

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/messaging/assignments": {
      "get": {
        "summary": "List assignment by pbx user",
        "description": "Retrieve a list of assignments given a particular domain and user. A list of phone numbers are first taken from the pbx portal based on the provided domain and user, which are then checked from the uri in the messaging server.",
        "security": [
          {
            "api_auth": [
              "messaging"
            ]
          }
        ],
        "tags": [
          "Messaging Assignments"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "The account identifier",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "domain",
            "required": true,
            "description": "The domain name",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "user",
            "required": true,
            "description": "The user",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success",
            "content": {
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": {
                    "type": "object",
                    "properties": {
                      "addresses": {
                        "type": "object",
                        "properties": {
                          "addressid": {
                            "type": "integer"
                          },
                          "userid": {
                            "type": "string"
                          },
                          "groupid": {
                            "type": "string"
                          },
                          "service": {
                            "type": "string"
                          },
                          "uri": {
                            "type": "string"
                          },
                          "provider": {
                            "type": "string"
                          },
                          "priority": {
                            "type": "string"
                          },
                          "name": {
                            "type": "string"
                          },
                          "shared_addresses": {
                            "type": "object",
                            "properties": {
                              "sharedaddressid": {
                                "type": "integer"
                              },
                              "userid": {
                                "type": "string"
                              },
                              "groupid": {
                                "type": "string"
                              },
                              "addressid": {
                                "type": "string"
                              },
                              "service": {
                                "type": "string"
                              },
                              "users": {
                                "type": "object",
                                "properties": {
                                  "userid": {
                                    "type": "integer"
                                  },
                                  "user": {
                                    "type": "string"
                                  },
                                  "domain": {
                                    "type": "string"
                                  },
                                  "brand": {
                                    "type": "string"
                                  },
                                  "name": {
                                    "type": "string"
                                  }
                                }
                              }
                            }
                          }
                        }
                      },
                      "endpoints": {
                        "type": "object",
                        "properties": {
                          "endpointid": {
                            "type": "integer"
                          },
                          "userid": {
                            "type": "string"
                          },
                          "groupid": {
                            "type": "string"
                          },
                          "service": {
                            "type": "string"
                          },
                          "uri": {
                            "type": "string"
                          },
                          "provider": {
                            "type": "string"
                          },
                          "priority": {
                            "type": "string"
                          },
                          "name": {
                            "type": "string"
                          }
                        }
                      },
                      "forwards": {
                        "type": "object",
                        "properties": {
                          "forwardid": {
                            "type": "integer"
                          },
                          "userid": {
                            "type": "string"
                          },
                          "groupid": {
                            "type": "string"
                          },
                          "service": {
                            "type": "string"
                          },
                          "uri": {
                            "type": "string"
                          },
                          "provider": {
                            "type": "string"
                          },
                          "priority": {
                            "type": "string"
                          },
                          "name": {
                            "type": "string"
                          }
                        }
                      }
                    }
                  }
                },
                "example": [
                  {
                    "addresses": [
                      {
                        "addressid": 7040,
                        "userid": "1724",
                        "groupid": "3227",
                        "service": "sms",
                        "uri": "tel:14122263151",
                        "provider": "inteliquent-rest",
                        "priority": "0",
                        "name": "",
                        "shared_addresses": [
                          {
                            "sharedaddressid": 28,
                            "userid": "31",
                            "groupid": "0",
                            "addressid": "7040",
                            "service": "sms",
                            "users": {
                              "userid": 31,
                              "user": "1001",
                              "domain": "uc.15611.service",
                              "brand": "",
                              "name": ""
                            }
                          }
                        ]
                      }
                    ],
                    "endpoints": [
                      {
                        "endpointid": 236,
                        "userid": "1724",
                        "groupid": "3227",
                        "service": "ams",
                        "uri": "sip:9999m@skyswitch.15611.service",
                        "provider": "",
                        "priority": "0",
                        "name": ""
                      }
                    ],
                    "forwards": [
                      {
                        "forwardid": 8179,
                        "userid": "1724",
                        "groupid": "3227",
                        "service": "email",
                        "uri": "email:john.doe@skyswitch.com",
                        "provider": "",
                        "priority": "0",
                        "name": ""
                      }
                    ]
                  }
                ]
              }
            }
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "Messaging Assignments"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

List Sms-Enabled Assignments

# List Sms-Enabled Assignments

Retrieve a list of sms-enabled assignments.

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/messaging/assignments/sms": {
      "get": {
        "summary": "List Sms-Enabled Assignments",
        "description": "Retrieve a list of sms-enabled assignments.",
        "security": [
          {
            "api_auth": [
              "messaging"
            ]
          }
        ],
        "tags": [
          "Messaging Assignments"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "The account identifier",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "carrier_id",
            "description": "Filter by carrier.",
            "schema": {
              "type": "integer",
              "default": ""
            }
          },
          {
            "in": "query",
            "name": "phone_number",
            "description": "Filter by substring of phone number.",
            "schema": {
              "type": "string",
              "default": ""
            }
          },
          {
            "in": "query",
            "name": "npa",
            "description": "Filter by NPA.",
            "schema": {
              "type": "string",
              "default": ""
            }
          },
          {
            "in": "query",
            "name": "nxx",
            "description": "Filter by NXX.",
            "schema": {
              "type": "string",
              "default": ""
            }
          },
          {
            "in": "query",
            "name": "tier",
            "description": "Filter by tier. A|B|C|D.",
            "schema": {
              "type": "string",
              "default": ""
            }
          },
          {
            "in": "query",
            "name": "origin",
            "description": "Filter by origin. stock|byot|port-in|off-net.",
            "schema": {
              "type": "string",
              "default": ""
            }
          },
          {
            "in": "query",
            "name": "type",
            "description": "Filter by type. local|toll-free.",
            "schema": {
              "type": "string",
              "default": ""
            }
          },
          {
            "in": "query",
            "name": "domain",
            "description": "Filter by Domain.",
            "schema": {
              "type": "string",
              "default": ""
            }
          },
          {
            "in": "query",
            "name": "userid",
            "description": "Filter by User ID.",
            "schema": {
              "type": "integer",
              "default": ""
            }
          },
          {
            "in": "query",
            "name": "user",
            "description": "Filter by User.",
            "schema": {
              "type": "string",
              "default": ""
            }
          },
          {
            "in": "query",
            "name": "include_available",
            "description": "Include unassigned phone numbers.",
            "schema": {
              "type": "integer",
              "default": ""
            }
          },
          {
            "in": "query",
            "name": "assignment_type",
            "description": "Filter by assignment type. ReachUC User|Email|Directory Bot|Cloud Message|URL",
            "schema": {
              "type": "string",
              "default": ""
            }
          },
          {
            "in": "query",
            "name": "per_page",
            "description": "The number of entries or page size of records to be retrieved. Default is 100.",
            "schema": {
              "type": "integer",
              "default": ""
            }
          },
          {
            "in": "query",
            "name": "page",
            "description": "The page index relative to the parameter per_page to be retrieved. Default is 1 (i.e., first page).",
            "schema": {
              "type": "integer",
              "default": ""
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success.",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "pagination": {
                      "$ref": "#/components/schemas/Pagination"
                    },
                    "data": {
                      "type": "array",
                      "items": {
                        "type": "object",
                        "properties": {
                          "phone_number": {
                            "type": "string"
                          },
                          "domain": {
                            "type": "string"
                          },
                          "user_id": {
                            "type": "string"
                          },
                          "user": {
                            "type": "string"
                          },
                          "assignment_type": {
                            "type": "string"
                          },
                          "assignment_value": {
                            "type": "string"
                          }
                        }
                      }
                    }
                  },
                  "example": {
                    "pagination": {
                      "count": 1000,
                      "per_page": 1,
                      "page": 5
                    },
                    "data": [
                      {
                        "phone_number": "14694218008",
                        "domain": "skyswitch.15611.service",
                        "user_id": "58762",
                        "user": "1130",
                        "assignment_type": "ReachUC User",
                        "assignment_value": "sip:1130m@skyswitch.15611.service"
                      }
                    ]
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "Messaging Assignments"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    },
    "schemas": {
      "Pagination": {
        "type": "object",
        "properties": {
          "count": {
            "type": "integer"
          },
          "per_page": {
            "type": "integer"
          },
          "page": {
            "type": "integer"
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

List assignment details

# List assignment details

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/messaging/details": {
      "get": {
        "summary": "List assignment details",
        "security": [
          {
            "api_auth": [
              "messaging"
            ]
          }
        ],
        "tags": [
          "Messaging Assignments"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "Account identifier",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "type",
            "description": "endpoints, or forwards",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "userid",
            "description": "The user identifier",
            "schema": {
              "type": "integer"
            }
          },
          {
            "in": "query",
            "name": "groupid",
            "description": "The group identifier",
            "schema": {
              "type": "integer"
            }
          },
          {
            "in": "query",
            "name": "user",
            "description": "The user",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "domain",
            "description": "The domain",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "companyid",
            "description": "The company id of account",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "service",
            "description": "The service",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "uri",
            "description": "The uri",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "priority",
            "description": "The priority",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "name",
            "description": "The name",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "per_page",
            "description": "Items per page.",
            "schema": {
              "type": "integer",
              "default": 10
            }
          },
          {
            "in": "query",
            "name": "page",
            "description": "Page number",
            "schema": {
              "type": "integer",
              "default": 1
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object"
                },
                "examples": {
                  "Endpoints": {
                    "value": {
                      "pagination": {
                        "count": "707",
                        "per_page": "1",
                        "page": 2
                      },
                      "data": [
                        {
                          "endpointid": 24654,
                          "userid": "31",
                          "groupid": "0",
                          "service": "ams",
                          "uri": "sip:1001m@uc.15611.service",
                          "priority": "0",
                          "name": "",
                          "users": {
                            "userid": 31,
                            "user": "1001",
                            "domain": "uc.15611.service",
                            "brand": "",
                            "name": "",
                            "origin": ""
                          }
                        }
                      ]
                    }
                  },
                  "Forwards": {
                    "value": {
                      "pagination": {
                        "count": "1519",
                        "per_page": "1",
                        "page": 2
                      },
                      "data": [
                        {
                          "forwardid": 19943,
                          "userid": "31",
                          "groupid": "0",
                          "service": "url",
                          "uri": "https://api.reachuc.com/api/rocket/send?url=https://skyswitch.rocket.chat/hooks/YL8nekGDfxY6km3bN/DNGugoXHSkv5apuath6HYqWY3C7gA8kSEFMbZzDNCBaRxFxc",
                          "priority": "0",
                          "name": "",
                          "direction": "inbound",
                          "users": {
                            "userid": 31,
                            "user": "1001",
                            "domain": "uc.15611.service",
                            "brand": "",
                            "name": "",
                            "origin": ""
                          }
                        }
                      ]
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "Messaging Assignments"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

List phone numbers by filters

# List phone numbers by filters

Retrieve a list of phone numbers given a particular filters. A list of phone numbers are first taken from the pbx portal based on the provided domain, and optionally the user, which are then filtered out from the messaging server with the type, service and uri provided.

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/messaging/phone-numbers": {
      "get": {
        "summary": "List phone numbers by filters",
        "description": "Retrieve a list of phone numbers given a particular filters. A list of phone numbers are first taken from the pbx portal based on the provided domain, and optionally the user, which are then filtered out from the messaging server with the type, service and uri provided.",
        "security": [
          {
            "api_auth": [
              "messaging"
            ]
          }
        ],
        "tags": [
          "Messaging Assignments"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "The account identifier",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "domain",
            "required": true,
            "description": "The domain name",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "user",
            "description": "The user",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "type",
            "description": "The type (addresses, endpoints, or forwards)",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "service",
            "description": "The service",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "uri",
            "description": "The uri",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success",
            "content": {
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": {
                    "type": "string"
                  },
                  "example": [
                    "12345678901"
                  ]
                }
              }
            }
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "Messaging Assignments"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

Get assignment

# Get assignment

Retrieves the assignment of the phone number user

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/phone-numbers/{phone_number}/messaging/assignment": {
      "get": {
        "summary": "Get assignment",
        "description": "Retrieves the assignment of the phone number user",
        "security": [
          {
            "api_auth": [
              "messaging"
            ]
          }
        ],
        "tags": [
          "Messaging Assignments"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "The account identifier",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "path",
            "name": "phone_number",
            "required": true,
            "description": "The phone number",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "phone_number": {
                      "type": "string"
                    },
                    "domain": {
                      "type": "string"
                    },
                    "user_id": {
                      "type": "string"
                    },
                    "group_id": {
                      "type": "string"
                    },
                    "user": {
                      "type": "string"
                    },
                    "assignment_type": {
                      "type": "string"
                    },
                    "assignment_value": {
                      "type": "string"
                    },
                    "send_copies_to": {
                      "type": "string"
                    },
                    "user_type": {
                      "type": "string"
                    },
                    "custom_data": {
                      "type": "string"
                    }
                  }
                },
                "examples": {
                  "ReachUC User": {
                    "value": {
                      "phone_number": "14123878008",
                      "domain": "skyswitch.15611.service",
                      "user_id": "8291",
                      "group_id": "0",
                      "user": "1121",
                      "assignment_type": "ReachUC User",
                      "assignment_value": "sip:1120m@skyswitch.15611.service",
                      "send_copies_to": "",
                      "user_type": "skyswitch-pbx",
                      "custom_data": ""
                    }
                  },
                  "Email": {
                    "value": {
                      "phone_number": "14123878008",
                      "domain": "skyswitch.15611.service",
                      "user_id": "11594",
                      "group_id": "0",
                      "user": "sys-5575ff67-f3d4-4990-aee8-94846aadffea",
                      "assignment_type": "Email",
                      "assignment_value": "email:john.doe@gmail.com",
                      "send_copies_to": "email:jane.doe@gmail.com",
                      "user_type": "skyswitch-pbx",
                      "custom_data": ""
                    }
                  },
                  "Directory Bot": {
                    "value": {
                      "phone_number": "14123878008",
                      "assignment_type": "Directory Bot",
                      "user_id": "11591",
                      "group_id": "0",
                      "user": "sys-bot-6355d6fd-473b-40e0-af79-07a0c60b9478",
                      "domain": "skyswitch.15611.service",
                      "assignment_value": "https://sms-bot.skyswitch.com/messages/",
                      "send_copies_to": "sip:1120m@skyswitch.15611.service",
                      "user_type": "skyswitch-pbx",
                      "custom_data": ""
                    }
                  },
                  "URL": {
                    "value": {
                      "phone_number": "14123878008",
                      "assignment_type": "URL",
                      "user_id": "11593",
                      "group_id": "0",
                      "user": "sys-7ee0559f-899a-4015-8c89-23bfc9a8a721",
                      "domain": "skyswitch.15611.service",
                      "assignment_value": "http://www.google.com/",
                      "send_copies_to": "email:john.doe@gmail.com",
                      "user_type": "skyswitch-pbx",
                      "custom_data": ""
                    }
                  },
                  "Contact Center": {
                    "value": {
                      "phone_number": "14123878008",
                      "assignment_type": "Contact Center",
                      "user_id": "11593",
                      "group_id": "0",
                      "user": "sys-3d8d1ab8-3531-4632-82dd-e7b0be5c72a3",
                      "domain": "skyswitch.15611.service",
                      "assignment_value": "https://custapi-skyswitch.contactcenter.com/Apps/Integrations/SkySwitch/ReceiveSMS",
                      "send_copies_to": "",
                      "user_type": "skyswitch-pbx",
                      "custom_data": "567c821f-0e40-4e0b-bcbe-a0f301c4e456"
                    }
                  },
                  "Cloud Message": {
                    "value": {
                      "phone_number": "14123878008",
                      "assignment_type": "Cloud Message",
                      "user_id": "11593",
                      "group_id": "0",
                      "user": "sys-3d8d1ab8-3531-4632-82dd-e7b0be5c72a3",
                      "domain": "skyswitch.15611.service",
                      "assignment_value": "https://api.cloudmessage.io/receive?provider=skyswitch",
                      "send_copies_to": "",
                      "user_type": "skyswitch-pbx",
                      "custom_data": ""
                    }
                  },
                  "Cloud Message Staging": {
                    "value": {
                      "phone_number": "14123878008",
                      "assignment_type": "Cloud Message Staging",
                      "user_id": "11593",
                      "group_id": "0",
                      "user": "sys-3d8d1ab8-3531-4632-82dd-e7b0be5c72a3",
                      "domain": "skyswitch.15611.service",
                      "assignment_value": "https://cloudmessage-txb-staging.textable.app/",
                      "send_copies_to": "",
                      "user_type": "skyswitch-pbx",
                      "custom_data": ""
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "Messaging Assignments"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

Save assignment

# Save assignment

Saves the assignment of the phone number user.

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/phone-numbers/{phone_number}/messaging/assignment": {
      "post": {
        "summary": "Save assignment",
        "description": "Saves the assignment of the phone number user.",
        "security": [
          {
            "api_auth": [
              "messaging"
            ]
          }
        ],
        "tags": [
          "Messaging Assignments"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "Account identifier",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "path",
            "name": "phone_number",
            "required": true,
            "description": "Phone number",
            "schema": {
              "type": "string"
            }
          }
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": [
                  "user",
                  "domain",
                  "assignment_type"
                ],
                "properties": {
                  "user": {
                    "type": "string",
                    "description": "The user"
                  },
                  "domain": {
                    "type": "string",
                    "description": "The domain"
                  },
                  "group_id": {
                    "type": "integer",
                    "description": "The group identifier"
                  },
                  "assignment_type": {
                    "type": "string",
                    "description": "ReachUC User, Email, Directory Bot, Contact Center, Cloud Message, Cloud Message Staging,URL"
                  },
                  "assignment_value": {
                    "type": "string",
                    "description": "Assignment value"
                  },
                  "user_type": {
                    "type": "string",
                    "description": "User type"
                  },
                  "custom_data": {
                    "type": "string",
                    "description": "Custom data"
                  }
                }
              },
              "examples": {
                "ReachUC User": {
                  "value": {
                    "domain": "skyswitch.15611.service",
                    "user": "1120",
                    "assignment_type": "ReachUC User",
                    "assignment_value": "",
                    "user_type": "skyswitch-pbx"
                  }
                },
                "Email": {
                  "value": {
                    "domain": "skyswitch.15611.service",
                    "user": "sys-<GUID>",
                    "assignment_type": "Email",
                    "assignment_value": "email:john.doe@skyswitch.com",
                    "user_type": "skyswitch-pbx"
                  }
                },
                "Directory Bot": {
                  "value": {
                    "domain": "skyswitch.15611.service",
                    "user": "sys-<GUID>",
                    "assignment_type": "Directory Bot",
                    "assignment_value": "",
                    "user_type": "skyswitch-pbx"
                  }
                },
                "URL": {
                  "value": {
                    "domain": "skyswitch.15611.service",
                    "user": "sys-<GUID>",
                    "assignment_type": "URL",
                    "assignment_value": "https://ace.broadmind.com/webhook.jsp",
                    "user_type": "skyswitch-pbx"
                  }
                },
                "Contact Center": {
                  "value": {
                    "domain": "skyswitch.15611.service",
                    "user": "sys-<GUID>",
                    "assignment_type": "Contact Center",
                    "assignment_value": "",
                    "user_type": "skyswitch-pbx",
                    "custom_data": "2bf4bf4a-2b3b-4b4b-a612-f6c4659ad4ac"
                  }
                },
                "Cloud Message": {
                  "value": {
                    "domain": "skyswitch.15611.service",
                    "user": "sys-<GUID>",
                    "assignment_type": "Cloud Message",
                    "assignment_value": "",
                    "user_type": "skyswitch-pbx"
                  }
                },
                "Cloud Message Staging": {
                  "value": {
                    "domain": "skyswitch.15611.service",
                    "user": "sys-<GUID>",
                    "assignment_type": "Cloud Message Staging",
                    "assignment_value": "",
                    "user_type": "skyswitch-pbx"
                  }
                }
              }
            }
          }
        },
        "responses": {
          "201": {
            "description": "Success"
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "Messaging Assignments"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

Delete assignment

# Delete assignment

Delete the assignment of the phone number user.

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/phone-numbers/{phone_number}/messaging/assignment": {
      "delete": {
        "summary": "Delete assignment",
        "description": "Delete the assignment of the phone number user.",
        "security": [
          {
            "api_auth": [
              "messaging"
            ]
          }
        ],
        "tags": [
          "Messaging Assignments"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "Account identifier",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "path",
            "name": "phone_number",
            "required": true,
            "description": "Phone number",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "204": {
            "description": "Success"
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "Messaging Assignments"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

List shared addresses

# List shared addresses

Retrieve a list of shared addresses

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/messaging/shared-aliases": {
      "get": {
        "summary": "List shared addresses",
        "description": "Retrieve a list of shared addresses",
        "security": [
          {
            "api_auth": [
              "messaging"
            ]
          }
        ],
        "tags": [
          "Message Sharing"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "Account identifier",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "groupid",
            "required": true,
            "description": "Group identifier",
            "schema": {
              "type": "integer"
            }
          },
          {
            "in": "query",
            "name": "domain",
            "required": true,
            "description": "Domain name",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "owner_userid",
            "description": "User identifier of the owner",
            "schema": {
              "type": "integer"
            }
          },
          {
            "in": "query",
            "name": "recipient_userid",
            "description": "User identifier of the recipient",
            "schema": {
              "type": "integer"
            }
          },
          {
            "in": "query",
            "name": "addressid",
            "description": "Address identifier",
            "schema": {
              "type": "integer"
            }
          },
          {
            "in": "query",
            "name": "service",
            "description": "The service",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success",
            "content": {
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": {
                    "type": "object",
                    "properties": {
                      "sharedaddressid": {
                        "type": "integer"
                      },
                      "userid": {
                        "type": "string"
                      },
                      "groupid": {
                        "type": "string"
                      },
                      "addressid": {
                        "type": "string"
                      },
                      "service": {
                        "type": "string"
                      },
                      "addresses": {
                        "type": "object",
                        "properties": {
                          "addressid": {
                            "type": "integer"
                          },
                          "userid": {
                            "type": "string"
                          },
                          "groupid": {
                            "type": "string"
                          },
                          "service": {
                            "type": "string"
                          },
                          "uri": {
                            "type": "string"
                          },
                          "provider": {
                            "type": "string"
                          },
                          "priority": {
                            "type": "string"
                          },
                          "name": {
                            "type": "string"
                          }
                        }
                      },
                      "users": {
                        "type": "object",
                        "properties": {
                          "userid": {
                            "type": "integer"
                          },
                          "user": {
                            "type": "string"
                          },
                          "domain": {
                            "type": "string"
                          },
                          "brand": {
                            "type": "string"
                          },
                          "name": {
                            "type": "string"
                          }
                        }
                      }
                    }
                  },
                  "example": [
                    {
                      "sharedaddressid": 6,
                      "userid": "12721",
                      "groupid": "0",
                      "addressid": "18816",
                      "service": "sms",
                      "addresses": {
                        "addressid": 18816,
                        "userid": "12719",
                        "groupid": "0",
                        "service": "sms",
                        "uri": "tel:17477778181",
                        "provider": "",
                        "priority": "0",
                        "name": ""
                      },
                      "users": {
                        "userid": 12721,
                        "user": "1128",
                        "domain": "uc.15611.service",
                        "brand": "",
                        "name": ""
                      }
                    }
                  ]
                }
              }
            }
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "Message Sharing"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

Store shared address

# Store shared address

Create or update a group for the messaging service.

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/messaging/shared-aliases": {
      "put": {
        "summary": "Store shared address",
        "description": "Create or update a group for the messaging service.",
        "security": [
          {
            "api_auth": [
              "messaging"
            ]
          }
        ],
        "tags": [
          "Message Sharing"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "The account identifier",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success"
          }
        },
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": [
                  "service",
                  "addressid"
                ],
                "properties": {
                  "userid": {
                    "type": "string",
                    "description": "User identifier."
                  },
                  "groupid": {
                    "type": "string",
                    "description": "Group identifier."
                  },
                  "service": {
                    "type": "string",
                    "description": "The service"
                  },
                  "addressid": {
                    "type": "string",
                    "description": "The address id"
                  },
                  "user": {
                    "type": "string",
                    "description": "The user. Required if userid is not provided."
                  },
                  "domain": {
                    "type": "string",
                    "description": "The domain. Required if userid is not provided."
                  },
                  "device_user": {
                    "type": "string",
                    "description": "Required if userid is not provided."
                  },
                  "name": {
                    "type": "string",
                    "description": "The name."
                  },
                  "brand": {
                    "type": "string",
                    "description": "The brand."
                  },
                  "group_name": {
                    "type": "string",
                    "description": "The group name."
                  },
                  "sharedaddressid": {
                    "type": "string",
                    "description": "The shared address identifier. Used for updates."
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "Message Sharing"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

Delete shared address

# Delete shared address

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/messaging/shared-aliases/{sharedaddressid}": {
      "delete": {
        "summary": "Delete shared address",
        "security": [
          {
            "api_auth": [
              "messaging"
            ]
          }
        ],
        "tags": [
          "Message Sharing"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "The account identifier",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "path",
            "name": "sharedaddressid",
            "required": true,
            "description": "The shared address identifier.",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "204": {
            "description": "Success"
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "Message Sharing"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

List forward addresses

# List forward addresses

Retrieve a list of addresses forwarded

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/messaging/forwardaddresses": {
      "get": {
        "summary": "List forward addresses",
        "description": "Retrieve a list of addresses forwarded",
        "security": [
          {
            "api_auth": [
              "messaging"
            ]
          }
        ],
        "tags": [
          "Message Forwarding"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "Account identifier",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "userid",
            "description": "User identifier",
            "schema": {
              "type": "integer"
            }
          },
          {
            "in": "query",
            "name": "groupid",
            "description": "Group identifier. This is often \"0\" (zero).",
            "schema": {
              "type": "integer"
            }
          },
          {
            "in": "query",
            "name": "service",
            "description": "The service",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "uri",
            "description": "The uri",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "priority",
            "description": "The priority",
            "schema": {
              "type": "integer"
            }
          },
          {
            "in": "query",
            "name": "name",
            "description": "The name",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "direction",
            "description": "inbound, outbound, or both",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "customdata",
            "description": "The custom data",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success",
            "content": {
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": {
                    "type": "object",
                    "properties": {
                      "forwardid": {
                        "type": "integer"
                      },
                      "userid": {
                        "type": "string"
                      },
                      "groupid": {
                        "type": "string"
                      },
                      "service": {
                        "type": "string"
                      },
                      "uri": {
                        "type": "string"
                      },
                      "priority": {
                        "type": "string"
                      },
                      "name": {
                        "type": "string"
                      },
                      "direction": {
                        "type": "string"
                      },
                      "customdata": {
                        "type": "string"
                      },
                      "addresses": {
                        "type": "array",
                        "items": {
                          "type": "object",
                          "properties": {
                            "addressid": {
                              "type": "integer"
                            },
                            "userid": {
                              "type": "string"
                            },
                            "groupid": {
                              "type": "string"
                            },
                            "service": {
                              "type": "string"
                            },
                            "uri": {
                              "type": "string"
                            },
                            "provider": {
                              "type": "string"
                            },
                            "name": {
                              "type": "string"
                            },
                            "customdata": {
                              "type": "string"
                            },
                            "users": {
                              "type": "object",
                              "properties": {
                                "userid": {
                                  "type": "integer"
                                },
                                "user": {
                                  "type": "string"
                                },
                                "domain": {
                                  "type": "string"
                                },
                                "brand": {
                                  "type": "string"
                                },
                                "name": {
                                  "type": "string"
                                }
                              }
                            }
                          }
                        }
                      },
                      "users": {
                        "type": "array",
                        "items": {
                          "type": "object",
                          "properties": {
                            "userid": {
                              "type": "integer"
                            },
                            "user": {
                              "type": "string"
                            },
                            "domain": {
                              "type": "string"
                            },
                            "brand": {
                              "type": "string"
                            },
                            "name": {
                              "type": "string"
                            }
                          }
                        }
                      }
                    }
                  },
                  "example": [
                    {
                      "forwardid": 709,
                      "userid": "1723",
                      "groupid": "3226",
                      "service": "ams",
                      "uri": "sip:6613m@uc.15611.service",
                      "priority": "0",
                      "name": "",
                      "direction": "inbound",
                      "customdata": "",
                      "addresses": [
                        {
                          "addressid": 776,
                          "userid": "1723",
                          "groupid": "3226",
                          "service": "ams",
                          "uri": "sip:6613@GigaTestDomain.15611.service",
                          "priority": "0",
                          "name": "",
                          "customdata": "",
                          "users": {
                            "userid": 1723,
                            "user": "6613",
                            "domain": "GigaTestDomain.15611.service",
                            "brand": "",
                            "name": ""
                          }
                        }
                      ],
                      "users": {
                        "userid": 1723,
                        "user": "6613",
                        "domain": "GigaTestDomain.15611.service",
                        "brand": "",
                        "name": ""
                      }
                    }
                  ]
                }
              }
            }
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "Message Forwarding"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

List addresses

# List addresses

Retrieve a list of addresses associated with a particular group and user.

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/messaging/users/{userid}/route-groups/{groupid}/aliases": {
      "get": {
        "summary": "List addresses",
        "description": "Retrieve a list of addresses associated with a particular group and user.",
        "security": [
          {
            "api_auth": [
              "messaging"
            ]
          }
        ],
        "tags": [
          "Message Forwarding"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "Account identifier",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "path",
            "name": "userid",
            "required": true,
            "description": "User identifier",
            "schema": {
              "type": "integer"
            }
          },
          {
            "in": "path",
            "name": "groupid",
            "required": true,
            "description": "Group identifier. This is often \"0\" (zero).",
            "schema": {
              "type": "integer"
            }
          },
          {
            "in": "query",
            "name": "service",
            "description": "The service",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "uri",
            "description": "The uri",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "priority",
            "description": "The priority",
            "schema": {
              "type": "integer"
            }
          },
          {
            "in": "query",
            "name": "name",
            "description": "The name",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "customdata",
            "description": "The custom data",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success",
            "content": {
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": {
                    "type": "object",
                    "properties": {
                      "addressid": {
                        "type": "integer"
                      },
                      "userid": {
                        "type": "string"
                      },
                      "groupid": {
                        "type": "string"
                      },
                      "service": {
                        "type": "string"
                      },
                      "uri": {
                        "type": "string"
                      },
                      "priority": {
                        "type": "string"
                      },
                      "name": {
                        "type": "string"
                      },
                      "customdata": {
                        "type": "string"
                      }
                    }
                  },
                  "example": [
                    {
                      "addressid": 1,
                      "userid": "1550",
                      "groupid": "0",
                      "service": "sms",
                      "uri": "tel:18589643746",
                      "priority": "0",
                      "name": "",
                      "customdata": ""
                    }
                  ]
                }
              }
            }
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "Message Forwarding"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

Store address

# Store address

Add or update an alias to the recipient user.

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/messaging/users/{userid}/route-groups/{groupid}/aliases": {
      "put": {
        "summary": "Store address",
        "description": "Add or update an alias to the recipient user.",
        "security": [
          {
            "api_auth": [
              "messaging"
            ]
          }
        ],
        "tags": [
          "Message Forwarding"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "Account identifier",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "path",
            "name": "userid",
            "required": true,
            "description": "User identifier",
            "schema": {
              "type": "integer"
            }
          },
          {
            "in": "path",
            "name": "groupid",
            "required": true,
            "description": "Group identifier. This is often \"0\" (zero).",
            "schema": {
              "type": "integer"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success"
          }
        },
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": [
                  "service",
                  "uri"
                ],
                "properties": {
                  "service": {
                    "type": "string",
                    "description": "The service"
                  },
                  "uri": {
                    "type": "string",
                    "description": "The uri"
                  },
                  "name": {
                    "type": "string",
                    "description": "The name"
                  },
                  "priority": {
                    "type": "integer",
                    "description": "The priority"
                  },
                  "customdata": {
                    "type": "string",
                    "description": "The custom data"
                  },
                  "addressid": {
                    "type": "integer",
                    "description": "The address identifier. Used for updates."
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "Message Forwarding"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

Delete address

# Delete address

Remove an alias from the recipient user.

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/messaging/users/{userid}/route-groups/{groupid}/aliases/{addressid}": {
      "delete": {
        "summary": "Delete address",
        "description": "Remove an alias from the recipient user.",
        "security": [
          {
            "api_auth": [
              "messaging"
            ]
          }
        ],
        "tags": [
          "Message Forwarding"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "Account identifier",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "path",
            "name": "userid",
            "required": true,
            "description": "User identifier",
            "schema": {
              "type": "integer"
            }
          },
          {
            "in": "path",
            "name": "groupid",
            "required": true,
            "description": "Group identifier. This is often \"0\" (zero).",
            "schema": {
              "type": "integer"
            }
          },
          {
            "in": "path",
            "name": "addressid",
            "required": true,
            "description": "Address identifier",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "204": {
            "description": "Success"
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "Message Forwarding"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

List forwards

# List forwards

Retrieve a list of forwards associated to a particular group and user.

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/messaging/users/{userid}/route-groups/{groupid}/receive-addresses": {
      "get": {
        "summary": "List forwards",
        "description": "Retrieve a list of forwards associated to a particular group and user.",
        "security": [
          {
            "api_auth": [
              "messaging"
            ]
          }
        ],
        "tags": [
          "Message Forwarding"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "Account identifier",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "path",
            "name": "userid",
            "required": true,
            "description": "User identifier",
            "schema": {
              "type": "integer"
            }
          },
          {
            "in": "path",
            "name": "groupid",
            "required": true,
            "description": "Group identifier. This is often \"0\" (zero).",
            "schema": {
              "type": "integer"
            }
          },
          {
            "in": "query",
            "name": "service",
            "description": "The service. \"ams\" for ReachUC user, \"email\" for email address, \"url\" for webhook url",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "uri",
            "description": "The uri",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "priority",
            "description": "The priority",
            "schema": {
              "type": "integer"
            }
          },
          {
            "in": "query",
            "name": "name",
            "description": "The name",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "direction",
            "description": "\"inbound\", \"outbound\", or \"both\". The \"inbound\" direction indicates that copies of inbound messages will be sent to the entity identified by the \"uri\" attribute. Outbound messages will be sent to the \"outbound\" entity. The \"both\" direction is reserved for Skyswitch use. If a client application wants an entity to get copies of inbound and outbound messages, add both an \"inbound\" record and an \"outbound\" record.",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "customdata",
            "description": "The custom data",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success",
            "content": {
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": {
                    "type": "object",
                    "properties": {
                      "forwardid": {
                        "type": "integer"
                      },
                      "userid": {
                        "type": "string"
                      },
                      "groupid": {
                        "type": "string"
                      },
                      "service": {
                        "type": "string"
                      },
                      "uri": {
                        "type": "string"
                      },
                      "priority": {
                        "type": "string"
                      },
                      "name": {
                        "type": "string"
                      },
                      "direction": {
                        "type": "string"
                      },
                      "customdata": {
                        "type": "string"
                      }
                    }
                  },
                  "example": [
                    {
                      "forwardid": 1212,
                      "userid": "1550",
                      "groupid": "0",
                      "service": "url",
                      "uri": "https://vbroadcast.skyswitch.com/index.php",
                      "priority": "0",
                      "name": "",
                      "direction": "inbound",
                      "customdata": ""
                    }
                  ]
                }
              }
            }
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "Message Forwarding"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

Store forward

# Store forward

Add or update entities that will receive the messages. If a client application wants an entity to get copies of inbound and outbound messages, add both an "inbound" record and an "outbound" record.

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/messaging/users/{userid}/route-groups/{groupid}/receive-addresses": {
      "put": {
        "summary": "Store forward",
        "description": "Add or update entities that will receive the messages. If a client application wants an entity to get copies of inbound and outbound messages, add both an \"inbound\" record and an \"outbound\" record.",
        "security": [
          {
            "api_auth": [
              "messaging"
            ]
          }
        ],
        "tags": [
          "Message Forwarding"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "Account identifier",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "path",
            "name": "userid",
            "required": true,
            "description": "User identifier",
            "schema": {
              "type": "integer"
            }
          },
          {
            "in": "path",
            "name": "groupid",
            "required": true,
            "description": "Group identifier. This is often \"0\" (zero).",
            "schema": {
              "type": "integer"
            }
          }
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": [
                  "service",
                  "uri"
                ],
                "properties": {
                  "service": {
                    "type": "string",
                    "description": "The service"
                  },
                  "uri": {
                    "type": "string",
                    "description": "The uri"
                  },
                  "name": {
                    "type": "string",
                    "description": "The name"
                  },
                  "priority": {
                    "type": "string",
                    "description": "The priority"
                  },
                  "direction": {
                    "type": "string",
                    "description": "inbound, outbound, or both"
                  },
                  "customdata": {
                    "type": "string"
                  },
                  "forwardid": {
                    "type": "integer",
                    "description": "The forward identifier. Used for updates."
                  }
                }
              },
              "examples": {
                "New email": {
                  "value": {
                    "service": "email",
                    "uri": "email:user@company.com",
                    "priority": "0",
                    "direction": "inbound",
                    "name": "",
                    "customdata": ""
                  }
                },
                "New url": {
                  "value": {
                    "service": "url",
                    "uri": "https://subdomain.company.com/webhook",
                    "priority": "0",
                    "direction": "inbound",
                    "name": "",
                    "customdata": ""
                  }
                },
                "New reachuc user": {
                  "value": {
                    "service": "user",
                    "uri": "user:114@petshop.12345.service",
                    "priority": "0",
                    "direction": "inbound",
                    "name": "",
                    "customdata": ""
                  }
                },
                "Update existing record": {
                  "value": {
                    "forwardid": 22708,
                    "service": "url",
                    "uri": "https://subdomain.company.com/webhook",
                    "priority": "0",
                    "direction": "inbound",
                    "name": "",
                    "customdata": ""
                  }
                }
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "Message Forwarding"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

Delete forward

# Delete forward

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/messaging/users/{userid}/route-groups/{groupid}/receive-addresses/{forwardid}": {
      "delete": {
        "summary": "Delete forward",
        "security": [
          {
            "api_auth": [
              "messaging"
            ]
          }
        ],
        "tags": [
          "Message Forwarding"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "Account identifier",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "path",
            "name": "userid",
            "required": true,
            "description": "User identifier",
            "schema": {
              "type": "integer"
            }
          },
          {
            "in": "path",
            "name": "groupid",
            "required": true,
            "description": "Group identifier. This is often \"0\" (zero).",
            "schema": {
              "type": "integer"
            }
          },
          {
            "in": "path",
            "name": "forwardid",
            "required": true,
            "description": "Forward identifier",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "204": {
            "description": "Success"
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "Message Forwarding"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

List endpoints

# List endpoints

Retrieve a list of endpoints associated to a particular group and user.

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/messaging/users/{userid}/route-groups/{groupid}/send-addresses": {
      "get": {
        "summary": "List endpoints",
        "description": "Retrieve a list of endpoints associated to a particular group and user.",
        "security": [
          {
            "api_auth": [
              "messaging"
            ]
          }
        ],
        "tags": [
          "Message Forwarding"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "Account identifier",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "path",
            "name": "userid",
            "required": true,
            "description": "User identifier",
            "schema": {
              "type": "integer"
            }
          },
          {
            "in": "path",
            "name": "groupid",
            "required": true,
            "description": "Group identifier. This is often \"0\" (zero).",
            "schema": {
              "type": "integer"
            }
          },
          {
            "in": "query",
            "name": "service",
            "description": "The service",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "uri",
            "description": "The uri",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "priority",
            "description": "The priority",
            "schema": {
              "type": "integer"
            }
          },
          {
            "in": "query",
            "name": "name",
            "description": "The name",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "customdata",
            "description": "The custom data",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success",
            "content": {
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": {
                    "type": "object",
                    "properties": {
                      "endpointid": {
                        "type": "integer"
                      },
                      "userid": {
                        "type": "string"
                      },
                      "groupid": {
                        "type": "string"
                      },
                      "service": {
                        "type": "string"
                      },
                      "uri": {
                        "type": "string"
                      },
                      "priority": {
                        "type": "string"
                      },
                      "name": {
                        "type": "string"
                      },
                      "customdata": {
                        "type": "string"
                      }
                    }
                  },
                  "example": [
                    {
                      "endpointid": 1,
                      "userid": "1550",
                      "groupid": "0",
                      "service": "ams",
                      "uri": "sip:6321m@testdomain.15611.service",
                      "priority": "0",
                      "name": "",
                      "customdata": ""
                    }
                  ]
                }
              }
            }
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "Message Forwarding"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

Store endpoint

# Store endpoint

Add or update an allowed message sender on behalf of the user.

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/messaging/users/{userid}/route-groups/{groupid}/send-addresses": {
      "put": {
        "summary": "Store endpoint",
        "description": "Add or update an allowed message sender on behalf of the user.",
        "security": [
          {
            "api_auth": [
              "messaging"
            ]
          }
        ],
        "tags": [
          "Message Forwarding"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "Account identifier",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "path",
            "name": "userid",
            "required": true,
            "description": "User identifier",
            "schema": {
              "type": "integer"
            }
          },
          {
            "in": "path",
            "name": "groupid",
            "required": true,
            "description": "Group identifier. This is often \"0\" (zero).",
            "schema": {
              "type": "integer"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success"
          }
        },
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": [
                  "service",
                  "uri"
                ],
                "properties": {
                  "service": {
                    "type": "string",
                    "description": "The service"
                  },
                  "uri": {
                    "type": "string",
                    "description": "The uri"
                  },
                  "name": {
                    "type": "string",
                    "description": "The name"
                  },
                  "priority": {
                    "type": "integer",
                    "description": "The priority"
                  },
                  "customdata": {
                    "type": "string",
                    "description": "The custom data"
                  },
                  "endpointid": {
                    "type": "integer",
                    "description": "The endpoint identifier. Used for updates."
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "Message Forwarding"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

Delete endpoint

# Delete endpoint

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/messaging/users/{userid}/route-groups/{groupid}/send-addresses/{endpointid}": {
      "delete": {
        "summary": "Delete endpoint",
        "security": [
          {
            "api_auth": [
              "messaging"
            ]
          }
        ],
        "tags": [
          "Message Forwarding"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "Account identifier",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "path",
            "name": "userid",
            "required": true,
            "description": "User identifier",
            "schema": {
              "type": "integer"
            }
          },
          {
            "in": "path",
            "name": "groupid",
            "required": true,
            "description": "Group identifier. This is often \"0\" (zero).",
            "schema": {
              "type": "integer"
            }
          },
          {
            "in": "path",
            "name": "endpointid",
            "required": true,
            "description": "Endpoint identifier",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "204": {
            "description": "Success"
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "Message Forwarding"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

Apply multiple addresses by phone number

# Apply multiple addresses by phone number

Add or delete an alias to multiple recipient users.

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/phone-numbers/{phone_number}/messaging/aliases": {
      "post": {
        "summary": "Apply multiple addresses by phone number",
        "description": "Add or delete an alias to multiple recipient users.",
        "security": [
          {
            "api_auth": [
              "messaging"
            ]
          }
        ],
        "tags": [
          "Message Forwarding"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "Account identifier",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "path",
            "name": "phone_number",
            "required": true,
            "description": "Phone number",
            "schema": {
              "type": "string"
            }
          }
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "array",
                "items": {
                  "type": "object",
                  "required": [
                    "user"
                  ],
                  "properties": {
                    "user": {
                      "type": "string"
                    },
                    "domain": {
                      "type": "string"
                    },
                    "service": {
                      "type": "string"
                    },
                    "name": {
                      "type": "string"
                    },
                    "customdata": {
                      "type": "string"
                    },
                    "remove": {
                      "type": "integer",
                      "description": "Set to 1 to delete"
                    }
                  }
                }
              },
              "example": [
                {
                  "user": "sys-jd2n92d2j2342j",
                  "remove": 1
                },
                {
                  "user": "sys-wer023942md283",
                  "domain": "skyswitch.15611.service",
                  "service": "sms",
                  "name": "my-name"
                }
              ]
            }
          }
        },
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "Message Forwarding"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

Store address by phone number

# Store address by phone number

Store an address by phone number and user id.

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/phone-numbers/{phone_number}/users/{userid}/messaging/aliases": {
      "put": {
        "summary": "Store address by phone number",
        "description": "Store an address by phone number and user id.",
        "security": [
          {
            "api_auth": [
              "messaging"
            ]
          }
        ],
        "tags": [
          "Message Forwarding"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "Account identifier",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "path",
            "name": "phone_number",
            "required": true,
            "description": "Phone number",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "path",
            "name": "userid",
            "required": true,
            "description": "User identifier",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "Message Forwarding"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

Delete address by phone number

# Delete address by phone number

Delete an address by phone number and user id.

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/phone-numbers/{phone_number}/users/{userid}/messaging/aliases": {
      "delete": {
        "summary": "Delete address by phone number",
        "description": "Delete an address by phone number and user id.",
        "security": [
          {
            "api_auth": [
              "messaging"
            ]
          }
        ],
        "tags": [
          "Message Forwarding"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "Account identifier",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "path",
            "name": "phone_number",
            "required": true,
            "description": "Phone number",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "path",
            "name": "userid",
            "required": true,
            "description": "User identifier",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "204": {
            "description": "Success"
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "Message Forwarding"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

List endpoint existence

# List endpoint existence

Retrieve a list of endpoints.

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/messaging/send-addresses": {
      "get": {
        "summary": "List endpoint existence",
        "description": "Retrieve a list of endpoints.",
        "security": [
          {
            "api_auth": [
              "messaging"
            ]
          }
        ],
        "tags": [
          "Message Forwarding"
        ],
        "parameters": [
          {
            "in": "query",
            "name": "userid",
            "description": "User identifier",
            "schema": {
              "type": "integer"
            }
          },
          {
            "in": "query",
            "name": "groupid",
            "description": "Group identifier. This is often \"0\" (zero).",
            "schema": {
              "type": "integer"
            }
          },
          {
            "in": "query",
            "name": "service",
            "description": "The service",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "uri",
            "description": "The uri",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "provider",
            "description": "The provider",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "priority",
            "description": "The priority",
            "schema": {
              "type": "integer"
            }
          },
          {
            "in": "query",
            "name": "name",
            "description": "The name",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "customdata",
            "description": "The custom data",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success",
            "content": {
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": {
                    "type": "object",
                    "properties": {
                      "userid": {
                        "type": "string"
                      },
                      "groupid": {
                        "type": "string"
                      },
                      "service": {
                        "type": "string"
                      },
                      "uri": {
                        "type": "string"
                      },
                      "provider": {
                        "type": "string"
                      },
                      "priority": {
                        "type": "string"
                      },
                      "name": {
                        "type": "string"
                      },
                      "customdata": {
                        "type": "string"
                      }
                    }
                  },
                  "example": [
                    {
                      "endpointid": 1,
                      "userid": "1550",
                      "groupid": "0",
                      "service": "ams",
                      "uri": "sip:6321m@testdomain.15611.service",
                      "priority": "0",
                      "name": "",
                      "customdata": ""
                    }
                  ]
                }
              }
            }
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "Message Forwarding"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

Send message

# Send message

Send message

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/messaging/send": {
      "post": {
        "summary": "Send message",
        "description": "Send message",
        "security": [
          {
            "api_auth": [
              "messaging"
            ]
          }
        ],
        "tags": [
          "Message Sending"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "The account identifier",
            "schema": {
              "type": "string"
            }
          }
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": [
                  "destination"
                ],
                "properties": {
                  "source_domain": {
                    "type": "string"
                  },
                  "source_user": {
                    "type": "string"
                  },
                  "source_number": {
                    "type": "string"
                  },
                  "destination": {
                    "type": "string"
                  },
                  "message": {
                    "type": "string"
                  },
                  "message_media": {
                    "type": "array",
                    "items": {
                      "type": "string"
                    }
                  },
                  "options": {
                    "type": "string"
                  },
                  "ref_id": {
                    "type": "string"
                  },
                  "callback": {
                    "type": "string",
                    "description": "The URL endpoint which will be posted with notification or error replies relative to the message sent request."
                  },
                  "application": {
                    "type": "string",
                    "description": "Use any string to identify the application sending the message. It is recommended to use a single string that represents an alias for your particular application, e.g., 'alarmapp'. This can be used to generated reports off your MDRs grouped by application."
                  }
                }
              },
              "examples": {
                "SMS from Specific Caller ID": {
                  "value": {
                    "source_number": "tel:15151234567",
                    "destination": "tel:12023334444",
                    "message": "from callerid testing in postman 2"
                  }
                },
                "SMS from Specific Caller ID of a User": {
                  "value": {
                    "source_domain": "acmecorp.12345.service",
                    "source_user": "1000",
                    "source_number": "tel:12129007777",
                    "destination": "tel:12345678901",
                    "message": "This is the text message",
                    "options": "directsend,notifyfailure,nosentcopy"
                  }
                },
                "SMS To User": {
                  "value": {
                    "source_domain": "acmecorp.12345.service",
                    "source_user": "1000",
                    "destination": "user:2000@acmecorp.12345.service",
                    "message": "This is the text message"
                  }
                },
                "MMS from a User to a Phone Number": {
                  "value": {
                    "source_domain": "acmecorp.12345.service",
                    "source_user": "1000",
                    "destination": "tel:12345678901",
                    "message": "This is the text message",
                    "message_media": [
                      "http://storage.company.com/store/product.jpg"
                    ]
                  }
                },
                "SMS from a User's Primary Number": {
                  "value": {
                    "source_number": "acmecorp.12345.service",
                    "source_user": "1000",
                    "destination": "tel:12345678901",
                    "message": "This is the text message"
                  }
                }
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Success",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "message_id": {
                      "type": "string"
                    }
                  },
                  "example": {
                    "message_id": 3168934
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "Message Sending"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

Send message

# Send message

Send message

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/messaging/send": {
      "post": {
        "summary": "Send message",
        "description": "Send message",
        "security": [
          {
            "api_auth": [
              "messaging"
            ]
          }
        ],
        "tags": [
          "Message Sending"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "The account identifier",
            "schema": {
              "type": "string"
            }
          }
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": [
                  "destination"
                ],
                "properties": {
                  "source_domain": {
                    "type": "string"
                  },
                  "source_user": {
                    "type": "string"
                  },
                  "source_number": {
                    "type": "string"
                  },
                  "destination": {
                    "type": "string"
                  },
                  "message": {
                    "type": "string"
                  },
                  "message_media": {
                    "type": "array",
                    "items": {
                      "type": "string"
                    }
                  },
                  "options": {
                    "type": "string"
                  },
                  "ref_id": {
                    "type": "string"
                  },
                  "callback": {
                    "type": "string",
                    "description": "The URL endpoint which will be posted with notification or error replies relative to the message sent request."
                  },
                  "application": {
                    "type": "string",
                    "description": "Use any string to identify the application sending the message. It is recommended to use a single string that represents an alias for your particular application, e.g., 'alarmapp'. This can be used to generated reports off your MDRs grouped by application."
                  }
                }
              },
              "examples": {
                "SMS from Specific Caller ID": {
                  "value": {
                    "source_number": "tel:15151234567",
                    "destination": "tel:12023334444",
                    "message": "from callerid testing in postman 2"
                  }
                },
                "SMS from Specific Caller ID of a User": {
                  "value": {
                    "source_domain": "acmecorp.12345.service",
                    "source_user": "1000",
                    "source_number": "tel:12129007777",
                    "destination": "tel:12345678901",
                    "message": "This is the text message",
                    "options": "directsend,notifyfailure,nosentcopy"
                  }
                },
                "SMS To User": {
                  "value": {
                    "source_domain": "acmecorp.12345.service",
                    "source_user": "1000",
                    "destination": "user:2000@acmecorp.12345.service",
                    "message": "This is the text message"
                  }
                },
                "MMS from a User to a Phone Number": {
                  "value": {
                    "source_domain": "acmecorp.12345.service",
                    "source_user": "1000",
                    "destination": "tel:12345678901",
                    "message": "This is the text message",
                    "message_media": [
                      "http://storage.company.com/store/product.jpg"
                    ]
                  }
                },
                "SMS from a User's Primary Number": {
                  "value": {
                    "source_number": "acmecorp.12345.service",
                    "source_user": "1000",
                    "destination": "tel:12345678901",
                    "message": "This is the text message"
                  }
                }
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Success",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "message_id": {
                      "type": "string"
                    }
                  },
                  "example": {
                    "message_id": 3168934
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "Message Sending"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

List mdrs

# List mdrs

List message data records

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/tendlc/mdrs": {
      "get": {
        "summary": "List mdrs",
        "description": "List message data records",
        "security": [
          {
            "api_auth": [
              "ten_dlc"
            ]
          }
        ],
        "tags": [
          "SMS Reports"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "Account identifier",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "start_date",
            "description": "Start date. Required when type is not inbound_detail or outbound_detail",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "end_date",
            "description": "End date. Required when type is not inbound_detail or outbound_detail",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "type",
            "required": true,
            "description": "View type. Values can be all, inbound, outbound, inbound_detail, outbound_detail, count, undelivered, unknown_delivery_status",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "message_id",
            "description": "Message identifier. Required when type is inbound_detail",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "delivery_id",
            "description": "Delivery identifier. Required when type is outbound_identifier",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "source_number",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "destination_number",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "brand_id",
            "schema": {
              "type": "integer"
            }
          },
          {
            "in": "query",
            "name": "campaign_id",
            "schema": {
              "type": "integer"
            }
          },
          {
            "in": "query",
            "name": "application",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "page",
            "schema": {
              "type": "integer"
            }
          },
          {
            "in": "query",
            "name": "per_page",
            "description": "Required with page",
            "schema": {
              "type": "integer"
            }
          },
          {
            "in": "query",
            "name": "sort_by",
            "description": "Column name. Required with sort_order. (ResellerID, Timestamp, MessageID, DeliveryID, MessageType, Direction, SourceNumber, DestinationNumber, SentTimestamp, CompletedTimestamp, MessageSegments, CampaignClass, CampaignID, BrandID, BrandName, ErrorCode, DLRCode, DeliveryStatus))",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "sort_order",
            "description": "Sort order. Required with sort_by. (asc, desc)",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success.",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "pagination": {
                      "$ref": "#/components/schemas/Pagination"
                    },
                    "data": {
                      "type": "array",
                      "items": {
                        "type": "object",
                        "properties": {
                          "ResellerID": {
                            "type": "string"
                          },
                          "Timestamp": {
                            "type": "string"
                          },
                          "MessageID": {
                            "type": "string"
                          },
                          "DeliveryID": {
                            "type": "string"
                          },
                          "MessageType": {
                            "type": "string"
                          },
                          "Application": {
                            "type": "string"
                          },
                          "SourceNumber": {
                            "type": "string"
                          },
                          "DestinationNumber": {
                            "type": "string"
                          },
                          "SentTimestamp": {
                            "type": "string"
                          },
                          "CompletedTimestamp": {
                            "type": "string"
                          },
                          "MessageSegments": {
                            "type": "string"
                          },
                          "CampaignClass": {
                            "type": "string"
                          },
                          "CampaignID": {
                            "type": "string"
                          },
                          "BrandID": {
                            "type": "string"
                          },
                          "BrandName": {
                            "type": "string"
                          },
                          "ErrorCode": {
                            "type": "string"
                          },
                          "DLRCode": {
                            "type": "string"
                          },
                          "DeliveryStatus": {
                            "type": "string"
                          }
                        }
                      }
                    }
                  }
                },
                "example": {
                  "pagination": {
                    "count": 1,
                    "per_page": "10",
                    "page": 1
                  },
                  "data": [
                    {
                      "ResellerID": "12345",
                      "Timestamp": "2021-11-02 09:16:33",
                      "MessageID": "16086731",
                      "DeliveryID": "",
                      "MessageType": "sms-a2p",
                      "Application": "",
                      "Direction": "INBOUND",
                      "SourceNumber": "12345678901",
                      "DestinationNumber": "01234567891",
                      "SentTimestamp": "",
                      "CompletedTimestamp": "",
                      "MessageSegments": "",
                      "CampaignClass": "T",
                      "CampaignID": "ABCDEF",
                      "BrandID": "BRANDY",
                      "BrandName": "Some Brand",
                      "ErrorCode": "",
                      "DLRCode": "",
                      "DeliveryStatus": ""
                    }
                  ]
                }
              }
            }
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "SMS Reports"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    },
    "schemas": {
      "Pagination": {
        "type": "object",
        "properties": {
          "count": {
            "type": "integer"
          },
          "per_page": {
            "type": "integer"
          },
          "page": {
            "type": "integer"
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

Get cnam delivery

# Get cnam delivery

Get the status CNAM delivery for a phone number.

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/phone-numbers/{phone_number}/cnam-delivery": {
      "get": {
        "summary": "Get cnam delivery",
        "description": "Get the status CNAM delivery for a phone number.",
        "security": [
          {
            "api_auth": [
              "phone_number"
            ]
          }
        ],
        "tags": [
          "CNAM Deliveries - Inbound"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "The account identifier",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "path",
            "name": "phone_number",
            "required": true,
            "description": "The phone number",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "CNAM is set."
          },
          "404": {
            "description": "CNAM is not set."
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "CNAM Deliveries - Inbound"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

Enable cnam delivery

# Enable cnam delivery

Enable CNAM Delivery on a phone number.

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/phone-numbers/{phone_number}/cnam-delivery": {
      "put": {
        "summary": "Enable cnam delivery",
        "description": "Enable CNAM Delivery on a phone number.",
        "security": [
          {
            "api_auth": [
              "phone_number"
            ]
          }
        ],
        "tags": [
          "CNAM Deliveries - Inbound"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "The account identifier",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "path",
            "name": "phone_number",
            "required": true,
            "description": "The phone number",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success."
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "CNAM Deliveries - Inbound"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

Disable cnam delivery

# Disable cnam delivery

Disable CNAM Delivery on a phone number.

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/phone-numbers/{phone_number}/cnam-delivery": {
      "delete": {
        "summary": "Disable cnam delivery",
        "description": "Disable CNAM Delivery on a phone number.",
        "security": [
          {
            "api_auth": [
              "phone_number"
            ]
          }
        ],
        "tags": [
          "CNAM Deliveries - Inbound"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "The account identifier",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "path",
            "name": "phone_number",
            "required": true,
            "description": "The phone number",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "204": {
            "description": "Success."
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "CNAM Deliveries - Inbound"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

Get Outbound CNAM Details

# Get Outbound CNAM Details

Get the outbound cnam delivery data of a stock phone number.

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/phone-numbers/{phone_number}/cnam-outbound/enum": {
      "get": {
        "summary": "Get Outbound CNAM Details",
        "description": "Get the outbound cnam delivery data of a stock phone number.",
        "security": [
          {
            "api_auth": [
              "phone_number"
            ]
          }
        ],
        "tags": [
          "CNAM Storage - Outbound"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "The account identifier",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "path",
            "name": "phone_number",
            "required": true,
            "description": "The phone number",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success.",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object"
                },
                "example": {
                  "open_cnam_standard": "BOISE        ID",
                  "cidname": "BOISE       I",
                  "neustar": "BOISE        ID"
                }
              }
            }
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "CNAM Storage - Outbound"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

Set Outbound CNAM

# Set Outbound CNAM

Set the outbound CNAM of a phone number

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/phone-numbers/{phone_number}/cnam-outbound/neustar": {
      "put": {
        "summary": "Set Outbound CNAM",
        "description": "Set the outbound CNAM of a phone number",
        "security": [
          {
            "api_auth": [
              "phone_number"
            ]
          }
        ],
        "tags": [
          "CNAM Storage - Outbound"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "The account identifier",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "path",
            "name": "phone_number",
            "required": true,
            "description": "The phone number",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success."
          }
        },
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": [
                  "calling_name"
                ],
                "properties": {
                  "calling_name": {
                    "type": "string",
                    "description": "Calling name"
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "CNAM Storage - Outbound"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

Remove Outbound CNAM

# Remove Outbound CNAM

Remove the outbound CNAM of a phone number

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/phone-numbers/{phone_number}/cnam-outbound/neustar": {
      "delete": {
        "summary": "Remove Outbound CNAM",
        "description": "Remove the outbound CNAM of a phone number",
        "security": [
          {
            "api_auth": [
              "phone_number"
            ]
          }
        ],
        "tags": [
          "CNAM Storage - Outbound"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "The account identifier",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "path",
            "name": "phone_number",
            "required": true,
            "description": "The phone number",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "204": {
            "description": "Success."
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "CNAM Storage - Outbound"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

Get anti-spam delivery

# Get anti-spam delivery

Get anti-spam delivery

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/phone-numbers/{phone_number}/anti-spam-delivery": {
      "get": {
        "summary": "Get anti-spam delivery",
        "description": "Get anti-spam delivery",
        "security": [
          {
            "api_auth": [
              "phone_number"
            ]
          }
        ],
        "tags": [
          "Anti-spam Deliveries"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "The account identifier",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "path",
            "name": "phone_number",
            "required": true,
            "description": "The phone number",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success.",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "spam_score": {
                      "type": "integer"
                    },
                    "caller_id_name_prefix": {
                      "type": "integer"
                    },
                    "caller_id_prefix": {
                      "type": "integer"
                    },
                    "caller_id_reject": {
                      "type": "integer"
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "Anti-spam Deliveries"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

Set anti-spam delivery

# Set anti-spam delivery

Set anti-spam delivery

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/phone-numbers/{phone_number}/anti-spam-delivery": {
      "put": {
        "summary": "Set anti-spam delivery",
        "description": "Set anti-spam delivery",
        "security": [
          {
            "api_auth": [
              "phone_number"
            ]
          }
        ],
        "tags": [
          "Anti-spam Deliveries"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "The account identifier",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "path",
            "name": "phone_number",
            "required": true,
            "description": "The phone number",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success."
          }
        },
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": [
                  "spam_score",
                  "caller_id_name_prefix",
                  "caller_id_prefix",
                  "caller_id_reject"
                ],
                "properties": {
                  "spam_score": {
                    "type": "integer",
                    "description": "Spam score flag"
                  },
                  "caller_id_name_prefix": {
                    "type": "integer",
                    "description": "Caller ID name prefix flag"
                  },
                  "caller_id_prefix": {
                    "type": "integer",
                    "description": "Caller ID prefix flag"
                  },
                  "caller_id_reject": {
                    "type": "integer",
                    "description": "Caller ID reject flag"
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "Anti-spam Deliveries"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

List pbx domains

# List pbx domains

Get the list of PBX domains accessible by the account.

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/pbx/domains": {
      "get": {
        "summary": "List pbx domains",
        "description": "Get the list of PBX domains accessible by the account.",
        "security": [
          {
            "api_auth": [
              "pbx"
            ]
          }
        ],
        "tags": [
          "Pbx"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "The account identifier",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "reseller",
            "description": "Filter by reseller",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "force_refresh",
            "description": "Force to retrieve latest domains list without waiting for the regular cache refresh schedule",
            "schema": {
              "type": "integer"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success",
            "content": {
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": {
                    "type": "object",
                    "properties": {
                      "domain": {
                        "type": "string"
                      },
                      "reseller": {
                        "type": "string"
                      },
                      "description": {
                        "type": "string"
                      }
                    }
                  }
                },
                "example": {
                  "skyswitch.15611.service": {
                    "domain": "skyswitch.15611.service",
                    "reseller": "15611",
                    "description": "SkySwitch Domain"
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "Pbx"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

List companies

# List companies

Get the list of companies accessible by the account.

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/companies": {
      "get": {
        "summary": "List companies",
        "description": "Get the list of companies accessible by the account.",
        "security": [
          {
            "api_auth": [
              "pbx"
            ]
          }
        ],
        "tags": [
          "Pbx"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "The account identifier",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success",
            "content": {
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": {
                    "type": "object",
                    "properties": {
                      "id": {
                        "type": "string"
                      },
                      "domain": {
                        "type": "string"
                      },
                      "reseller": {
                        "type": "string"
                      },
                      "description": {
                        "type": "string"
                      }
                    }
                  }
                },
                "example": {
                  "skyswitch.15611.service": {
                    "id": "b815bd90-c190-21ed-bc26-f9927a91a010",
                    "domain": "skyswitch.15611.service",
                    "reseller": "15611",
                    "description": "SkySwitch Domain"
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "Pbx"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

Make call

# Make call

Make a new call

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/pbx/make-call": {
      "post": {
        "summary": "Make call",
        "description": "Make a new call",
        "security": [
          {
            "api_auth": [
              "pbx"
            ]
          }
        ],
        "tags": [
          "Pbx"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "Account identifier",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "202": {
            "description": "Success.",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "call_id": {
                      "type": "string"
                    }
                  },
                  "example": {
                    "call_id": "e27b30fc-7ef9-449a-ac19-eb2e7a4c0524"
                  }
                }
              }
            }
          }
        },
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": [
                  "uid",
                  "destination"
                ],
                "properties": {
                  "uid": {
                    "type": "string",
                    "description": "User ID for the subscriber monitoring the Call."
                  },
                  "destination": {
                    "type": "string",
                    "description": "Destination/recipient for the Call. Use SIP account of the extension you're trying to reach."
                  },
                  "origination": {
                    "type": "string",
                    "default": "",
                    "description": "Source of the new call."
                  },
                  "application": {
                    "type": "string",
                    "default": "",
                    "description": "Name of the Application."
                  },
                  "auto": {
                    "type": "string",
                    "default": "",
                    "description": "Specify whether auto answer is enabled or disabled."
                  },
                  "cbani": {
                    "type": "string",
                    "default": "",
                    "description": "ANI to be signalled at the Call Back"
                  },
                  "ani": {
                    "type": "string",
                    "default": "",
                    "description": "Automatic number identification. Grants the destination access to information about the call's origin."
                  },
                  "call_id": {
                    "type": "string",
                    "default": "",
                    "description": "SIP Call-ID. Should be unique for each call. A random uuid will be used if not set."
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "Pbx"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

List phone numbers by domain

# List phone numbers by domain

Get the list of phone numbers by PBX domains accessible by the account.

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/pbx/phone-numbers": {
      "get": {
        "summary": "List phone numbers by domain",
        "description": "Get the list of phone numbers by PBX domains accessible by the account.",
        "security": [
          {
            "api_auth": [
              "pbx"
            ]
          }
        ],
        "tags": [
          "Pbx"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "The account identifier",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "domain",
            "required": true,
            "description": "Domain name",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "user",
            "description": "Pbx user",
            "schema": {
              "type": "string",
              "default": ""
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success",
            "content": {
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": {
                    "type": "string"
                  }
                },
                "example": [
                  "12033045272",
                  "12089177013"
                ]
              }
            }
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "Pbx"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

List pbx resellers

# List pbx resellers

Get the list of PBX resellers accessible by the account.

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/pbx/resellers": {
      "get": {
        "summary": "List pbx resellers",
        "description": "Get the list of PBX resellers accessible by the account.",
        "security": [
          {
            "api_auth": [
              "pbx"
            ]
          }
        ],
        "tags": [
          "Pbx"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "The account identifier",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success",
            "content": {
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": {
                    "type": "object",
                    "properties": {
                      "name": {
                        "type": "string"
                      },
                      "description": {
                        "type": "string"
                      }
                    }
                  }
                },
                "example": {
                  "15611": {
                    "name": "15611",
                    "description": "SkySwitch"
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "Pbx"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

List pbx subscribers

# List pbx subscribers

Get the list of PBX subscribers for a domain.

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/pbx/subscribers": {
      "get": {
        "summary": "List pbx subscribers",
        "description": "Get the list of PBX subscribers for a domain.",
        "security": [
          {
            "api_auth": [
              "pbx"
            ]
          }
        ],
        "tags": [
          "Pbx"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "The account identifier",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "domain",
            "description": "Filter by domain",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "filter",
            "description": "Filter by service code. Possible values are all, queue, attendant, subscriber",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "user",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "login",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success",
            "content": {
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": {
                    "type": "object",
                    "properties": {
                      "user": {
                        "type": "string"
                      },
                      "domain": {
                        "type": "string"
                      },
                      "name": {
                        "type": "string"
                      },
                      "caller_id": {
                        "type": "string"
                      },
                      "caller_id_emergency": {
                        "type": "string"
                      },
                      "email_address": {
                        "type": "string"
                      },
                      "srv_code": {
                        "type": "string"
                      },
                      "subscriber_login": {
                        "type": "string"
                      },
                      "first_name": {
                        "type": "string"
                      },
                      "last_name": {
                        "type": "string"
                      },
                      "group": {
                        "type": "string"
                      }
                    }
                  }
                },
                "example": {
                  "100": {
                    "user": "100",
                    "domain": "skyswitch.15611.service",
                    "name": "John Doe",
                    "caller_id": "4072131863",
                    "caller_id_emergency": "4072131863",
                    "email_address": "john.doe@gmail.com",
                    "srv_code": "",
                    "subscriber_login": "100@skyswitch",
                    "first_name": "John",
                    "last_name": "Doe",
                    "group": "Devs"
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "Pbx"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

Get pbx ui config

# Get pbx ui config

Get the PBX UI domain configuration.

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/pbx/ui-config": {
      "get": {
        "summary": "Get pbx ui config",
        "description": "Get the PBX UI domain configuration.",
        "security": [
          {
            "api_auth": [
              "pbx"
            ]
          }
        ],
        "tags": [
          "Pbx"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "The account identifier",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "domain",
            "required": true,
            "description": "Domain name",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "config_name",
            "required": true,
            "description": "Config name",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "config_name": {
                      "type": "string"
                    },
                    "config_value": {
                      "type": "string"
                    },
                    "domain": {
                      "type": "string"
                    },
                    "description": {
                      "type": "string"
                    },
                    "server_name": {
                      "type": "string"
                    }
                  }
                },
                "example": {
                  "config_name": "PORTAL_DOMAIN_HIPAA_ENABLED",
                  "config_value": "no",
                  "domain": "skyswitch.15611.service",
                  "description": "Enable HIPAA compliance feature",
                  "server_name": "*"
                }
              }
            }
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "Pbx"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

Validate e911

# Validate e911

Validate an E911 endpoint address.

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/e911/address": {
      "get": {
        "summary": "Validate e911",
        "description": "Validate an E911 endpoint address.",
        "security": [
          {
            "api_auth": [
              "e911"
            ]
          }
        ],
        "tags": [
          "E911"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "Account identifier",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "street_number",
            "required": true,
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "street_name",
            "required": true,
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "location",
            "description": "Additional location information such as suite, floor, etc.",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "city",
            "required": true,
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "state",
            "required": true,
            "description": "two-letter abbreviation.",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "zip_code",
            "required": true,
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "country",
            "required": true,
            "description": "US or CA",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "force",
            "description": "Setting to 0 will validate the full address; otherwise, it will validate the address only as CSZ (city-state-zip).",
            "schema": {
              "type": "integer",
              "default": 0
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success.",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object"
                },
                "example": {
                  "level_of_service": {
                    "responder_type": "PSAP",
                    "routing_status": "Enhanced",
                    "msag_status": "FOUND",
                    "position_status": "FULL_ADDRESS",
                    "civic_status": "PREFERRED"
                  },
                  "address_corrected": {
                    "name": "My Home",
                    "street_number": "451",
                    "street_name": "BRENTWOOD CLUB CV",
                    "location": "Apartment 101",
                    "city": "LONGWOOD",
                    "state": "FL",
                    "country": "US",
                    "zip_code": "32750"
                  },
                  "geoposition": {
                    "latitude": "28.72063",
                    "longitude": "-81.35826"
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "E911"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

List countries

# List countries

List countries.

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/e911/countries": {
      "get": {
        "summary": "List countries",
        "description": "List countries.",
        "security": [
          {
            "api_auth": [
              "e911"
            ]
          }
        ],
        "tags": [
          "E911"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "Account identifier",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success.",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object"
                },
                "example": {
                  "US": "United States",
                  "CA": "Canada"
                }
              }
            }
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "E911"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

List e911

# List e911

List E911 endpoints.

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/e911/endpoints": {
      "get": {
        "summary": "List e911",
        "description": "List E911 endpoints.",
        "security": [
          {
            "api_auth": [
              "e911"
            ]
          }
        ],
        "tags": [
          "E911"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "Account identifier",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success.",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object"
                },
                "example": [
                  {
                    "phone_number": "14074884809",
                    "location": {
                      "description": null,
                      "custom_callback": null,
                      "notification": {
                        "email_addresses": [
                          "john.doe@gmail.com",
                          "jane.doe@gmail.com"
                        ],
                        "did": null,
                        "mute_option": null,
                        "notification_display": null
                      },
                      "delivery": "DIRECT",
                      "address": {
                        "civic_address": {
                          "name": "Blake McKeeby",
                          "street_number": "452",
                          "street_name": "WOOD ST",
                          "location": "",
                          "city": "LAKE MARY",
                          "state": "FL",
                          "country": "US",
                          "zip_code": "32746"
                        },
                        "geoposition": {
                          "latitude": "28.745261",
                          "longitude": "-81.3283754"
                        }
                      },
                      "level_of_service": {
                        "responder_type": "PSAP",
                        "routing_status": "Enhanced",
                        "msag_status": "FOUND",
                        "position_status": "FULL_ADDRESS",
                        "civic_status": "PREFERRED",
                        "referred_status": "NA"
                      },
                      "force_csz": false,
                      "language": "EN"
                    }
                  }
                ]
              }
            }
          },
          "400": {
            "description": "Bad Request"
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "E911"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

List states

# List states

List states.

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/e911/states": {
      "get": {
        "summary": "List states",
        "description": "List states.",
        "security": [
          {
            "api_auth": [
              "e911"
            ]
          }
        ],
        "tags": [
          "E911"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "Account identifier",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success.",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object"
                },
                "example": {
                  "USA": {
                    "AL": "Alabama",
                    "AK": "Alaska",
                    "AS": "American Samoa",
                    "AZ": "Arizona",
                    "AR": "Arkansas",
                    "CA": "California",
                    "CO": "Colorado",
                    "CT": "Connecticut",
                    "DE": "Delaware",
                    "DC": "District of Columbia",
                    "FM": "Federated States of Micronesia",
                    "FL": "Florida",
                    "GA": "Georgia",
                    "GU": "Guam",
                    "HI": "Hawaii",
                    "ID": "Idaho",
                    "IL": "Illinois",
                    "IN": "Indiana",
                    "IA": "Iowa",
                    "KS": "Kansas",
                    "KY": "Kentucky",
                    "LA": "Louisiana",
                    "ME": "Maine",
                    "MH": "Marshall Islands",
                    "MD": "Maryland",
                    "MA": "Massachusetts",
                    "MI": "Michigan",
                    "MN": "Minnesota",
                    "MS": "Mississippi",
                    "MO": "Missouri",
                    "MT": "Montana",
                    "NE": "Nebraska",
                    "NV": "Nevada",
                    "NH": "New Hampshire",
                    "NJ": "New Jersey",
                    "NM": "New Mexico",
                    "NY": "New York",
                    "NC": "North Carolina",
                    "ND": "North Dakota",
                    "MP": "Northern Mariana Islands",
                    "OH": "Ohio",
                    "OK": "Oklahoma",
                    "OR": "Oregon",
                    "PW": "Palau",
                    "PA": "Pennsylvania",
                    "PR": "Puerto Rico",
                    "RI": "Rhode Island",
                    "SC": "South Carolina",
                    "TN": "Tennessee",
                    "TX": "Texas",
                    "UT": "Utah",
                    "VT": "Vermont",
                    "VI": "Virgin Islands",
                    "VA": "Virginia",
                    "WA": "Washington",
                    "WV": "West Virginia",
                    "WI": "Wisconsin",
                    "WY": "Wyoming"
                  },
                  "CAN": {
                    "AB": "Alberta",
                    "BC": "British Columbia",
                    "MB": "Manitoba",
                    "NB": "New Brunswick",
                    "NL": "Newfoundland and Labrador",
                    "NT": "Northwest Territories",
                    "NS": "Nova Scotia",
                    "NU": "Nunavut",
                    "ON": "Ontario",
                    "PE": "Prince Edward Island",
                    "QC": "Quebec",
                    "SK": "Saskatchewan",
                    "YT": "Yukon"
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "E911"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

Get e911

# Get e911

Retrieve an E911 endpoint.

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/phone-numbers/{phone_number}/e911": {
      "get": {
        "summary": "Get e911",
        "description": "Retrieve an E911 endpoint.",
        "security": [
          {
            "api_auth": [
              "e911"
            ]
          }
        ],
        "tags": [
          "E911"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "Account identifier",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "path",
            "name": "phone_number",
            "required": true,
            "description": "Phone number",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "force",
            "description": "0 to retrieve from cache; 1 to refresh cache.",
            "schema": {
              "type": "integer"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success.",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object"
                },
                "examples": {
                  "USA": {
                    "value": {
                      "phone_number": "14074884809",
                      "location": {
                        "description": null,
                        "custom_callback": null,
                        "notification": {
                          "email_addresses": [
                            "john.doe@gmail.com",
                            "jane.doe@gmail.com"
                          ],
                          "did": null,
                          "mute_option": null,
                          "notification_display": null
                        },
                        "delivery": "DIRECT",
                        "address": {
                          "civic_address": {
                            "name": "Blake McKeeby",
                            "street_number": "452",
                            "street_name": "WOOD ST",
                            "location": "",
                            "city": "LAKE MARY",
                            "state": "FL",
                            "country": "US",
                            "zip_code": "32746"
                          },
                          "geoposition": {
                            "latitude": "28.745261",
                            "longitude": "-81.3283754"
                          }
                        },
                        "level_of_service": {
                          "responder_type": "PSAP",
                          "routing_status": "Enhanced",
                          "msag_status": "FOUND",
                          "position_status": "FULL_ADDRESS",
                          "civic_status": "PREFERRED",
                          "referred_status": "NA"
                        },
                        "force_csz": false,
                        "language": "EN"
                      }
                    }
                  },
                  "Canada": {
                    "value": {
                      "phone_number": "14123878008",
                      "location": {
                        "address": {
                          "civic_address": {
                            "name": "John Doe",
                            "street_number": "3008",
                            "street_name": "66TH STREET NW",
                            "location": "",
                            "city": "EDMONTON",
                            "state": "AB",
                            "country": "CA",
                            "zip_code": "T6K 4B2"
                          },
                          "geoposition": {
                            "latitude": null,
                            "longitude": null
                          }
                        },
                        "level_of_service": {
                          "responder_type": "PSAP",
                          "routing_status": "Basic",
                          "msag_status": "FOUND",
                          "position_status": "FULL_ADDRESS",
                          "civic_status": "ALTERNATIVE",
                          "referred_status": "NA"
                        },
                        "force_csz": false,
                        "language": "EN"
                      }
                    }
                  }
                }
              }
            }
          },
          "400": {
            "description": "Bad Request.",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object"
                },
                "example": {
                  "error": "E911 record not found."
                }
              }
            }
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "E911"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

Provision e911

# Provision e911

Provision an E911 endpoint.

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/phone-numbers/{phone_number}/e911": {
      "put": {
        "summary": "Provision e911",
        "description": "Provision an E911 endpoint.",
        "security": [
          {
            "api_auth": [
              "e911"
            ]
          }
        ],
        "tags": [
          "E911"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "Account identifier",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "path",
            "name": "phone_number",
            "required": true,
            "description": "Phone number",
            "schema": {
              "type": "string"
            }
          }
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": [
                  "street_number",
                  "street_name",
                  "city",
                  "state",
                  "zip_code",
                  "country"
                ],
                "properties": {
                  "name": {
                    "type": "string",
                    "description": "Name to be displayed to PSAP."
                  },
                  "street_number": {
                    "type": "string"
                  },
                  "street_name": {
                    "type": "string"
                  },
                  "location": {
                    "type": "string",
                    "description": "Additional location information such as suite, floor, etc."
                  },
                  "city": {
                    "type": "string"
                  },
                  "state": {
                    "type": "string",
                    "description": "two-letter abbreviation."
                  },
                  "zip_code": {
                    "type": "string"
                  },
                  "country": {
                    "type": "string",
                    "description": "US or CA"
                  },
                  "longitude": {
                    "type": "string"
                  },
                  "latitude": {
                    "type": "string"
                  },
                  "force": {
                    "type": "integer",
                    "default": 0,
                    "description": "If address does not pass validation, force address to be saved."
                  },
                  "language": {
                    "type": "string",
                    "description": "EN, or FR (FR only supported in Canada)"
                  },
                  "description": {
                    "type": "string"
                  },
                  "custom_callback": {
                    "type": "string",
                    "description": "11 digits. The number that will appear on the PSAP operator’s screen as the number that should be called back."
                  },
                  "delivery_method": {
                    "type": "string",
                    "description": "DIRECT, or THREE_WAY"
                  },
                  "notification_email": {
                    "type": "array",
                    "description": "Array of email addresses",
                    "items": {
                      "type": "string"
                    }
                  },
                  "number_to_bridge": {
                    "type": "string",
                    "description": "11 digits. This is the phone number that will receive a call when 911 is dialed if delivery_method is SECURITY_DESK or THREE_WAY."
                  },
                  "listen_only": {
                    "type": "boolean",
                    "description": "Controls whether the call to the notification_did will be muted. Must not be muted when delivery_method is SECURITY_DESK"
                  },
                  "notification_display": {
                    "type": "string",
                    "default": "ORIGINAL_CALLBACK_NUMBER",
                    "description": "ORIGINAL_CALLBACK_NUMBER, or REMAPPED_TEN_DIGIT. Controls what Caller ID that will be presented in the call to notification_did."
                  }
                }
              },
              "examples": {
                "sample-1": {
                  "value": {
                    "name": "John Doe",
                    "street_number": "201",
                    "street_name": "Elm St.",
                    "location": "Apartment 101",
                    "city": "Summerville",
                    "country": "US",
                    "state": "FL",
                    "zip_code": "32750",
                    "force": "0"
                  }
                },
                "sample-2": {
                  "value": {
                    "name": "John Doe",
                    "street_number": "201",
                    "street_name": "Elm St.",
                    "location": "Apartment 101",
                    "city": "Summerville",
                    "country": "US",
                    "state": "FL",
                    "zip_code": "32750",
                    "force": "0",
                    "language": "EN",
                    "delivery_method": "THREE_WAY",
                    "description": "Some Description",
                    "custom_callback": "14123878120",
                    "notification_email": [
                      "john.doe@gmail.com",
                      "jane.doe@gmail.com"
                    ],
                    "number_to_bridge": "14123878030",
                    "listen_only": true,
                    "notification_display": "REMAPPED_TEN_DIGIT"
                  }
                },
                "sample-3": {
                  "value": {
                    "name": "John Doe",
                    "city": "Summerville",
                    "country": "US",
                    "state": "FL",
                    "zip_code": "32750",
                    "latitude": "38.2382301",
                    "longitude": "-10.282819821",
                    "force": "0"
                  }
                }
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Success.",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object"
                },
                "example": {
                  "responder_type": "PSAP",
                  "routing_status": "Enhanced",
                  "msag_status": "FOUND",
                  "position_status": "FULL_ADDRESS",
                  "civic_status": "PREFERRED",
                  "referred_status": "NA"
                }
              }
            }
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "E911"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

Unprovision e911

# Unprovision e911

Deletes an e911 endpoint.

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/phone-numbers/{phone_number}/e911": {
      "delete": {
        "summary": "Unprovision e911",
        "description": "Deletes an e911 endpoint.",
        "security": [
          {
            "api_auth": [
              "e911"
            ]
          }
        ],
        "tags": [
          "E911"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "Account identifier",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "path",
            "name": "phone_number",
            "required": true,
            "description": "Phone number",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "204": {
            "description": "Success."
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "E911"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

List carriers

# List carriers

List carriers.

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/carriers": {
      "get": {
        "summary": "List carriers",
        "description": "List carriers.",
        "security": [
          {
            "api_auth": [
              "carrier"
            ]
          }
        ],
        "tags": [
          "Carrier"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "Account identifier",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "name",
            "description": "Filter list of carriers by name.",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "messaging",
            "description": "Must be one of the values. \"Not Supported\", \"Active\", \"Inactive\". Not Supported - Carrier is not used by Skyswitch for SMS/MMS messaging. Active - Skyswitch uses the carrier for messaging and fully uses the carrier API for real-time integration. Inactive - Skyswitch uses the carrier for messaging but does not use the carrier API for real-time integration.",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success.",
            "content": {
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": {
                    "type": "object",
                    "properties": {
                      "id": {
                        "type": "integer"
                      },
                      "name": {
                        "type": "string"
                      },
                      "settings_key": {
                        "type": "string"
                      },
                      "messaging": {
                        "type": "string"
                      },
                      "created_at": {
                        "type": "string",
                        "format": "date_time"
                      },
                      "updated_at": {
                        "type": "string",
                        "format": "date_time"
                      }
                    }
                  }
                },
                "example": [
                  {
                    "id": 30,
                    "name": "Inteliquent",
                    "settings_key": "carrier.inteliquent",
                    "messaging": "Active",
                    "created_at": "2016-07-19T17:19:51.000000Z",
                    "updated_at": "2016-07-19T17:19:51.000000Z"
                  }
                ]
              }
            }
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "Carrier"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

List roles

# List roles

List roles

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/roles": {
      "get": {
        "summary": "List roles",
        "description": "List roles",
        "security": [
          {
            "api_auth": [
              "user"
            ]
          }
        ],
        "tags": [
          "Permissions"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "Account identifier",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success.",
            "content": {
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": {
                    "type": "object",
                    "properties": {
                      "id": {
                        "type": "integer"
                      },
                      "name": {
                        "type": "string"
                      },
                      "display_name": {
                        "type": "string"
                      },
                      "description": {
                        "type": "string"
                      },
                      "created_at": {
                        "type": "string"
                      },
                      "updated_at": {
                        "type": "string"
                      }
                    }
                  }
                },
                "example": [
                  {
                    "id": 1,
                    "name": "account-reader",
                    "display_name": "Account Reader",
                    "description": "Can read account information.",
                    "created_at": "2016-07-25 18:33:41",
                    "updated_at": "2016-07-25 18:33:41"
                  }
                ]
              }
            }
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "Permissions"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

List user roles

# List user roles

List roles of a user

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/users/{user_id}/roles": {
      "get": {
        "summary": "List user roles",
        "description": "List roles of a user",
        "security": [
          {
            "api_auth": [
              "user"
            ]
          }
        ],
        "tags": [
          "Permissions"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "Account identifier",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "path",
            "name": "user_id",
            "required": true,
            "description": "User identifier",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success.",
            "content": {
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": {
                    "type": "object",
                    "properties": {
                      "id": {
                        "type": "integer"
                      },
                      "name": {
                        "type": "string"
                      },
                      "display_name": {
                        "type": "string"
                      },
                      "description": {
                        "type": "string"
                      },
                      "created_at": {
                        "type": "string"
                      },
                      "updated_at": {
                        "type": "string"
                      }
                    }
                  }
                },
                "example": [
                  {
                    "id": 1,
                    "name": "account-reader",
                    "display_name": "Account Reader",
                    "description": "Can read account information.",
                    "created_at": "2016-07-25 18:33:41",
                    "updated_at": "2016-07-25 18:33:41"
                  }
                ]
              }
            }
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "Permissions"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

Create user-role

# Create user-role

Assign user to a role

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/users/{user_id}/roles/{role_id}": {
      "post": {
        "summary": "Create user-role",
        "description": "Assign user to a role",
        "security": [
          {
            "api_auth": [
              "user"
            ]
          }
        ],
        "tags": [
          "Permissions"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "Account identifier",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "path",
            "name": "user_id",
            "required": true,
            "description": "User identifier",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "path",
            "name": "role_id",
            "required": true,
            "description": "Role identifier",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success."
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "Permissions"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

Delete user-role

# Delete user-role

Revoke a role from a user

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/users/{user_id}/roles/{role_id}": {
      "delete": {
        "summary": "Delete user-role",
        "description": "Revoke a role from a user",
        "security": [
          {
            "api_auth": [
              "user"
            ]
          }
        ],
        "tags": [
          "Permissions"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "Account identifier",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "path",
            "name": "user_id",
            "required": true,
            "description": "User identifier",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "path",
            "name": "role_id",
            "required": true,
            "description": "Role identifier",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "204": {
            "description": "Success."
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "Permissions"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

List phone number details

# List phone number details

List phone number details

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/phone-numbers/details": {
      "get": {
        "summary": "List phone number details",
        "description": "List phone number details",
        "security": [
          {
            "api_auth": [
              "phone_number"
            ]
          }
        ],
        "tags": [
          "Phone Number Attributes"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "The account identifier",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "type",
            "required": true,
            "description": "bw-purchase, bw-purchase-failed",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success.",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "id": {
                      "type": "integer"
                    },
                    "account_id": {
                      "type": "string"
                    },
                    "phone_number": {
                      "type": "string"
                    },
                    "type": {
                      "type": "string"
                    },
                    "value": {
                      "type": "string"
                    },
                    "created_at": {
                      "type": "string"
                    },
                    "updated_at": {
                      "type": "string"
                    }
                  }
                },
                "example": {
                  "id": 1,
                  "account_id": "7c7e30c0-d0f8-11e6-8455-09043becaf9d",
                  "phone_number": "12345678916",
                  "type": "bw-purchase",
                  "value": "{\"tier\":\"A\"}",
                  "created_at": "2024-10-1 12:21:31",
                  "updated_at": "2024-10-1 12:21:31"
                }
              }
            }
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "Phone Number Attributes"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

Get phone number details

# Get phone number details

Retrieve phone number details

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/phone-numbers/{phone_number}/details": {
      "get": {
        "summary": "Get phone number details",
        "description": "Retrieve phone number details",
        "security": [
          {
            "api_auth": [
              "phone_number"
            ]
          }
        ],
        "tags": [
          "Phone Number Attributes"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "The account identifier",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "path",
            "name": "phone_number",
            "required": true,
            "description": "The phone number",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success.",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "id": {
                      "type": "integer"
                    },
                    "phone_number": {
                      "type": "string"
                    },
                    "type": {
                      "type": "string"
                    },
                    "value": {
                      "type": "string"
                    }
                  }
                },
                "example": {
                  "id": 1,
                  "phone_number": "12345678916",
                  "type": "port-out-pin",
                  "value": "12345"
                }
              }
            }
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "Phone Number Attributes"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

Apply phone number details

# Apply phone number details

Apply phone number details

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/phone-numbers/{phone_number}/details": {
      "put": {
        "summary": "Apply phone number details",
        "description": "Apply phone number details",
        "security": [
          {
            "api_auth": [
              "phone_number"
            ]
          }
        ],
        "tags": [
          "Phone Number Attributes"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "The account identifier",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "path",
            "name": "phone_number",
            "required": true,
            "description": "The phone number",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success."
          }
        },
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "value": {
                    "type": "string"
                  },
                  "type": {
                    "type": "string",
                    "description": "Allowed type is port-out-pin"
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "Phone Number Attributes"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

Delete phone number details

# Delete phone number details

Delete phone number details

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/phone-numbers/{phone_number}/details": {
      "delete": {
        "summary": "Delete phone number details",
        "description": "Delete phone number details",
        "security": [
          {
            "api_auth": [
              "phone_number"
            ]
          }
        ],
        "tags": [
          "Phone Number Attributes"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "The account identifier",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "path",
            "name": "phone_number",
            "required": true,
            "description": "The phone number",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "type",
            "required": true,
            "description": "Allowed type is port-out-pin",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "204": {
            "description": "Success."
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "Phone Number Attributes"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

List fax atas

# List fax atas

List fax atas

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/fax-atas": {
      "get": {
        "summary": "List fax atas",
        "description": "List fax atas",
        "security": [
          {
            "api_auth": [
              "routing"
            ]
          }
        ],
        "tags": [
          "Fax ATA"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "The account identifier",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success.",
            "content": {
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": {
                    "type": "object",
                    "properties": {
                      "mac_address": {
                        "type": "string"
                      },
                      "phone_number": {
                        "type": "string"
                      },
                      "deliver_offline": {
                        "type": "integer"
                      }
                    }
                  }
                },
                "example": [
                  {
                    "mac_address": "012345678912",
                    "phone_number": "14075551212",
                    "deliver_offline": 1
                  }
                ]
              }
            }
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "Fax ATA"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

Reboot fax-ata

# Reboot fax-ata

Reboot a fax ata

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/fax-atas/{mac_address}/reboot": {
      "post": {
        "summary": "Reboot fax-ata",
        "description": "Reboot a fax ata",
        "security": [
          {
            "api_auth": [
              "routing"
            ]
          }
        ],
        "tags": [
          "Fax ATA"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "The account identifier",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "path",
            "name": "mac_address",
            "required": true,
            "description": "Mac address",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success."
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "Fax ATA"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

Get fax-ata status

# Get fax-ata status

Retrieve the fax-ata status

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/fax-atas/{mac_address}/status": {
      "get": {
        "summary": "Get fax-ata status",
        "description": "Retrieve the fax-ata status",
        "security": [
          {
            "api_auth": [
              "routing"
            ]
          }
        ],
        "tags": [
          "Fax ATA"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "The account identifier",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "path",
            "name": "mac_address",
            "required": true,
            "description": "The mac address",
            "schema": {
              "type": "integer"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success.",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "is_online": {
                      "type": "string"
                    }
                  }
                },
                "example": {
                  "is_online": false
                }
              }
            }
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "Fax ATA"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

Get config rules by offering

# Get config rules by offering

Get config rules by offering

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/config-rules": {
      "get": {
        "summary": "Get config rules by offering",
        "description": "Get config rules by offering",
        "security": [
          {
            "api_auth": [
              "uc_config"
            ]
          }
        ],
        "tags": [
          "UC Settings"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "Account identifier",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "reseller",
            "required": true,
            "description": "Filter by reseller",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "domain",
            "required": true,
            "description": "Filter by domain",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "subscriber",
            "required": true,
            "description": "Filter by subscriber",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "offering_id",
            "required": true,
            "description": "Filter by offering identifier",
            "schema": {
              "type": "integer"
            }
          },
          {
            "in": "query",
            "name": "offer_option_id",
            "description": "Filter by offer option identifier",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "setting_id",
            "description": "Filter by setting identifier",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "class",
            "description": "Filter by class",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "name",
            "description": "Filter by name",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "include_entitlement",
            "description": "Flag to include entitlement details",
            "schema": {
              "type": "integer"
            }
          },
          {
            "in": "query",
            "name": "index_sort_order",
            "description": "Sort order (asc or desc)",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "page",
            "schema": {
              "type": "integer"
            }
          },
          {
            "in": "query",
            "name": "per_page",
            "schema": {
              "type": "integer"
            }
          },
          {
            "in": "query",
            "name": "hidden",
            "schema": {
              "type": "integer"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success.",
            "content": {
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": {
                    "type": "object",
                    "properties": {
                      "id": {
                        "type": "integer"
                      },
                      "reseller": {
                        "type": "string"
                      },
                      "domain": {
                        "type": "string"
                      },
                      "subscriber": {
                        "type": "string"
                      },
                      "setting_offer_option_id": {
                        "type": "string"
                      },
                      "setting_id": {
                        "type": "string"
                      },
                      "setting_value": {
                        "type": "string"
                      },
                      "created_at": {
                        "type": "string"
                      },
                      "updated_at": {
                        "type": "string"
                      },
                      "setting_offer_option": {
                        "type": "object",
                        "properties": {
                          "id": {
                            "type": "integer"
                          },
                          "setting_id": {
                            "type": "string"
                          },
                          "offering_id": {
                            "type": "string"
                          },
                          "offer_option_id": {
                            "type": "string"
                          },
                          "visible": {
                            "type": "string"
                          },
                          "overridable": {
                            "type": "string"
                          },
                          "setting": {
                            "type": "object",
                            "properties": {
                              "id": {
                                "type": "integer"
                              },
                              "name": {
                                "type": "string"
                              },
                              "display_name": {
                                "type": "string"
                              },
                              "plan": {
                                "type": "string"
                              },
                              "visibility": {
                                "type": "string"
                              },
                              "validation": {
                                "type": "string"
                              },
                              "description": {
                                "type": "string"
                              },
                              "index": {
                                "type": "string"
                              },
                              "allow_reseller_override": {
                                "type": "string"
                              },
                              "allow_domain_override": {
                                "type": "string"
                              },
                              "allow_user_override": {
                                "type": "string"
                              }
                            }
                          },
                          "class_setting": {
                            "type": "object",
                            "properties": {
                              "uc_class": {
                                "type": "object",
                                "properties": {
                                  "name": {
                                    "type": "string"
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                },
                "example": [
                  {
                    "id": 3648,
                    "reseller": "*",
                    "domain": "*",
                    "subscriber": "*",
                    "setting_offer_option_id": "768",
                    "setting_id": null,
                    "setting_value": "{\"ucproxy-nyj\",\"uc1-atl\",\"uc1-dal\",\"uc1-las\",\"uc1-nyj\"}",
                    "created_at": "2020-05-28T16:25:18.000000Z",
                    "updated_at": "2020-08-26T23:23:24.000000Z",
                    "setting_offer_option": {
                      "id": 768,
                      "setting_id": "147",
                      "offering_id": "10",
                      "offer_option_id": "29",
                      "visible": "1",
                      "overridable": "0",
                      "setting": {
                        "id": 147,
                        "name": "rucSensors",
                        "display_name": "ReachUC Sensors",
                        "plan": "plus",
                        "visibility": "hidden",
                        "validation": "string|max:255",
                        "description": "Sensors used by UC Proxy",
                        "index": "1",
                        "allow_reseller_override": "0",
                        "allow_domain_override": "0",
                        "allow_user_override": "0"
                      },
                      "class_setting": [
                        {
                          "uc_class": {
                            "name": "systemsettings"
                          }
                        }
                      ]
                    }
                  }
                ]
              }
            }
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "UC Settings"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

List setting offer-options

# List setting offer-options

List setting offer-options

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/config-rules/setting-offer-options": {
      "get": {
        "summary": "List setting offer-options",
        "description": "List setting offer-options",
        "security": [
          {
            "api_auth": [
              "uc_config"
            ]
          }
        ],
        "tags": [
          "UC Settings"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "Account identifier",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "id",
            "schema": {
              "type": "integer"
            }
          },
          {
            "in": "query",
            "name": "setting_id",
            "schema": {
              "type": "integer"
            }
          },
          {
            "in": "query",
            "name": "offering_id",
            "schema": {
              "type": "integer"
            }
          },
          {
            "in": "query",
            "name": "offer_option_id",
            "schema": {
              "type": "integer"
            }
          },
          {
            "in": "query",
            "name": "visible",
            "schema": {
              "type": "boolean"
            }
          },
          {
            "in": "query",
            "name": "overridable",
            "schema": {
              "type": "boolean"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success.",
            "content": {
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": {
                    "type": "object",
                    "properties": {
                      "id": {
                        "type": "integer"
                      },
                      "setting_id": {
                        "type": "string"
                      },
                      "offering_id": {
                        "type": "string"
                      },
                      "offer_option_id": {
                        "type": "string"
                      },
                      "visible": {
                        "type": "string"
                      },
                      "overridable": {
                        "type": "string"
                      }
                    }
                  }
                },
                "example": [
                  {
                    "id": 788,
                    "setting_id": "157",
                    "offering_id": "13",
                    "offer_option_id": "36",
                    "visible": "0",
                    "overridable": "1"
                  }
                ]
              }
            }
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "UC Settings"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

Create setting offer-option

# Create setting offer-option

Create a setting offer-option

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/config-rules/setting-offer-options": {
      "post": {
        "summary": "Create setting offer-option",
        "description": "Create a setting offer-option",
        "security": [
          {
            "api_auth": [
              "uc_config"
            ]
          }
        ],
        "tags": [
          "UC Settings"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "Account identifier",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "201": {
            "description": "Success."
          }
        },
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": [
                  "setting_id",
                  "offering_id",
                  "offer_option_id"
                ],
                "properties": {
                  "setting_id": {
                    "type": "integer"
                  },
                  "offering_id": {
                    "type": "integer"
                  },
                  "offer_option_id": {
                    "type": "integer"
                  },
                  "visible": {
                    "type": "boolean"
                  },
                  "overridable": {
                    "type": "boolean"
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "UC Settings"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

Update setting offer-option

# Update setting offer-option

Update a setting offer-option

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/config-rules/setting-offer-options/{id}": {
      "put": {
        "summary": "Update setting offer-option",
        "description": "Update a setting offer-option",
        "security": [
          {
            "api_auth": [
              "uc_config"
            ]
          }
        ],
        "tags": [
          "UC Settings"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "Account identifier",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "path",
            "name": "id",
            "required": true,
            "description": "Setting offer option identifier",
            "schema": {
              "type": "integer"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success."
          }
        },
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "setting_id": {
                    "type": "integer"
                  },
                  "offering_id": {
                    "type": "integer"
                  },
                  "offer_option_id": {
                    "type": "integer"
                  },
                  "visible": {
                    "type": "boolean"
                  },
                  "overridable": {
                    "type": "boolean"
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "UC Settings"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

Delete setting offer-option

# Delete setting offer-option

Delete a setting offer-option

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/config-rules/setting-offer-options/{id}": {
      "delete": {
        "summary": "Delete setting offer-option",
        "description": "Delete a setting offer-option",
        "security": [
          {
            "api_auth": [
              "uc_config"
            ]
          }
        ],
        "tags": [
          "UC Settings"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "Account identifier",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "path",
            "name": "id",
            "required": true,
            "description": "Setting offer option identifier",
            "schema": {
              "type": "integer"
            }
          }
        ],
        "responses": {
          "204": {
            "description": "Success."
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "UC Settings"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

List uc-config rules by entitlement

# List uc-config rules by entitlement

List UC config rules by entitlement. Retrieve a list of all settings and its corresponding config rules. The ReachUC plan must be defined in the entitlements so as to be able to retrieve the list of UC config rules.

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/uc/config": {
      "get": {
        "summary": "List uc-config rules by entitlement",
        "description": "List UC config rules by entitlement. Retrieve a list of all settings and its corresponding config rules. The ReachUC plan must be defined in the entitlements so as to be able to retrieve the list of UC config rules.",
        "security": [
          {
            "api_auth": [
              "uc_config"
            ]
          }
        ],
        "tags": [
          "UC Settings"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "Account identifier",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "domain",
            "required": true,
            "description": "Filter by domain",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "subscriber",
            "required": true,
            "description": "Filter by subscriber",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "class",
            "description": "Filter by class",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "name",
            "description": "Filter by name",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "include_entitlement",
            "description": "Flag to include the entitlement matching the domain and subscriber will be included.",
            "schema": {
              "type": "integer"
            }
          },
          {
            "in": "query",
            "name": "include_fqdn",
            "description": "Flag to include the reseller's FQDN",
            "schema": {
              "type": "integer"
            }
          },
          {
            "in": "query",
            "name": "offering_id",
            "description": "If set, the specified offering plan will be used for retrieving the list of UC config rules.",
            "schema": {
              "type": "integer"
            }
          },
          {
            "in": "query",
            "name": "index_sort_order",
            "description": "Sort order (asc or desc)",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success.",
            "content": {
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": {
                    "type": "object"
                  }
                },
                "examples": {
                  "without entitlement filter": {
                    "value": [
                      {
                        "id": 117,
                        "reseller": "15611",
                        "domain": "skyswitch.15611.service",
                        "subscriber": "*",
                        "setting_offer_option_id": null,
                        "setting_id": "97",
                        "setting_value": "1",
                        "created_at": "2017-12-21 17:48:12",
                        "updated_at": "2017-12-21 17:48:12",
                        "setting": {
                          "name": "enableTranscoder",
                          "display_name": "Enable iLBC Transcoding",
                          "plan": "plus",
                          "visibility": "advanced",
                          "validation": "integer|in:0,1",
                          "description": "If enabled, calls will be sent to a transcoder instead of the proxy. See Transcoder Address.",
                          "index": "1",
                          "allow_reseller_override": null,
                          "allow_domain_override": null,
                          "allow_user_override": null
                        },
                        "class_setting": [
                          {
                            "uc_class": {
                              "name": "reachuc"
                            }
                          }
                        ]
                      }
                    ]
                  },
                  "with entitlement filter": {
                    "value": [
                      {
                        "reseller": "15611",
                        "domain": "skyswitch.15611.service",
                        "subscriber": "*",
                        "setting_offer_option_id": null,
                        "setting_value": "Plus",
                        "setting": {
                          "name": "entitlement",
                          "display_name": "entitlement"
                        },
                        "class_setting": []
                      },
                      {
                        "id": 117,
                        "reseller": "15611",
                        "domain": "skyswitch.15611.service",
                        "subscriber": "*",
                        "setting_offer_option_id": null,
                        "setting_id": "97",
                        "setting_value": "1",
                        "created_at": "2017-12-21 17:48:12",
                        "updated_at": "2017-12-21 17:48:12",
                        "setting": {
                          "name": "enableTranscoder",
                          "display_name": "Enable iLBC Transcoding",
                          "plan": "plus",
                          "visibility": "advanced",
                          "validation": "integer|in:0,1",
                          "description": "If enabled, calls will be sent to a transcoder instead of the proxy. See Transcoder Address.",
                          "index": "1",
                          "allow_reseller_override": null,
                          "allow_domain_override": null,
                          "allow_user_override": null
                        },
                        "class_setting": [
                          {
                            "uc_class": {
                              "name": "reachuc"
                            }
                          }
                        ]
                      }
                    ]
                  },
                  "with include_entitlement, plan is unavailable": {
                    "value": [
                      {
                        "reseller": "15611",
                        "domain": "skyswitch.15611.service",
                        "subscriber": "*",
                        "setting_offer_option_id": null,
                        "setting_value": "Plus",
                        "setting": {
                          "name": "entitlement",
                          "display_name": "entitlement"
                        },
                        "class_setting": []
                      }
                    ]
                  },
                  "with offering_id": {
                    "value": [
                      {
                        "id": 3650,
                        "reseller": "15611",
                        "domain": "skyswitch.15611.service",
                        "subscriber": "*",
                        "setting_offer_option_id": "614",
                        "setting_id": null,
                        "setting_value": "Title Preview",
                        "created_at": null,
                        "updated_at": null,
                        "setting_offer_option": {
                          "setting_id": "1",
                          "offering_id": "1",
                          "offer_option_id": "10",
                          "class_setting": [
                            {
                              "uc_class": {
                                "name": "acrobits"
                              }
                            },
                            {
                              "uc_class": {
                                "name": "messagehub"
                              }
                            },
                            {
                              "uc_class": {
                                "name": "ucserver"
                              }
                            }
                          ],
                          "setting": {
                            "name": "title",
                            "display_name": "Name",
                            "plan": "standard",
                            "visibility": "basic",
                            "validation": "string|between:1,255",
                            "description": "The title of the account, shown in the mobile app.",
                            "index": "1",
                            "allow_reseller_override": null,
                            "allow_domain_override": null,
                            "allow_user_override": null
                          }
                        }
                      }
                    ]
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "UC Settings"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

Store uc-config rule

# Store uc-config rule

Persist a Reach UC config rule to the database

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/uc/config-rules": {
      "post": {
        "summary": "Store uc-config rule",
        "description": "Persist a Reach UC config rule to the database",
        "security": [
          {
            "api_auth": [
              "uc_config"
            ]
          }
        ],
        "tags": [
          "UC Settings"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "Account identifier",
            "schema": {
              "type": "string"
            }
          }
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": [
                  "domain",
                  "subscriber"
                ],
                "properties": {
                  "domain": {
                    "type": "string"
                  },
                  "subscriber": {
                    "type": "string",
                    "description": "Use * if the setting to set is a domain's default setting."
                  },
                  "setting_id": {
                    "type": "integer",
                    "description": "Not applicable when setting_offer_option_id is set."
                  },
                  "setting_offer_option_id": {
                    "type": "integer",
                    "description": "Not applicable when setting_id is set."
                  },
                  "setting_value": {
                    "type": "string",
                    "description": "The customized setting value"
                  }
                }
              },
              "examples": {
                "Set a User's Setting by setting_offer_option_id": {
                  "value": {
                    "domain": "acmecorp.12345.service",
                    "subscriber": "1001",
                    "setting_offer_option_id": 1,
                    "setting_value": "The Adventure of the Brown Fox"
                  }
                },
                "Set a Domain's Setting by setting_offer_option_id": {
                  "value": {
                    "domain": "0000.15621.service",
                    "subscriber": "*",
                    "setting_offer_option_id": 1,
                    "setting_value": "The Adventure of the Brown Fox"
                  }
                }
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Success."
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "UC Settings"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

Get config rule by id

# Get config rule by id

Retrieve the config rule of a specific id

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/uc/config-rules/{id}": {
      "get": {
        "summary": "Get config rule by id",
        "description": "Retrieve the config rule of a specific id",
        "security": [
          {
            "api_auth": [
              "uc_config"
            ]
          }
        ],
        "tags": [
          "UC Settings"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "Account identifier",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "path",
            "name": "id",
            "required": true,
            "description": "Config rule identifier",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success.",
            "content": {
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": {
                    "type": "object",
                    "properties": {
                      "id": {
                        "type": "integer"
                      },
                      "reseller": {
                        "type": "string"
                      },
                      "domain": {
                        "type": "string"
                      },
                      "subscriber": {
                        "type": "string"
                      },
                      "setting_offer_option_id": {
                        "type": "string"
                      },
                      "setting_id": {
                        "type": "string"
                      },
                      "setting_value": {
                        "type": "string"
                      },
                      "created_at": {
                        "type": "string"
                      },
                      "updated_at": {
                        "type": "string"
                      }
                    }
                  }
                },
                "example": {
                  "id": 3648,
                  "reseller": "*",
                  "domain": "*",
                  "subscriber": "*",
                  "setting_offer_option_id": "768",
                  "setting_id": null,
                  "setting_value": "{\"ucproxy-nyj\",\"uc1-atl\",\"uc1-dal\",\"uc1-las\",\"uc1-nyj\"}",
                  "created_at": "2020-05-28T16:25:18.000000Z",
                  "updated_at": "2020-08-26T23:23:24.000000Z"
                }
              }
            }
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "UC Settings"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

Delete uc-config rule

# Delete uc-config rule

Delete a uc config rule

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/uc/config-rules/{id}": {
      "delete": {
        "summary": "Delete uc-config rule",
        "description": "Delete a uc config rule",
        "security": [
          {
            "api_auth": [
              "uc_config"
            ]
          }
        ],
        "tags": [
          "UC Settings"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "Account identifier",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "path",
            "name": "id",
            "required": true,
            "description": "Config rule identifier",
            "schema": {
              "type": "integer"
            }
          }
        ],
        "responses": {
          "204": {
            "description": "Success."
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "UC Settings"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

List settings

# List settings

List settings

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/uc/settings": {
      "get": {
        "summary": "List settings",
        "description": "List settings",
        "security": [
          {
            "api_auth": [
              "uc_config"
            ]
          }
        ],
        "tags": [
          "UC Settings"
        ],
        "parameters": [
          {
            "in": "query",
            "name": "name",
            "description": "Filter by setting name.",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "plan",
            "description": "Filter by plan (standard, or plus)",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "visibility",
            "description": "Filter by visibility (basic, advanced, or hidden)",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "description",
            "description": "Filter by description. Can be set as a substring.",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "allow_reseller_override",
            "description": "0 or 1",
            "schema": {
              "type": "integer"
            }
          },
          {
            "in": "query",
            "name": "allow_domain_override",
            "description": "0 or 1",
            "schema": {
              "type": "integer"
            }
          },
          {
            "in": "query",
            "name": "allow_user_override",
            "description": "0 or 1",
            "schema": {
              "type": "integer"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success.",
            "content": {
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": {
                    "type": "object",
                    "properties": {
                      "id": {
                        "type": "integer"
                      },
                      "name": {
                        "type": "string"
                      },
                      "display_name": {
                        "type": "string"
                      },
                      "plan": {
                        "type": "string"
                      },
                      "visibility": {
                        "type": "string"
                      },
                      "validation": {
                        "type": "string"
                      },
                      "description": {
                        "type": "string"
                      },
                      "index": {
                        "type": "string"
                      },
                      "allow_reseller_override": {
                        "type": "string"
                      },
                      "allow_domain_override": {
                        "type": "string"
                      },
                      "allow_user_override": {
                        "type": "string"
                      }
                    }
                  }
                },
                "example": [
                  {
                    "id": 1,
                    "name": "title",
                    "display_name": "Name",
                    "plan": "standard",
                    "visibility": "basic",
                    "validation": "string|between:1,255",
                    "description": "The title of the account, shown in the mobile app.",
                    "index": "1",
                    "allow_reseller_override": "0",
                    "allow_domain_override": "0",
                    "allow_user_override": "0"
                  }
                ]
              }
            }
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "UC Settings"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

List routes by ani

# List routes by ani

Retrieve route by ani

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/pbx/route-by-ani": {
      "get": {
        "summary": "List routes by ani",
        "description": "Retrieve route by ani",
        "tags": [
          "Route by Ani"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "Account identifier",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "ani",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "dnis",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "domain",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success."
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "Route by Ani"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

Provision route by ani

# Provision route by ani

Provision a route by ani

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/pbx/route-by-ani": {
      "put": {
        "summary": "Provision route by ani",
        "description": "Provision a route by ani",
        "tags": [
          "Route by Ani"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "Account identifier",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "ani",
            "required": true,
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "dnis",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "domain",
            "required": true,
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "application",
            "description": "user, device, or literal.",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "destination",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "201": {
            "description": "Success."
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "Route by Ani"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

Delete route by ani

# Delete route by ani

Delete route by ani

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/pbx/route-by-ani": {
      "delete": {
        "summary": "Delete route by ani",
        "description": "Delete route by ani",
        "tags": [
          "Route by Ani"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "Account identifier",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "ani",
            "required": true,
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "dnis",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "domain",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "204": {
            "description": "Success."
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "Route by Ani"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

List entitlements

# List entitlements

Retrieve a list of entitlements and its corresponding offerings and offer options.

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/entitlements": {
      "get": {
        "summary": "List entitlements",
        "description": "Retrieve a list of entitlements and its corresponding offerings and offer options.",
        "security": [
          {
            "api_auth": [
              "entitlement"
            ]
          }
        ],
        "tags": [
          "Entitlements"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "Account identifier",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "reseller",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "domain",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "subscriber",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "offering_name",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success.",
            "content": {
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": {
                    "type": "object",
                    "properties": {
                      "id": {
                        "type": "integer"
                      },
                      "name": {
                        "type": "string"
                      },
                      "hidden": {
                        "type": "string"
                      },
                      "offering_id": {
                        "type": "string"
                      }
                    }
                  }
                },
                "example": [
                  {
                    "id": 897,
                    "reseller": "15611",
                    "domain": "skyswitch.15611.service",
                    "subscriber": "*",
                    "offering": {
                      "id": 6,
                      "name": "vBroadcast",
                      "hidden": "0"
                    },
                    "offer_option": {
                      "id": 14,
                      "name": "Enabled",
                      "hidden": "0",
                      "offering_id": "6"
                    }
                  }
                ]
              }
            }
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "Entitlements"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

Store entitlement

# Store entitlement

Create or update an entitlement

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/entitlements": {
      "put": {
        "summary": "Store entitlement",
        "description": "Create or update an entitlement",
        "security": [
          {
            "api_auth": [
              "entitlement"
            ]
          }
        ],
        "tags": [
          "Entitlements"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "Account identifier",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "201": {
            "description": "Success."
          }
        },
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": [
                  "domain",
                  "subscriber",
                  "offering_name",
                  "offer_option_name"
                ],
                "properties": {
                  "reseller": {
                    "type": "string",
                    "description": "The reseller number"
                  },
                  "domain": {
                    "type": "string",
                    "description": "The domain or the company number. Can be set to '*' to apply to all domains."
                  },
                  "subscriber": {
                    "type": "string",
                    "description": ". Can be set to '*' to apply to all subscribers. Note that this must also be set to '*' if the domain is set to '*'."
                  },
                  "offering_name": {
                    "type": "string"
                  },
                  "offer_option_name": {
                    "type": "string"
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "Entitlements"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

List offerings

# List offerings

List the offerings for entitlements

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/entitlements/offerings": {
      "get": {
        "summary": "List offerings",
        "description": "List the offerings for entitlements",
        "security": [
          {
            "api_auth": [
              "entitlement"
            ]
          }
        ],
        "tags": [
          "Entitlements"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "Account identifier",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success.",
            "content": {
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": {
                    "type": "object",
                    "properties": {
                      "id": {
                        "type": "integer"
                      },
                      "name": {
                        "type": "string"
                      },
                      "hidden": {
                        "type": "integer"
                      }
                    }
                  }
                },
                "example": [
                  {
                    "id": 9,
                    "name": "Team Connector",
                    "hidden": "0"
                  }
                ]
              }
            }
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "Entitlements"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

List offer options

# List offer options

Retrieve an entitlement offer options

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/entitlements/offeroptions": {
      "get": {
        "summary": "List offer options",
        "description": "Retrieve an entitlement offer options",
        "security": [
          {
            "api_auth": [
              "entitlement"
            ]
          }
        ],
        "tags": [
          "Entitlements"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "Account identifier",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "offering_name",
            "required": true,
            "description": "The name of the offering (e.g. ReachUC, SMS)",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success.",
            "content": {
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": {
                    "type": "object",
                    "properties": {
                      "id": {
                        "type": "integer"
                      },
                      "name": {
                        "type": "string"
                      },
                      "hidden": {
                        "type": "string"
                      },
                      "offering_id": {
                        "type": "string"
                      }
                    }
                  }
                },
                "example": [
                  {
                    "id": 14,
                    "name": "Enabled",
                    "hidden": "0",
                    "offering_id": "6"
                  },
                  {
                    "id": 15,
                    "name": "Disabled",
                    "hidden": "0",
                    "offering_id": "6"
                  }
                ]
              }
            }
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "Entitlements"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

Get entitlement offer value

# Get entitlement offer value

Retrieve an entitlement offer value

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/entitlements/offervalue": {
      "get": {
        "summary": "Get entitlement offer value",
        "description": "Retrieve an entitlement offer value",
        "security": [
          {
            "api_auth": [
              "entitlement"
            ]
          }
        ],
        "tags": [
          "Entitlements"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "Account identifier",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "reseller",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "domain",
            "required": true,
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "subscriber",
            "required": true,
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "offering_id",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "hidden",
            "schema": {
              "type": "boolean"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success.",
            "content": {
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": {
                    "type": "object",
                    "properties": {
                      "id": {
                        "type": "integer"
                      },
                      "reseller": {
                        "type": "string"
                      },
                      "domain": {
                        "type": "string"
                      },
                      "subscriber": {
                        "type": "string"
                      },
                      "offering": {
                        "type": "object",
                        "properties": {
                          "id": {
                            "type": "integer"
                          },
                          "name": {
                            "type": "string"
                          },
                          "hidden": {
                            "type": "integer"
                          }
                        }
                      },
                      "offer_option": {
                        "type": "object",
                        "properties": {
                          "id": {
                            "type": "integer"
                          },
                          "name": {
                            "type": "string"
                          },
                          "hidden": {
                            "type": "integer"
                          },
                          "offering_id": {
                            "type": "string"
                          }
                        }
                      }
                    }
                  }
                },
                "example": [
                  {
                    "id": 86,
                    "reseller": "12345",
                    "domain": "acmecorp.12345.service",
                    "subscriber": "*",
                    "offering": {
                      "id": 1,
                      "name": "ReachUC",
                      "hidden": "0"
                    },
                    "offer_option": {
                      "id": 2,
                      "name": "Plus",
                      "hidden": "0",
                      "offering_id": "1"
                    }
                  }
                ]
              }
            }
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "Entitlements"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

Delete entitlement

# Delete entitlement

Delete an existing entitlement

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/entitlements/{id}": {
      "delete": {
        "summary": "Delete entitlement",
        "description": "Delete an existing entitlement",
        "security": [
          {
            "api_auth": [
              "entitlement"
            ]
          }
        ],
        "tags": [
          "Entitlements"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "Account identifier",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "path",
            "name": "id",
            "required": true,
            "description": "Entitlement identifier",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "204": {
            "description": "Success."
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "Entitlements"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

List reports

# List reports

List reports

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/reports": {
      "get": {
        "summary": "List reports",
        "description": "List reports",
        "security": [
          {
            "api_auth": [
              "report"
            ]
          }
        ],
        "tags": [
          "Reports"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "The account identifier",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success.",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "example": {
                    "current_page": 1,
                    "per_page": 1,
                    "total": "56",
                    "data": [
                      {
                        "id": 13174,
                        "account_id": "022b3bf9-e5d7-3b44-89b2-b27ca65750b8",
                        "report_type": "sms_route",
                        "notes": "",
                        "parameters": "[]",
                        "status": "completed",
                        "error": null,
                        "file_id": "152671b0-5925-11ec-ac28-71bc467ea864",
                        "created_at": "2021-12-09 19:17:54",
                        "file": {
                          "id": "152671b0-5925-11ec-ac28-71bc467ea864",
                          "account_id": "022b3bf9-e5d7-3b44-89b2-b27ca65750b8",
                          "file_path": "smsroute_15611_20211209192034188819.zip",
                          "expiry_days": "-1"
                        },
                        "user": {
                          "id": 5,
                          "account_id": "ebe4dfd0-5020-11e6-82df-0519a30363ed",
                          "name": "John Doe",
                          "email": "mail@mail.com",
                          "created_at": "2021-10-12 05:26:13",
                          "updated_at": "2021-10-12 05:26:13",
                          "deleted_at": null
                        }
                      }
                    ]
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "Reports"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

List report types

# List report types

List report types

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/reports/types": {
      "get": {
        "summary": "List report types",
        "description": "List report types",
        "security": [
          {
            "api_auth": [
              "report"
            ]
          }
        ],
        "tags": [
          "Reports"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "The account identifier",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success.",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "example": {
                    "organizational": [
                      {
                        "label": "Organization SMS Summary",
                        "value": "organization_sms_count",
                        "fields": []
                      },
                      {
                        "label": "Organization SMS Usage",
                        "value": "organization_sms_usage_count",
                        "fields": {
                          "from": "required|date",
                          "to": "sometimes|date",
                          "user": "sometimes|string"
                        }
                      }
                    ],
                    "reseller": [
                      {
                        "label": "10DLC Brands and Campaigns",
                        "value": "ten_dlc",
                        "fields": []
                      }
                    ],
                    "root": [
                      {
                        "label": "Organization 10DLC Brands and Campaigns",
                        "value": "organization_ten_dlc",
                        "fields": []
                      }
                    ],
                    "route_manager_reseller": [
                      {
                        "label": "10DLC Brands and Campaigns",
                        "value": "ten_dlc",
                        "fields": []
                      }
                    ]
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "Reports"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

Get report status

# Get report status

Get the status of the report whether it is still queued, completed, or failed. Once completed, the file ID of the report will be returned.

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/reports/{report_id}": {
      "get": {
        "summary": "Get report status",
        "description": "Get the status of the report whether it is still queued, completed, or failed. Once completed, the file ID of the report will be returned.",
        "security": [
          {
            "api_auth": [
              "report"
            ]
          }
        ],
        "tags": [
          "Reports"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "The account identifier",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "path",
            "name": "report_id",
            "required": true,
            "description": "The reports identifier",
            "schema": {
              "type": "integer"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success.",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "example": {
                    "id": 13174,
                    "account_id": "022b3bf9-e5d7-3b44-89b2-b27ca65750b8",
                    "report_type": "sms_route",
                    "notes": "",
                    "parameters": "[]",
                    "status": "completed",
                    "error": null,
                    "file_id": "152671b0-5925-11ec-ac28-71bc467ea864",
                    "created_at": "2021-12-09 19:17:54",
                    "file": {
                      "id": "152671b0-5925-11ec-ac28-71bc467ea864",
                      "account_id": "022b3bf9-e5d7-3b44-89b2-b27ca65750b8",
                      "file_path": "smsroute_15611_20211209192034188819.zip",
                      "expiry_days": "-1"
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "Reports"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

Cancel a queued report.

# Cancel a queued report.

Cancel a queued report.

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/reports/{report_id}": {
      "delete": {
        "summary": "Cancel a queued report.",
        "description": "Cancel a queued report.",
        "security": [
          {
            "api_auth": [
              "report"
            ]
          }
        ],
        "tags": [
          "Reports"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "The account identifier",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "path",
            "name": "report_id",
            "required": true,
            "description": "The report identifier",
            "schema": {
              "type": "integer"
            }
          }
        ],
        "responses": {
          "204": {
            "description": "Success."
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "Reports"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

Download report

# Download report

Download a report.

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/v2/files/{file_id}": {
      "get": {
        "summary": "Download report",
        "description": "Download a report.",
        "security": [
          {
            "api_auth": [
              "report"
            ]
          }
        ],
        "tags": [
          "Reports"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "file_id",
            "required": true,
            "description": "The file identifier",
            "schema": {
              "type": "integer"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success.",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "example": {
                    "url": "https://someurl.com/reports/skyswitch_report_20250304150253344803.zip"
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "Reports"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

List audit logs

# List audit logs

List the audit logs.

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/audit-logs": {
      "get": {
        "summary": "List audit logs",
        "description": "List the audit logs.",
        "security": [
          {
            "api_auth": [
              "log"
            ]
          }
        ],
        "tags": [
          "Audit Logs and Logs"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "Account identifier",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "request_id",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "client",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "user_id",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "resource",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "action",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "parameter",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "ip_address",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "user_agent",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "start_date",
            "required": true,
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "end_date",
            "required": true,
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "page",
            "schema": {
              "type": "integer"
            }
          },
          {
            "in": "query",
            "name": "per_page",
            "schema": {
              "type": "integer"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success.",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object"
                },
                "example": {
                  "current_page": 1,
                  "per_page": 100,
                  "total": "525393",
                  "data": [
                    {
                      "id": 2130464,
                      "request_id": "5a4933b2e6fd9",
                      "client": "1",
                      "user_id": "1",
                      "account_id": "022b3bf9-e5d7-3b44-89b2-b27ca65750b8",
                      "resource": "reserved phone number",
                      "action": "release",
                      "parameter": "[]",
                      "ip_address": "127.0.0.1",
                      "user_agent": "Symfony/3.X",
                      "created_at": "2018-01-01T00:00:06.000000Z",
                      "user": {
                        "id": 1,
                        "name": "Skylar",
                        "email": "telco@skyswitch.com"
                      },
                      "account": {
                        "id": "022b3bf9-e5d7-3b44-89b2-b27ca65750b8",
                        "parent_id": "fc8dd0e0-501d-11e6-95ba-c3e4bed7a5a1",
                        "name": "SkySwitch Corporate",
                        "account_number": "15611",
                        "organizational": "0"
                      }
                    }
                  ]
                }
              }
            }
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "Audit Logs and Logs"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

List resources, actions

# List resources, actions

List the audit logs supported resource and actions

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/audit-logs/resource-actions": {
      "get": {
        "summary": "List resources, actions",
        "description": "List the audit logs supported resource and actions",
        "security": [
          {
            "api_auth": [
              "log"
            ]
          }
        ],
        "tags": [
          "Audit Logs and Logs"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "Account identifier",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success.",
            "content": {
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": {
                    "type": "object",
                    "properties": {
                      "resource": {
                        "type": "string"
                      },
                      "action": {
                        "type": "string"
                      }
                    }
                  }
                },
                "example": [
                  {
                    "resource": "account",
                    "action": "create"
                  }
                ]
              }
            }
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "Audit Logs and Logs"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

List journals

# List journals

List the journal logs.

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/journals": {
      "get": {
        "summary": "List journals",
        "description": "List the journal logs.",
        "security": [
          {
            "api_auth": [
              "log"
            ]
          }
        ],
        "tags": [
          "Audit Logs and Logs"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "identifier",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "module",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "type",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "action",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "notes",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "data",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "created_by",
            "description": "The user identifier",
            "schema": {
              "type": "integer"
            }
          },
          {
            "in": "query",
            "name": "start_date",
            "required": true,
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "end_date",
            "required": true,
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "page",
            "schema": {
              "type": "integer"
            }
          },
          {
            "in": "query",
            "name": "per_page",
            "schema": {
              "type": "integer"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success.",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object"
                },
                "example": {
                  "current_page": 1,
                  "per_page": 10,
                  "total": "12",
                  "data": [
                    {
                      "id": 2130464,
                      "account_id": "022b3bf9-e5d7-3b44-89b2-b27ca65750b8",
                      "identifier": "15204421410",
                      "module": "carrier",
                      "type": "phone number",
                      "action": "purchased",
                      "notes": "Phone number purchased from carrier.",
                      "data": "{\"carrier_id\":\"4\"}",
                      "created_by": "1",
                      "created_at": "2016-05-07 00:17:19",
                      "user": {
                        "id": 1,
                        "name": "Skylar",
                        "email": "telco@skyswitch.com"
                      },
                      "account": {
                        "id": "022b3bf9-e5d7-3b44-89b2-b27ca65750b8",
                        "parent_id": "fc8dd0e0-501d-11e6-95ba-c3e4bed7a5a1",
                        "name": "SkySwitch Corporate",
                        "account_number": "15611",
                        "organizational": "0"
                      }
                    }
                  ]
                }
              }
            }
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "Audit Logs and Logs"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

List modules, types, actions

# List modules, types, actions

List the journals-supported module, type, and actions

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/journals/module-type-actions": {
      "get": {
        "summary": "List modules, types, actions",
        "description": "List the journals-supported module, type, and actions",
        "security": [
          {
            "api_auth": [
              "log"
            ]
          }
        ],
        "tags": [
          "Audit Logs and Logs"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "Account identifier",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success.",
            "content": {
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": {
                    "type": "object",
                    "properties": {
                      "module": {
                        "type": "string"
                      },
                      "type": {
                        "type": "string"
                      },
                      "action": {
                        "type": "string"
                      }
                    }
                  }
                },
                "example": [
                  {
                    "module": "10dlc",
                    "type": "brand",
                    "action": "added"
                  }
                ]
              }
            }
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "Audit Logs and Logs"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

List logs

# List logs

List the logs.

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/logs/{request_id}": {
      "get": {
        "summary": "List logs",
        "description": "List the logs.",
        "security": [
          {
            "api_auth": [
              "log"
            ]
          }
        ],
        "tags": [
          "Audit Logs and Logs"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "path",
            "name": "request_id",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success.",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object"
                },
                "example": [
                  {
                    "id": 44997095,
                    "request_id": "5ac638e5c5e1d",
                    "level": "100",
                    "level_name": "DEBUG",
                    "service": "Telco API",
                    "type": null,
                    "message": "Application HTTP response.",
                    "context": "{\"response\":\"HTTP\\/1.1 500 Internal Server Error\\r\\n0: HTTP\\/1.1 500 Internal Server Error\\r\\nAccess-Control-Allow-Headers:  Authorization, Content-Type\\r\\nAccess-Control-Allow-Methods:  GET, POST, PUT, DELETE, OPTIONS\\r\\nAccess-Control-Allow-Origin:   https:\\/\\/telco.skyswitch.com\\r\\nAccess-Control-Expose-Headers: Location\\r\\nAccess-Control-Max-Age:        10000\\r\\nCache-Control:                 no-cache\\r\\nContent-Type:                  application\\/json\\r\\n\\r\\n{\\\"error\\\":\\\"The service encountered an error and could not perform request.\\\"}\",\"request_id\":\"5ac638e5c5e1d\"}",
                    "created_at": "2018-04-05 14:55:43"
                  }
                ]
              }
            }
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "Audit Logs and Logs"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

List global audit logs

# List global audit logs

List the audit logs.

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/audit-logs": {
      "get": {
        "summary": "List global audit logs",
        "description": "List the audit logs.",
        "security": [
          {
            "api_auth": [
              "log"
            ]
          }
        ],
        "tags": [
          "Audit Logs and Logs"
        ],
        "parameters": [
          {
            "in": "query",
            "name": "account_id",
            "required": true,
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "request_id",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "client",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "user_id",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "resource",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "action",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "parameter",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "ip_address",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "user_agent",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "start_date",
            "required": true,
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "end_date",
            "required": true,
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "page",
            "schema": {
              "type": "integer"
            }
          },
          {
            "in": "query",
            "name": "per_page",
            "schema": {
              "type": "integer"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success.",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object"
                },
                "example": {
                  "current_page": 1,
                  "per_page": 100,
                  "total": "525393",
                  "data": [
                    {
                      "id": 2130464,
                      "request_id": "5a4933b2e6fd9",
                      "client": "1",
                      "user_id": "1",
                      "account_id": "022b3bf9-e5d7-3b44-89b2-b27ca65750b8",
                      "resource": "reserved phone number",
                      "action": "release",
                      "parameter": "[]",
                      "ip_address": "127.0.0.1",
                      "user_agent": "Symfony/3.X",
                      "created_at": "2018-01-01T00:00:06.000000Z",
                      "user": {
                        "id": 1,
                        "name": "Skylar",
                        "email": "telco@skyswitch.com"
                      },
                      "account": {
                        "id": "022b3bf9-e5d7-3b44-89b2-b27ca65750b8",
                        "parent_id": "fc8dd0e0-501d-11e6-95ba-c3e4bed7a5a1",
                        "name": "SkySwitch Corporate",
                        "account_number": "15611",
                        "organizational": "0"
                      }
                    }
                  ]
                }
              }
            }
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "Audit Logs and Logs"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

List global journals

# List global journals

List the journal logs without account restrictions

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/journals": {
      "get": {
        "summary": "List global journals",
        "description": "List the journal logs without account restrictions",
        "security": [
          {
            "api_auth": [
              "log"
            ]
          }
        ],
        "tags": [
          "Audit Logs and Logs"
        ],
        "parameters": [
          {
            "in": "query",
            "name": "account_id",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "identifier",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "module",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "type",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "action",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "notes",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "data",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "created_by",
            "description": "The user identifier",
            "schema": {
              "type": "integer"
            }
          },
          {
            "in": "query",
            "name": "start_date",
            "required": true,
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "end_date",
            "required": true,
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "page",
            "schema": {
              "type": "integer"
            }
          },
          {
            "in": "query",
            "name": "per_page",
            "schema": {
              "type": "integer"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success.",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object"
                },
                "example": {
                  "current_page": 1,
                  "per_page": 10,
                  "total": "12",
                  "data": [
                    {
                      "id": 2130464,
                      "account_id": "022b3bf9-e5d7-3b44-89b2-b27ca65750b8",
                      "identifier": "15204421410",
                      "module": "carrier",
                      "type": "phone number",
                      "action": "purchased",
                      "notes": "Phone number purchased from carrier.",
                      "data": "{\"carrier_id\":\"4\"}",
                      "created_by": "1",
                      "created_at": "2016-05-07 00:17:19",
                      "user": {
                        "id": 1,
                        "name": "Skylar",
                        "email": "telco@skyswitch.com"
                      },
                      "account": {
                        "id": "022b3bf9-e5d7-3b44-89b2-b27ca65750b8",
                        "parent_id": "fc8dd0e0-501d-11e6-95ba-c3e4bed7a5a1",
                        "name": "SkySwitch Corporate",
                        "account_number": "15611",
                        "organizational": "0"
                      }
                    }
                  ]
                }
              }
            }
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "Audit Logs and Logs"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

List order-phone numbers

# List order-phone numbers

List order-phone number associations.

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/lnp/order-phone-numbers": {
      "get": {
        "summary": "List order-phone numbers",
        "description": "List order-phone number associations.",
        "security": [
          {
            "api_auth": [
              "port-in"
            ]
          }
        ],
        "tags": [
          "LNP Management"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "The account identifier",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "order_id",
            "schema": {
              "type": "integer"
            }
          },
          {
            "in": "query",
            "name": "phone_number",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "carrier_id",
            "schema": {
              "type": "integer"
            }
          },
          {
            "in": "query",
            "name": "pon_id",
            "schema": {
              "type": "integer"
            }
          },
          {
            "in": "query",
            "name": "pon",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "status",
            "description": "Can be enumerated separated by comma. Values can be pending, foc, activated, rejected, canceled, completed",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "order_status",
            "description": "Can be enumerated separated by comma. Values can be Draft, New, Processing, Carrier Pending, Customer Pending, Rejected, Accepted, FOC, Processing CNAM/DL, Billing, Port Out Notice, CSR Requested, Purchase TN, Completed, Canceled, Portability Check",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "pon_status",
            "description": "Can be enumerated separated by comma. Values can be acknowledged, pending, rejected, stalled, foc, pending cancel, canceled, completed",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "start_foc_at",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "end_foc_at",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "start_requested_due_date",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "end_requested_due_date",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "sort_by",
            "description": "Sort by attribute. E.g. phone_number, pons.requested_due_date, orders.ticket_ref",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "sort_order",
            "description": "Goes together with sort_by. Can either be asc or desc",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "page",
            "required": true,
            "schema": {
              "type": "integer"
            }
          },
          {
            "in": "query",
            "name": "per_page",
            "required": true,
            "schema": {
              "type": "integer"
            }
          },
          {
            "in": "query",
            "name": "exclude_deleted",
            "description": "Exclude deleted order phone numbers",
            "schema": {
              "type": "integer"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success.",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "example": {
                    "pagination": {
                      "count": "506",
                      "per_page": "1",
                      "page": 1
                    },
                    "data": [
                      {
                        "order_id": "44668",
                        "account_id": "022b3bf9-e5d7-3b44-89b2-b27ca65750b8",
                        "phone_number": "12392302397",
                        "carrier_id": "30",
                        "status": "completed",
                        "pon_id": "2949",
                        "foc_at": "2022-12-09 17:00:00",
                        "foc_tz": "US/Eastern",
                        "activated_at": "2022-12-09 14:43:45",
                        "thirdparty_enabled_sms": null,
                        "to_enable_sms": null,
                        "order_csr_id": "18151",
                        "order_dl_id": "1385",
                        "order_cnam_id": "1398",
                        "order_fax_id": null,
                        "created_at": "2022-12-07 15:31:26",
                        "updated_at": "2022-12-09 19:43:45",
                        "deleted_at": null,
                        "orders": {
                          "id": 44668,
                          "account_id": "022b3bf9-e5d7-3b44-89b2-b27ca65750b8",
                          "ticket_ref": "329147",
                          "requested_at": "2022-12-06 17:29:00",
                          "requested_due_date": "2022-12-14",
                          "rdd_tz": "America/New_York",
                          "status": "Completed",
                          "port_trigger": "0",
                          "expedite": "0",
                          "notes": ""
                        },
                        "pons": {
                          "id": 2949,
                          "pon": "62857509",
                          "name": "62857509",
                          "carrier_id": "30",
                          "requested_at": "2022-12-09 16:49:00",
                          "requested_due_date": "2022-12-07 17:00:00",
                          "port_tz": "US/Eastern",
                          "status": "completed",
                          "notes": "Order completed 12/09/2022 10:49:00 GMT-0600; 12/09/2022 Port Date set for Group ID 55721233 - Flowroute Inc: 683G - NSR/1; Order submitted 12/07/2022 09:37:00 GMT-0600; ",
                          "created_at": "2022-12-07 15:35:59",
                          "updated_at": "2022-12-09 16:49:00"
                        },
                        "order_csrs": {
                          "id": 18151,
                          "account_id": "022b3bf9-e5d7-3b44-89b2-b27ca65750b8",
                          "auth_name": "Bruce Wayne",
                          "auth_date": "2022-12-07 00:00:00",
                          "account_number": "12392302397",
                          "atn": "",
                          "new_atn": null,
                          "account_pin": "",
                          "port_out_pin": "",
                          "port_type": "full",
                          "service_type": "B",
                          "name": "SkySwitch TEST",
                          "street_no": "101",
                          "street_pre_dir": "S",
                          "street_name": "Hoover",
                          "street_type": "Blvd",
                          "street_post_dir": "",
                          "location_type_1": "",
                          "location_value_1": "",
                          "location_type_2": "",
                          "location_value_2": "",
                          "location_type_3": "",
                          "location_value_3": "",
                          "city": "Tampa",
                          "state": "FL",
                          "zip_code": "33609",
                          "country": "US",
                          "megalink_enabled": "0",
                          "megalink_id": "",
                          "megalink_main_tn": "",
                          "megalink_after_port_action": "",
                          "megalink_other_number_exists": "0",
                          "megalink_other_numbers": "[]",
                          "megalink_other_number_action": "Left Active",
                          "notes": "",
                          "attachment": null,
                          "created_at": "2022-12-07 15:31:26",
                          "updated_at": "2022-12-07 15:38:56"
                        },
                        "order_dls": {
                          "id": 1385,
                          "account_id": "022b3bf9-e5d7-3b44-89b2-b27ca65750b8",
                          "phone_number": "",
                          "last_name": "SkySwitch TEST",
                          "first_name": null,
                          "street_no": "101",
                          "street_pre_dir": "S",
                          "street_name": "Hoover",
                          "street_type": "Blvd",
                          "street_post_dir": "",
                          "location": null,
                          "city": "Tampa",
                          "state": "FL",
                          "zip_code": "33609",
                          "country": "US",
                          "created_at": "2022-12-07 15:31:26",
                          "updated_at": "2022-12-07 15:35:53"
                        },
                        "order_cnams": {
                          "id": 1398,
                          "account_id": "022b3bf9-e5d7-3b44-89b2-b27ca65750b8",
                          "phone_number": "",
                          "calling_name": "TEST CNAM",
                          "created_at": "2022-12-07 15:31:26",
                          "updated_at": "2022-12-07 15:35:53"
                        },
                        "order_faxs": null
                      }
                    ]
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "LNP Management"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

Validate order

# Validate order

Validate if phone numbers can be ordered for porting into Skyswitch API. Some reasons that a phone number may not be allowed for port order are the phone number is in a pending order; and the phone number is already in Skyswitch.

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/lnp/orders/validate": {
      "post": {
        "summary": "Validate order",
        "description": "Validate if phone numbers can be ordered for porting into Skyswitch API. Some reasons that a phone number may not be allowed for port order are the phone number is in a pending order; and the phone number is already in Skyswitch.",
        "security": [
          {
            "api_auth": [
              "port-in"
            ]
          }
        ],
        "tags": [
          "LNP Management"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "The account identifier",
            "schema": {
              "type": "string"
            }
          }
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": [
                  "phone_numbers"
                ],
                "properties": {
                  "phone_numbers": {
                    "type": "array",
                    "description": "Phone numbers to be validated.",
                    "items": {
                      "type": "string"
                    }
                  },
                  "restrict": {
                    "type": "integer",
                    "description": "Enforces restriction check of phone numbers within the managed inventory. Values are 0 or 1."
                  },
                  "include_details": {
                    "type": "integer",
                    "description": "Flag to include validation result details. Values are 0 or 1."
                  }
                }
              },
              "example": {
                "phone_numbers": [
                  "11122233345",
                  "18008248832",
                  "18008783540"
                ],
                "include_details": 0
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Success.",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object"
                },
                "examples": {
                  "Without Details": {
                    "value": {
                      "11122233345": "allow",
                      "18008248832": "deny",
                      "18008783540": "deny"
                    }
                  },
                  "With Details": {
                    "value": {
                      "11122233345": {
                        "status": "allow",
                        "reason": ""
                      },
                      "18008248832": {
                        "status": "deny",
                        "reason": "Phone number is already included in another opened port request order number 43847."
                      },
                      "18008783540": {
                        "status": "deny",
                        "reason": "Phone number already exists in the managed inventory."
                      },
                      "14702231144": {
                        "status": "deny",
                        "reason": "Phone number is currently being ported by another owner."
                      },
                      "14702231145": {
                        "status": "duplicate",
                        "reason": "Phone number is duplicated in this port request."
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "LNP Management"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

Check phone number portability

# Check phone number portability

Check portability of phone numbers

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/port-in/validate": {
      "post": {
        "summary": "Check phone number portability",
        "description": "Check portability of phone numbers",
        "security": [
          {
            "api_auth": [
              "port_out"
            ]
          }
        ],
        "tags": [
          "LNP Management"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "The account identifier",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "carrier_id",
            "schema": {
              "type": "integer"
            }
          }
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "phone_numbers": {
                    "type": "array",
                    "description": "Phone numbers that will be checked for portability",
                    "items": {
                      "type": "string"
                    }
                  }
                }
              },
              "example": {
                "phone_numbers": [
                  "12017217546",
                  "12295848535",
                  "12814022771"
                ]
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Success.",
            "content": {
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": {
                    "type": "object",
                    "properties": {
                      "phone_number": {
                        "type": "string"
                      },
                      "portable": {
                        "type": "boolean"
                      },
                      "rate_center_tier": {
                        "type": "string"
                      },
                      "losing_carrier": {
                        "type": "string"
                      },
                      "not_portable_reason": {
                        "type": "string"
                      }
                    }
                  },
                  "example": [
                    {
                      "phone_number": "12017217546",
                      "portable": true,
                      "rate_center_tier": "0",
                      "losing_carrier": "PAETEC:4151-NSR/1",
                      "not_portable_reason": ""
                    }
                  ]
                }
              }
            }
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "LNP Management"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

List port order requests

# List port order requests

Retrieve list of port request order

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/port-requests/orders": {
      "get": {
        "summary": "List port order requests",
        "description": "Retrieve list of port request order",
        "security": [
          {
            "api_auth": [
              "port-in"
            ]
          }
        ],
        "tags": [
          "LNP Management"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "The account identifier",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "order_id",
            "schema": {
              "type": "integer"
            }
          },
          {
            "in": "query",
            "name": "phone_number",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "status",
            "description": "Can be enumerated separated by comma. Values can be Draft, New, Processing, Carrier Pending, Customer Pending, Rejected, Accepted, FOC, Processing CNAM/DL, Billing, Port Out Notice, CSR Requested, Purchase TN, Completed, Canceled, Portability Check",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "start_requested_at",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "end_requested_at",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "start_requested_due_date",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "end_requested_due_date",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "sort_by",
            "description": "Sort by attribute. Default is orders.requested_at",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "sort_order",
            "description": "Goes together with sort_by. Can either be asc or desc. Default is desc",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "page",
            "required": true,
            "schema": {
              "type": "integer"
            }
          },
          {
            "in": "query",
            "name": "per_page",
            "required": true,
            "description": "Up to 50 per page",
            "schema": {
              "type": "integer"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success.",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "example": {
                    "id": 21238,
                    "account_id": "7c7e30c0-d0f8-11e6-8455-09043becaf9d",
                    "requested_at": "2020-10-07 11:41:51",
                    "requested_due_date": "2020-10-14",
                    "port_trigger": "0",
                    "expedite": "1",
                    "expedite_reason": "urgent request to expedite",
                    "rdd_tz": "US/Eastern",
                    "ticket_ref": "213011",
                    "status": "New",
                    "notes": "This is a test",
                    "phone_numbers": [
                      "18884445555",
                      "18884445556",
                      "18884445557"
                    ],
                    "thirdparty_enabled_sms": [
                      "18884445555"
                    ],
                    "to_enable_sms": [
                      "18884445556",
                      "18884445557"
                    ],
                    "csr": [
                      {
                        "csr_id": "2",
                        "auth_name": "Bruce Wayne",
                        "auth_date": "2020-10-06",
                        "account_number": "40429286815860355",
                        "atn": "4042928681",
                        "new_atn": null,
                        "account_pin": null,
                        "port_out_pin": null,
                        "port_type": "full",
                        "notes": "this is a note",
                        "attachment": null,
                        "end_user": {
                          "service_type": "R",
                          "name": "ABC Company",
                          "street_no": null,
                          "street_pre_dir": null,
                          "street_name": null,
                          "street_type": null,
                          "street_post_dir": null,
                          "location_type_1": null,
                          "location_value_1": null,
                          "location_type_2": null,
                          "location_value_2": null,
                          "location_type_3": null,
                          "location_value_3": null,
                          "city": null,
                          "state": null,
                          "zip_code": null,
                          "country": null
                        },
                        "phone_numbers": [
                          "18884445555",
                          "18884445556",
                          "18884445557"
                        ]
                      }
                    ],
                    "directory_listing": [
                      {
                        "directory_listing_id": "261",
                        "last_name": null,
                        "first_name": null,
                        "street_no": "2",
                        "street_pre_dir": null,
                        "street_name": "Holand",
                        "street_type": null,
                        "street_post_dir": null,
                        "location": null,
                        "city": "Boston",
                        "state": "PA",
                        "zip_code": "29101",
                        "country": "USA",
                        "phone_numbers": [
                          "18884445555",
                          "18884445556"
                        ]
                      }
                    ],
                    "cnam": [
                      {
                        "cnam_id": "491",
                        "calling_name": "Batman",
                        "phone_numbers": [
                          "18884445555",
                          "18884445556"
                        ]
                      },
                      {
                        "cnam_id": "492",
                        "calling_name": "Robin",
                        "phone_numbers": [
                          "18884445557"
                        ]
                      }
                    ],
                    "fax": [
                      {
                        "fax_id": "280",
                        "delivery_type": "Instant Fax Portal",
                        "phone_numbers": [
                          "18884445555",
                          "18884445556",
                          "18884445557"
                        ]
                      }
                    ]
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "LNP Management"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

Create port order request

# Create port order request

Create an order and corresponding RT ticket.

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/port-requests/orders": {
      "post": {
        "summary": "Create port order request",
        "description": "Create an order and corresponding RT ticket.",
        "security": [
          {
            "api_auth": [
              "port-in"
            ]
          }
        ],
        "tags": [
          "LNP Management"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "The account identifier",
            "schema": {
              "type": "string"
            }
          }
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": [
                  "status",
                  "phone_numbers"
                ],
                "properties": {
                  "requested_at": {
                    "type": "string",
                    "description": "The date/time when the request was made."
                  },
                  "requested_due_date": {
                    "type": "string",
                    "description": "The date/time when the request will be due. This is required for automation."
                  },
                  "rdd_tz": {
                    "type": "string",
                    "description": "Timezone for requested_due_date. This is required for automation."
                  },
                  "status": {
                    "type": "string",
                    "description": "Draft. Draft will create a new port request for future carrier approval process."
                  },
                  "expedite": {
                    "type": "integer",
                    "description": "Expedite flag"
                  },
                  "expedite_reason": {
                    "type": "string",
                    "description": "Expedite reason"
                  },
                  "activate_anytime": {
                    "type": "integer",
                    "description": "Activate anytime flag"
                  },
                  "port_trigger": {
                    "type": "integer",
                    "description": "Port trigger flag"
                  },
                  "notes": {
                    "type": "string"
                  },
                  "phone_numbers": {
                    "type": "array",
                    "description": "List of phone numbers that will be ordered for port-in.",
                    "items": {
                      "type": "string"
                    }
                  },
                  "thirdparty_enabled_sms": {
                    "type": "array",
                    "description": "List of phone numbers that are sms-enabled in a thirdparty provider.",
                    "items": {
                      "type": "string"
                    }
                  },
                  "to_enable_sms": {
                    "type": "array",
                    "description": "List of phone numbers that are sms-enabled in skyswitch",
                    "items": {
                      "type": "string"
                    }
                  },
                  "csr": {
                    "type": "array",
                    "items": {
                      "type": "object",
                      "required": [
                        "phone_numbers"
                      ],
                      "properties": {
                        "auth_name": {
                          "type": "string",
                          "description": "Name of port-in authorizer. This is required for automation."
                        },
                        "auth_date": {
                          "type": "string",
                          "format": "date",
                          "description": "yyyy-mm-dd format. Must not be set to a future date. This is required for automation."
                        },
                        "account_number": {
                          "type": "string",
                          "description": "Account number. This is required for automation."
                        },
                        "atn": {
                          "type": "string",
                          "description": "Account telephone number (ATN). This is required for automation."
                        },
                        "new_atn": {
                          "type": "string",
                          "description": "New account telephone number (ATN)."
                        },
                        "account_pin": {
                          "type": "string",
                          "description": "Account PIN."
                        },
                        "port_out_pin": {
                          "type": "string",
                          "description": "Port-out PIN."
                        },
                        "port_type": {
                          "type": "string",
                          "description": "full or partial. This is required for automation."
                        },
                        "notes": {
                          "type": "string"
                        },
                        "phone_numbers": {
                          "type": "array",
                          "description": "List of phone numbers to be associated with the csr.",
                          "items": {
                            "type": "string"
                          }
                        },
                        "end_user": {
                          "type": "object",
                          "required": [
                            "name",
                            "phone_numbers"
                          ],
                          "properties": {
                            "service_type": {
                              "type": "string",
                              "description": "Acceptable values are B and R (business and residence). This is required for automation."
                            },
                            "name": {
                              "type": "string",
                              "description": "End user company name. This is required for automation."
                            },
                            "street_no": {
                              "type": "string",
                              "description": "End user address street number (e.g. 100, 550). This is required for automation."
                            },
                            "street_pre_dir": {
                              "type": "string",
                              "description": "End user address street direction prefix (e.g. N)"
                            },
                            "street_name": {
                              "type": "string",
                              "description": "End user address street name. This is required for automation."
                            },
                            "street_type": {
                              "type": "string",
                              "description": "End user address street type (e.g. St, Ave)"
                            },
                            "street_post_dir": {
                              "type": "string",
                              "description": "End user address street direction ending (e.g. SW)"
                            },
                            "location_type_1": {
                              "type": "string",
                              "description": "End user address location type 1 (e.g. Bld, Apt)"
                            },
                            "location_value_1": {
                              "type": "string",
                              "description": "End user address location value 1 (e.g. 1, 2B)"
                            },
                            "location_type_2": {
                              "type": "string",
                              "description": "End user address location type 2 (e.g. Flr, Ste)"
                            },
                            "location_value_2": {
                              "type": "string",
                              "description": "End user address location value 2 (e.g. 1, 900)"
                            },
                            "location_type_3": {
                              "type": "string",
                              "description": "End user address location type 3 (e.g. Flr, Ste)"
                            },
                            "location_value_3": {
                              "type": "string",
                              "description": "End user address location value 3 (e.g. 1, 900)"
                            },
                            "city": {
                              "type": "string",
                              "description": "End user address city. This is required for automation."
                            },
                            "state": {
                              "type": "string",
                              "description": "End user address state. This is required for automation."
                            },
                            "zip_code": {
                              "type": "string",
                              "description": "End user address postal code. This is required for automation."
                            },
                            "country": {
                              "type": "string",
                              "description": "End user address country. This is required for automation."
                            },
                            "megalink_circuit": {
                              "type": "object",
                              "required": [
                                "enabled",
                                "other_number_exists"
                              ],
                              "properties": {
                                "enabled": {
                                  "type": "boolean",
                                  "description": "Megalink Circuit status on the account."
                                },
                                "id": {
                                  "type": "string",
                                  "description": "Megalink Circuit ID (PRI)"
                                },
                                "main_tn": {
                                  "type": "string",
                                  "description": "Megalink Circuit main phone number"
                                },
                                "after_port_action": {
                                  "type": "boolean",
                                  "description": "Status of Megalink Circuit after porting."
                                },
                                "other_number_exists": {
                                  "type": "boolean",
                                  "description": "Other number exists on the account."
                                },
                                "other_numbers": {
                                  "type": "array",
                                  "description": "List of phone numbers on the account."
                                },
                                "other_number_action": {
                                  "type": "string",
                                  "description": "Status of remaining numbers after porting."
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  },
                  "cnam": {
                    "type": "array",
                    "items": {
                      "type": "object",
                      "required": [
                        "phone_numbers"
                      ],
                      "properties": {
                        "calling_name": {
                          "type": "string",
                          "description": "Caller ID calling name"
                        },
                        "phone_numbers": {
                          "type": "array",
                          "description": "Phone numbers to be associated with the associated cnam",
                          "items": {
                            "type": "string"
                          }
                        }
                      }
                    }
                  },
                  "directory_listing": {
                    "type": "array",
                    "items": {
                      "type": "object",
                      "required": [
                        "phone_numbers"
                      ],
                      "properties": {
                        "last_name": {
                          "type": "string",
                          "description": "Directory listing last name (if residential) or business name (if business)"
                        },
                        "first_name": {
                          "type": "string",
                          "description": "Directory listing first name (if residential) or additional business name detail (if business)"
                        },
                        "street_no": {
                          "type": "string",
                          "description": "Directory listing address street number (e.g. 100, 550)"
                        },
                        "street_pre_dir": {
                          "type": "string",
                          "description": "Directory listing address street direction prefix (e.g. N)"
                        },
                        "street_name": {
                          "type": "string",
                          "description": "Directory listing address street name"
                        },
                        "street_type": {
                          "type": "string",
                          "description": "Directory listing address street type (e.g. St, Ave)"
                        },
                        "street_post_dir": {
                          "type": "string",
                          "description": "Directory listing address street direction ending (e.g. SW)"
                        },
                        "location": {
                          "type": "string",
                          "description": "Directory listing address location (e.g. Ste 900)"
                        },
                        "city": {
                          "type": "string",
                          "description": "Directory listing address city"
                        },
                        "state": {
                          "type": "string",
                          "description": "Directory listing address state"
                        },
                        "zip_code": {
                          "type": "string",
                          "description": "Directory listing address postal code"
                        },
                        "country": {
                          "type": "string",
                          "description": "Directory listing address country"
                        },
                        "phone_numbers": {
                          "type": "array",
                          "description": "Phone numbers to be associated with the associated directory listing",
                          "items": {
                            "type": "string"
                          }
                        }
                      }
                    }
                  },
                  "fax": {
                    "type": "array",
                    "items": {
                      "type": "object",
                      "required": [
                        "phone_numbers"
                      ],
                      "properties": {
                        "delivery_type": {
                          "type": "string",
                          "description": "Instant Fax Portal, Instant Fax ATA, SIP ATA"
                        },
                        "phone_numbers": {
                          "type": "array",
                          "description": "Phone numbers to be associated with the associated cnam",
                          "items": {
                            "type": "string"
                          }
                        }
                      }
                    }
                  }
                }
              },
              "examples": {
                "Draft Status": {
                  "value": {
                    "status": "Draft",
                    "requested_at": "2020-10-07 11:41:51",
                    "expedite": 1,
                    "expedite_reason": "urgent request to expedite",
                    "port_trigger": 0,
                    "phone_numbers": [
                      "12345678901",
                      "12345678902",
                      "12345678903"
                    ],
                    "csr": [
                      {
                        "auth_name": "Bruce Wayne",
                        "auth_date": "2020-10-16",
                        "account_number": "40429286815860355",
                        "atn": "4042928681",
                        "port_type": "full",
                        "end_user": {
                          "service_type": "R",
                          "name": "Robin Hood",
                          "street_no": "1032",
                          "street_name": "THORN WOODE",
                          "street_type": "LN",
                          "city": "Stone MTN",
                          "state": "GA",
                          "zip_code": "30083",
                          "country": "USA",
                          "megalink_circuit": {
                            "enabled": "1",
                            "id": "123456",
                            "main_tn": "12345678901",
                            "after_port_action": "Left Active",
                            "other_number_exists": "1",
                            "other_numbers": [
                              "22233344412"
                            ],
                            "other_number_action": "Left Active"
                          }
                        },
                        "phone_numbers": [
                          "12345678901",
                          "12345678902"
                        ],
                        "notes": "This is a test number."
                      }
                    ],
                    "directory_listing": [
                      {
                        "street_no": "2",
                        "street_name": "Holand",
                        "city": "Boston",
                        "state": "PA",
                        "zip_code": "29101",
                        "country": "USA",
                        "phone_numbers": [
                          "12345678901"
                        ]
                      }
                    ],
                    "cnam": [
                      {
                        "calling_name": "Batman",
                        "phone_numbers": [
                          "12345678901"
                        ]
                      }
                    ],
                    "fax": [
                      {
                        "delivery_type": "Instant Fax Portal",
                        "phone_numbers": [
                          "12345678901"
                        ]
                      },
                      {
                        "delivery_type": "Instant Fax ATA",
                        "phone_numbers": [
                          "12345678902"
                        ]
                      }
                    ],
                    "thirdparty_enabled_sms": [
                      "12345678901"
                    ],
                    "to_enable_sms": [
                      "12345678902",
                      "12345678903"
                    ]
                  }
                }
              }
            }
          }
        },
        "responses": {
          "201": {
            "description": "Success.",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "example": {
                    "id": 43849,
                    "account_id": "7c7e30c0-d0f8-11e6-8455-09043becaf9d",
                    "requested_at": "2020-10-07 11:41:51",
                    "requested_due_date": null,
                    "port_trigger": "0",
                    "expedite": "1",
                    "expedite_reason": "urgent request to expedite",
                    "activate_anytime": "1",
                    "rdd_tz": null,
                    "ticket_ref": "",
                    "status": "Draft",
                    "notes": null,
                    "phone_numbers": [
                      "12345678901",
                      "12345678902",
                      "12345678903"
                    ],
                    "thirdparty_enabled_sms": [
                      "12345678901"
                    ],
                    "to_enable_sms": [
                      "12345678902",
                      "12345678903"
                    ],
                    "csr": [
                      {
                        "csr_id": "17265",
                        "auth_name": "Bruce Wayne",
                        "auth_date": "2020-10-16",
                        "account_number": "40429286815860355",
                        "atn": "4042928681",
                        "new_atn": null,
                        "account_pin": null,
                        "port_out_pin": null,
                        "port_type": "full",
                        "end_user": {
                          "service_type": "R",
                          "name": "Robin Hood",
                          "street_no": "1032",
                          "street_pre_dir": null,
                          "street_name": "THORN WOODE",
                          "street_type": "LN",
                          "street_post_dir": null,
                          "location_type_1": null,
                          "location_value_1": null,
                          "location_type_2": null,
                          "location_value_2": null,
                          "location_type_3": null,
                          "location_value_3": null,
                          "city": "Stone MTN",
                          "state": "GA",
                          "zip_code": "30083",
                          "country": "USA",
                          "megalink_circuit": {
                            "enabled": null,
                            "id": null,
                            "main_tn": null,
                            "after_port_action": null,
                            "other_number_exists": null,
                            "other_numbers": null,
                            "other_number_action": null
                          }
                        },
                        "notes": "This is a test number.",
                        "attachment": null,
                        "phone_numbers": [
                          "12345678901",
                          "12345678902"
                        ]
                      }
                    ],
                    "directory_listing": [
                      {
                        "directory_listing_id": "33",
                        "last_name": null,
                        "first_name": null,
                        "street_no": "2",
                        "street_pre_dir": null,
                        "street_name": "Holand",
                        "street_type": null,
                        "street_post_dir": null,
                        "location": null,
                        "city": "Boston",
                        "state": "PA",
                        "zip_code": "29101",
                        "country": "USA",
                        "phone_numbers": [
                          "12345678901"
                        ]
                      }
                    ],
                    "cnam": [
                      {
                        "cnam_id": "112",
                        "calling_name": "Batman",
                        "phone_numbers": [
                          "12345678901"
                        ]
                      }
                    ],
                    "fax": [
                      {
                        "fax_id": "42",
                        "delivery_type": "Instant Fax Portal",
                        "phone_numbers": [
                          "12345678901"
                        ]
                      },
                      {
                        "fax_id": "43",
                        "delivery_type": "Instant Fax ATA",
                        "phone_numbers": [
                          "12345678902"
                        ]
                      }
                    ]
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "LNP Management"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

Get port order request

# Get port order request

Retrieve a port request order

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/port-requests/orders/{order_id}": {
      "get": {
        "summary": "Get port order request",
        "description": "Retrieve a port request order",
        "security": [
          {
            "api_auth": [
              "port-in"
            ]
          }
        ],
        "tags": [
          "LNP Management"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "The account identifier",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "path",
            "name": "order_id",
            "required": true,
            "description": "The order identifier",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success.",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "example": {
                    "id": 21238,
                    "account_id": "7c7e30c0-d0f8-11e6-8455-09043becaf9d",
                    "requested_at": "2020-10-07 11:41:51",
                    "requested_due_date": "2020-10-14 00:00:00",
                    "port_trigger": "0",
                    "expedite": "1",
                    "expedite_reason": "urgent request to expedite",
                    "rdd_tz": "US/Eastern",
                    "ticket_ref": "213011",
                    "status": "New",
                    "notes": null,
                    "phone_numbers": [
                      "18884445555",
                      "18884445556",
                      "18884445557"
                    ],
                    "thirdparty_enabled_sms": [
                      "18884445555"
                    ],
                    "to_enable_sms": [
                      "18884445556",
                      "18884445557"
                    ],
                    "csr": [
                      {
                        "csr_id": "2",
                        "auth_name": "Bruce Wayne",
                        "auth_date": "2020-10-06",
                        "account_number": "40429286815860355",
                        "atn": "4042928681",
                        "new_atn": null,
                        "account_pin": null,
                        "port_out_pin": null,
                        "port_type": "full",
                        "notes": "this is a note",
                        "attachment": null,
                        "end_user": {
                          "service_type": "R",
                          "name": "ABC Company",
                          "street_no": null,
                          "street_pre_dir": null,
                          "street_name": null,
                          "street_type": null,
                          "street_post_dir": null,
                          "location_type_1": null,
                          "location_value_1": null,
                          "location_type_2": null,
                          "location_value_2": null,
                          "location_type_3": null,
                          "location_value_3": null,
                          "city": null,
                          "state": null,
                          "zip_code": null,
                          "country": null
                        },
                        "phone_numbers": [
                          "18884445555",
                          "18884445556",
                          "18884445557"
                        ]
                      }
                    ],
                    "directory_listing": [
                      {
                        "directory_listing_id": "261",
                        "last_name": null,
                        "first_name": null,
                        "street_no": "2",
                        "street_pre_dir": null,
                        "street_name": "Holand",
                        "street_type": null,
                        "street_post_dir": null,
                        "location": null,
                        "city": "Boston",
                        "state": "PA",
                        "zip_code": "29101",
                        "country": "USA",
                        "phone_numbers": [
                          "18884445555",
                          "18884445556"
                        ]
                      }
                    ],
                    "cnam": [
                      {
                        "cnam_id": "491",
                        "calling_name": "Batman",
                        "phone_numbers": [
                          "18884445555",
                          "18884445556"
                        ]
                      },
                      {
                        "cnam_id": "492",
                        "calling_name": "Robin",
                        "phone_numbers": [
                          "18884445557"
                        ]
                      }
                    ],
                    "fax": [
                      {
                        "fax_id": "280",
                        "delivery_type": "Instant Fax Portal",
                        "phone_numbers": [
                          "18884445555",
                          "18884445556",
                          "18884445557"
                        ]
                      }
                    ]
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "LNP Management"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

Update port order request

# Update port order request

Update an order and corresponding RT ticket.

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/port-requests/orders/{order_id}": {
      "put": {
        "summary": "Update port order request",
        "description": "Update an order and corresponding RT ticket.",
        "security": [
          {
            "api_auth": [
              "port-in"
            ]
          }
        ],
        "tags": [
          "LNP Management"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "The account identifier",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "path",
            "name": "order_id",
            "required": true,
            "description": "The order identifier",
            "schema": {
              "type": "integer"
            }
          }
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "requested_at": {
                    "type": "string",
                    "description": "The date/time when the request was made."
                  },
                  "requested_due_date": {
                    "type": "string",
                    "description": "The date/time when the request will be due."
                  },
                  "rdd_tz": {
                    "type": "string",
                    "description": "Timezone of the browser"
                  },
                  "status": {
                    "type": "string",
                    "description": "Draft, New. Setting to New will submit the port request to LNP."
                  },
                  "expedite": {
                    "type": "integer",
                    "description": "Expedite flag"
                  },
                  "expedite_reason": {
                    "type": "string",
                    "description": "Expedite reason"
                  },
                  "activate_anytime": {
                    "type": "integer",
                    "description": "Activate anytime flag"
                  },
                  "port_trigger": {
                    "type": "integer",
                    "description": "Port trigger flag"
                  },
                  "notes": {
                    "type": "string"
                  },
                  "link_to_ticket": {
                    "type": "integer",
                    "description": "Create corresponding RT. RT is automatically created if this parameter is not set."
                  },
                  "phone_numbers": {
                    "type": "array",
                    "description": "List of phone numbers that will be ordered for port-in.",
                    "items": {
                      "type": "string"
                    }
                  },
                  "thirdparty_enabled_sms": {
                    "type": "array",
                    "description": "List of phone numbers that are sms-enabled in a thirdparty provider.",
                    "items": {
                      "type": "string"
                    }
                  },
                  "to_enable_sms": {
                    "type": "array",
                    "description": "List of phone numbers that are sms-enabled in skyswitch",
                    "items": {
                      "type": "string"
                    }
                  },
                  "csr": {
                    "type": "array",
                    "items": {
                      "type": "object",
                      "required": [
                        "phone_numbers"
                      ],
                      "properties": {
                        "csr_id": {
                          "type": "integer",
                          "description": "Csr identifier. The csr will be treated as new and will be created when not supplied."
                        },
                        "auth_name": {
                          "type": "string",
                          "description": "Name of port-in authorizer."
                        },
                        "auth_date": {
                          "type": "string",
                          "format": "date",
                          "description": "yyyy-mm-dd format. Must not be set to a future date"
                        },
                        "account_number": {
                          "type": "string",
                          "description": "Account number."
                        },
                        "atn": {
                          "type": "string",
                          "description": "Account telephone number (ATN)."
                        },
                        "new_atn": {
                          "type": "string",
                          "description": "New account telephone number (ATN)."
                        },
                        "account_pin": {
                          "type": "string",
                          "description": "Account PIN.."
                        },
                        "port_out_pin": {
                          "type": "string",
                          "description": "Port-out PIN."
                        },
                        "port_type": {
                          "type": "string",
                          "description": "full or partial."
                        },
                        "notes": {
                          "type": "string"
                        },
                        "attachment": {
                          "type": "string"
                        },
                        "phone_numbers": {
                          "type": "array",
                          "description": "List of phone numbers to be associated with the csr.",
                          "items": {
                            "type": "string"
                          }
                        },
                        "end_user": {
                          "type": "object",
                          "required": [
                            "name",
                            "phone_numbers"
                          ],
                          "properties": {
                            "service_type": {
                              "type": "string",
                              "description": "Acceptable values are B and R (business and residence)"
                            },
                            "name": {
                              "type": "string",
                              "description": "End user company name"
                            },
                            "street_no": {
                              "type": "string",
                              "description": "End user address street number (e.g. 100, 550)"
                            },
                            "street_pre_dir": {
                              "type": "string",
                              "description": "End user address street direction prefix (e.g. N)"
                            },
                            "street_name": {
                              "type": "string",
                              "description": "End user address street name"
                            },
                            "street_type": {
                              "type": "string",
                              "description": "End user address street type (e.g. St, Ave)"
                            },
                            "street_post_dir": {
                              "type": "string",
                              "description": "End user address street direction ending (e.g. SW)"
                            },
                            "location_type_1": {
                              "type": "string",
                              "description": "End user address location type 1 (e.g. Bld, Apt)"
                            },
                            "location_value_1": {
                              "type": "string",
                              "description": "End user address location value 1 (e.g. 1, 2B)"
                            },
                            "location_type_2": {
                              "type": "string",
                              "description": "End user address location type 2 (e.g. Flr, Ste)"
                            },
                            "location_value_2": {
                              "type": "string",
                              "description": "End user address location value 2 (e.g. 1, 900)"
                            },
                            "location_type_3": {
                              "type": "string",
                              "description": "End user address location type 3 (e.g. Flr, Ste)"
                            },
                            "location_value_3": {
                              "type": "string",
                              "description": "End user address location value 3 (e.g. 1, 900)"
                            },
                            "city": {
                              "type": "string",
                              "description": "End user address city"
                            },
                            "state": {
                              "type": "string",
                              "description": "End user address state"
                            },
                            "zip_code": {
                              "type": "string",
                              "description": "End user address postal code"
                            },
                            "country": {
                              "type": "string",
                              "description": "End user address country"
                            },
                            "megalink_circuit": {
                              "type": "object",
                              "required": [
                                "enabled",
                                "other_number_exists"
                              ],
                              "properties": {
                                "enabled": {
                                  "type": "boolean",
                                  "description": "Megalink Circuit status on the account."
                                },
                                "id": {
                                  "type": "string",
                                  "description": "Megalink Circuit ID (PRI)"
                                },
                                "main_tn": {
                                  "type": "string",
                                  "description": "Megalink Circuit main phone number"
                                },
                                "after_port_action": {
                                  "type": "boolean",
                                  "description": "Status of Megalink Circuit after porting."
                                },
                                "other_number_exists": {
                                  "type": "boolean",
                                  "description": "Other number exists on the account."
                                },
                                "other_numbers": {
                                  "type": "array",
                                  "description": "List of phone numbers on the account."
                                },
                                "other_number_action": {
                                  "type": "string",
                                  "description": "Status of remaining phone numbers after porting."
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  },
                  "cnam": {
                    "type": "array",
                    "items": {
                      "type": "object",
                      "required": [
                        "phone_numbers"
                      ],
                      "properties": {
                        "cnam_id": {
                          "type": "integer",
                          "description": "Cnam identifier. The cnam will be treated as new and will be created when not supplied."
                        },
                        "calling_name": {
                          "type": "string",
                          "description": "Caller ID calling name"
                        },
                        "phone_numbers": {
                          "type": "array",
                          "description": "Phone numbers to be associated with the associated cnam",
                          "items": {
                            "type": "string"
                          }
                        }
                      }
                    }
                  },
                  "directory_listing": {
                    "type": "array",
                    "items": {
                      "type": "object",
                      "required": [
                        "phone_numbers"
                      ],
                      "properties": {
                        "directory_listing_id": {
                          "type": "integer",
                          "description": "Directory listing identifier. The directory listing will be treated as new and will be created when not supplied."
                        },
                        "last_name": {
                          "type": "string",
                          "description": "Directory listing last name (if residential) or business name (if business)"
                        },
                        "first_name": {
                          "type": "string",
                          "description": "Directory listing first name (if residential) or additional business name detail (if business)"
                        },
                        "street_no": {
                          "type": "string",
                          "description": "Directory listing address street number (e.g. 100, 550)"
                        },
                        "street_pre_dir": {
                          "type": "string",
                          "description": "Directory listing address street direction prefix (e.g. N)"
                        },
                        "street_name": {
                          "type": "string",
                          "description": "Directory listing address street name"
                        },
                        "street_type": {
                          "type": "string",
                          "description": "Directory listing address street type (e.g. St, Ave)"
                        },
                        "street_post_dir": {
                          "type": "string",
                          "description": "Directory listing address street direction ending (e.g. SW)"
                        },
                        "location": {
                          "type": "string",
                          "description": "Directory listing address location (e.g. Ste 900)"
                        },
                        "city": {
                          "type": "string",
                          "description": "Directory listing address city"
                        },
                        "state": {
                          "type": "string",
                          "description": "Directory listing address state"
                        },
                        "zip_code": {
                          "type": "string",
                          "description": "Directory listing address postal code"
                        },
                        "country": {
                          "type": "string",
                          "description": "Directory listing address country"
                        },
                        "phone_numbers": {
                          "type": "array",
                          "description": "Phone numbers to be associated with the associated directory listing",
                          "items": {
                            "type": "string"
                          }
                        }
                      }
                    }
                  },
                  "fax": {
                    "type": "array",
                    "items": {
                      "type": "object",
                      "required": [
                        "phone_numbers"
                      ],
                      "properties": {
                        "fax_id": {
                          "type": "integer",
                          "description": "Fax identifier. The fax will be treated as new and will be created when not supplied."
                        },
                        "delivery_type": {
                          "type": "string",
                          "description": "Instant Fax Portal, Instant Fax ATA, SIP ATA"
                        },
                        "phone_numbers": {
                          "type": "array",
                          "description": "Phone numbers to be associated with the associated cnam",
                          "items": {
                            "type": "string"
                          }
                        }
                      }
                    }
                  }
                }
              },
              "example": {
                "requested_at": "2020-10-07 11:41:51",
                "requested_due_date": "2022-12-30",
                "port_trigger": "0",
                "expedite": "1",
                "expedite_reason": "urgent request to expedite",
                "activate_anytime": "1",
                "rdd_tz": "US/Eastern",
                "status": "New",
                "notes": null,
                "phone_numbers": [
                  "12345678901",
                  "12345678902",
                  "12345678903"
                ],
                "thirdparty_enabled_sms": [
                  "12345678901"
                ],
                "to_enable_sms": [
                  "12345678902",
                  "12345678903"
                ],
                "csr": [
                  {
                    "csr_id": "17265",
                    "auth_name": "Bruce Wayne",
                    "auth_date": "2020-10-16",
                    "account_number": "40429286815860355",
                    "atn": "4042928681",
                    "new_atn": null,
                    "account_pin": null,
                    "port_out_pin": null,
                    "port_type": "full",
                    "end_user": {
                      "service_type": "R",
                      "name": "Robin Hood",
                      "street_no": "1032",
                      "street_pre_dir": null,
                      "street_name": "THORN WOODE",
                      "street_type": "LN",
                      "street_post_dir": null,
                      "location_type_1": null,
                      "location_value_1": null,
                      "location_type_2": null,
                      "location_value_2": null,
                      "location_type_3": null,
                      "location_value_3": null,
                      "city": "Stone MTN",
                      "state": "GA",
                      "zip_code": "30083",
                      "country": "USA"
                    },
                    "notes": "This is a test number.",
                    "attachment": null,
                    "phone_numbers": [
                      "12345678901",
                      "12345678902"
                    ]
                  }
                ],
                "directory_listing": [
                  {
                    "directory_listing_id": "33",
                    "last_name": null,
                    "first_name": null,
                    "street_no": "2",
                    "street_pre_dir": null,
                    "street_name": "Holand",
                    "street_type": null,
                    "street_post_dir": null,
                    "location": null,
                    "city": "Boston",
                    "state": "PA",
                    "zip_code": "29101",
                    "country": "USA",
                    "phone_numbers": [
                      "12345678901"
                    ]
                  }
                ],
                "cnam": [
                  {
                    "cnam_id": "112",
                    "calling_name": "Batman",
                    "phone_numbers": [
                      "12345678901"
                    ]
                  }
                ],
                "fax": [
                  {
                    "fax_id": "42",
                    "delivery_type": "Instant Fax Portal",
                    "phone_numbers": [
                      "12345678901"
                    ]
                  },
                  {
                    "fax_id": "43",
                    "delivery_type": "Instant Fax ATA",
                    "phone_numbers": [
                      "12345678902"
                    ]
                  }
                ]
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Success.",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "example": {
                    "id": 43849,
                    "account_id": "7c7e30c0-d0f8-11e6-8455-09043becaf9d",
                    "requested_at": "2020-10-07 11:41:51",
                    "requested_due_date": "2022-12-30",
                    "port_trigger": "0",
                    "expedite": "1",
                    "expedite_reason": "urgent request to expedite",
                    "activate_anytime": "1",
                    "rdd_tz": null,
                    "ticket_ref": "",
                    "status": "New",
                    "notes": null,
                    "phone_numbers": [
                      "12345678901",
                      "12345678902",
                      "12345678903"
                    ],
                    "thirdparty_enabled_sms": [
                      "12345678901"
                    ],
                    "to_enable_sms": [
                      "12345678902",
                      "12345678903"
                    ],
                    "csr": [
                      {
                        "csr_id": "17265",
                        "auth_name": "Bruce Wayne",
                        "auth_date": "2020-10-16",
                        "account_number": "40429286815860355",
                        "atn": "4042928681",
                        "new_atn": null,
                        "account_pin": null,
                        "port_out_pin": null,
                        "port_type": "full",
                        "end_user": {
                          "service_type": "R",
                          "name": "Robin Hood",
                          "street_no": "1032",
                          "street_pre_dir": null,
                          "street_name": "THORN WOODE",
                          "street_type": "LN",
                          "street_post_dir": null,
                          "location_type_1": null,
                          "location_value_1": null,
                          "location_type_2": null,
                          "location_value_2": null,
                          "location_type_3": null,
                          "location_value_3": null,
                          "city": "Stone MTN",
                          "state": "GA",
                          "zip_code": "30083",
                          "country": "USA",
                          "megalink_circuit": {
                            "enabled": null,
                            "id": null,
                            "main_tn": null,
                            "after_port_action": null,
                            "other_number_exists": null,
                            "other_numbers": null,
                            "other_number_action": null
                          }
                        },
                        "notes": "This is a test number.",
                        "attachment": null,
                        "phone_numbers": [
                          "12345678901",
                          "12345678902"
                        ]
                      }
                    ],
                    "directory_listing": [
                      {
                        "directory_listing_id": "33",
                        "last_name": null,
                        "first_name": null,
                        "street_no": "2",
                        "street_pre_dir": null,
                        "street_name": "Holand",
                        "street_type": null,
                        "street_post_dir": null,
                        "location": null,
                        "city": "Boston",
                        "state": "PA",
                        "zip_code": "29101",
                        "country": "USA",
                        "phone_numbers": [
                          "12345678901"
                        ]
                      }
                    ],
                    "cnam": [
                      {
                        "cnam_id": "112",
                        "calling_name": "Batman",
                        "phone_numbers": [
                          "12345678901"
                        ]
                      }
                    ],
                    "fax": [
                      {
                        "fax_id": "42",
                        "delivery_type": "Instant Fax Portal",
                        "phone_numbers": [
                          "12345678901"
                        ]
                      },
                      {
                        "fax_id": "43",
                        "delivery_type": "Instant Fax ATA",
                        "phone_numbers": [
                          "12345678902"
                        ]
                      }
                    ]
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "LNP Management"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

Delete port order request

# Delete port order request

Delete a draft port request

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/port-requests/orders/{order_id}": {
      "delete": {
        "summary": "Delete port order request",
        "description": "Delete a draft port request",
        "security": [
          {
            "api_auth": [
              "port-in"
            ]
          }
        ],
        "tags": [
          "LNP Management"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "The account identifier",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "path",
            "name": "order_id",
            "required": true,
            "description": "The order identifier",
            "schema": {
              "type": "integer"
            }
          }
        ],
        "responses": {
          "204": {
            "description": "Success."
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "LNP Management"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

List order status

# List order status

List the supported order status

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/lnp/order/status": {
      "get": {
        "summary": "List order status",
        "description": "List the supported order status",
        "security": [
          {
            "api_auth": [
              "port-in"
            ]
          }
        ],
        "tags": [
          "LNP Management"
        ],
        "responses": {
          "200": {
            "description": "Success.",
            "content": {
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": {
                    "type": "string"
                  },
                  "example": [
                    "Draft",
                    "New",
                    "Processing",
                    "Carrier Pending",
                    "Customer Pending",
                    "Rejected",
                    "FOC",
                    "Processing CNAM/DL",
                    "Billing",
                    "Port Out Notice",
                    "CSR Requested",
                    "Purchase TN",
                    "Completed",
                    "Canceled",
                    "Portability Check"
                  ]
                }
              }
            }
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "LNP Management"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

List order phone number status

# List order phone number status

List the supported order phone number status

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/lnp/order_phone_number/status": {
      "get": {
        "summary": "List order phone number status",
        "description": "List the supported order phone number status",
        "security": [
          {
            "api_auth": [
              "port-in"
            ]
          }
        ],
        "tags": [
          "LNP Management"
        ],
        "responses": {
          "200": {
            "description": "Success.",
            "content": {
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": {
                    "type": "string"
                  },
                  "example": [
                    "acknowledged",
                    "pending",
                    "foc",
                    "activated",
                    "accepted",
                    "rejected",
                    "canceled",
                    "completed"
                  ]
                }
              }
            }
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "LNP Management"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

List pon status

# List pon status

List the supported pon status

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/lnp/pon/status": {
      "get": {
        "summary": "List pon status",
        "description": "List the supported pon status",
        "security": [
          {
            "api_auth": [
              "port-in"
            ]
          }
        ],
        "tags": [
          "LNP Management"
        ],
        "responses": {
          "200": {
            "description": "Success.",
            "content": {
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": {
                    "type": "string"
                  },
                  "example": [
                    "acknowledged",
                    "pending",
                    "foc",
                    "rejected",
                    "stalled",
                    "cancelled"
                  ]
                }
              }
            }
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "LNP Management"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

List branding seting

# List branding seting

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/branding": {
      "get": {
        "summary": "List branding seting",
        "security": [
          {
            "api_auth": [
              "branding"
            ]
          }
        ],
        "tags": [
          "Reseller Branding"
        ],
        "parameters": [
          {
            "in": "query",
            "name": "site_url",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "application_id",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "reseller_id",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success.",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "domain_name": {
                      "type": "array",
                      "items": {
                        "type": "object",
                        "properties": {
                          "field_id": {
                            "type": "integer"
                          },
                          "field_name": {
                            "type": "string"
                          },
                          "field_display_name": {
                            "type": "string"
                          },
                          "description": {
                            "type": "string"
                          },
                          "field_value": {
                            "type": "string"
                          }
                        }
                      }
                    }
                  }
                },
                "example": {
                  "npat.skyswitch.com": [
                    {
                      "field_id": 43,
                      "field_name": "primary_color",
                      "field_display_name": "Primary Color",
                      "description": "Primary Color",
                      "field_value": "#2ca0bd"
                    }
                  ]
                }
              }
            }
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "Reseller Branding"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

Save branding setting

# Save branding setting

Create or update a setting for a brandable application instance

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/branding": {
      "post": {
        "summary": "Save branding setting",
        "description": "Create or update a setting for a brandable application instance",
        "security": [
          {
            "api_auth": [
              "branding"
            ]
          }
        ],
        "tags": [
          "Reseller Branding"
        ],
        "parameters": [
          {
            "in": "query",
            "name": "site_url",
            "required": true,
            "description": "Brandable application instance's URL.",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "reseller_id",
            "required": true,
            "description": "Reseller's unique indentifier",
            "schema": {
              "type": "integer"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success."
          }
        },
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": [
                  "field_id",
                  "field_value"
                ],
                "properties": {
                  "field_id": {
                    "type": "string",
                    "description": "Setting field identifier."
                  },
                  "field_value": {
                    "type": "string",
                    "description": "Value of the setting field. If setting is an uploaded file, this should be a publicly-available URL. See Create Artifact."
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "Reseller Branding"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

Delete branding setting

# Delete branding setting

Delete settings of a brandable application

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/branding": {
      "delete": {
        "summary": "Delete branding setting",
        "description": "Delete settings of a brandable application",
        "security": [
          {
            "api_auth": [
              "branding"
            ]
          }
        ],
        "tags": [
          "Reseller Branding"
        ],
        "parameters": [
          {
            "in": "query",
            "name": "site_url",
            "required": true,
            "description": "Brandable applcation instance's URL.",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "reseller_id",
            "required": true,
            "description": "Reseller's unique indentifier",
            "schema": {
              "type": "integer"
            }
          },
          {
            "in": "query",
            "name": "field_id",
            "description": "If supplied, it will remove a specific field associated to this field_id. If not supplied, the full brandable application instance is deleted.",
            "schema": {
              "type": "integer"
            }
          }
        ],
        "responses": {
          "204": {
            "description": "Success.",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "msg": {
                      "type": "string"
                    }
                  }
                },
                "examples": {
                  "Remove Field Setting": {
                    "value": {
                      "msg": "Field setting has been detached from the brandable application instance"
                    }
                  },
                  "Remove Brandable Instance Setting": {
                    "value": {
                      "msg": "Settings has been detached from the brandable application instance and removed the instance completely"
                    }
                  }
                }
              }
            }
          },
          "400": {
            "description": "Failure.",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object"
                },
                "examples": {
                  "Remove Field Setting": {
                    "value": {
                      "msg": "Failed to delete brandable application instance field setting"
                    }
                  },
                  "Remove Brandable Instance Setting": {
                    "value": {
                      "msg": "Failed to delete brandable application instance settings"
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "Reseller Branding"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

List branding artifacts

# List branding artifacts

List the available artifacts and their respective public urls.

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/branding/artifacts": {
      "get": {
        "summary": "List branding artifacts",
        "description": "List the available artifacts and their respective public urls.",
        "security": [
          {
            "api_auth": [
              "branding"
            ]
          }
        ],
        "tags": [
          "Reseller Branding"
        ],
        "parameters": [
          {
            "in": "query",
            "name": "reseller_id",
            "description": "integer",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success.",
            "content": {
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": {
                    "type": "object",
                    "properties": {
                      "key": {
                        "type": "string"
                      },
                      "size": {
                        "type": "string"
                      },
                      "url": {
                        "type": "string"
                      }
                    }
                  }
                },
                "example": [
                  {
                    "key": "account_id/assets/artifact_filename.txt",
                    "size": "20947",
                    "url": "https://domain.host.com/some-account-id/assets/artifact_filenme.txt"
                  }
                ]
              }
            }
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "Reseller Branding"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

Store branding artifact

# Store branding artifact

Stores a new artifact (for files such logos, icons, recordings or reports)  and returns a URL upon success.

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/branding/artifacts": {
      "post": {
        "summary": "Store branding artifact",
        "description": "Stores a new artifact (for files such logos, icons, recordings or reports)  and returns a URL upon success.",
        "security": [
          {
            "api_auth": [
              "branding"
            ]
          }
        ],
        "tags": [
          "Reseller Branding"
        ],
        "parameters": [
          {
            "in": "query",
            "name": "reseller_id",
            "required": true,
            "description": "Reseller's unique identifier",
            "schema": {
              "type": "integer"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success."
          }
        },
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": [
                  "artifact",
                  "type"
                ],
                "properties": {
                  "artifact": {
                    "type": "string",
                    "description": "File to be stored. Max file size is 100MB."
                  },
                  "type": {
                    "type": "integer",
                    "description": "Type of artifact. Values could be assets, recordings or reports."
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "Reseller Branding"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

List branding settings by IDs

# List branding settings by IDs

List settings for a branding application instance

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/branding/instances": {
      "get": {
        "summary": "List branding settings by IDs",
        "description": "List settings for a branding application instance",
        "security": [
          {
            "api_auth": [
              "branding"
            ]
          }
        ],
        "tags": [
          "Reseller Branding"
        ],
        "parameters": [
          {
            "in": "query",
            "name": "reseller_id",
            "required": true,
            "schema": {
              "type": "integer"
            }
          },
          {
            "in": "query",
            "name": "application_id",
            "required": true,
            "schema": {
              "type": "integer"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success.",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "domain_name": {
                      "type": "array",
                      "items": {
                        "type": "object",
                        "properties": {
                          "field_id": {
                            "type": "integer"
                          },
                          "field_name": {
                            "type": "string"
                          },
                          "field_display_name": {
                            "type": "string"
                          },
                          "description": {
                            "type": "string"
                          },
                          "field_value": {
                            "type": "string"
                          }
                        }
                      }
                    }
                  }
                },
                "example": {
                  "npat.skyswitch.com": [
                    {
                      "field_id": 43,
                      "field_name": "primary_color",
                      "field_display_name": "Primary Color",
                      "description": "Primary Color",
                      "field_value": "#2ca0bd"
                    }
                  ]
                }
              }
            }
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "Reseller Branding"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

List brandable applications

# List brandable applications

List all the brandable applications.

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/branding/management/applications": {
      "get": {
        "summary": "List brandable applications",
        "description": "List all the brandable applications.",
        "security": [
          {
            "api_auth": [
              "branding"
            ]
          }
        ],
        "tags": [
          "Reseller Branding"
        ],
        "responses": {
          "200": {
            "description": "Success.",
            "content": {
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": {
                    "type": "object",
                    "properties": {
                      "id": {
                        "type": "integer"
                      },
                      "name": {
                        "type": "string"
                      },
                      "created_at": {
                        "type": "string"
                      },
                      "updated_at": {
                        "type": "string"
                      }
                    }
                  }
                },
                "example": [
                  {
                    "id": 1,
                    "name": "Custom Dashboard",
                    "created_at": "2019-03-08 13:39:31",
                    "updated_at": "2019-03-08 13:39:31"
                  }
                ]
              }
            }
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "Reseller Branding"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

Store brandable application

# Store brandable application

Create new brandable application.

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/branding/management/applications": {
      "post": {
        "summary": "Store brandable application",
        "description": "Create new brandable application.",
        "security": [
          {
            "api_auth": [
              "branding"
            ]
          }
        ],
        "tags": [
          "Reseller Branding"
        ],
        "parameters": [],
        "responses": {
          "200": {
            "description": "Success."
          }
        },
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": [
                  "name"
                ],
                "properties": {
                  "name": {
                    "type": "string",
                    "description": "Brandable application's name"
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "Reseller Branding"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

Store brandable application instance

# Store brandable application instance

Create or update a brandable application instance

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/branding/management/applications/instances": {
      "post": {
        "summary": "Store brandable application instance",
        "description": "Create or update a brandable application instance",
        "security": [
          {
            "api_auth": [
              "branding"
            ]
          }
        ],
        "tags": [
          "Reseller Branding"
        ],
        "parameters": [
          {
            "in": "query",
            "name": "application_instance_url",
            "required": true,
            "description": "Brandable application instance's URL.",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "reseller_id",
            "required": true,
            "description": "Reseller's unique indentifier",
            "schema": {
              "type": "integer"
            }
          },
          {
            "in": "query",
            "name": "application_id",
            "required": true,
            "description": "Brandable application id",
            "schema": {
              "type": "integer"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success."
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "Reseller Branding"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

List brandable application instances

# List brandable application instances

List all the brandable applications instances by application id

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/branding/management/applications/{application_id}/instances": {
      "get": {
        "summary": "List brandable application instances",
        "description": "List all the brandable applications instances by application id",
        "security": [
          {
            "api_auth": [
              "branding"
            ]
          }
        ],
        "tags": [
          "Reseller Branding"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "application_id",
            "required": true,
            "description": "Application id's unique identifier",
            "schema": {
              "type": "integer"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success.",
            "content": {
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": {
                    "type": "object",
                    "properties": {
                      "id": {
                        "type": "integer"
                      },
                      "site_url": {
                        "type": "string"
                      },
                      "app_id": {
                        "type": "string"
                      },
                      "account_id": {
                        "type": "string"
                      },
                      "created_at": {
                        "type": "string"
                      },
                      "updated_at": {
                        "type": "string"
                      }
                    }
                  }
                },
                "example": [
                  {
                    "id": 459,
                    "site_url": "npat.skyswitch.com",
                    "app_id": "5",
                    "account_id": "022b3bf9-e5d7-3b44-89b2-b27ca65750b8",
                    "created_at": "2019-03-08 13:39:31",
                    "updated_at": "2019-03-08 13:39:31"
                  }
                ]
              }
            }
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "Reseller Branding"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

List Releasenotes.io subscribers.

# List Releasenotes.io subscribers.

Get a list of Releasenotes.io subscribers.

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/releasenotes/subscribers": {
      "get": {
        "summary": "List Releasenotes.io subscribers.",
        "description": "Get a list of Releasenotes.io subscribers.",
        "tags": [
          "Releasenotes Subscribers"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "Account ID of the authenticated user.",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success.",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object"
                },
                "example": [
                  {
                    "id": 114387,
                    "uid": "dEQczy7x1PI8b3nl",
                    "team_id": 123,
                    "medium": "email",
                    "added_via": "registered",
                    "value": "user@example.io",
                    "created_at": "2018-04-20 19:14:58",
                    "updated_at": "2018-04-20 19:14:58",
                    "name": null,
                    "unsubscribed_at": null
                  }
                ]
              }
            }
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "Releasenotes Subscribers"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

Add Releasenotes.io subscribers.

# Add Releasenotes.io subscribers.

Create Releasenotes.io subscribers.

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/releasenotes/subscribers": {
      "post": {
        "summary": "Add Releasenotes.io subscribers.",
        "description": "Create Releasenotes.io subscribers.",
        "tags": [
          "Releasenotes Subscribers"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "Account ID of the authenticated user.",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success.",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object"
                },
                "example": {
                  "success": true
                }
              }
            }
          }
        },
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "emails": {
                    "type": "array",
                    "description": "List of emails."
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "Releasenotes Subscribers"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

Delete Releasenotes.io subscribers.

# Delete Releasenotes.io subscribers.

Delete Releasenotes.io subscribers.

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/releasenotes/subscribers": {
      "delete": {
        "summary": "Delete Releasenotes.io subscribers.",
        "description": "Delete Releasenotes.io subscribers.",
        "tags": [
          "Releasenotes Subscribers"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "Account ID of the authenticated user.",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success.",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object"
                },
                "example": {
                  "success": true
                }
              }
            }
          }
        },
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "emails": {
                    "type": "array",
                    "description": "List of emails of subscribers to be deleted."
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "Releasenotes Subscribers"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

List brand-campaigns

# List brand-campaigns

List brand-campaigns registered within the reseller account

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/tendlc/brand-campaigns": {
      "get": {
        "summary": "List brand-campaigns",
        "description": "List brand-campaigns registered within the reseller account",
        "security": [
          {
            "api_auth": [
              "ten_dlc"
            ]
          }
        ],
        "tags": [
          "10DLC"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "Account identifier",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "brand_name",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "campaign_description",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "campaign_usecase",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "tcr_brand_id",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "tcr_campaign_id",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "sort_by",
            "description": "Required with sort order.",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "sort_order",
            "description": "Required with sort_by. Valid values are asc or desc.",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success.",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object"
                },
                "example": [
                  {
                    "id": 1,
                    "reseller_id": "5",
                    "tcr_brand_id": "BSW9JVC",
                    "entity_type": "PRIVATE_PROFIT",
                    "name": "My Test Company",
                    "ein": "123456789",
                    "ein_issuing_country": "US",
                    "vertical": "RETAIL",
                    "email_address": "ben@test.com",
                    "phone_number": "+12345678901",
                    "website": "www.google.com",
                    "reference_id": null,
                    "identity_status": "Verified",
                    "status": "Active",
                    "flag": "10dlc_tcr_skyswitch",
                    "created_at": "2021-08-30T03:34:44.000000Z",
                    "updated_at": "2021-10-15T08:04:54.000000Z",
                    "deleted_at": "0",
                    "dlc_campaigns": [
                      {
                        "id": 2,
                        "brand_id": "1",
                        "tcr_campaign_id": "CNMHP7J",
                        "description": "test campaign - 11",
                        "status": "Expired",
                        "usecase": "2FA",
                        "sub_usecases": "[]",
                        "registered_on": "2021-09-01 12:06:56",
                        "deregistered_on": "2021-09-02 12:02:04",
                        "renew_on": null,
                        "auto_renewal": "1",
                        "message_class": "E",
                        "created_at": "2021-09-01T12:06:56.000000Z",
                        "updated_at": "2021-09-02T12:02:04.000000Z",
                        "deleted_at": "0",
                        "dlc_carrier_status": [
                          {
                            "campaign_id": 2,
                            "mno_id": "10017",
                            "mno_name": "AT&T",
                            "event_type": "API_UPDATE",
                            "created_at": "2021-11-02T12:30:42.000000Z",
                            "updated_at": "2021-11-02T12:30:42.000000Z"
                          }
                        ],
                        "dlc_campaign_cnps": [],
                        "dlc_campaign_draft": null,
                        "dlc_campaign_phonenumber": [
                          {
                            "campaign_id": 2,
                            "notes": null,
                            "phone_number": "+12345678901",
                            "status": "completed",
                            "created_at": "2021-11-02T12:30:42.000000Z",
                            "updated_at": "2021-11-02T12:30:42.000000Z"
                          }
                        ]
                      }
                    ]
                  }
                ]
              }
            }
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "10DLC"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

Create brand draft

# Create brand draft

Create a draft brand

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/tendlc/brands/drafts": {
      "post": {
        "summary": "Create brand draft",
        "description": "Create a draft brand",
        "security": [
          {
            "api_auth": [
              "ten_dlc"
            ]
          }
        ],
        "tags": [
          "10DLC"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "Account identifier",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "201": {
            "description": "Success."
          }
        },
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": [
                  "entity_type",
                  "display_name",
                  "phone_number",
                  "email_address"
                ],
                "properties": {
                  "entity_type": {
                    "type": "string",
                    "description": "PRIVATE_PROFIT, INDIVIDUAL, PUBLIC_PROFIT, NON_PROFIT, GOVERNMENT, SOLE_PROPRIETOR"
                  },
                  "company_account_id": {
                    "type": "string",
                    "description": "Company account identifier"
                  },
                  "first_name": {
                    "type": "string"
                  },
                  "last_name": {
                    "type": "string"
                  },
                  "display_name": {
                    "type": "string"
                  },
                  "mobile_phone": {
                    "type": "string"
                  },
                  "company_name": {
                    "type": "string"
                  },
                  "ein": {
                    "type": "string"
                  },
                  "ein_issuing_country": {
                    "type": "string"
                  },
                  "phone_number": {
                    "type": "string"
                  },
                  "street": {
                    "type": "string"
                  },
                  "city": {
                    "type": "string"
                  },
                  "state": {
                    "type": "string"
                  },
                  "zip_code": {
                    "type": "string"
                  },
                  "country": {
                    "type": "string"
                  },
                  "email_address": {
                    "type": "string"
                  },
                  "stock_symbol": {
                    "type": "string"
                  },
                  "stock_exchange": {
                    "type": "string"
                  },
                  "ip_address": {
                    "type": "string"
                  },
                  "website": {
                    "type": "string"
                  },
                  "brand_relationship": {
                    "type": "string"
                  },
                  "vertical": {
                    "type": "string"
                  },
                  "alt_business_id": {
                    "type": "string"
                  },
                  "alt_business_id_type": {
                    "type": "string",
                    "description": "NONE, DUNS, GIIN, LEI"
                  },
                  "reference_id": {
                    "type": "string"
                  },
                  "tag": {
                    "type": "string"
                  },
                  "business_contact_email": {
                    "type": "string"
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "10DLC"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

Update brand draft

# Update brand draft

Update a draft brand

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/tendlc/brands/drafts/{id}": {
      "put": {
        "summary": "Update brand draft",
        "description": "Update a draft brand",
        "security": [
          {
            "api_auth": [
              "ten_dlc"
            ]
          }
        ],
        "tags": [
          "10DLC"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "Account identifier",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "path",
            "name": "id",
            "required": true,
            "description": "Draft brand identifier",
            "schema": {
              "type": "integer"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success."
          }
        },
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "entity_type": {
                    "type": "string",
                    "description": "PRIVATE_PROFIT, INDIVIDUAL, PUBLIC_PROFIT, NON_PROFIT, GOVERNMENT, SOLE_PROPRIETOR"
                  },
                  "company_account_id": {
                    "type": "string",
                    "description": "Company account identifier"
                  },
                  "first_name": {
                    "type": "string",
                    "description": "Required if entity_type is SOLE_PROPRIETOR."
                  },
                  "last_name": {
                    "type": "string",
                    "description": "Required if entity_type is SOLE_PROPRIETOR."
                  },
                  "mobile_phone": {
                    "type": "string",
                    "description": "Required if entity_type is SOLE_PROPRIETOR."
                  },
                  "display_name": {
                    "type": "string"
                  },
                  "company_name": {
                    "type": "string"
                  },
                  "ein": {
                    "type": "string"
                  },
                  "ein_issuing_country": {
                    "type": "string"
                  },
                  "phone_number": {
                    "type": "string"
                  },
                  "street": {
                    "type": "string"
                  },
                  "city": {
                    "type": "string"
                  },
                  "state": {
                    "type": "string"
                  },
                  "zip_code": {
                    "type": "string"
                  },
                  "country": {
                    "type": "string"
                  },
                  "email_address": {
                    "type": "string"
                  },
                  "stock_symbol": {
                    "type": "string",
                    "description": "Required if entity_type is PUBLIC_PROFIT."
                  },
                  "stock_exchange": {
                    "type": "string",
                    "description": "Required if entity_type is PUBLIC_PROFIT. Must be one of the ff. NONE, NASDAQ, NYSE, AMEX, AMX, ASX, B3, BME, BSE, FRA, ICEX, JPX, JSE, KRX, LON, NSE, OMX, SEHK, SGX, SSE, STO, SWX, SZSE, TSX, TWSE, VSE, OTHER"
                  },
                  "ip_address": {
                    "type": "string"
                  },
                  "website": {
                    "type": "string"
                  },
                  "brand_relationship": {
                    "type": "string",
                    "description": "BASIC_ACCOUNT, SMALL_ACCOUNT, MEDIUM_ACCOUNT, LARGE_ACCOUNT, KEY_ACCOUNT"
                  },
                  "vertical": {
                    "type": "string"
                  },
                  "alt_business_id": {
                    "type": "string"
                  },
                  "alt_business_id_type": {
                    "type": "string",
                    "description": "NONE, DUNS, GIIN, LEI"
                  },
                  "reference_id": {
                    "type": "string"
                  },
                  "tag": {
                    "type": "string"
                  },
                  "business_contact_email": {
                    "type": "string"
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "10DLC"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

Delete brand draft

# Delete brand draft

Delete a draft brand

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/tendlc/brands/drafts/{id}": {
      "delete": {
        "summary": "Delete brand draft",
        "description": "Delete a draft brand",
        "security": [
          {
            "api_auth": [
              "ten_dlc"
            ]
          }
        ],
        "tags": [
          "10DLC"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "Account identifier",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "path",
            "name": "id",
            "required": true,
            "description": "Draft brand identifier",
            "schema": {
              "type": "integer"
            }
          }
        ],
        "responses": {
          "204": {
            "description": "Success."
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "10DLC"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

Submit brand draft

# Submit brand draft

Submit a draft brand

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/tendlc/brands/drafts/{id}/submit": {
      "post": {
        "summary": "Submit brand draft",
        "description": "Submit a draft brand",
        "security": [
          {
            "api_auth": [
              "ten_dlc"
            ]
          }
        ],
        "tags": [
          "10DLC"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "Account identifier",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "path",
            "name": "id",
            "required": true,
            "description": "Draft brand identifier",
            "schema": {
              "type": "integer"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success."
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "10DLC"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

Get brand

# Get brand

Get a brand

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/tendlc/brands/{id}": {
      "get": {
        "summary": "Get brand",
        "description": "Get a brand",
        "security": [
          {
            "api_auth": [
              "ten_dlc"
            ]
          }
        ],
        "tags": [
          "10DLC"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "Account identifier",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "path",
            "name": "id",
            "required": true,
            "description": "Brand identifier",
            "schema": {
              "type": "integer"
            }
          },
          {
            "in": "query",
            "name": "include_details",
            "description": "Set to include details from the campaign registry.",
            "schema": {
              "type": "boolean"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success.",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object"
                },
                "example": [
                  {
                    "id": 1,
                    "reseller_id": "5",
                    "tcr_brand_id": "BSW9JVC",
                    "entity_type": "PRIVATE_PROFIT",
                    "name": "My Test Company",
                    "ein": "123456789",
                    "ein_issuing_country": "US",
                    "vertical": "RETAIL",
                    "email_address": "ben@test.com",
                    "phone_number": "+12345678901",
                    "website": "www.google.com",
                    "reference_id": null,
                    "identity_status": "Verified",
                    "status": "Active",
                    "flag": "10dlc_tcr_skyswitch",
                    "created_at": "2021-08-30T03:34:44.000000Z",
                    "updated_at": "2021-10-15T08:04:54.000000Z",
                    "deleted_at": "0",
                    "dlc_brand_draft": null,
                    "details": {
                      "ein": "123456789",
                      "phone": "+12345678901",
                      "street": "some street",
                      "city": "Maryland",
                      "state": "NC",
                      "country": "US",
                      "email": "ben@test.com",
                      "website": "www.google.com",
                      "vertical": "RETAIL",
                      "mock": true,
                      "entity_type": "PRIVATE_PROFIT",
                      "csp_id": "SSWW5LA",
                      "brand_id": "BSW9JVC",
                      "display_name": "My Test Company",
                      "company_name": "Test Company",
                      "ein_issuing_country": "US",
                      "postal_code": "12345",
                      "ip_address": "156.201.223.120",
                      "brand_relationship": "KEY_ACCOUNT",
                      "universal_ein": "US_123456789",
                      "optional_attributes": [],
                      "identity_status": "VERIFIED"
                    }
                  }
                ]
              }
            }
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "10DLC"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

Update brand

# Update brand

Update a brand

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/tendlc/brands/{id}": {
      "put": {
        "summary": "Update brand",
        "description": "Update a brand",
        "security": [
          {
            "api_auth": [
              "ten_dlc"
            ]
          }
        ],
        "tags": [
          "10DLC"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "Account identifier",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "path",
            "name": "id",
            "required": true,
            "description": "Brand identifier",
            "schema": {
              "type": "integer"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success."
          }
        },
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "entity_type": {
                    "type": "string",
                    "description": "PRIVATE_PROFIT, INDIVIDUAL, PUBLIC_PROFIT, NON_PROFIT, GOVERNMENT, SOLE_PROPRIETOR"
                  },
                  "company_account_id": {
                    "type": "string",
                    "description": "Company account identifier"
                  },
                  "first_name": {
                    "type": "string",
                    "description": "Required if entity_type is SOLE_PROPRIETOR."
                  },
                  "last_name": {
                    "type": "string",
                    "description": "Required if entity_type is SOLE_PROPRIETOR."
                  },
                  "display_name": {
                    "type": "string"
                  },
                  "company_name": {
                    "type": "string"
                  },
                  "ein": {
                    "type": "string"
                  },
                  "ein_issuing_country": {
                    "type": "string"
                  },
                  "phone_number": {
                    "type": "string"
                  },
                  "street": {
                    "type": "string"
                  },
                  "city": {
                    "type": "string"
                  },
                  "state": {
                    "type": "string"
                  },
                  "zip_code": {
                    "type": "string"
                  },
                  "country": {
                    "type": "string"
                  },
                  "email_address": {
                    "type": "string"
                  },
                  "stock_symbol": {
                    "type": "string",
                    "description": "Required if entity_type is PUBLIC_PROFIT."
                  },
                  "stock_exchange": {
                    "type": "string",
                    "description": "Required if entity_type is PUBLIC_PROFIT. Must be one of the ff. NONE, NASDAQ, NYSE, AMEX, AMX, ASX, B3, BME, BSE, FRA, ICEX, JPX, JSE, KRX, LON, NSE, OMX, SEHK, SGX, SSE, STO, SWX, SZSE, TSX, TWSE, VSE, OTHER"
                  },
                  "ip_address": {
                    "type": "string"
                  },
                  "website": {
                    "type": "string"
                  },
                  "brand_relationship": {
                    "type": "string",
                    "description": "BASIC_ACCOUNT, SMALL_ACCOUNT, MEDIUM_ACCOUNT, LARGE_ACCOUNT, KEY_ACCOUNT"
                  },
                  "vertical": {
                    "type": "string"
                  },
                  "alt_business_id": {
                    "type": "string"
                  },
                  "alt_business_id_type": {
                    "type": "string",
                    "description": "NONE, DUNS, GIIN, LEI"
                  },
                  "reference_id": {
                    "type": "string"
                  },
                  "tag": {
                    "type": "string"
                  },
                  "business_contact_email": {
                    "type": "string"
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "10DLC"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

Delete brand

# Delete brand

Delete a brand

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/tendlc/brands/{id}": {
      "delete": {
        "summary": "Delete brand",
        "description": "Delete a brand",
        "security": [
          {
            "api_auth": [
              "ten_dlc"
            ]
          }
        ],
        "tags": [
          "10DLC"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "Account identifier",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "path",
            "name": "id",
            "required": true,
            "description": "Brand identifier",
            "schema": {
              "type": "integer"
            }
          }
        ],
        "responses": {
          "204": {
            "description": "Success."
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "10DLC"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

Get brand feedback

# Get brand feedback

Retrieve the brand feedback

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/tendlc/brands/{id}/feedbacks": {
      "get": {
        "summary": "Get brand feedback",
        "description": "Retrieve the brand feedback",
        "security": [
          {
            "api_auth": [
              "ten_dlc"
            ]
          }
        ],
        "tags": [
          "10DLC"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "Account identifier",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "path",
            "name": "id",
            "required": true,
            "description": "Brand identifier",
            "schema": {
              "type": "integer"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success.",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object"
                },
                "example": {
                  "brand_id": "BX3N0IK",
                  "feedback": [
                    {
                      "TAX_ID": "Tax id does not match with the company name or business type."
                    },
                    {
                      "NONPROFIT": "IRS tax exempt subsection status not found."
                    }
                  ]
                }
              }
            }
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "10DLC"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

Get brand identity status

# Get brand identity status

Set a brand identity status

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/tendlc/brands/{id}/identity-status": {
      "post": {
        "summary": "Get brand identity status",
        "description": "Set a brand identity status",
        "security": [
          {
            "api_auth": [
              "ten_dlc"
            ]
          }
        ],
        "tags": [
          "10DLC"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "Account identifier",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "path",
            "name": "id",
            "required": true,
            "description": "Brand identifier",
            "schema": {
              "type": "integer"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success."
          }
        },
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "identity_status": {
                    "type": "string",
                    "description": "SELF_DECLARED, UNVERIFIED, VERIFIED, VETTED_VERIFIED"
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "10DLC"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

List campaigns

# List campaigns

List campaigns

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/tendlc/campaigns": {
      "get": {
        "summary": "List campaigns",
        "description": "List campaigns",
        "security": [
          {
            "api_auth": [
              "ten_dlc"
            ]
          }
        ],
        "tags": [
          "10DLC"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "Account identifier",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "brand_id",
            "schema": {
              "type": "integer"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success.",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object"
                },
                "example": [
                  {
                    "id": 2,
                    "brand_id": "1",
                    "tcr_campaign_id": "CNMHP7J",
                    "description": "test campaign - 11",
                    "status": "Expired",
                    "usecase": "2FA",
                    "sub_usecases": "[]",
                    "registered_on": "2021-09-01 12:06:56",
                    "deregistered_on": "2021-09-02 12:02:04",
                    "renew_on": null,
                    "auto_renewal": "1",
                    "message_class": "E",
                    "created_at": "2021-09-01T12:06:56.000000Z",
                    "updated_at": "2021-09-02T12:02:04.000000Z",
                    "deleted_at": "0"
                  }
                ]
              }
            }
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "10DLC"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

Create campaign draft

# Create campaign draft

Create a draft campaign

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/tendlc/campaigns/drafts": {
      "post": {
        "summary": "Create campaign draft",
        "description": "Create a draft campaign",
        "security": [
          {
            "api_auth": [
              "ten_dlc"
            ]
          }
        ],
        "tags": [
          "10DLC"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "Account identifier",
            "schema": {
              "type": "string"
            }
          }
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": [
                  "brand_id",
                  "usecase",
                  "description",
                  "auto_renewal"
                ],
                "properties": {
                  "brand_id": {
                    "type": "integer"
                  },
                  "tcr_brand_id": {
                    "type": "string"
                  },
                  "usecase": {
                    "type": "string"
                  },
                  "sub_usecases": {
                    "type": "array",
                    "items": {
                      "type": "string"
                    }
                  },
                  "description": {
                    "type": "string"
                  },
                  "embedded_link": {
                    "type": "integer"
                  },
                  "embedded_phone": {
                    "type": "integer"
                  },
                  "number_pool": {
                    "type": "integer"
                  },
                  "age_gated": {
                    "type": "integer"
                  },
                  "direct_lending": {
                    "type": "integer"
                  },
                  "subscriber_optin": {
                    "type": "integer"
                  },
                  "subscriber_optin_keywords": {
                    "type": "array",
                    "items": {
                      "type": "string"
                    }
                  },
                  "subscriber_optin_message": {
                    "type": "string"
                  },
                  "subscriber_optout": {
                    "type": "integer"
                  },
                  "subscriber_optout_keywords": {
                    "type": "array",
                    "items": {
                      "type": "string"
                    }
                  },
                  "subscriber_optout_message": {
                    "type": "string"
                  },
                  "subscriber_help": {
                    "type": "integer"
                  },
                  "subscriber_help_keywords": {
                    "type": "array",
                    "items": {
                      "type": "string"
                    }
                  },
                  "subscriber_help_message": {
                    "type": "string"
                  },
                  "message_flow": {
                    "type": "string"
                  },
                  "help_message_include_email": {
                    "type": "integer"
                  },
                  "help_message_include_phone_number": {
                    "type": "integer"
                  },
                  "help_message_include_website": {
                    "type": "integer"
                  },
                  "send_consent": {
                    "type": "integer"
                  },
                  "consent_message": {
                    "type": "string"
                  },
                  "sample1": {
                    "type": "string"
                  },
                  "sample2": {
                    "type": "string"
                  },
                  "sample3": {
                    "type": "string"
                  },
                  "sample4": {
                    "type": "string"
                  },
                  "sample5": {
                    "type": "string"
                  },
                  "auto_renewal": {
                    "type": "integer"
                  },
                  "terms_and_conditions": {
                    "type": "integer"
                  },
                  "cnp": {
                    "type": "string"
                  },
                  "privacy_policy_link": {
                    "type": "string"
                  },
                  "terms_and_conditions_link": {
                    "type": "string"
                  },
                  "embedded_link_sample": {
                    "type": "string"
                  }
                }
              },
              "example": {
                "brand_id": 9,
                "usecase": "MIXED",
                "sub_usecases": [
                  "2FA",
                  "CUSTOMER_CARE",
                  "SECURITY_ALERT",
                  "FRAUD_ALERT"
                ],
                "description": "This is a test campaign draft",
                "auto_renewal": true,
                "embedded_link": false,
                "embedded_phone": false,
                "number_pool": false,
                "age_gated": false,
                "direct_lending": false,
                "subscriber_optin": true,
                "subscriber_optin_keywords": [
                  "START"
                ],
                "subscriber_optin_message": "Opt In message string",
                "subscriber_optout": true,
                "subscriber_optout_keywords": [
                  "STOP"
                ],
                "subscriber_optout_message": "Opt Out message string",
                "subscriber_help": true,
                "subscriber_help_keywords": [
                  "HELP"
                ],
                "subscriber_help_message": "Help message string",
                "message_flow": "Some string",
                "help_message_include_email": false,
                "help_message_include_phone_number": true,
                "help_message_include_website": false,
                "send_consent": true,
                "consent_message": "SkySwitch would like to confirm your consent to receive messages sent to your phone number.",
                "terms_and_conditions": true,
                "sample1": "test 1",
                "sample2": "test 2",
                "sample3": "test 3",
                "sample4": "test 4",
                "sample5": "test 5",
                "cnp": "ABCDE",
                "privacy_policy_link": "http://privacy.link",
                "terms_and_conditions_link": "http://terms.conditions.link",
                "embedded_link_sample": "http://embedded.link.sample"
              }
            }
          }
        },
        "responses": {
          "201": {
            "description": "Success."
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "10DLC"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

Update campaign draft

# Update campaign draft

Update a draft campaign

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/tendlc/campaigns/drafts/{id}": {
      "put": {
        "summary": "Update campaign draft",
        "description": "Update a draft campaign",
        "security": [
          {
            "api_auth": [
              "ten_dlc"
            ]
          }
        ],
        "tags": [
          "10DLC"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "Account identifier",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "path",
            "name": "id",
            "required": true,
            "description": "Draft campaign identifier",
            "schema": {
              "type": "string"
            }
          }
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "brand_id": {
                    "type": "integer"
                  },
                  "usecase": {
                    "type": "string"
                  },
                  "sub_usecases": {
                    "type": "array",
                    "items": {
                      "type": "string"
                    }
                  },
                  "description": {
                    "type": "string"
                  },
                  "embedded_link": {
                    "type": "integer"
                  },
                  "embedded_phone": {
                    "type": "integer"
                  },
                  "number_pool": {
                    "type": "integer"
                  },
                  "age_gated": {
                    "type": "integer"
                  },
                  "direct_lending": {
                    "type": "integer"
                  },
                  "subscriber_optin": {
                    "type": "integer"
                  },
                  "subscriber_optin_keywords": {
                    "type": "array",
                    "items": {
                      "type": "string"
                    }
                  },
                  "subscriber_optin_message": {
                    "type": "string"
                  },
                  "subscriber_optout": {
                    "type": "integer"
                  },
                  "subscriber_optout_keywords": {
                    "type": "array",
                    "items": {
                      "type": "string"
                    }
                  },
                  "subscriber_optout_message": {
                    "type": "string"
                  },
                  "subscriber_help": {
                    "type": "integer"
                  },
                  "subscriber_help_keywords": {
                    "type": "array",
                    "items": {
                      "type": "string"
                    }
                  },
                  "subscriber_help_message": {
                    "type": "string"
                  },
                  "message_flow": {
                    "type": "string"
                  },
                  "help_message_include_email": {
                    "type": "integer"
                  },
                  "help_message_include_phone_number": {
                    "type": "integer"
                  },
                  "help_message_include_website": {
                    "type": "integer"
                  },
                  "send_consent": {
                    "type": "integer"
                  },
                  "consent_message": {
                    "type": "string"
                  },
                  "sample1": {
                    "type": "string"
                  },
                  "sample2": {
                    "type": "string"
                  },
                  "sample3": {
                    "type": "string"
                  },
                  "sample4": {
                    "type": "string"
                  },
                  "sample5": {
                    "type": "string"
                  },
                  "auto_renewal": {
                    "type": "integer"
                  },
                  "terms_and_conditions": {
                    "type": "integer"
                  },
                  "privacy_policy_link": {
                    "type": "string"
                  },
                  "terms_and_conditions_link": {
                    "type": "string"
                  },
                  "embedded_link_sample": {
                    "type": "string"
                  }
                }
              },
              "example": {
                "brand_id": 9,
                "usecase": "MIXED",
                "sub_usecases": [
                  "2FA",
                  "CUSTOMER_CARE",
                  "SECURITY_ALERT",
                  "FRAUD_ALERT"
                ],
                "description": "This is a test campaign draft",
                "auto_renewal": true,
                "embedded_link": false,
                "embedded_phone": false,
                "number_pool": false,
                "age_gated": false,
                "direct_lending": false,
                "subscriber_optin": true,
                "subscriber_optin_keywords": [
                  "START"
                ],
                "subscriber_optin_message": "Opt In message string",
                "subscriber_optout": true,
                "subscriber_optout_keywords": [
                  "STOP"
                ],
                "subscriber_optout_message": "Opt Out message string",
                "subscriber_help": true,
                "subscriber_help_keywords": [
                  "HELP"
                ],
                "subscriber_help_message": "Help message string",
                "message_flow": "Some string",
                "help_message_include_email": false,
                "help_message_include_phone_number": true,
                "help_message_include_website": false,
                "send_consent": true,
                "consent_message": "SkySwitch would like to confirm your consent to receive messages sent to your phone number.",
                "terms_and_conditions": false,
                "sample1": "test 1",
                "sample2": "test 2",
                "sample3": "test 3",
                "sample4": "test 4",
                "sample5": "test 5",
                "privacy_policy_link": "http://privacy.link",
                "terms_and_conditions_link": "http://terms.conditions.link",
                "embedded_link_sample": "http://embedded.link.sample"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Success."
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "10DLC"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

Delete campaign draft

# Delete campaign draft

Delete a draft campaign

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/tendlc/campaigns/drafts/{id}": {
      "delete": {
        "summary": "Delete campaign draft",
        "description": "Delete a draft campaign",
        "security": [
          {
            "api_auth": [
              "ten_dlc"
            ]
          }
        ],
        "tags": [
          "10DLC"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "Account identifier",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "path",
            "name": "id",
            "required": true,
            "description": "Draft campaign identifier",
            "schema": {
              "type": "integer"
            }
          }
        ],
        "responses": {
          "204": {
            "description": "Success."
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "10DLC"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

Submit campaign draft

# Submit campaign draft

Submit a draft campaign

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/tendlc/campaigns/drafts/{id}/submit": {
      "post": {
        "summary": "Submit campaign draft",
        "description": "Submit a draft campaign",
        "security": [
          {
            "api_auth": [
              "ten_dlc"
            ]
          }
        ],
        "tags": [
          "10DLC"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "Account identifier",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "path",
            "name": "id",
            "required": true,
            "description": "Draft campaign identifier",
            "schema": {
              "type": "integer"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success."
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "10DLC"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

List campaign content attributes

# List campaign content attributes

List campaign content attribute value

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/tendlc/campaigns/{campaign_id}/attributes": {
      "get": {
        "summary": "List campaign content attributes",
        "description": "List campaign content attribute value",
        "security": [
          {
            "api_auth": [
              "ten_dlc"
            ]
          }
        ],
        "tags": [
          "10DLC"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "Account identifier",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "path",
            "name": "campaign_id",
            "required": true,
            "description": "Campaign identifier",
            "schema": {
              "type": "integer"
            }
          },
          {
            "in": "query",
            "name": "attribute_name",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success.",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object"
                },
                "example": {
                  "id": 4,
                  "campaign_id": "1",
                  "attribute_name": "my-name",
                  "attribute_value": "my-value"
                }
              }
            }
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "10DLC"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

Store campaign content attributes

# Store campaign content attributes

Apply campaign content attributes

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/tendlc/campaigns/{campaign_id}/attributes": {
      "post": {
        "summary": "Store campaign content attributes",
        "description": "Apply campaign content attributes",
        "security": [
          {
            "api_auth": [
              "ten_dlc"
            ]
          }
        ],
        "tags": [
          "10DLC"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "Account identifier",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "path",
            "name": "campaign_id",
            "required": true,
            "description": "Campaign identifier",
            "schema": {
              "type": "integer"
            }
          },
          {
            "in": "query",
            "name": "action",
            "description": "Set \"delete\" to perform delete",
            "schema": {
              "type": "string"
            }
          }
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "array",
                "items": {
                  "type": "object",
                  "required": [
                    "attribute_name"
                  ],
                  "properties": {
                    "attribute_name": {
                      "type": "string"
                    },
                    "attribute_value": {
                      "type": "string",
                      "description": "Required unless action is delete"
                    }
                  }
                }
              },
              "example": [
                {
                  "attribute_name": "my-name",
                  "attribute_value": "my-value"
                },
                {
                  "attribute_name": "your-name",
                  "attribute_value": "your-value"
                }
              ]
            }
          }
        },
        "responses": {
          "200": {
            "description": "Success.",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object"
                },
                "example": [
                  {
                    "id": 4,
                    "campaign_id": "1",
                    "attribute_name": "my-name",
                    "attribute_value": "my-value"
                  },
                  {
                    "id": 5,
                    "campaign_id": "1",
                    "attribute_name": "your-name",
                    "attribute_value": "your-value"
                  }
                ]
              }
            }
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "10DLC"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

List opt phone numbers

# List opt phone numbers

List opt phone numbers

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/tendlc/campaigns/{campaign_id}/opt": {
      "get": {
        "summary": "List opt phone numbers",
        "description": "List opt phone numbers",
        "security": [
          {
            "api_auth": [
              "ten_dlc"
            ]
          }
        ],
        "tags": [
          "10DLC"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "Account identifier",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "path",
            "name": "campaign_id",
            "required": true,
            "description": "Campaign identifier",
            "schema": {
              "type": "integer"
            }
          },
          {
            "in": "query",
            "name": "opt_type",
            "description": "Comma-separated opt type filter.",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "opt_origin",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "phone_number",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "subscriber_number",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "page",
            "schema": {
              "type": "integer"
            }
          },
          {
            "in": "query",
            "name": "per_page",
            "schema": {
              "type": "integer"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success.",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object"
                },
                "example": {
                  "pagination": {
                    "count": "2",
                    "per_page": 100,
                    "page": 1
                  },
                  "data": [
                    {
                      "messageid": 123456,
                      "campaign_id": "1",
                      "opt_type": "opt-in",
                      "phone_number": "12345678906",
                      "subscriber_number": "19876543211",
                      "opt_origin": "subscribe",
                      "scope": "campaign",
                      "updated_at": "2021-09-28T20:30:37.000000Z",
                      "created_at": "2021-09-28T20:30:37.000000Z",
                      "id": 12
                    },
                    {
                      "messageid": 123457,
                      "campaign_id": "1",
                      "opt_type": "opt-out",
                      "phone_number": "12345678907",
                      "subscriber_number": "19876543211",
                      "opt_origin": "subscribe",
                      "scope": "phone_number",
                      "updated_at": "2021-09-28T20:30:37.000000Z",
                      "created_at": "2021-09-28T20:30:37.000000Z",
                      "id": 13
                    }
                  ]
                }
              }
            }
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "10DLC"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

Store opt phone numbers

# Store opt phone numbers

Apply opt phone numbers

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/tendlc/campaigns/{campaign_id}/opt": {
      "post": {
        "summary": "Store opt phone numbers",
        "description": "Apply opt phone numbers",
        "security": [
          {
            "api_auth": [
              "ten_dlc"
            ]
          }
        ],
        "tags": [
          "10DLC"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "Account identifier",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "path",
            "name": "campaign_id",
            "required": true,
            "description": "Campaign identifier",
            "schema": {
              "type": "integer"
            }
          },
          {
            "in": "query",
            "name": "action",
            "description": "Set \"delete\" to perform delete",
            "schema": {
              "type": "string"
            }
          }
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "array",
                "items": {
                  "type": "object",
                  "required": [
                    "phone_number"
                  ],
                  "properties": {
                    "phone_number": {
                      "type": "string"
                    },
                    "subscriber_number": {
                      "type": "string",
                      "description": "Required unless action is delete"
                    },
                    "opt_type": {
                      "type": "string",
                      "description": "Either opt-in or opt-out. Required unless action is delete"
                    },
                    "opt_origin": {
                      "type": "string",
                      "description": "Can be spam, subscribe, stop, end, spam, consent. Required unless action is delete"
                    },
                    "scope": {
                      "type": "string",
                      "description": "Can be either campaign or phone_number. Required unless action is delete"
                    },
                    "messageid": {
                      "type": "integer"
                    }
                  }
                }
              },
              "example": [
                {
                  "messageid": 123456,
                  "phone_number": "12345678906",
                  "subscriber_number": "19876543211",
                  "opt_type": "opt-in",
                  "opt_origin": "subscribe",
                  "scope": "campaign"
                },
                {
                  "messageid": 123457,
                  "phone_number": "12345678907",
                  "subscriber_number": "19876543211",
                  "opt_type": "opt-out",
                  "opt_origin": "subscribe",
                  "scope": "phone_number"
                }
              ]
            }
          }
        },
        "responses": {
          "200": {
            "description": "Success.",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object"
                },
                "example": [
                  {
                    "messageid": 123456,
                    "campaign_id": "1",
                    "opt_type": "opt-in",
                    "phone_number": "12345678906",
                    "subscriber_number": "19876543211",
                    "opt_origin": "subscribe",
                    "scope": "campaign",
                    "updated_at": "2021-09-28T20:30:37.000000Z",
                    "created_at": "2021-09-28T20:30:37.000000Z",
                    "id": 12
                  },
                  {
                    "messageid": 123457,
                    "campaign_id": "1",
                    "opt_type": "opt-out",
                    "phone_number": "12345678907",
                    "subscriber_number": "19876543211",
                    "opt_origin": "subscribe",
                    "scope": "phone_number",
                    "updated_at": "2021-09-28T20:30:37.000000Z",
                    "created_at": "2021-09-28T20:30:37.000000Z",
                    "id": 13
                  }
                ]
              }
            }
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "10DLC"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

Get Campaign

# Get Campaign

Get details of a specific campaign.

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/tendlc/campaigns/{id}": {
      "get": {
        "summary": "Get Campaign",
        "description": "Get details of a specific campaign.",
        "security": [
          {
            "api_auth": [
              "ten_dlc"
            ]
          }
        ],
        "tags": [
          "10DLC"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "Account identifier",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "path",
            "name": "id",
            "required": true,
            "description": "Campaign identifier",
            "schema": {
              "type": "integer"
            }
          },
          {
            "in": "query",
            "name": "include_details",
            "description": "Set 1 to include details to be retrieved from The Campaign Registry (TCR). When set to 0 or undefined, the response are a limited set of campaign information but response time is faster.",
            "schema": {
              "type": "integer"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success.",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object"
                },
                "example": {
                  "id": 463,
                  "brand_id": "2",
                  "tcr_campaign_id": "CHTF3F5",
                  "description": "ReachUC PBX Mobile Application and or Customer Care BOT Responder",
                  "status": "Active",
                  "usecase": "LOW_VOLUME",
                  "sub_usecases": "[\"CUSTOMER_CARE\",\"ACCOUNT_NOTIFICATION\",\"FRAUD_ALERT\",\"DELIVERY_NOTIFICATION\",\"MARKETING\"]",
                  "registered_on": "2021-10-01 19:10:38",
                  "deregistered_on": null,
                  "renew_on": "2022-01-01",
                  "auto_renewal": "1",
                  "message_class": "T",
                  "created_at": "2021-10-01T19:10:23.000000Z",
                  "updated_at": "2021-10-25T13:52:00.000000Z",
                  "deleted_at": "0",
                  "dlc_campaign_draft": null,
                  "details": {
                    "tcr_brand_id": "BEYNFBC",
                    "tcr_campaign_id": "CHTF3F5",
                    "status": "ACTIVE",
                    "vertical": "TECHNOLOGY",
                    "usecase": "LOW_VOLUME",
                    "description": "ReachUC PBX Mobile Application and or Customer Care BOT Responder",
                    "sample1": "For technical support, please reply with SUPPORT.",
                    "sample2": "Your password will expire in 30 days.",
                    "sample3": "A device has accessed your account from a new location, please verify.",
                    "sample4": "Your order has been delivered.",
                    "sample5": "To receive 10% off your next order, please reply with TAKE10 to get your code.",
                    "reseller_id": "RJAKQSI",
                    "auto_renewal": true,
                    "sub_usecases": [
                      "CUSTOMER_CARE",
                      "MARKETING",
                      "ACCOUNT_NOTIFICATION",
                      "DELIVERY_NOTIFICATION",
                      "FRAUD_ALERT"
                    ],
                    "embedded_link": true,
                    "embedded_phone": true,
                    "affiliate_marketing": false,
                    "number_pool": false,
                    "age_gated": false,
                    "direct_lending": false,
                    "subscriber_optin": true,
                    "subscriber_optout": true,
                    "subscriber_help": true,
                    "message_flow": null,
                    "help_message": null,
                    "reference_id": null,
                    "mno_metadata": {
                      "10017": {
                        "mno": "AT&T",
                        "tpm": 75,
                        "qualify": true,
                        "tpm_scope": "CAMPAIGN",
                        "min_msg_samples": 1,
                        "msg_class": "T",
                        "req_subscriber_optout": true,
                        "mno_review": false,
                        "no_embedded_phone": false,
                        "req_subscriber_help": true,
                        "req_subscriber_optin": true,
                        "mno_support": true,
                        "no_embedded_link": false
                      }
                    },
                    "operation_status": {
                      "10017": "APPROVED"
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "10DLC"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

Update campaign

# Update campaign

Update a campaign

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/tendlc/campaigns/{id}": {
      "put": {
        "summary": "Update campaign",
        "description": "Update a campaign",
        "security": [
          {
            "api_auth": [
              "ten_dlc"
            ]
          }
        ],
        "tags": [
          "10DLC"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "Account identifier",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "path",
            "name": "id",
            "required": true,
            "description": "Campaign identifier",
            "schema": {
              "type": "string"
            }
          }
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "reseller_id": {
                    "type": "string"
                  },
                  "sample1": {
                    "type": "string"
                  },
                  "sample2": {
                    "type": "string"
                  },
                  "sample3": {
                    "type": "string"
                  },
                  "sample4": {
                    "type": "string"
                  },
                  "sample5": {
                    "type": "string"
                  },
                  "message_flow": {
                    "type": "string"
                  },
                  "help_message": {
                    "type": "string"
                  },
                  "help_keywords": {
                    "type": "array",
                    "items": {
                      "type": "string"
                    }
                  },
                  "auto_renewal": {
                    "type": "integer"
                  },
                  "description": {
                    "type": "string"
                  },
                  "embedded_link": {
                    "type": "integer"
                  },
                  "embedded_phone": {
                    "type": "integer"
                  },
                  "age_gated": {
                    "type": "integer"
                  },
                  "direct_lending": {
                    "type": "integer"
                  },
                  "dca_election_status": {
                    "type": "string"
                  },
                  "optin_keywords": {
                    "type": "array",
                    "items": {
                      "type": "string"
                    }
                  },
                  "optin_message": {
                    "type": "string"
                  },
                  "optout_keywords": {
                    "type": "array",
                    "items": {
                      "type": "string"
                    }
                  },
                  "optout_message": {
                    "type": "string"
                  },
                  "help_message_include_email": {
                    "type": "boolean"
                  },
                  "help_message_include_phone_number": {
                    "type": "boolean"
                  },
                  "help_message_include_website": {
                    "type": "boolean"
                  }
                }
              },
              "example": {
                "reseller_id": "1",
                "sample1": "test",
                "sample2": "test",
                "sample3": "test",
                "sample4": "test",
                "sample5": "test",
                "message_flow": "some string",
                "help_message": "help string",
                "help_keywords": [
                  "HELP"
                ],
                "auto_renewal": 1,
                "description": "description text",
                "dca_election_status": "accepted",
                "optin_keywords": [
                  "START"
                ],
                "optin_message": "some string",
                "optout_keywords": [
                  "STOP"
                ],
                "optout_message": "some string",
                "help_message_include_email": true,
                "help_message_include_phone_number": true,
                "help_message_include_website": true
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Success."
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "10DLC"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

Delete campaign

# Delete campaign

Delete a campaign

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/tendlc/campaigns/{id}": {
      "delete": {
        "summary": "Delete campaign",
        "description": "Delete a campaign",
        "security": [
          {
            "api_auth": [
              "ten_dlc"
            ]
          }
        ],
        "tags": [
          "10DLC"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "Account identifier",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "path",
            "name": "id",
            "required": true,
            "description": "Campaign identifier",
            "schema": {
              "type": "integer"
            }
          }
        ],
        "responses": {
          "204": {
            "description": "Success."
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "10DLC"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

List phone numbers in/outside a campaign

# List phone numbers in/outside a campaign

List phone numbers assigned in a campaign or phone numbers not associated with a campaign.

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/tendlc/campaigns/{id}/phone-numbers": {
      "get": {
        "summary": "List phone numbers in/outside a campaign",
        "description": "List phone numbers assigned in a campaign or phone numbers not associated with a campaign.",
        "security": [
          {
            "api_auth": [
              "ten_dlc"
            ]
          }
        ],
        "tags": [
          "10DLC"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "Account identifier",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "path",
            "name": "id",
            "required": true,
            "description": "Campaign identifier or TCR Campaign ID",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "assigned",
            "description": "Filter for campaign assigned phone numbers. Values can be 1 or 0.",
            "schema": {
              "type": "integer"
            }
          },
          {
            "in": "query",
            "name": "domain",
            "required": true,
            "description": "Filter phone numbers by domain. Values can be the actual domain or \"*\" for all domain.",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "phone_number",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "page",
            "schema": {
              "type": "integer"
            }
          },
          {
            "in": "query",
            "name": "per_page",
            "schema": {
              "type": "integer"
            }
          },
          {
            "in": "query",
            "name": "force",
            "description": "Force check from the carrier of the phone number status",
            "schema": {
              "type": "integer"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success.",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "pagination": {
                      "$ref": "#/components/schemas/Pagination"
                    },
                    "data": {
                      "type": "array",
                      "items": {
                        "type": "object",
                        "properties": {
                          "phone_number": {
                            "type": "string"
                          },
                          "carrier": {
                            "type": "string"
                          },
                          "domain": {
                            "type": "string"
                          },
                          "status": {
                            "type": "string"
                          }
                        }
                      }
                    }
                  }
                },
                "example": {
                  "pagination": {
                    "count": 1,
                    "per_page": "10",
                    "page": 1
                  },
                  "data": [
                    {
                      "phone_number": "12345678901",
                      "carrier": "inteli-rest",
                      "domain": "domain.12345.service",
                      "status": "pending"
                    }
                  ]
                }
              }
            }
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "10DLC"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    },
    "schemas": {
      "Pagination": {
        "type": "object",
        "properties": {
          "count": {
            "type": "integer"
          },
          "per_page": {
            "type": "integer"
          },
          "page": {
            "type": "integer"
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

Assign phone numbers to campaign by domain

# Assign phone numbers to campaign by domain

Assign phone numbers to campaign by domain.

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/tendlc/campaigns/{id}/phone-numbers": {
      "post": {
        "summary": "Assign phone numbers to campaign by domain",
        "description": "Assign phone numbers to campaign by domain.",
        "security": [
          {
            "api_auth": [
              "ten_dlc"
            ]
          }
        ],
        "tags": [
          "10DLC"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "Account identifier",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "path",
            "name": "id",
            "required": true,
            "description": "Campaign identifier or TCR Campaign ID",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "domain",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success."
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "10DLC"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

Bulk assign/unassign phone numbers to campaign

# Bulk assign/unassign phone numbers to campaign

Assign or unassign a group of phone numbers to a messaging campaign.

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/tendlc/campaigns/{id}/phone-numbers": {
      "put": {
        "summary": "Bulk assign/unassign phone numbers to campaign",
        "description": "Assign or unassign a group of phone numbers to a messaging campaign.",
        "security": [
          {
            "api_auth": [
              "ten_dlc"
            ]
          }
        ],
        "tags": [
          "10DLC"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "Account identifier",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "path",
            "name": "id",
            "required": true,
            "description": "Campaign identifier",
            "schema": {
              "type": "integer"
            }
          },
          {
            "in": "query",
            "name": "action",
            "description": "Set to 'delete' to unassign phone numbers from a messaging campaign.",
            "schema": {
              "type": "string"
            }
          }
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": [
                  "phone_numbers"
                ],
                "properties": {
                  "phone_numbers": {
                    "type": "array",
                    "items": {
                      "type": "string"
                    }
                  }
                }
              },
              "example": {
                "phone_numbers": [
                  "16027336369",
                  "17826981628"
                ]
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Success."
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "10DLC"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

Assign phone number to campaign

# Assign phone number to campaign

Assign a phone number to a campaign

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/tendlc/campaigns/{id}/phone-numbers/{phone_number}": {
      "post": {
        "summary": "Assign phone number to campaign",
        "description": "Assign a phone number to a campaign",
        "security": [
          {
            "api_auth": [
              "ten_dlc"
            ]
          }
        ],
        "tags": [
          "10DLC"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "Account identifier",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "path",
            "name": "id",
            "required": true,
            "description": "Campaign identifier or TCR Campaign ID",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "path",
            "name": "phone_number",
            "required": true,
            "description": "Phone number",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success."
          }
        },
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "notes": {
                    "type": "string",
                    "description": "Notes"
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "10DLC"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

Unassign phone number from campaign

# Unassign phone number from campaign

Unassign a phone number from a campaign

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/tendlc/campaigns/{id}/phone-numbers/{phone_number}": {
      "delete": {
        "summary": "Unassign phone number from campaign",
        "description": "Unassign a phone number from a campaign",
        "security": [
          {
            "api_auth": [
              "ten_dlc"
            ]
          }
        ],
        "tags": [
          "10DLC"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "Account identifier",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "path",
            "name": "id",
            "required": true,
            "description": "Campaign identifier or TCR Campaign ID",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "path",
            "name": "phone_number",
            "required": true,
            "description": "Phone number",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "204": {
            "description": "Success."
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "10DLC"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

Set campaign phone number notes

# Set campaign phone number notes

Set notes to campaign phone number

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/tendlc/campaigns/{id}/phone-numbers/{phone_number}/notes": {
      "put": {
        "summary": "Set campaign phone number notes",
        "description": "Set notes to campaign phone number",
        "security": [
          {
            "api_auth": [
              "ten_dlc"
            ]
          }
        ],
        "tags": [
          "10DLC"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "Account identifier",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "path",
            "name": "id",
            "required": true,
            "description": "Campaign identifier or TCR Campaign ID",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "path",
            "name": "phone_number",
            "required": true,
            "description": "Phone number",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success."
          }
        },
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "notes": {
                    "type": "string",
                    "description": "Notes"
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "10DLC"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

Get campaign by phone number

# Get campaign by phone number

Get campaign by phone numbr

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/tendlc/phone-numbers/{phone_number}": {
      "get": {
        "summary": "Get campaign by phone number",
        "description": "Get campaign by phone numbr",
        "security": [
          {
            "api_auth": [
              "ten_dlc"
            ]
          }
        ],
        "tags": [
          "10DLC"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "Account identifier",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "path",
            "name": "phone_number",
            "required": true,
            "description": "Phone number",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success.",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "campaign_id": {
                      "type": "string"
                    },
                    "phone_number": {
                      "type": "string"
                    },
                    "created_at": {
                      "type": "integer"
                    },
                    "updated_at": {
                      "type": "integer"
                    },
                    "dlc_campaign": {
                      "type": "object",
                      "properties": {
                        "id": {
                          "type": "integer"
                        },
                        "brand_id": {
                          "type": "string"
                        },
                        "tcr_campaign_id": {
                          "type": "string"
                        },
                        "description": {
                          "type": "string"
                        },
                        "status": {
                          "type": "string"
                        },
                        "usecase": {
                          "type": "string"
                        },
                        "sub_usecases": {
                          "type": "string"
                        },
                        "registered_on": {
                          "type": "integer"
                        },
                        "deregistered_on": {
                          "type": "integer"
                        },
                        "renew_on": {
                          "type": "integer"
                        },
                        "auto_renew": {
                          "type": "string"
                        },
                        "message_class": {
                          "type": "string"
                        },
                        "created_at": {
                          "type": "integer"
                        },
                        "updated_at": {
                          "type": "integer"
                        },
                        "dlc_brand": {
                          "type": "object",
                          "properties": {
                            "id": {
                              "type": "integer"
                            },
                            "reseller_id": {
                              "type": "string"
                            },
                            "tcr_brand_id": {
                              "type": "string"
                            },
                            "name": {
                              "type": "string"
                            },
                            "status": {
                              "type": "string"
                            },
                            "created_at": {
                              "type": "integer"
                            },
                            "updated_at": {
                              "type": "integer"
                            }
                          }
                        }
                      }
                    }
                  }
                },
                "example": {
                  "campaign_id": "1",
                  "phone_number": "12345678901",
                  "created_at": 1630742338,
                  "updated_at": 1630742338,
                  "dlc_campaign": {
                    "id": 1,
                    "brand_id": "1",
                    "tcr_campaign_id": "CQYC8E9",
                    "description": "Test Campaign Description",
                    "status": "Active",
                    "usecase": "",
                    "sub_usecases": null,
                    "registered_on": 1630742338,
                    "deregistered_on": null,
                    "renew_on": null,
                    "auto_renew": "0",
                    "message_class": "A",
                    "created_at": 1630742338,
                    "updated_at": 1630742338,
                    "dlc_brand": {
                      "id": 1,
                      "reseller_id": "1",
                      "tcr_brand_id": "BZ7D2TD",
                      "name": "test brand",
                      "status": "Completed",
                      "created_at": 1630742338,
                      "updated_at": 1630742338
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "10DLC"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

Calculate pricing

# Calculate pricing

Calculate 10dlc pricing

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/tendlc/pricing/calculate": {
      "post": {
        "summary": "Calculate pricing",
        "description": "Calculate 10dlc pricing",
        "security": [
          {
            "api_auth": [
              "ten_dlc"
            ]
          }
        ],
        "tags": [
          "10DLC"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "Account identifier",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success.",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object"
                },
                "example": {
                  "breakdown": {
                    "sms_entitlement": {
                      "nrc": "0.00",
                      "mrc": "12.25",
                      "usage": "0.00"
                    },
                    "number_pooling": {
                      "nrc": "0.00",
                      "mrc": "0.00",
                      "usage": "0.00"
                    },
                    "brand": {
                      "nrc": "4.00",
                      "mrc": "0.00",
                      "usage": "0.00"
                    },
                    "campaign": {
                      "nrc": "50.00",
                      "mrc": "0.00",
                      "usage": "0.00"
                    },
                    "vetting": {
                      "nrc": "0",
                      "mrc": "0.00",
                      "usage": "0.00"
                    },
                    "sms_usage": {
                      "usage": "0.00",
                      "nrc": "0.00",
                      "mrc": "0.00"
                    },
                    "mms_usage": {
                      "usage": "0.00",
                      "nrc": "0.00",
                      "mrc": "0.00"
                    }
                  },
                  "subtotal": {
                    "nrc": "66.25",
                    "mrc": "12.25",
                    "usage": "0.00"
                  },
                  "total": {
                    "nrc": "66.25",
                    "mrc": "12.25"
                  },
                  "did_average_cost": "0.25"
                }
              }
            }
          }
        },
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": [
                  "number_of_dids",
                  "vetting",
                  "all_sms",
                  "all_mms"
                ],
                "properties": {
                  "number_of_dids": {
                    "type": "integer",
                    "description": "Number of DIDs"
                  },
                  "use_case": {
                    "type": "string",
                    "description": "Campaign use case. For values see List Use Cases endpoint"
                  },
                  "vetting": {
                    "type": "boolean",
                    "description": "Vetting"
                  },
                  "all_sms": {
                    "type": "integer",
                    "description": "All Inbound/Outbound SMS"
                  },
                  "all_mms": {
                    "type": "integer",
                    "description": "All Inbound/Outbound MMS"
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "10DLC"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

Get reseller

# Get reseller

Retrieve a reseller

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/tendlc/resellers": {
      "get": {
        "summary": "Get reseller",
        "description": "Retrieve a reseller",
        "security": [
          {
            "api_auth": [
              "ten_dlc"
            ]
          }
        ],
        "tags": [
          "10DLC"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "Account identifier",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success.",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "id": {
                      "type": "integer"
                    },
                    "tcr_reseller_id": {
                      "type": "string"
                    },
                    "company_name": {
                      "type": "string"
                    },
                    "phone_number": {
                      "type": "string"
                    },
                    "email_address": {
                      "type": "string"
                    },
                    "email_address_alerts": {
                      "type": "string"
                    },
                    "variant": {
                      "type": "string"
                    },
                    "created_at": {
                      "type": "string"
                    },
                    "updated_at": {
                      "type": "string"
                    }
                  }
                },
                "example": {
                  "id": 5,
                  "tcr_reseller_id": "RJAKQSI",
                  "company_name": "Skyswitch",
                  "phone_number": "+17477778102",
                  "email_address": "csp@skyswitch.com",
                  "email_address_alerts": "dev@skyswitch.com",
                  "variant": "original",
                  "created_at": "2021-08-30T03:34:08.000000Z",
                  "updated_at": "2021-11-24T08:08:41.000000Z"
                }
              }
            }
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "10DLC"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

Create reseller

# Create reseller

Create a reseller

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/tendlc/resellers": {
      "post": {
        "summary": "Create reseller",
        "description": "Create a reseller",
        "security": [
          {
            "api_auth": [
              "ten_dlc"
            ]
          }
        ],
        "tags": [
          "10DLC"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "Account identifier",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "201": {
            "description": "Success."
          }
        },
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": [
                  "company_name",
                  "phone_number",
                  "email_address",
                  "email_address_alerts"
                ],
                "properties": {
                  "company_name": {
                    "type": "string"
                  },
                  "phone_number": {
                    "type": "string"
                  },
                  "email_address": {
                    "type": "string"
                  },
                  "email_address_alerts": {
                    "type": "string",
                    "description": "Can be comma-separated for multiple addresses. Max of 5 email addresses only."
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "10DLC"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

Update reseller

# Update reseller

Update a reseller

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/tendlc/resellers": {
      "put": {
        "summary": "Update reseller",
        "description": "Update a reseller",
        "security": [
          {
            "api_auth": [
              "ten_dlc"
            ]
          }
        ],
        "tags": [
          "10DLC"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "Account identifier",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success."
          }
        },
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": [
                  "company_name",
                  "phone_number",
                  "email_address",
                  "email_address_alerts"
                ],
                "properties": {
                  "company_name": {
                    "type": "string"
                  },
                  "phone_number": {
                    "type": "string"
                  },
                  "email_address": {
                    "type": "string"
                  },
                  "email_address_alerts": {
                    "type": "string",
                    "description": "Can be comma-separated for multiple addresses. Max of 5 email addresses only."
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "10DLC"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

List Toll Free Brands and Campaigns

# List Toll Free Brands and Campaigns

List toll free brands and campaigns.

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/tfa2p/brand-campaigns": {
      "get": {
        "summary": "List Toll Free Brands and Campaigns",
        "description": "List toll free brands and campaigns.",
        "security": [
          {
            "api_auth": [
              "tollfree_a2p"
            ]
          }
        ],
        "tags": [
          "Toll Free A2P"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "Account identifier",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "brand_name",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "campaign_description",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "campaign_usecase",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "sort_by",
            "description": "Required with sort_order",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "sort_order",
            "description": "Required with sort_by. Valid values are asc, desc",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "example": [
                    {
                      "id": 1,
                      "reseller_id": "1",
                      "tcr_brand_id": null,
                      "entity_type": "PRIVATE_COMPANY",
                      "name": "Test Brand",
                      "ein": null,
                      "ein_issuing_country": null,
                      "vertical": null,
                      "email_address": "test@mail.com",
                      "phone_number": "12345678901",
                      "website": null,
                      "reference_id": null,
                      "identity_status": null,
                      "status": "Active",
                      "flag": "tollfree",
                      "created_at": "2021-12-06T06:33:42.000000Z",
                      "updated_at": "2021-12-06T06:33:42.000000Z",
                      "deleted_at": "0",
                      "dlc_campaigns": [
                        {
                          "id": 1,
                          "brand_id": "1",
                          "tcr_campaign_id": null,
                          "description": "test campaign",
                          "status": "Active",
                          "usecase": "ACCOUNT_MANAGEMENT_REMINDERS",
                          "sub_usecases": "[]",
                          "registered_on": "2021-12-06 06:47:22",
                          "deregistered_on": null,
                          "renew_on": null,
                          "auto_renewal": "0",
                          "message_class": "",
                          "created_at": "2021-12-06T06:47:22.000000Z",
                          "updated_at": "2021-12-06T06:47:22.000000Z",
                          "deleted_at": "0",
                          "dlc_carrier_status": [],
                          "dlc_campaign_cnps": [],
                          "dlc_campaign_draft": null
                        }
                      ]
                    }
                  ]
                }
              }
            }
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "Toll Free A2P"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

Create Toll Free Brand

# Create Toll Free Brand

Create Toll Free A2P brand.

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/tfa2p/brands": {
      "post": {
        "summary": "Create Toll Free Brand",
        "description": "Create Toll Free A2P brand.",
        "security": [
          {
            "api_auth": [
              "tollfree_a2p"
            ]
          }
        ],
        "tags": [
          "Toll Free A2P"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "Account identifier",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success.",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "example": {
                    "reseller_id": 55,
                    "entity_type": "PRIVATE_COMPANY",
                    "name": "Test Company",
                    "ein": null,
                    "ein_issuing_country": null,
                    "vertical": null,
                    "status": "Active",
                    "email_address": "test@mail.com",
                    "phone_number": "12345678901",
                    "website": null,
                    "reference_id": "some text here...",
                    "flag": "tollfree",
                    "updated_at": "2021-12-06T06:17:00.000000Z",
                    "created_at": "2021-12-06T06:17:00.000000Z",
                    "id": 1
                  }
                }
              }
            }
          }
        },
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": [
                  "entity_type",
                  "company_name",
                  "email_address",
                  "phone_number",
                  "status"
                ],
                "properties": {
                  "entity_type": {
                    "type": "string",
                    "description": "Valid values are PRIVATE_COMPANY, FRANCHISE, GOVERNMENT, LICENSED_PROFESSIONAL, PUBLIC_UTILITY"
                  },
                  "company_name": {
                    "type": "string"
                  },
                  "email_address": {
                    "type": "string"
                  },
                  "phone_number": {
                    "type": "string"
                  },
                  "reference_id": {
                    "type": "string"
                  },
                  "status": {
                    "type": "string",
                    "description": "Valid values are Pending, Active, Error"
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "Toll Free A2P"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

Get Toll Free Brand

# Get Toll Free Brand

Get Toll Free A2P brand.

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/tfa2p/brands/{id}": {
      "get": {
        "summary": "Get Toll Free Brand",
        "description": "Get Toll Free A2P brand.",
        "security": [
          {
            "api_auth": [
              "tollfree_a2p"
            ]
          }
        ],
        "tags": [
          "Toll Free A2P"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "Account identifier",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "path",
            "name": "id",
            "required": true,
            "description": "Brand identifier",
            "schema": {
              "type": "integer"
            }
          },
          {
            "in": "query",
            "name": "entity_type",
            "description": "Valid values are PRIVATE_COMPANY, FRANCHISE, GOVERNMENT, LICENSED_PROFESSIONAL, PUBLIC_UTILITY",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "company_name",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "email_address",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "phone_number",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "example": {
                    "id": 1,
                    "reseller_id": "1",
                    "tcr_brand_id": null,
                    "entity_type": "PRIVATE_COMPANY",
                    "name": "Test Brand",
                    "ein": null,
                    "ein_issuing_country": null,
                    "vertical": null,
                    "email_address": "test@mail.com",
                    "phone_number": "12345678901",
                    "website": null,
                    "reference_id": null,
                    "identity_status": null,
                    "status": "Active",
                    "flag": "tollfree",
                    "created_at": "2021-12-06T06:17:00.000000Z",
                    "updated_at": "2021-12-06T06:17:00.000000Z",
                    "deleted_at": "0",
                    "dlc_brand_draft": null
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "Toll Free A2P"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

Update Toll Free Brand

# Update Toll Free Brand

Update Toll Free A2P brand.

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/tfa2p/brands/{id}": {
      "put": {
        "summary": "Update Toll Free Brand",
        "description": "Update Toll Free A2P brand.",
        "security": [
          {
            "api_auth": [
              "tollfree_a2p"
            ]
          }
        ],
        "tags": [
          "Toll Free A2P"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "Account identifier",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "path",
            "name": "id",
            "required": true,
            "description": "Brand identifier",
            "schema": {
              "type": "integer"
            }
          }
        ],
        "responses": {
          "202": {
            "description": "Accepted"
          }
        },
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "entity_type": {
                    "type": "string",
                    "description": "Valid values are PRIVATE_COMPANY, FRANCHISE, GOVERNMENT, LICENSED_PROFESSIONAL, PUBLIC_UTILITY"
                  },
                  "company_name": {
                    "type": "string"
                  },
                  "email_address": {
                    "type": "string"
                  },
                  "phone_number": {
                    "type": "string"
                  },
                  "reference_id": {
                    "type": "string"
                  },
                  "status": {
                    "type": "string",
                    "description": "Valid values are Pending, Active, Error"
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "Toll Free A2P"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

Delete Toll Free Brand

# Delete Toll Free Brand

Delete Toll Free A2P brand.

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/tfa2p/brands/{id}": {
      "delete": {
        "summary": "Delete Toll Free Brand",
        "description": "Delete Toll Free A2P brand.",
        "security": [
          {
            "api_auth": [
              "tollfree_a2p"
            ]
          }
        ],
        "tags": [
          "Toll Free A2P"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "Account identifier",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "path",
            "name": "id",
            "required": true,
            "description": "Brand identifier",
            "schema": {
              "type": "integer"
            }
          }
        ],
        "responses": {
          "204": {
            "description": "Success"
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "Toll Free A2P"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

Create Toll Free Campaign

# Create Toll Free Campaign

Create Toll Free A2P campaign.

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/tfa2p/campaigns": {
      "post": {
        "summary": "Create Toll Free Campaign",
        "description": "Create Toll Free A2P campaign.",
        "security": [
          {
            "api_auth": [
              "tollfree_a2p"
            ]
          }
        ],
        "tags": [
          "Toll Free A2P"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "Account identifier",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success.",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "example": {
                    "brand_id": 1,
                    "description": "test campaign",
                    "usecase": "ACCOUNT_MANAGEMENT_REMINDERS",
                    "registered_on": "2021-12-06 06:36:16",
                    "sub_usecases": "[]",
                    "auto_renewal": 0,
                    "status": "Active",
                    "updated_at": "2021-12-06T06:36:16.000000Z",
                    "created_at": "2021-12-06T06:36:16.000000Z",
                    "id": 1
                  }
                }
              }
            }
          }
        },
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": [
                  "brand_id",
                  "usecase",
                  "description",
                  "status"
                ],
                "properties": {
                  "brand_id": {
                    "type": "integer"
                  },
                  "usecase": {
                    "type": "string",
                    "description": "Values from List Toll Free A2P use cases."
                  },
                  "description": {
                    "type": "string"
                  },
                  "status": {
                    "type": "string",
                    "description": "Valid values are Pending, Active, Expired, Error, Disabled_Complaint, Disabled_Suspended"
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "Toll Free A2P"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

List Use Cases

# List Use Cases

List TollFree A2P use cases.

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/tfa2p/campaigns/use-cases": {
      "get": {
        "summary": "List Use Cases",
        "description": "List TollFree A2P use cases.",
        "security": [
          {
            "api_auth": [
              "tollfree_a2p"
            ]
          }
        ],
        "tags": [
          "Toll Free A2P"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "Account identifier",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success.",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "example": [
                    {
                      "key": "ACCOUNT_MANAGEMENT_REMINDERS",
                      "name": "Account Management Reminders"
                    },
                    {
                      "key": "APPOINTMENT_REMINDERS",
                      "name": "Appointment Reminders"
                    },
                    {
                      "key": "EDUCATIONAL",
                      "name": "Educational Services"
                    }
                  ]
                }
              }
            }
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "Toll Free A2P"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

Get Toll Free Campaign

# Get Toll Free Campaign

Get Toll Free A2P campaign.

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/tfa2p/campaigns/{id}": {
      "get": {
        "summary": "Get Toll Free Campaign",
        "description": "Get Toll Free A2P campaign.",
        "security": [
          {
            "api_auth": [
              "tollfree_a2p"
            ]
          }
        ],
        "tags": [
          "Toll Free A2P"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "Account identifier",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "path",
            "name": "id",
            "required": true,
            "description": "Campaign identifier",
            "schema": {
              "type": "integer"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success.",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "example": {
                    "id": 1,
                    "brand_id": "1",
                    "tcr_campaign_id": null,
                    "description": "Test Campaign",
                    "status": "Active",
                    "usecase": "2FA",
                    "sub_usecases": "[]",
                    "registered_on": "2021-12-06 06:36:16",
                    "deregistered_on": null,
                    "renew_on": null,
                    "auto_renewal": "0",
                    "message_class": "",
                    "created_at": "2021-12-06T06:36:16.000000Z",
                    "updated_at": "2021-12-06T06:39:14.000000Z",
                    "deleted_at": "0",
                    "dlc_campaign_draft": null
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "Toll Free A2P"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

Update Toll Free Campaign

# Update Toll Free Campaign

Update Toll Free A2P campaign.

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/tfa2p/campaigns/{id}": {
      "put": {
        "summary": "Update Toll Free Campaign",
        "description": "Update Toll Free A2P campaign.",
        "security": [
          {
            "api_auth": [
              "tollfree_a2p"
            ]
          }
        ],
        "tags": [
          "Toll Free A2P"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "Account identifier",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "path",
            "name": "id",
            "required": true,
            "description": "Campaign identifier",
            "schema": {
              "type": "integer"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success."
          }
        },
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "usecase": {
                    "type": "string",
                    "description": "Values from List Toll Free A2P use cases."
                  },
                  "description": {
                    "type": "string"
                  },
                  "status": {
                    "type": "string",
                    "description": "Valid values are Pending, Active, Expired, Error, Disabled_Complaint, Disabled_Suspended"
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "Toll Free A2P"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

Delete Toll Free Campaign

# Delete Toll Free Campaign

Delete Toll Free A2P campaign.

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/tfa2p/campaigns/{id}": {
      "delete": {
        "summary": "Delete Toll Free Campaign",
        "description": "Delete Toll Free A2P campaign.",
        "security": [
          {
            "api_auth": [
              "tollfree_a2p"
            ]
          }
        ],
        "tags": [
          "Toll Free A2P"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "Account identifier",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "path",
            "name": "id",
            "required": true,
            "description": "Campaign identifier",
            "schema": {
              "type": "integer"
            }
          }
        ],
        "responses": {
          "204": {
            "description": "Success."
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "Toll Free A2P"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

List Toll Free Campaign Phone Numbers

# List Toll Free Campaign Phone Numbers

List toll free campaign phone numbers.

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/tfa2p/campaigns/{id}/phone-numbers": {
      "get": {
        "summary": "List Toll Free Campaign Phone Numbers",
        "description": "List toll free campaign phone numbers.",
        "security": [
          {
            "api_auth": [
              "tollfree_a2p"
            ]
          }
        ],
        "tags": [
          "Toll Free A2P"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "Account identifier",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "path",
            "name": "id",
            "required": true,
            "description": "Campaign identifier",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "domain",
            "required": true,
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "assigned",
            "required": true,
            "schema": {
              "type": "boolean"
            }
          },
          {
            "in": "query",
            "name": "page",
            "schema": {
              "type": "integer"
            }
          },
          {
            "in": "query",
            "name": "per_page",
            "schema": {
              "type": "integer"
            }
          },
          {
            "in": "query",
            "name": "force",
            "description": "Force check phone number status based on campaign status",
            "schema": {
              "type": "integer"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "example": {
                    "pagination": {
                      "count": 1,
                      "per_page": "10",
                      "page": 1
                    },
                    "data": [
                      {
                        "phone_number": "18771234567",
                        "carrier": "inteli-rest"
                      }
                    ]
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "Toll Free A2P"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

Bulk Assign/Unassign Phone Numbers to a Toll Free Campaign

# Bulk Assign/Unassign Phone Numbers to a Toll Free Campaign

Bulk assign/unassign phone numbers to a toll free campaign.

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/tfa2p/campaigns/{id}/phone-numbers": {
      "put": {
        "summary": "Bulk Assign/Unassign Phone Numbers to a Toll Free Campaign",
        "description": "Bulk assign/unassign phone numbers to a toll free campaign.",
        "security": [
          {
            "api_auth": [
              "tollfree_a2p"
            ]
          }
        ],
        "tags": [
          "Toll Free A2P"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "Account identifier",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "path",
            "name": "id",
            "required": true,
            "description": "Campaign identifier",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "action",
            "description": "set to 'delete' to unassign phone numbers",
            "schema": {
              "type": "string"
            }
          }
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": [
                  "phone_numbers"
                ],
                "properties": {
                  "phone_numbers": {
                    "type": "array",
                    "items": {
                      "type": "string"
                    }
                  }
                }
              },
              "example": {
                "phone_numbers": [
                  "16027336369",
                  "17826981628"
                ]
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Success."
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "Toll Free A2P"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

Assign Phone Number to Toll Free Campaign

# Assign Phone Number to Toll Free Campaign

Assign phone number to a toll free campaign.

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/tfa2p/campaigns/{id}/phone-numbers/{phone_number}": {
      "post": {
        "summary": "Assign Phone Number to Toll Free Campaign",
        "description": "Assign phone number to a toll free campaign.",
        "security": [
          {
            "api_auth": [
              "tollfree_a2p"
            ]
          }
        ],
        "tags": [
          "Toll Free A2P"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "Account identifier",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "path",
            "name": "id",
            "required": true,
            "description": "Campaign identifier",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "path",
            "name": "phone_number",
            "required": true,
            "description": "Phone number",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success."
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "Toll Free A2P"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

Unassign Phone Number to Toll Free Campaign

# Unassign Phone Number to Toll Free Campaign

Unassign phone number to a toll free campaign.

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/tfa2p/campaigns/{id}/phone-numbers/{phone_number}": {
      "delete": {
        "summary": "Unassign Phone Number to Toll Free Campaign",
        "description": "Unassign phone number to a toll free campaign.",
        "security": [
          {
            "api_auth": [
              "tollfree_a2p"
            ]
          }
        ],
        "tags": [
          "Toll Free A2P"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "Account identifier",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "path",
            "name": "id",
            "required": true,
            "description": "Campaign identifier",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "path",
            "name": "phone_number",
            "required": true,
            "description": "Phone number",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "204": {
            "description": "Success."
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "Toll Free A2P"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```

Get Toll Free Campaign Phone Number

# Get Toll Free Campaign Phone Number

Get toll free campaign phone number.

# OpenAPI definition

```json
{
  "openapi": "3.0.0",
  "info": {
    "description": "Welcome to the Telco API developer hub. You'll find comprehensive guides and documentation to help you start working with Telco API as quickly as possible, as well as support if you get stuck. Let's jump right in!",
    "version": "1.0.0",
    "title": "Telco API"
  },
  "paths": {
    "/accounts/{account_id}/tfa2p/phone-numbers/{phone_number}": {
      "get": {
        "summary": "Get Toll Free Campaign Phone Number",
        "description": "Get toll free campaign phone number.",
        "security": [
          {
            "api_auth": [
              "tollfree_a2p"
            ]
          }
        ],
        "tags": [
          "Toll Free A2P"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "account_id",
            "required": true,
            "description": "Account identifier",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "path",
            "name": "phone_number",
            "required": true,
            "description": "Phone number",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "example": {
                    "campaign_id": "862",
                    "phone_number": "18771234567",
                    "created_at": "2021-12-07T06:42:40.000000Z",
                    "updated_at": "2021-12-07T06:42:40.000000Z",
                    "dlc_campaign": {
                      "id": 862,
                      "brand_id": "712",
                      "tcr_campaign_id": null,
                      "description": "test campaign",
                      "status": "Active",
                      "usecase": "ACCOUNT_MANAGEMENT_REMINDERS",
                      "sub_usecases": "[]",
                      "registered_on": "2021-12-06 12:46:23",
                      "deregistered_on": null,
                      "renew_on": null,
                      "auto_renewal": "0",
                      "message_class": "",
                      "created_at": "2021-12-06T12:46:23.000000Z",
                      "updated_at": "2021-12-06T12:46:23.000000Z",
                      "deleted_at": "0",
                      "dlc_brand": {
                        "id": 712,
                        "reseller_id": "5",
                        "tcr_brand_id": null,
                        "entity_type": "PRIVATE_COMPANY",
                        "name": "Test Company",
                        "ein": null,
                        "ein_issuing_country": null,
                        "vertical": null,
                        "email_address": "test@mail.com",
                        "phone_number": "12345678901",
                        "website": null,
                        "reference_id": null,
                        "identity_status": null,
                        "status": "Active",
                        "flag": "tollfree",
                        "created_at": "2021-12-06T12:45:37.000000Z",
                        "updated_at": "2021-12-06T12:45:37.000000Z",
                        "deleted_at": "0",
                        "dlc_reseller": {
                          "id": 5,
                          "account_id": "some-string",
                          "tcr_reseller_id": "ABCDEF",
                          "email_address_alerts": "test@mail.com",
                          "created_at": "2021-08-30T03:34:08.000000Z",
                          "updated_at": "2021-10-15T20:24:11.000000Z",
                          "deleted_at": "0"
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "Toll Free A2P"
    }
  ],
  "servers": [
    {
      "url": "https://api.skyswitch.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "api_auth": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "https://api.skyswitch.com/oauth/token",
            "scopes": {
              "phone_number": ""
            }
          }
        }
      }
    }
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true
  },
  "_id": {
    "buffer": {
      "0": 97,
      "1": 250,
      "2": 79,
      "3": 47,
      "4": 82,
      "5": 240,
      "6": 21,
      "7": 0,
      "8": 27,
      "9": 196,
      "10": 77,
      "11": 182
    }
  }
}
```