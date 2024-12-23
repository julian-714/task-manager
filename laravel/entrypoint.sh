#!/bin/bash

# Wait for PostgreSQL to be ready
until pg_isready -h postgres_db -p 5432 -U laravel; do
  echo "Waiting for PostgreSQL..."
  sleep 2
done

chown -R www-data:www-data /var/www/html

composer install

# Run Laravel migrations
php artisan migrate
php artisan key:generate
php artisan storage:link
php artisan storage:link
php artisan optimize:clear

# Start Apache
apache2-foreground
