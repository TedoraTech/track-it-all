# 🎓 Student Hub - Full Stack Community Platform for International Students

**Version:** 1.1
**Date:** July 19, 2025
**Author:** Gemini

Student Hub is a full-stack MERN web application designed to connect international students, enabling them to share information, collaborate, and track their application statuses for universities and visa types (CPT, OPT, STEM OPT).

---

## 🧹 Features

* 🔐 **Authentication** – Secure user registration and login using JWT
* 🕴️ **Community Feed** – Scrollable, filterable feed of user-generated posts
* 🔍 **Search & Filters** – Full-text search and filtering by category, university, semester, and year
* 💬 **Posts & Replies** – Support for file uploads, upvotes, threaded replies
* 📊 **Visa Analytics** – Visual insights using Recharts on processing times and volume
* 💬 **Real-time Chats** – Group messaging per university, with discovery & joining capabilities
* 📱 **Responsive Design** – Optimized for mobile, tablet, and desktop using Tailwind CSS

---

## ⚙️ Tech Stack

| Layer    | Technology                                            |
| -------- | ----------------------------------------------------- |
| Frontend | React 18+, Vite, Tailwind CSS, React Router, Recharts |
| Backend  | Node.js, Express.js, Multer, JWT Authentication       |
| Database | MongoDB + Mongoose                                    |
| Charts   | Recharts                                              |
| Uploads  | Cloud Storage (AWS S3 / Cloudinary recommended)       |

---

## 🏗️ Application Architecture

* **Client**: SPA built with React + Vite
* **Server**: Express.js REST API
* **Database**: MongoDB with Mongoose
* **File Uploads**: Handled via Multer & stored in cloud

---

## 💽 Screens Overview

### 1. Authentication

* Login & Register with form validation
* Clear feedback for errors
* Navigation toggle between forms

### 2. Community Dashboard

* Two-column layout on desktop/tablet
* Filter panel + scrollable post feed
* Create new post modal

### 3. Post Detail

* Full post view
* Reply form with file upload
* Upvote/downvote support for replies
* Related posts section

### 4. Chats

* WhatsApp-style layout
* Discover & join university groups
* Real-time messaging
* Leave group functionality

### 5. Visa Analytics

* Select visa type and timeframe
* Chart showing application volume
* Metrics like average wait time & current processing batch

---

## 🤭 Application Flow

1. **Onboarding** → Login/Register
2. **Home** → Community Dashboard
3. **Detail** → View single post + reply
4. **Chats** → Group messaging with discovery & real-time updates
5. **Analytics** → Visual insights per visa type
6. **Logout** → Clears session and redirects

---

## 🎨 UI / UX & Color Palette

| Role             | Color     | Tailwind Class   | Usage                         |
| ---------------- | --------- | ---------------- | ----------------------------- |
| Primary          | `#2563EB` | `bg-blue-600`    | Buttons, highlights           |
| Secondary        | `#475569` | `text-slate-600` | Secondary text, icons         |
| Success (Accent) | `#16A34A` | `bg-green-600`   | "Open Chat", positive actions |
| Danger (Accent)  | `#DC2626` | `bg-red-600`     | Errors, delete actions        |
| Neutral (BG)     | `#F3F4F6` | `bg-gray-100`    | Page background               |
| Neutral (Card)   | `#FFFFFF` | `bg-white`       | Cards, modals                 |
| Text (Primary)   | `#1F2937` | `text-gray-900`  | Headings, main text           |
| Text (Secondary) | `#6B7280` | `text-gray-500`  | Helper text, timestamps       |

---

## 🔌 API Endpoints (REST)

> 🔒 = Requires Authentication

| Method | Endpoint                     | Description                      | Protected |
| ------ | ---------------------------- | -------------------------------- | --------- |
| POST   | `/api/auth/register`         | Register new user                | No        |
| POST   | `/api/auth/login`            | Login and return JWT             | No        |
| GET    | `/api/auth/me`               | Get current user info            | ✅         |
| GET    | `/api/posts`                 | Get all posts (supports filters) | ✅         |
| POST   | `/api/posts`                 | Create a new post                | ✅         |
| GET    | `/api/posts/:id`             | Get single post                  | ✅         |
| POST   | `/api/posts/:id/upvote`      | Upvote a post                    | ✅         |
| POST   | `/api/posts/:id/replies`     | Reply to a post (with uploads)   | ✅         |
| POST   | `/api/replies/:replyId/vote` | Vote on a reply                  | ✅         |
| GET    | `/api/chats`                 | Get user's chat groups           | ✅         |
| GET    | `/api/chats/discover`        | Discover groups by university    | ✅         |
| GET    | `/api/chats/:id/messages`    | Get all messages in a chat       | ✅         |
| POST   | `/api/chats/:id/join`        | Join a chat group                | ✅         |
| POST   | `/api/chats/:id/leave`       | Leave a chat group               | ✅         |
| GET    | `/api/analytics/visa`        | Visa volume & processing data    | ✅         |

---

## 📃 MongoDB Schemas

### `User`

```js
{
  displayName: String,
  email: { type: String, unique: true },
  password: String,
  chatGroups: [ObjectId] // ChatGroup references
}
```

### `Reply`

```js
{
  author: ObjectId, // User ref
  content: String,
  files: [String], // URLs
  votes: Number
}
```

### `Post`

```js
{
  author: ObjectId, // User ref
  category: String, // ENUM
  title: String,
  content: String,
  universityName: String,
  semester: String,
  year: String,
  upvotes: Number,
  replies: [Reply]
}
```

### `ChatGroup`

```js
{
  name: String,
  universityName: String,
  members: [ObjectId] // User refs
}
```

### `ChatMessage`

```js
{
  chatGroup: ObjectId, // ChatGroup ref
  author: ObjectId, // User ref
  text: String
}
```

---

## 🛠️ Development & Tooling

* **Structure**: Monorepo with `/client` and `/server`
* **Environment**:

  * `.env` for sensitive configs (e.g. `MONGO_URI`, `JWT_SECRET`)
* **Dev Commands**:

  * Run both servers: `npm run dev` (uses `concurrently`)
  * Auto-restart backend: `nodemon`
* **Uploads**:

  * Use Multer
  * Recommend storing in **Cloudinary** or **AWS S3**

---

## 📁 Folder Structure (Suggested)

```
/
├── client/          # React app (Vite)
├── server/          # Express API
├── .env             # Environment config
├── package.json     # Root scripts (concurrently, etc.)
└── README.md
```

---

## 📬 Contributions

Pull requests, issues, and suggestions are welcome! 🎉
This is a student-led open source initiative—let’s build it together!

---

## 📄 License

MIT License © 2025 – Gemini & Contributors
