# Northstar Workspace

A small MERN app I built for managing workspace users and their records. There's an Express/MongoDB API in `server/` and a Vite + React frontend in `client/`.

## What you'll need

- Node 18 or newer
- MongoDB, either running on your machine or a hosted one (Atlas works fine)

## Getting it running

Clone the repo, then install both halves. They're separate projects with their own `node_modules` and `package-lock.json`:

```sh
npm install --prefix server
npm install --prefix client
```

### Environment setup

Make a `server/.env` file:

```env
MONGO_URI=mongodb://127.0.0.1:27017/mern_admin_portal
JWT_SECRET=put-something-long-and-random-here
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
PORT=5000
```

Please don't leave the JWT secret as the placeholder. Anything long and random will do.

The client talks to `http://localhost:5000/api` out of the box. If your API lives somewhere else, add a `client/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

### Start it up

You'll need two terminals, both opened in the project folder.

**Terminal 1 (backend).** Seed the admin account first (you only need to do this once), then start the server:

```sh
npm run seed --prefix server
npm run dev --prefix server
```

**Terminal 2 (frontend):**

```sh
npm run dev --prefix client
```

Then open [http://localhost:5173](http://localhost:5173) and sign in with the default admin:

- Email: `admin@example.com`
- Password: `Admin@123`

Change that password right after your first login.

## Troubleshooting

- **Server won't connect to the database:** check that MongoDB is running and that `MONGO_URI` in `server/.env` is correct.
- **Frontend can't reach the API:** make sure the server is up on port 5000, or set `VITE_API_URL` if you changed the port.
- **CORS errors:** `CLIENT_URL` in `server/.env` has to match the exact address the frontend runs on.