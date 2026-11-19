# API Endpoint Documentation

Base URL: `http://localhost:5000/api`

Protected endpoints accept the `token` cookie or an `Authorization: Bearer <JWT>` header. Login and registration set the HTTP-only cookie. Unless stated otherwise, errors use `{ "success": false, "message": "..." }`. Request validation errors may also include an `errors` array.

## Health

### `GET /health`

- **Access:** Public
- **Success:** `200` — `{ "success": true, "message": "API is running" }`

## Authentication

### `POST /auth/register`

- **Access:** Public
- **Body:** `name` (required, non-empty, max 80 chars), `email` (required, valid email), `password` (required, at least 8 characters, includes a letter and a number)
- **Success:** `201` — account created; returns `data.user` and sets the session cookie.

### `POST /auth/login`

- **Access:** Public; account must be active.
- **Body:** `email` (required, valid email), `password` (required, non-empty)
- **Success:** `200` — returns `data.user` and sets the session cookie.
- **Errors:** `401` invalid credentials; `403` inactive account.

### `POST /auth/admin-login`

- **Access:** Public; account must be an active admin.
- **Body:** Same as `/auth/login`.
- **Success:** `200` — returns `data.user` and sets the session cookie.
- **Errors:** `401` invalid credentials; `403` inactive account or non-admin account.

### `POST /auth/logout`

- **Access:** Public
- **Success:** `200` — `{ "success": true, "message": "Signed out successfully" }`; clears the session cookie.

### `GET /auth/me`

- **Access:** Authenticated users
- **Success:** `200` — returns the current user as `data.user`.

## Users

### `GET /users`

- **Access:** Admin, manager
- **Query:** `page` (default 1), `limit` (default 10, maximum 100), `search` (name/email), `status` (`active`/`inactive`), `role` (`user`/`manager`/`admin`)
- **Success:** `200` — `{ "success": true, "data": { "users": [], "pagination": {} } }`

### `GET /users/:id`

- **Access:** Admin, manager
- **Path:** `id` — MongoDB ObjectId
- **Success:** `200` — returns `data.user`.
- **Errors:** `400` invalid ID; `404` user not found.

### `POST /users`

- **Access:** Admin
- **Body:** `name` (required, non-empty, max 80 chars), `email` (required, valid email), `password` (required, minimum 8 characters, includes a letter and a number), `role` (optional: `user`, `manager`, `admin`), `status` (optional: `active`, `inactive`)
- **Success:** `201` — returns the created `data.user`.
- **Errors:** `400` invalid fields; `409` email already in use.

### `PUT /users/:id`

- **Access:** Admin
- **Path:** `id` — MongoDB ObjectId
- **Body:** Optional fields: `name` (non-empty, max 80 chars), `email` (valid email), `password` (minimum 8 characters, includes a letter and a number), `role` (`user`, `manager`, `admin`), `status` (`active`, `inactive`). The route does not require any particular field to be included.
- **Success:** `200` — returns the updated `data.user`.
- **Errors:** `400` invalid fields/ID or attempting to deactivate your own account; `404` user not found; `409` email already in use.

### `DELETE /users/:id`

- **Access:** Admin
- **Path:** `id` — MongoDB ObjectId
- **Success:** `200` — `{ "success": true, "message": "User deleted" }`
- **Errors:** `400` invalid ID or attempting to delete your own account; `404` user not found.

## Records

All record endpoints require authentication and are available to any active user role.

### `GET /records`

- **Query:** `page` (default 1), `limit` (default 10, maximum 100), `search` (title/description/category), `status` (`active`/`inactive`), `sortBy` (`title`, `category`, `price`, `status`, `createdAt`; default `createdAt`), `sortOrder` (`asc`; otherwise descending)
- **Success:** `200` — `{ "success": true, "data": { "records": [], "pagination": {} } }`. Creator name and email are included.

### `GET /records/:id`

- **Path:** `id` — MongoDB ObjectId
- **Success:** `200` — returns `data.record`, including creator name and email.
- **Errors:** `400` invalid ID; `404` record not found.

### `POST /records`

- **Body:** `title` (required, non-empty, max 120 chars), `description` (optional, max 2,000 chars), `category` (required, non-empty, max 80 chars), `price` (required, number >= 0), `status` (optional: `active`, `inactive`)
- **Success:** `201` — returns the created `data.record`. The API assigns the current user as `createdBy`.
- **Errors:** `400` invalid fields.

### `PUT /records/:id`

- **Path:** `id` — MongoDB ObjectId
- **Body:** Same validation as record creation. `title`, `category`, and `price` are required; `description` and `status` are optional.
- **Success:** `200` — returns the updated `data.record`, including creator name and email.
- **Errors:** `400` invalid fields/ID; `404` record not found.

### `DELETE /records/:id`

- **Path:** `id` — MongoDB ObjectId
- **Success:** `200` — `{ "success": true, "message": "Record deleted" }`
- **Errors:** `400` invalid ID; `404` record not found.

## Dashboard

### `GET /dashboard/stats`

- **Access:** Authenticated users
- **Success:** `200` — `data` contains `totalUsers`, `activeUsers`, `inactiveUsers`, `totalRecords`, up to five `recentUsers`, up to five `recentRecords`, and `usersByRole`.

## Common Errors

| Status | Meaning |
|---:|---|
| `400` | Validation error or invalid MongoDB ID |
| `401` | Missing, invalid, or expired authentication |
| `403` | Insufficient role or inactive account |
| `404` | Resource or route not found |
| `409` | Duplicate user email |
| `429` | Authentication rate limit exceeded |
| `500` | Unexpected server error |

Authentication endpoints are limited to 30 requests per 15-minute window.
