# API Documentation

## 1. Overview

- **Base URL:** `http://localhost:5000/api` by default. `PORT` can change the server port.
- **API version:** Not defined in code; routes use the `/api` prefix without a version segment.
- **Tech stack:** Node.js (README requires Node 18 or newer), Express, MongoDB, and Mongoose.
- **Request format:** JSON for request bodies. The server parses JSON bodies up to 1 MB.
- **Response format:** Most responses use `{ "success": boolean, "message": "...", "data": ... }`. Some omit `message` or `data`; errors use `{ "success": false, "message": "...", "errors": [...] }` when applicable.
- **CORS:** The configured frontend origin is `CLIENT_URL`, defaulting to `http://localhost:5173`; credentials are enabled.

## 2. Authentication

### How authentication works

Login and registration sign a JWT containing the user's ID. The API places it in an HTTP-only cookie named `token`; the token is not included in the JSON response.

Protected endpoints accept either:

- The `token` cookie (sent automatically by a browser when allowed), or
- `Authorization: Bearer <JWT>` in the request header.

The cookie uses `SameSite=Lax`, is marked `Secure` when `NODE_ENV=production`, and has a seven-day max age. JWT expiration uses `JWT_EXPIRES_IN` (default `7d`). The `authMiddleware` verifies the JWT, loads the user, and rejects missing, invalid, expired, deleted, or inactive accounts.

`POST /api/auth/logout` clears the cookie; it does not require authentication. The API's authentication rate limiter applies to registration, user login, and admin login: 30 requests per 15-minute window.

### Roles and access

| Role | Access |
|---|---|
| `user` | Authenticated records endpoints and dashboard statistics |
| `manager` | User listing and detail endpoints, plus authenticated records endpoints and dashboard statistics |
| `admin` | User management, authenticated records endpoints, and dashboard statistics |

`POST /api/auth/admin-login` only permits a user whose role is `admin`. New registrations default to the `user` role. Routes use `authMiddleware` for authentication and `roleMiddleware('admin', 'manager')` or `roleMiddleware('admin')` where role restrictions apply.

## 3. Endpoints Summary Table

| Method | URL | Description | Auth required | Roles allowed |
|---|---|---|---|---|
| GET | `/api/health` | API health check | No | All |
| POST | `/api/auth/register` | Register a user | No | All |
| POST | `/api/auth/login` | Sign in a user | No | All active users |
| POST | `/api/auth/admin-login` | Sign in an administrator | No | Admin only |
| POST | `/api/auth/logout` | Clear the session cookie | No | All |
| GET | `/api/auth/me` | Get the current user | Yes | Any authenticated role |
| GET | `/api/users` | List users | Yes | Admin, manager |
| GET | `/api/users/:id` | Get a user | Yes | Admin, manager |
| POST | `/api/users` | Create a user | Yes | Admin |
| PUT | `/api/users/:id` | Update a user | Yes | Admin |
| DELETE | `/api/users/:id` | Delete a user | Yes | Admin |
| GET | `/api/records` | List records | Yes | Any authenticated role |
| GET | `/api/records/:id` | Get a record | Yes | Any authenticated role |
| POST | `/api/records` | Create a record | Yes | Any authenticated role |
| PUT | `/api/records/:id` | Update a record | Yes | Any authenticated role |
| DELETE | `/api/records/:id` | Delete a record | Yes | Any authenticated role |
| GET | `/api/dashboard/stats` | Get dashboard statistics | Yes | Any authenticated role |

## 4. Endpoint Details

In the cURL examples, `<JWT>` is a placeholder, not a real token. Alternatively, use `-b cookies.txt` after saving the login cookie with `-c cookies.txt`.

### Health

#### GET `http://localhost:5000/api/health`

- **Description:** Confirms that the API is running.
- **Auth / roles:** None.
- **Path/query parameters:** None.
- **Request body:** None.
- **Success:** `200 OK`

```json
{
  "success": true,
  "message": "API is running"
}
```

- **Errors:** No endpoint-specific error response is defined. An unmatched URL returns the not-found response described in [Error Handling](#5-error-handling).
- **cURL:**

```sh
curl http://localhost:5000/api/health
```

### Auth

#### POST `http://localhost:5000/api/auth/register`

- **Description:** Creates a user and sets the session cookie.
- **Auth / roles:** None.
- **Path/query parameters:** None.
- **Request body:**

| Field | Type | Required | Rules |
|---|---|---:|---|
| `name` | String | Yes | Trimmed, non-empty, maximum 80 characters |
| `email` | String | Yes | Must be a valid email; normalized |
| `password` | String | Yes | Minimum 8 characters; must contain a letter and a number |

- **Example request body:**

```json
{
  "name": "Casey Example",
  "email": "casey@example.test",
  "password": "ExamplePass123"
}
```

- **Success:** `201 Created`

```json
{
  "success": true,
  "message": "Account created",
  "data": {
    "user": {
      "_id": "673a10000000000000000001",
      "name": "Casey Example",
      "email": "casey@example.test",
      "role": "user",
      "status": "active",
      "lastLogin": null,
      "createdAt": "2026-10-12T09:30:00.000Z",
      "updatedAt": "2026-10-12T09:30:00.000Z"
    }
  }
}
```

- **Errors:** `400` validation error; `409` duplicate email; `429` rate limit; `500` server error. See [Error Handling](#5-error-handling) for response examples.
- **cURL:**

```sh
curl -i -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Casey Example","email":"casey@example.test","password":"ExamplePass123"}' \
  -c cookies.txt
```

#### POST `http://localhost:5000/api/auth/login`

- **Description:** Authenticates an active user and sets the session cookie.
- **Auth / roles:** None; credentials must belong to an active user.
- **Path/query parameters:** None.
- **Request body:**

| Field | Type | Required | Rules |
|---|---|---:|---|
| `email` | String | Yes | Must be a valid email; normalized |
| `password` | String | Yes | Non-empty |

- **Example request body:**

```json
{
  "email": "casey@example.test",
  "password": "ExamplePass123"
}
```

- **Success:** `200 OK`

```json
{
  "success": true,
  "message": "Signed in successfully",
  "data": {
    "user": {
      "_id": "673a10000000000000000001",
      "name": "Casey Example",
      "email": "casey@example.test",
      "role": "user",
      "status": "active",
      "lastLogin": "2026-10-12T09:30:00.000Z",
      "createdAt": "2026-10-01T10:00:00.000Z",
      "updatedAt": "2026-10-12T09:30:00.000Z"
    }
  }
}
```

- **Errors:** `400` validation error; `401` invalid credentials; `403` inactive account; `429` rate limit; `500` server error.
- **cURL:**

```sh
curl -i -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"casey@example.test","password":"ExamplePass123"}' \
  -c cookies.txt
```

#### POST `http://localhost:5000/api/auth/admin-login`

- **Description:** Authenticates an active administrator and sets the session cookie.
- **Auth / roles:** None to call the route; submitted user must have the `admin` role.
- **Path/query parameters:** None.
- **Request body:** Same fields and rules as `POST /api/auth/login`.
- **Example request body:**

```json
{
  "email": "admin@example.test",
  "password": "ExamplePass123"
}
```

- **Success:** `200 OK`

```json
{
  "success": true,
  "message": "Signed in successfully",
  "data": {
    "user": {
      "_id": "673a10000000000000000003",
      "name": "Taylor Example",
      "email": "admin@example.test",
      "role": "admin",
      "status": "active",
      "lastLogin": "2026-10-12T09:30:00.000Z",
      "createdAt": "2026-10-01T10:00:00.000Z",
      "updatedAt": "2026-10-12T09:30:00.000Z"
    }
  }
}
```
- **Errors:** `400` validation error; `401` invalid credentials; `403` inactive account or non-admin user; `429` rate limit; `500` server error.
- **cURL:**

```sh
curl -i -X POST http://localhost:5000/api/auth/admin-login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.test","password":"ExamplePass123"}' \
  -c cookies.txt
```

#### POST `http://localhost:5000/api/auth/logout`

- **Description:** Clears the `token` cookie.
- **Auth / roles:** None.
- **Path/query parameters:** None.
- **Request body:** None.
- **Success:** `200 OK`

```json
{
  "success": true,
  "message": "Signed out successfully"
}
```

- **Errors:** No endpoint-specific error response is defined; `500` may occur for an unexpected server error.
- **cURL:**

```sh
curl -i -X POST http://localhost:5000/api/auth/logout -b cookies.txt
```

#### GET `http://localhost:5000/api/auth/me`

- **Description:** Returns the authenticated user's profile.
- **Auth / roles:** Required; any active authenticated role.
- **Path/query parameters:** None.
- **Request body:** None.
- **Success:** `200 OK`

```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "673a10000000000000000001",
      "name": "Casey Example",
      "email": "casey@example.test",
      "role": "user",
      "status": "active",
      "lastLogin": null,
      "createdAt": "2026-10-01T10:00:00.000Z",
      "updatedAt": "2026-10-01T10:00:00.000Z"
    }
  }
}
```

- **Errors:** `401` missing/invalid session or unavailable account; `500` server error.
- **cURL:**

```sh
curl http://localhost:5000/api/auth/me \
  -H 'Authorization: Bearer <JWT>'
```

### Users

#### GET `http://localhost:5000/api/users`

- **Description:** Lists users, newest first.
- **Auth / roles:** Required; `admin` or `manager`.
- **Path parameters:** None.
- **Query parameters:**

| Name | Type | Required | Rules / default |
|---|---|---:|---|
| `page` | Integer | No | Minimum 1; default 1 |
| `limit` | Integer | No | Clamped to 1–100; default 10 |
| `search` | String | No | Case-insensitive match against name or email |
| `status` | String | No | `active` or `inactive`; other values are ignored |
| `role` | String | No | `user`, `manager`, or `admin`; other values are ignored |

- **Request body:** None.
- **Success:** `200 OK`

```json
{
  "success": true,
  "data": {
    "users": [
      {
        "_id": "673a10000000000000000001",
        "name": "Casey Example",
        "email": "casey@example.test",
        "role": "user",
        "status": "active",
        "lastLogin": null,
        "createdAt": "2026-10-01T10:00:00.000Z",
        "updatedAt": "2026-10-01T10:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "pages": 1
    }
  }
}
```

- **Errors:** `401` missing/invalid session; `403` role not allowed; `500` server error.
- **cURL:**

```sh
curl 'http://localhost:5000/api/users?page=1&limit=10&search=Casey&status=active&role=user' \
  -H 'Authorization: Bearer <JWT>'
```

#### GET `http://localhost:5000/api/users/:id`

- **Description:** Returns one user.
- **Auth / roles:** Required; `admin` or `manager`.
- **Path parameters:** `id` — MongoDB ObjectId.
- **Query parameters / request body:** None.
- **Success:** `200 OK`

```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "673a10000000000000000001",
      "name": "Casey Example",
      "email": "casey@example.test",
      "role": "user",
      "status": "active",
      "lastLogin": null,
      "createdAt": "2026-10-01T10:00:00.000Z",
      "updatedAt": "2026-10-01T10:00:00.000Z"
    }
  }
}
```

- **Errors:** `400` invalid ObjectId; `401` missing/invalid session; `403` role not allowed; `404` user not found; `500` server error.
- **cURL:**

```sh
curl http://localhost:5000/api/users/673a10000000000000000001 \
  -H 'Authorization: Bearer <JWT>'
```

#### POST `http://localhost:5000/api/users`

- **Description:** Creates a user without signing them in.
- **Auth / roles:** Required; `admin`.
- **Path/query parameters:** None.
- **Request body:**

| Field | Type | Required | Rules |
|---|---|---:|---|
| `name` | String | Yes | Trimmed, non-empty, maximum 80 characters |
| `email` | String | Yes | Must be a valid email; normalized |
| `password` | String | Yes | Minimum 8 characters; must contain a letter and a number |
| `role` | String | No | `user`, `manager`, or `admin`; defaults to `user` |
| `status` | String | No | `active` or `inactive`; defaults to `active` |

- **Example request body:**

```json
{
  "name": "Jordan Example",
  "email": "jordan@example.test",
  "password": "ExamplePass123",
  "role": "manager",
  "status": "active"
}
```

- **Success:** `201 Created`

```json
{
  "success": true,
  "message": "User created",
  "data": {
    "user": {
      "_id": "673a10000000000000000002",
      "name": "Jordan Example",
      "email": "jordan@example.test",
      "role": "manager",
      "status": "active",
      "lastLogin": null,
      "createdAt": "2026-10-12T09:30:00.000Z",
      "updatedAt": "2026-10-12T09:30:00.000Z"
    }
  }
}
```

- **Errors:** `400` validation error; `401` missing/invalid session; `403` role not allowed; `409` duplicate email; `500` server error.
- **cURL:**

```sh
curl -X POST http://localhost:5000/api/users \
  -H 'Authorization: Bearer <JWT>' \
  -H 'Content-Type: application/json' \
  -d '{"name":"Jordan Example","email":"jordan@example.test","password":"ExamplePass123","role":"manager","status":"active"}'
```

#### PUT `http://localhost:5000/api/users/:id`

- **Description:** Updates specified user fields.
- **Auth / roles:** Required; `admin`.
- **Path parameters:** `id` — MongoDB ObjectId.
- **Query parameters:** None.
- **Request body:** All fields are optional; only supplied supported fields are assigned. At least one field is not required by the route.

| Field | Type | Required | Rules |
|---|---|---:|---|
| `name` | String | No | If supplied, trimmed, non-empty, maximum 80 characters |
| `email` | String | No | If supplied, must be a valid email; normalized |
| `password` | String | No | If supplied, minimum 8 characters; must contain a letter and a number |
| `role` | String | No | `user`, `manager`, or `admin` |
| `status` | String | No | `active` or `inactive` |

- **Example request body:**

```json
{
  "status": "inactive"
}
```

- **Success:** `200 OK`

```json
{
  "success": true,
  "message": "User updated",
  "data": {
    "user": {
      "_id": "673a10000000000000000002",
      "name": "Jordan Example",
      "email": "jordan@example.test",
      "role": "manager",
      "status": "inactive",
      "lastLogin": null,
      "createdAt": "2026-10-01T10:00:00.000Z",
      "updatedAt": "2026-10-12T09:30:00.000Z"
    }
  }
}
```

- **Errors:** `400` invalid ObjectId, validation error, or attempting to deactivate your own account; `401` missing/invalid session; `403` role not allowed; `404` user not found; `409` duplicate email; `500` server error.
- **cURL:**

```sh
curl -X PUT http://localhost:5000/api/users/673a10000000000000000002 \
  -H 'Authorization: Bearer <JWT>' \
  -H 'Content-Type: application/json' \
  -d '{"status":"inactive"}'
```

#### DELETE `http://localhost:5000/api/users/:id`

- **Description:** Deletes a user.
- **Auth / roles:** Required; `admin`.
- **Path parameters:** `id` — MongoDB ObjectId.
- **Query parameters / request body:** None.
- **Success:** `200 OK`

```json
{
  "success": true,
  "message": "User deleted"
}
```

- **Errors:** `400` invalid ObjectId or attempting to delete your own account; `401` missing/invalid session; `403` role not allowed; `404` user not found; `500` server error.
- **cURL:**

```sh
curl -X DELETE http://localhost:5000/api/users/673a10000000000000000002 \
  -H 'Authorization: Bearer <JWT>'
```

### Records

All records routes require an active authenticated user. The creator is set to the current user when a record is created.

#### GET `http://localhost:5000/api/records`

- **Description:** Lists records, newest first by default, and populates each creator's name and email.
- **Auth / roles:** Required; any authenticated role.
- **Path parameters:** None.
- **Query parameters:**

| Name | Type | Required | Rules / default |
|---|---|---:|---|
| `page` | Integer | No | Minimum 1; default 1 |
| `limit` | Integer | No | Clamped to 1–100; default 10 |
| `search` | String | No | Case-insensitive match against title, description, or category |
| `status` | String | No | `active` or `inactive`; other values are ignored |
| `sortBy` | String | No | `title`, `category`, `price`, `status`, or `createdAt`; default `createdAt` |
| `sortOrder` | String | No | `asc` for ascending; otherwise descending |

- **Request body:** None.
- **Success:** `200 OK`

```json
{
  "success": true,
  "data": {
    "records": [
      {
        "_id": "673a20000000000000000001",
        "title": "Workspace review",
        "description": "Review of workspace resources.",
        "category": "Operations",
        "price": 125.5,
        "status": "active",
        "createdBy": {
          "_id": "673a10000000000000000001",
          "name": "Casey Example",
          "email": "casey@example.test"
        },
        "createdAt": "2026-10-12T09:45:00.000Z",
        "updatedAt": "2026-10-12T09:45:00.000Z",
        "__v": 0
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "pages": 1
    }
  }
}
```

- **Errors:** `401` missing/invalid session; `500` server error.
- **cURL:**

```sh
curl 'http://localhost:5000/api/records?page=1&limit=10&search=workspace&status=active&sortBy=createdAt&sortOrder=desc' \
  -H 'Authorization: Bearer <JWT>'
```

#### GET `http://localhost:5000/api/records/:id`

- **Description:** Returns one record and populates its creator's name and email.
- **Auth / roles:** Required; any authenticated role.
- **Path parameters:** `id` — MongoDB ObjectId.
- **Query parameters / request body:** None.
- **Success:** `200 OK`

```json
{
  "success": true,
  "data": {
    "record": {
      "_id": "673a20000000000000000001",
      "title": "Workspace review",
      "description": "Review of workspace resources.",
      "category": "Operations",
      "price": 125.5,
      "status": "active",
      "createdBy": {
        "_id": "673a10000000000000000001",
        "name": "Casey Example",
        "email": "casey@example.test"
      },
      "createdAt": "2026-10-12T09:45:00.000Z",
      "updatedAt": "2026-10-12T09:45:00.000Z",
      "__v": 0
    }
  }
}
```

- **Errors:** `400` invalid ObjectId; `401` missing/invalid session; `404` record not found; `500` server error.
- **cURL:**

```sh
curl http://localhost:5000/api/records/673a20000000000000000001 \
  -H 'Authorization: Bearer <JWT>'
```

#### POST `http://localhost:5000/api/records`

- **Description:** Creates a record owned by the authenticated user.
- **Auth / roles:** Required; any authenticated role.
- **Path/query parameters:** None.
- **Request body:**

| Field | Type | Required | Rules |
|---|---|---:|---|
| `title` | String | Yes | Trimmed, non-empty, maximum 120 characters |
| `description` | String | No | Maximum 2,000 characters; defaults to an empty string |
| `category` | String | Yes | Trimmed, non-empty, maximum 80 characters |
| `price` | Number | Yes | Must be zero or greater |
| `status` | String | No | `active` or `inactive`; defaults to `active` |

- **Example request body:**

```json
{
  "title": "Workspace review",
  "description": "Review of workspace resources.",
  "category": "Operations",
  "price": 125.5,
  "status": "active"
}
```

- **Success:** `201 Created`

```json
{
  "success": true,
  "message": "Record created",
  "data": {
    "record": {
      "_id": "673a20000000000000000001",
      "title": "Workspace review",
      "description": "Review of workspace resources.",
      "category": "Operations",
      "price": 125.5,
      "status": "active",
      "createdBy": "673a10000000000000000001",
      "createdAt": "2026-10-12T09:45:00.000Z",
      "updatedAt": "2026-10-12T09:45:00.000Z",
      "__v": 0
    }
  }
}
```

- **Errors:** `400` validation error; `401` missing/invalid session; `500` server error.
- **cURL:**

```sh
curl -X POST http://localhost:5000/api/records \
  -H 'Authorization: Bearer <JWT>' \
  -H 'Content-Type: application/json' \
  -d '{"title":"Workspace review","description":"Review of workspace resources.","category":"Operations","price":125.5,"status":"active"}'
```

#### PUT `http://localhost:5000/api/records/:id`

- **Description:** Updates a record and returns it with the creator's name and email populated.
- **Auth / roles:** Required; any authenticated role.
- **Path parameters:** `id` — MongoDB ObjectId.
- **Query parameters:** None.
- **Request body:** The route applies the same validators as record creation. Therefore, `title`, `category`, and `price` are required for an update request; `description` and `status` are optional.

| Field | Type | Required | Rules |
|---|---|---:|---|
| `title` | String | Yes | Trimmed, non-empty, maximum 120 characters |
| `description` | String | No | Maximum 2,000 characters |
| `category` | String | Yes | Trimmed, non-empty, maximum 80 characters |
| `price` | Number | Yes | Must be zero or greater |
| `status` | String | No | `active` or `inactive` |

- **Example request body:**

```json
{
  "title": "Workspace review updated",
  "description": "Updated review.",
  "category": "Operations",
  "price": 130,
  "status": "active"
}
```

- **Success:** `200 OK`

```json
{
  "success": true,
  "message": "Record updated",
  "data": {
    "record": {
      "_id": "673a20000000000000000001",
      "title": "Workspace review updated",
      "description": "Updated review.",
      "category": "Operations",
      "price": 130,
      "status": "active",
      "createdBy": {
        "_id": "673a10000000000000000001",
        "name": "Casey Example",
        "email": "casey@example.test"
      },
      "createdAt": "2026-10-12T09:45:00.000Z",
      "updatedAt": "2026-10-12T10:00:00.000Z",
      "__v": 0
    }
  }
}
```
- **Errors:** `400` invalid ObjectId or validation error; `401` missing/invalid session; `404` record not found; `500` server error.
- **cURL:**

```sh
curl -X PUT http://localhost:5000/api/records/673a20000000000000000001 \
  -H 'Authorization: Bearer <JWT>' \
  -H 'Content-Type: application/json' \
  -d '{"title":"Workspace review updated","description":"Updated review.","category":"Operations","price":130,"status":"active"}'
```

#### DELETE `http://localhost:5000/api/records/:id`

- **Description:** Deletes a record.
- **Auth / roles:** Required; any authenticated role.
- **Path parameters:** `id` — MongoDB ObjectId.
- **Query parameters / request body:** None.
- **Success:** `200 OK`

```json
{
  "success": true,
  "message": "Record deleted"
}
```

- **Errors:** `400` invalid ObjectId; `401` missing/invalid session; `404` record not found; `500` server error.
- **cURL:**

```sh
curl -X DELETE http://localhost:5000/api/records/673a20000000000000000001 \
  -H 'Authorization: Bearer <JWT>'
```

### Dashboard

#### GET `http://localhost:5000/api/dashboard/stats`

- **Description:** Returns user and record totals, five most recently created users and records, and user counts grouped by role.
- **Auth / roles:** Required; any authenticated role.
- **Path/query parameters:** None.
- **Request body:** None.
- **Success:** `200 OK`

```json
{
  "success": true,
  "data": {
    "totalUsers": 12,
    "activeUsers": 10,
    "inactiveUsers": 2,
    "totalRecords": 25,
    "recentUsers": [
      {
        "_id": "673a10000000000000000001",
        "name": "Casey Example",
        "email": "casey@example.test",
        "role": "user",
        "status": "active",
        "lastLogin": null,
        "createdAt": "2026-10-12T09:30:00.000Z",
        "updatedAt": "2026-10-12T09:30:00.000Z"
      }
    ],
    "recentRecords": [
      {
        "_id": "673a20000000000000000001",
        "title": "Workspace review",
        "description": "Review of workspace resources.",
        "category": "Operations",
        "price": 125.5,
        "status": "active",
        "createdBy": {
          "_id": "673a10000000000000000001",
          "name": "Casey Example"
        },
        "createdAt": "2026-10-12T09:45:00.000Z",
        "updatedAt": "2026-10-12T09:45:00.000Z",
        "__v": 0
      }
    ],
    "usersByRole": [
      {
        "_id": "user",
        "count": 8
      },
      {
        "_id": "manager",
        "count": 3
      },
      {
        "_id": "admin",
        "count": 1
      }
    ]
  }
}
```

The arrays shown contain one sample entry; the endpoint returns up to five recent documents in each array.

- **Errors:** `401` missing/invalid session; `500` server error.
- **cURL:**

```sh
curl http://localhost:5000/api/dashboard/stats \
  -H 'Authorization: Bearer <JWT>'
```

## 5. Error Handling

Validation middleware returns `400` with field-level details. Other thrown errors are forwarded by `asyncHandler` to the error middleware. The error handler maps Mongoose validation errors to `400`, duplicate-key errors to `409`, invalid ObjectIds to `400`, and JWT errors to `401`. It logs errors for status codes `500` and higher.

| Status | When used in this API |
|---:|---|
| `400` | Request validation failure, invalid resource identifier, or prohibited self-deactivation/self-deletion |
| `401` | Missing/invalid/expired session, invalid credentials, or unavailable account |
| `403` | User role is not permitted, admin login attempted by a non-admin, or account is inactive |
| `404` | Requested user/record or route is not found |
| `409` | Duplicate user email |
| `429` | Authentication rate limit exceeded |
| `500` | Unexpected server error |

### Common error response examples

Request validation:

```json
{
  "success": false,
  "message": "Please correct the highlighted fields",
  "errors": [
    {
      "field": "email",
      "message": "Enter a valid email address"
    }
  ]
}
```

Authentication:

```json
{
  "success": false,
  "message": "Authentication required"
}
```

Authorization:

```json
{
  "success": false,
  "message": "You do not have permission to perform this action"
}
```

Resource not found:

```json
{
  "success": false,
  "message": "Record not found"
}
```

Duplicate email:

```json
{
  "success": false,
  "message": "A user with this email already exists",
  "errors": [
    {
      "field": "email",
      "message": "Already in use"
    }
  ]
}
```

Rate limit:

```json
{
  "success": false,
  "message": "Too many authentication attempts. Try again later."
}
```

Internal error fallback:

```json
{
  "success": false,
  "message": "Internal server error"
}
```

The error middleware uses the thrown error's message when present, so actual `500` messages can differ from the fallback example. The not-found handler uses `Route not found: <METHOD> <URL>` as its message.

## 6. Testing

- Start MongoDB locally or configure an Atlas connection string in `server/.env` as `MONGO_URI`.
- Install backend dependencies and start the API:

  ```sh
  npm install --prefix server
  npm run dev --prefix server
  ```

- Check `GET http://localhost:5000/api/health` with cURL, Postman, or another HTTP client.
- For protected routes, retain the `token` cookie from login (Postman can keep cookies; cURL can use `-c cookies.txt` and `-b cookies.txt`) or send `Authorization: Bearer <JWT>`.
- The seed command is `npm run seed --prefix server`. It creates an administrator only if one does not already exist. Demo account values are hard-coded in `server/utils/seedAdmin.js`; review those values locally and change the seeded password before using the account beyond local testing.
- No automated API test suite or Postman collection is defined in the project.
