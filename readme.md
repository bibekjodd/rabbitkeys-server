## Rabbitkeys Server

#### This is a server repository of rabbitkeys webapp. Rabbitkeys is a realtime single/multiplayer typeracing web app.

### [Rabbitkeys client repository](https://github.com/bibekjodd/rabbitkeys)

### Tech Stack

- #### [Express](http://expressjs.com/)
- #### [Passport Google Auth](https://www.passportjs.org/)
- #### [Pusher](https://pusher.com/) <em>(realtime provider)</em>
- #### [SQLite](https://turso.tech/)
- #### [Drizzle ORM](https://orm.drizzle.team/) <em>(sql query builder)</em>
- #### [Typescript](https://www.typescriptlang.org/)

### Screenshots

![page](https://i.postimg.cc/Cxffvw3z/Screenshot-2024-04-11-182428.png)
![page](https://i.postimg.cc/3w50VPh9/Screenshot-2024-04-11-182303.png)
![page](https://i.postimg.cc/s20Fwmm3/Screenshot-2024-04-11-201129.png)

## Api Endpoints

#### User api endpoints

```ts
//Get profile details
GET /api/profile => 200

//Response
user: {
  id: string;
  name: string;
  email: string;
  image: string | null;
  carImage: string | null;
  speed: number;
  topSpeed: number;
  role: string;
  createdAt: string;
  lastOnline: string;
}
```

```ts
// update profile
PUT /api/profile => 200

// Request
body: {
  name: string;
  image: string | null;
  carImage: string | null;
}
```

```ts
// Login user
GET /api/login/google => 200
```

```ts
// Logout user
GET /api/logout => 200
```

```ts
// Get current active players list
GET /api/active-players => 200

// Response
players: User[]
```

```ts
// Get user details
GET /api/user/:id => 200 // id => userId

// Response
user: User
```

#### Track api endpoints

```ts
// Create track
POST /api/track => 201

// Response
track: {
    id: string;
    createdAt: string;
    creator: string;
    players: PlayerState[];
    paragraphId: string;
    nextParagraphId: string;
    isStarted: boolean;
    isFinished: boolean;
    startedAt: string | null;
    finishedAt: string | null;
}

PlayerState = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  carImage: string | null;
  isFinished: boolean;
  lastSeen: string;
  position?: number;
  accuracy?: number;
  speed?: number;
  topSpeed?: number;
  duration?: number;
}
```

```ts
// Join/Get track details
GET /api/track/:id => 200 // id => trackId

// Response
track: Track


```

```ts
// Leave track
GET /api/leave-track/:id => 200 // id => trackId
```

```ts
// invite player
GET /api/invite/:trackId/:playerId => 200
```

```ts
// Kick player from track
GET /api/kick/:trackId/:playerId => 200
```

#### Race api endpoints

```ts
// Start race
GET /api/race/:id => 200 // id => trackId
```

```ts
// Update live score
PUT /api/race/:id // id => trackId

// Request
body: {
  speed: number;
  topSpeed: number;
  accuracy: number;
  progress: number;
  duration: number;
}
```

#### Stats api endpoints

```ts
// get leaderboard
GET /api/leaderboard => 200

// Response
leaderboard: LeaderboardData[]

//
LeaderboardData={
  speed: number;
  createdAt: string;
  topSpeed: number;
  accuracy: number;
  user: User
}
```

#### Result api endpoints

```ts
// update singleplayer race result
POST /api/result => 200

// Request
body: {
  speed: number;
  topSpeed: number;
  accuracy: number;
}
```

```ts
// get previous results
GET /api/results => 200

// Response
result: Result[]

Result={
  id: string;
  userId: string;
  position: number;
  speed: number;
  topSpeed: number;
  accuracy: number;
  isMultiplayer: number;
  createdAt: string;
}
```

#### Paragraph api endpoints

```ts
// get random paragraph
GET /api/paragraph?skip=paragraphId => 200

// Response
paragraph: {
  id: string;
  text: string;
  wordsLength: number;
  charactersLength: number;
}
```

```ts
// get paragraph by id
GET /api/paragraph/:id => 200  // id => paragraphId

// Response
paragraph: Paragraph
```
