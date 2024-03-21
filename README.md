![Next JS](https://img.shields.io/badge/Next-black?style=for-the-badge&logo=next.js&logoColor=white) ![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB) ![Redux](https://img.shields.io/badge/redux-%23593d88.svg?style=for-the-badge&logo=redux&logoColor=white) ![Socket.io](https://img.shields.io/badge/Socket.io-black?style=for-the-badge&logo=socket.io&badgeColor=010101) ![Authjs](https://img.shields.io/badge/authjs-black?style=for-the-badge) ![Prisma](https://img.shields.io/badge/Prisma-2D3748.svg?style=for-the-badge&logo=Prisma&logoColor=white) ![JWT](https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens) ![Zod](https://img.shields.io/badge/Zod-3E67B1.svg?style=for-the-badge&logo=Zod&logoColor=white) ![Lodash](https://img.shields.io/badge/Lodash-3492FF.svg?style=for-the-badge&logo=Lodash&logoColor=white) ![React Hook Form](https://img.shields.io/badge/React%20Hook%20Form-%23EC5990.svg?style=for-the-badge&logo=reacthookform&logoColor=white) ![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white) ![Framer](https://img.shields.io/badge/Framer-0055FF.svg?style=for-the-badge&logo=Framer&logoColor=white) ![Radix UI](https://img.shields.io/badge/radix%20ui-161618.svg?style=for-the-badge&logo=radix-ui&logoColor=white) ![MUI](https://img.shields.io/badge/MUI-%230081CB.svg?style=for-the-badge&logo=mui&logoColor=white) ![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white) ![ESLint](https://img.shields.io/badge/eslint-3A33D1?style=for-the-badge&logo=eslint&logoColor=white) ![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E.svg?style=for-the-badge&logo=JavaScript&logoColor=black) ![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white) ![Resend](https://img.shields.io/badge/Resend-000000.svg?style=for-the-badge&logo=Resend&logoColor=white) ![ReactEmail](https://img.shields.io/badge/react_email-black?style=for-the-badge) ![Gmail](https://img.shields.io/badge/Gmail-D14836?style=for-the-badge&logo=gmail&logoColor=white) ![Nginx](https://img.shields.io/badge/nginx-%23009639.svg?style=for-the-badge&logo=nginx&logoColor=white) ![Express](https://img.shields.io/badge/Express-000000.svg?style=for-the-badge&logo=Express&logoColor=white) ![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white) ![Mongoose](https://img.shields.io/badge/Mongoose-880000.svg?style=for-the-badge&logo=Mongoose&logoColor=white)  ![NPM](https://img.shields.io/badge/NPM-%23CB3837.svg?style=for-the-badge&logo=npm&logoColor=white) ![LetsEncrypt](https://img.shields.io/badge/Let's%20Encrypt-003A70.svg?style=for-the-badge&logo=Let's-Encrypt&logoColor=white)

# AnnotationPlatformLUS
Web platform for the annotation of LUS data, built in Next.js 14 (App Router), as part of the LLMs4ULTRA thesis project where the goal is to use a dataset for fine-tuning a Vision-Language Model (VLM) to make it capable of producing a diagnosis based on lung ultrasound (LUS) videos.

## Link
The platform is available at the following link: [https://llms4ultra.disi.unitn.it](https://llms4ultra.disi.unitn.it)

## Structure
The platform is composed of two main parts: the client and the server.
- The client, built in Next.js, is responsible for the user interface and the interaction with the user, as well as the management of the state and the data, using `Redux Toolkit`, the authentication, using `Auth.js (v5)` via JWT, the registration/login forms, using `React Hook Form` and `Zod`, and the verification/reset of the account using emails sent via `Gmail`. The UI is built using `TailwindCSS`, `Framer Motion`, `Radix UI` and `Material-UI`.
- The server, built in `Node.js` and `Express.js`, acts as a REST API and it is responsible for the `Socket.IO` real-time communications, the assignment of videos to the users, the interaction with the database and the management of the data.

## Deployment
The platform is deployed on a VPS, hosted by the University of Trento, with `Ubuntu 22.04`, using `Nginx` as a reverse proxy. The database is hosted on `MongoDB Atlas`, or alternatively on a `Docker` container with a replica set of three nodes. The `SSL` certificate is provided by `Let's Encrypt`.

To work properly in a firewalled VPS, the following ports need to be open:
- 80 (HTTP)
- 443 (HTTPS)

And for the outbound traffic:
- 27015-27017 (MongoDB)
- 25, 465, 587 (SMTP)

### Nginx Configuration

To create the reverse proxy with `Nginx`, a new Server Block is needed, and the following configuration is used:
```nginx
server { 
    server_name llms4ultra.disi.unitn.it;  # Listen to requests for this domain

    # Redirect Socket.IO requests to the backend server
    location /socketIO {
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_pass http://localhost:3000; # Local address of the Express.js server
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Redirect everything else to the Next.js server. The server API is not exposed to the client
    location / {
        proxy_pass http://localhost:5174; # Local address of the Next.js server
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    listen 443 ssl; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/llms4ultra.disi.unitn.it/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/llms4ultra.disi.unitn.it/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot

}server {
    if ($host = llms4ultra.disi.unitn.it) {
        return 301 https://$host$request_uri;
    } # managed by Certbot


    listen 80;
    server_name llms4ultra.disi.unitn.it www.llms4ultra.disi.unitn.it;
    return 404; # managed by Certbot


}

```

### Node Modules
To install the required node modules, the following commands are used:
```bash
cd client
npm ci
cd ../server
npm ci
```
The `npm ci` command performs a clean install. It is used to install the exact versions of the packages listed in the `package-lock.json` file, without updating nor modifying it.

### MongoDB Server
The platform can use a local MongoDB server, or a MongoDB Atlas cluster.
You also need to change the constant used as a parameter of the `connect()` function inside the `./server/index.ts` file to connect to the desired database. (e.g. `MONGO_URI` or `MONGO_URI_LOCAL`)

#### Local MongoDB Server
A folder named `mongo3` is needed inside the `./server` directory, containing the following files:
- `username.txt` containing the username for the MongoDB server admin user
- `password.txt` containing the password for the MongoDB server admin user
- `data` folder used to persist the data after the container is stopped

To start a local MongoDB server with a three replica set in a Docker container, the following command is used inside the `./server` directory:
```bash
docker compose up -d
```
In case of an error about the `host.docker.internal` not being resolved, the following line needs to be added to the `/etc/hosts` file:
```
127.0.0.1 host.docker.internal
```

#### MongoDB Atlas
To use MongoDB Atlas, a cluster needs to be created, and the connection string needs to be added to the `.env` file inside the `./client` and `./server` directories.

### Environment Variables
Inside the `./client` directory, two `dotenv` files are needed.
- The `.env` file, used by `Prisma` should contain the following environment variables:
```env
DATABASE_URL=<your-remote-mongodb-atlas-url> # e.g. mongodb+srv://<username>:<password>@<cluster-url>/<database>?retryWrites=true&w=majority
DATABASE_URL_LOCAL<your-local-mongodb-url> # e.g. mongodb://<username>:<password>@127.0.0.1:27017,127.0.0.1:27018,127.0.0.1:27019/<database>?retryWrites=true&w=majority
```
- The `.env.local` file, used by `Next.js` should contain the following environment variables:
```env
SERVER_URL_BASE=<server-url> # e.g. http://localhost:3000 
SERVER_PORT=<server-port> # e.g. 3000
NEXT_PUBLIC_BASE_URL=<your-client-base-url> # e.g. http://localhost:5174 or https://llms4ultra.disi.unitn.it

AUTH_SECRET=<secret-key-for-auth-js> # create a random string (e.g. using openssl rand -hex 32)

# if you want to use Resend as the email provider
RESEND_API_KEY=<your-resend-api-key> # create an account on Resend and get the API key

# If you want to use NodeMailer with your Gmail account
SMTP_EMAIL=<your-gmail-address>
SMTP_PASS=<gmail-application-password> # create an application password on your Gmail account under the "Security->Two-Step Verification" section 
REPLY_TO_EMAIL=<your-email> # if you want to use a different email for the "reply-to" field
```

Inside the `./server` directory, a `.env` file is needed, containing the following environment variables:
```env
PORT=<server-port> # e.g. 3000
MONGO_URI=<your-remote-mongodb-atlas-url> # e.g. mongodb+srv://<username>:<password>@<cluster-url>/<database>?retryWrites=true&w=majority
MONGO_URI_LOCAL=<your-local-mongodb-url> # e.g. mongodb://<username>:<password>@127.0.0.1:27017,127.0.0.1:27018,127.0.0.1:27019/<database>?retryWrites=true&w=majority
```

### Prisma
To generate the Prisma client, the following command is used inside the `./client` directory:
```bash
npx prisma generate
npx prisma db push
```

### Video Files
The video files are stored in the `./client/public/videos` directory, and they are served statically by the Next.js server.

### Populating the Database
To populate the database with the initial data, the following command is used inside the `./server` directory:
```bash
npm run populateDB
```
It will create the entries for the videos stored in the `./client/public/videos` directory.

### Resetting the Database
To reset the database, the following command is used inside the `./server` directory:
```bash
npm run resetDB
```
It will ask for a confirmation on which collections to delete, and then it will reset the database accordingly. After that, this command should be used to populate the database again to avoid Prisma errors: 
```bash
npx prisma db push
```



### Start the Servers
To start the servers, the following commands are used:
```bash
cd client
npm run build
npm run start
```
In a different terminal:
```bash
cd server
npm run build
npm run start
```

### Development
To start the servers in development mode, the following commands are used:
```bash
cd client
npm run dev
```

In a different terminal:
```bash
cd server
npm run dev
```

## License
This project is licensed under the GNU General Public License v3.0 - see the [LICENSE](LICENSE) file for details.