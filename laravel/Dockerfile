FROM php:8.2-apache

# Install system dependencies and PHP extensions
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libzip-dev \
    libbz2-dev \
    libjpeg-dev \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    libmcrypt-dev \
    libgd-dev \
    libpq-dev \
    unzip \
    postgresql-client \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Install PHP extensions
RUN docker-php-ext-install \
    bz2 \
    intl \
    iconv \
    bcmath \
    mbstring \
    pdo_pgsql \
    zip \
    exif \
    pcntl \
    pgsql \
    dom \
    gd

# Install Composer globally
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

# Install Node.js (using a single RUN for efficiency)
RUN curl -sS https://deb.nodesource.com/setup_23.x | bash && \
    apt-get update && apt-get install -y nodejs

# Copy application files (excluding files in .dockerignore)
COPY . /var/www/html

# Set working directory
WORKDIR /var/www/html

COPY ./apache/default.conf /etc/apache2/sites-available/000-default.conf

# Copy entrypoint script into the container
COPY ./entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

# Enable Apache modules
RUN a2enmod rewrite

# Set permissions
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache
RUN chmod -R 777 /var/www/html/storage /var/www/html/bootstrap/cache


# RUN php artisan db:seed
# RUN php artisan storage:link
# RUN php artisan optimize:clear

# Set the entrypoint to run the script
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
