require('dotenv/config');
const path = require('path');
const db = require('./db');
const express = require('express');
const errorMiddleware = require('./error-middleware');
const ClientError = require('./client-error');
const jwt = require('jsonwebtoken');
const app = express();
const publicPath = path.join(__dirname, 'public');
const argon2 = require('argon2');
const authorizationMiddleware = require('./authorization-middleware');
const uploadsMiddleware = require('./uploads-middleware');

if (process.env.NODE_ENV === 'development') {
  app.use(require('./dev-middleware')(publicPath));
}

app.use(express.static(publicPath));

// get user card data
app.get('/api/users', (req, res, next) => {
  const sql = `
    select "u"."userId",
            "u"."name",
            "u"."imageUrl",
            "c"."champions",
            "rl"."roles",
            "rk".*
      from "users" as "u"
    join "ranks" as "rk" using ("rankId")
    left join lateral (
      select json_agg("c") as "champions"
      from (
        select "c".*
        from "champions" as "c"
        join "userChampions" as "uc" using ("championId")
        where "uc"."userId" = "u"."userId"
      ) as "c"
    ) as "c" on true
    left join lateral (
      select json_agg("rl") as "roles"
      from (
        select "rl".*
        from "roles" as "rl"
        join "userRoles" as "url" using ("roleId")
        where "url"."userId" = "u"."userId"
      ) as "rl"
    ) as "rl" on true
  `;
  db.query(sql)
    .then(result => res.json(result.rows))
    .catch(err => next(err));
});

// get ranks data on search bar
app.get('/api/ranks-filter', (req, res, next) => {
  const sql = `
        select  "rankId",
                "rankUrl"
    from "ranks"
  `;
  db.query(sql)
    .then(result => res.json(result.rows))
    .catch(err => next(err));
});

// get roles data on search bar
app.get('/api/roles-filter', (req, res, next) => {
  const sql = `
        select  "roleId",
                "roleUrl"
    from "roles"
  `;
  db.query(sql)
    .then(result => res.json(result.rows))
    .catch(err => next(err));
});

// get champions data on search bar
app.get('/api/champions-filter', (req, res, next) => {
  const sql = `
        select  "championId",
                "championUrl"
    from "champions"
  `;
  db.query(sql)
    .then(result => res.json(result.rows))
    .catch(err => next(err));
});

// get ranks on update profile
app.get('/api/ranks-update', (req, res, next) => {
  const sql = `
        select  "rankId",
                "rankUrl"
    from "ranks"
  `;

  db.query(sql)
    .then(result => res.json(result.rows))
    .catch(err => next(err));
});

// get roles data on update profile
app.get('/api/roles-update', (req, res, next) => {
  const sql = `
        select  "roleId",
                "roleUrl"
    from "roles"
  `;

  db.query(sql)
    .then(result => res.json(result.rows))
    .catch(err => next(err));
});

// get champions on update profile
app.get('/api/champions-update', (req, res, next) => {
  const sql = `
        select  "championId",
                "championUrl"
    from "champions"
  `;

  db.query(sql)
    .then(result => res.json(result.rows))
    .catch(err => next(err));
});

// get user card data by filtering
app.get('/api/filter', (req, res, next) => {
  const rankId = req.query.rankId;
  const roleId = req.query.roleId;
  const championId = req.query.championId;

  const sql = `
    with "matchingUsers" as (
      select "u"."userId",
            "u"."name",
            "u"."imageUrl",
            "u"."rankId"
        from "users" as "u"
        join "userRoles" as "ur"
        on "u"."userId" = "ur"."userId"
          and "ur"."roleId" = $2
        join "userChampions" as "uc"
        on "u"."userId" = "uc"."userId"
          and "uc"."championId" = $3
        where "u"."rankId" = $1
    )
    select "u"."userId",
            "u"."name",
            "u"."imageUrl",
            "c"."champions",
            "rl"."roles",
            "rk".*
      from "matchingUsers" as "u"
    join "ranks" as "rk" using ("rankId")
    left join lateral (
      select json_agg("c") as "champions"
      from (
        select "c".*
        from "champions" as "c"
        join "userChampions" as "uc" using ("championId")
        where "uc"."userId" = "u"."userId"
      ) as "c"
    ) as "c" on true
    left join lateral (
      select json_agg("rl") as "roles"
      from (
        select "rl".*
        from "roles" as "rl"
        join "userRoles" as "url" using ("roleId")
        where "url"."userId" = "u"."userId"
      ) as "rl"
    ) as "rl" on true
    `;

  const query = [rankId, roleId, championId];
  db.query(sql, query)
    .then(result => {
      res.json(result.rows);
    })
    .catch(err => next(err));
});

// user can view players profile
app.get('/api/users/:userId', (req, res, next) => {
  const userId = Number(req.params.userId);

  if (!userId) {
    throw new ClientError(400, 'userId must be a positive integer');
  }

  const sql = `
    select "u"."userId",
            "u"."name",
            "u"."imageUrl",
            "u"."bio",
            "c"."champions",
            "rl"."roles",
            "rk".*
      from "users" as "u"
    join "ranks" as "rk" using ("rankId")
    left join lateral (
      select json_agg("c") as "champions"
      from (
        select "c".*
        from "champions" as "c"
        join "userChampions" as "uc" using ("championId")
        where "uc"."userId" = "u"."userId"
      ) as "c"
    ) as "c" on true
    left join lateral (
      select json_agg("rl") as "roles"
      from (
        select "rl".*
        from "roles" as "rl"
        join "userRoles" as "url" using ("roleId")
        where "url"."userId" = "u"."userId"
      ) as "rl"
    ) as "rl" on true
    where "userId" = $1
  `;

  const params = [userId];
  db.query(sql, params)
    .then(result => {
      if (!result.rows[0]) {
        throw new ClientError(404, `cannot find user with userId ${userId}`);
      }
      res.json(result.rows[0]);
    })
    .catch(err => next(err));
});

app.use(express.json());

app.post('/api/auth/sign-up', (req, res, next) => {
  const { username, password } = req.body;
  if (!username || !password) {
    throw new ClientError(400, 'username and password are required fields');
  }
  argon2
    .hash(password)
    .then(hashedPassword => {
      const sql = `
        insert into "users" ("username", "hashedPassword", "createdAt")
        values ($1, $2, now())
        returning "userId", "username", "createdAt"
      `;
      const params = [username, hashedPassword];
      return db.query(sql, params);
    })
    .then(result => {
      const [user] = result.rows;
      res.status(201).json(user);
    })
    .catch(err => next(err));
});

app.post('/api/auth/sign-in', (req, res, next) => {
  const { username, password } = req.body;
  if (!username || !password) {
    throw new ClientError(401, 'invalid login');
  }
  const sql = `
    select "userId",
           "hashedPassword"
      from "users"
     where "username" = $1
  `;
  const params = [username];
  db.query(sql, params)
    .then(result => {
      const [user] = result.rows;
      if (!user) {
        throw new ClientError(401, 'invalid login');
      }
      const { userId, hashedPassword } = user;
      return argon2
        .verify(hashedPassword, password)
        .then(isMatching => {
          if (!isMatching) {
            throw new ClientError(401, 'invalid login');
          }
          const payload = { userId, username };
          const token = jwt.sign(payload, process.env.TOKEN_SECRET);
          res.json({ token, user: payload });
        });
    })
    .catch(err => next(err));
});

app.use(authorizationMiddleware);

app.get('/api/user-details', (req, res, next) => {
  const { userId } = req.user;
  const sql = `
    select "u"."userId",
            "u"."name",
            "u"."imageUrl",
            "u"."bio",
            coalesce ("c"."champions", '[]'::json) as "champions",
            coalesce ("rl"."roles", '[]'::json) as "roles",
            "rk".*
      from "users" as "u"
    left join "ranks" as "rk" using ("rankId")
    left join lateral (
      select json_agg("c") as "champions"
      from (
        select "c".*
        from "champions" as "c"
        join "userChampions" as "uc" using ("championId")
        where "uc"."userId" = "u"."userId"
      ) as "c"
    ) as "c" on true
    left join lateral (
      select json_agg("rl") as "roles"
      from (
        select "rl".*
        from "roles" as "rl"
        join "userRoles" as "url" using ("roleId")
        where "url"."userId" = "u"."userId"
      ) as "rl"
    ) as "rl" on true
    where "userId" = $1
  `;

  const params = [userId];
  db.query(sql, params)
    .then(result => {
      if (!result.rows[0]) {
        throw new ClientError(404, `cannot find user with userId ${userId}`);
      }
      res.json(result.rows[0]);
    })
    .catch(err => next(err));
});

app.get('/api/user-profile', (req, res, next) => {
  const { userId } = req.user;
  const sql = `
    select "u"."userId",
            "u"."name",
            "u"."imageUrl",
            "u"."bio",
            "c"."champions",
            "rl"."roles",
            "rk".*
      from "users" as "u"
    join "ranks" as "rk" using ("rankId")
    left join lateral (
      select json_agg("c") as "champions"
      from (
        select "c".*
        from "champions" as "c"
        join "userChampions" as "uc" using ("championId")
        where "uc"."userId" = "u"."userId"
      ) as "c"
    ) as "c" on true
    left join lateral (
      select json_agg("rl") as "roles"
      from (
        select "rl".*
        from "roles" as "rl"
        join "userRoles" as "url" using ("roleId")
        where "url"."userId" = "u"."userId"
      ) as "rl"
    ) as "rl" on true
    where "userId" = $1
  `;

  const params = [userId];
  db.query(sql, params)
    .then(result => {
      if (!result.rows[0]) {
        throw new ClientError(404, `cannot find user with userId ${userId}`);
      }
      res.json(result.rows[0]);
    })
    .catch(err => next(err));
});

app.put('/api/user', uploadsMiddleware, express.urlencoded({ extended: true }), (req, res, next) => {
  const { userId } = req.user;
  const { name, bio, rankId, roles, champions } = req.body;
  if (!name || !bio || !rankId || !roles || !champions) {
    throw new ClientError(400, 'name, bio, rankId, roles, champions are required fields');
  }
  const imageUrl = req.file
    ? `https://lolfindr.s3.us-west-1.amazonaws.com/${req.file.key}`
    : null;

  const sql = `
    with "deletedRoles" as (
      delete from "userRoles"
      where "userId" = $1
    ), "deletedChampions" as (
      delete from "userChampions"
      where "userId" = $1
    ), "newUserRoles" as (
      insert into "userRoles"
          select $1,
                "ur"."roleId"
          from (
            select unnest($5::text[]) as "roleId"
          ) as "ur"
    ), "newUserChampions" as (
      insert into "userChampions"
          select $1,
                "uc"."championId"
            from (
              select unnest($6::text[]) as "championId"
            ) as "uc"
    )

    update "users"
    set "name" = $2,
        "bio" = $3,
        "rankId" = $4,
        "imageUrl" = coalesce($7, "imageUrl")
    where "userId" = $1
    returning *
  `;
  const params = [userId, name, bio, rankId, roles, champions, imageUrl];
  db.query(sql, params)
    .then(result => {
      const [user] = result.rows;
      res.status(201).json(user);
    })
    .catch(err => next(err));
});

app.use(errorMiddleware);

app.listen(process.env.PORT, () => {
  process.stdout.write(`\n\napp listening on port ${process.env.PORT}\n\n`);
});
