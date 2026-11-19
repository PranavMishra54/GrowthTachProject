# Database Documentation

## Overview

- **Database:** MongoDB, using Mongoose (v8)
- **Database name:** Set in `MONGO_URI`. The local default is `mern_admin_portal`.
- **Hosting:** Local MongoDB or MongoDB Atlas, depending on `MONGO_URI`
- **Collections:** `users` and `records`

## Setup

1. Install Node.js 18+ and MongoDB (or get an Atlas connection string).
2. Create `server/.env` (never commit it):

```env
   MONGO_URI=mongodb://127.0.0.1:27017/mern_admin_portal
   JWT_SECRET=<replace-with-a-long-random-secret>
   JWT_EXPIRES_IN=7d
   CLIENT_URL=http://localhost:5173
   PORT=5000
```

   Atlas format: `mongodb+srv://<username>:<password>@<cluster-host>/<database>?retryWrites=true&w=majority`

3. Install dependencies:

```sh
   npm install --prefix server
```

4. (Optional) Create the first admin. This only runs if no admin exists. Change the hard-coded demo credentials in `server/utils/seedAdmin.js` before using it outside local development, and change the password right after seeding.

```sh
   npm run seed --prefix server
```

5. Start the API. It connects to MongoDB first, then starts listening.

```sh
   npm run dev --prefix server
```

## Environment Variables

| Name | Purpose | Default |
|---|---|---|
| `MONGO_URI` | MongoDB connection string (required) | None |
| `JWT_SECRET` | Signs auth tokens | None |
| `JWT_EXPIRES_IN` | Token expiry | `7d` |
| `CLIENT_URL` | Allowed frontend origin (CORS) | `http://localhost:5173` |
| `PORT` | API port | `5000` |
| `NODE_ENV` | `production` makes the auth cookie `secure` | Not defined in code |

## Schemas

Both collections get `_id`, `createdAt`, `updatedAt` (timestamps) and `__v`.

### `users`

| Field | Type | Required | Default | Notes |
|---|---|---|---|---|
| `name` | String | Yes | None | Max 80 chars |
| `email` | String | Yes | None | Unique, lowercase |
| `password` | String | Yes | None | Min 8 chars, hashed (bcrypt, 12 rounds), hidden from queries |
| `role` | String | No | `user` | `user`, `manager`, `admin` |
| `status` | String | No | `active` | `active`, `inactive` |
| `lastLogin` | Date | No | `null` | Set on login |

Registration also checks that the email format is valid and the password has a letter and a number. This happens in Express validators, not the schema.

### `records`

| Field | Type | Required | Default | Notes |
|---|---|---|---|---|
| `title` | String | Yes | None | Max 120 chars |
| `description` | String | No | `''` | Max 2,000 chars |
| `category` | String | Yes | None | Max 80 chars |
| `price` | Number | Yes | None | Min 0 |
| `status` | String | No | `active` | `active`, `inactive` |
| `createdBy` | ObjectId | Yes | None | References `User` |

## Relationships

- Each record points to the user who created it through `records.createdBy` → `users`.
- No cascade delete is defined.

## Indexes

- `users.email` is unique.
- Both collections have the default `_id` index.
- There are no other indexes (no compound or text indexes).

## Sample Documents

Fictional data. The password is a placeholder. Timestamps and `__v` are omitted for brevity; they are added automatically.

**User**

~~~json
{
  "_id": "673a10000000000000000001",
  "name": "Alex Morgan",
  "email": "alex.morgan@example.test",
  "password": "<bcrypt hash omitted>",
  "role": "manager",
  "status": "active",
  "lastLogin": "2026-10-12T09:30:00.000Z"
}
~~~

**Record**

~~~json
{
  "_id": "673a20000000000000000001",
  "title": "Quarterly workspace review",
  "description": "Review of workspace access and resources.",
  "category": "Operations",
  "price": 125.5,
  "status": "active",
  "createdBy": "673a10000000000000000001"
}
~~~