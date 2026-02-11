#!/bin/sh
set -e

echo "🚀 Starting Hase Forum application..."

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
max_attempts=30
attempt=1
while [ $attempt -le $max_attempts ]; do
  if nc -z postgres 5432 2>/dev/null; then
    echo "✅ Database is ready!"
    break
  fi
  echo "Attempt $attempt/$max_attempts: Database not ready yet, waiting..."
  sleep 1
  attempt=$((attempt + 1))
done

if [ $attempt -gt $max_attempts ]; then
  echo "❌ Database failed to become ready after $max_attempts attempts"
  exit 1
fi

# Run Prisma migrations
echo "🔄 Running database migrations..."
npx prisma migrate deploy

# Seed the database if needed
echo "🌱 Seeding database..."
npm run db:seed

echo "✅ Database setup complete!"
echo "🎉 Starting Next.js application..."

# Start the application
exec "$@"
