# Hase Forum - Note-Sharing Platform

A modern, full-stack forum application built with Next.js 16, featuring rich text editing, threaded discussions, and social engagement features.

## 🎯 Project Status: 59% Complete (13/22 tasks)

### ✅ Implemented Features

- **Authentication**: Google OAuth + Email/Password with security questions
- **User Profiles**: View, edit, delete with soft delete pattern
- **Posts**: Rich text editor (Tiptap), CRUD operations, pagination
- **Comments**: Threaded discussions with 5-level depth limit
- **Voting**: Upvote/downvote for posts and comments
- **Bookmarks**: Save posts for later
- **Categories**: 6 academic categories (Math, Science, History, Literature, Languages, General)
- **Search**: Find posts and users
- **Sharing**: Social media integration (Twitter, Facebook, LinkedIn, Reddit)

### 🚧 Remaining Tasks

- File/Image Uploads (requires Uploadthing API)
- Real-time features (requires Pusher API)
- DMs with blocking
- Anonymous Q&A section
- Polls
- Moderation system
- Dark mode

## 🛠️ Tech Stack

- **Framework**: Next.js 16.1.6 (App Router)
- **Database**: Prisma 7 + PostgreSQL
- **Auth**: Auth.js v5 (next-auth@beta)
- **UI**: TailwindCSS v4 + shadcn/ui
- **Editor**: Tiptap with extensions
- **Icons**: Lucide React

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Docker and Docker Compose (for local PostgreSQL)
- Google OAuth credentials (optional)

### Local Development Setup

#### Database Setup with Docker

1. **Start PostgreSQL container:**

   ```bash
   docker-compose up -d
   ```

2. **Verify database is healthy:**

   ```bash
   docker-compose ps
   ```

   The `postgres` service should show `healthy` status.

3. **Run migrations:**

   ```bash
   npx prisma migrate deploy
   ```

4. **Seed the database (optional):**

   ```bash
   npm run db:seed
   ```

5. **Stop the database when done:**
   ```bash
   docker-compose down
   ```

**Note:** The database credentials for local development are:

- User: `postgres`
- Password: `postgres`
- Database: `hase_forum`
- Port: `5432`

These are configured in `docker-compose.yml` and `.env.local.example`.

### Docker Setup (Complete Application)

Run the entire application (Next.js app + PostgreSQL database) in Docker containers:

1. **Build and start all services:**

   ```bash
   docker-compose up --build
   ```

2. **Access the application:**
   - Open your browser and navigate to `http://localhost:3002`
   - The application will automatically:
     - Start the PostgreSQL database
     - Run database migrations
     - Seed the database with categories
     - Start the Next.js application

3. **View logs:**

   ```bash
   docker-compose logs -f app
   ```

4. **Stop all services:**

   ```bash
   docker-compose down
   ```

5. **Remove volumes (reset database):**
   ```bash
   docker-compose down -v
   ```

**Docker Services:**

- **app**: Next.js application running on port 3002 (maps to internal port 3000)
- **postgres**: PostgreSQL database running on port 5432

**Features:**

- Multi-stage Docker build for optimized image size
- Automatic database migrations on startup
- Automatic database seeding with categories
- Health checks for both services
- Persistent database volume
- Production-ready configuration

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your database URL and auth secrets

# Run database migrations
npx prisma migrate dev

# Seed categories
npm run db:seed

# Start development server
npm run dev
```

### Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/hase_forum"

# Auth
AUTH_SECRET="your-secret-key"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
NEXTAUTH_URL="http://localhost:3000"
```

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth pages
│   ├── api/               # API routes
│   ├── posts/             # Post pages
│   ├── profile/           # User profiles
│   └── search/            # Search
├── components/            # React components
│   ├── ui/                # shadcn/ui components
│   ├── comments/          # Comment system
│   ├── votes/             # Voting system
│   └── ...
└── lib/                   # Utilities
    ├── prisma.ts          # Database client
    ├── auth.ts            # Auth utilities
    └── validations/       # Zod schemas
```

## 🧰 Scripts

```bash
# Run linter
npm run lint

# Build for production
npm run build
```

## 📊 Database Schema

19 Prisma models including:

- User, Account, Session (Auth)
- Post, Comment, Vote, Bookmark (Content)
- Category, Tag (Organization)
- Poll, PollOption, PollVote (Polls)
- Conversation, Message, Block (Messaging)
- Report, Notification (Moderation)

## 🎨 Design

- **Theme**: Modern Editorial
- **Colors**: Warm, editorial aesthetic
- **Typography**: Instrument Serif (display) + Outfit (body)
- **Components**: shadcn/ui (owned, customizable)

## 📝 API Routes

- `/api/auth/*` - Authentication
- `/api/posts` - Post CRUD
- `/api/posts/[id]/comments` - Comments
- `/api/posts/[id]/vote` - Voting
- `/api/posts/[id]/bookmark` - Bookmarks
- `/api/users/[id]` - User profiles
- `/api/categories` - Categories
- `/api/search` - Search

## 🔒 Security Features

- Password hashing (bcrypt)
- Security questions for password recovery
- JWT session management
- Input validation (Zod)
- XSS prevention
- Soft delete pattern
- Auth middleware

## 🤝 Contributing

This is a learning project. Feel free to fork and experiment!

## 📄 License

MIT

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- shadcn for the beautiful UI components
- Tiptap for the rich text editor
- Prisma for the excellent ORM

---

**Built with ❤️ using Next.js, Prisma, and TailwindCSS**
