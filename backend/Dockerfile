FROM php:8.4-apache

# Dépendances système pour PostgreSQL + PostGIS clients
RUN apt-get update && apt-get install -y --no-install-recommends \
        libpq-dev \
        unzip \
        git \
    && rm -rf /var/lib/apt/lists/*

# Extensions PHP
RUN docker-php-ext-install pdo pdo_pgsql pgsql

# Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Apache : activer mod_rewrite et autoriser .htaccess
RUN a2enmod rewrite headers \
    && sed -ri -e 's!AllowOverride None!AllowOverride All!g' /etc/apache2/apache2.conf \
    && sed -ri -e 's!/var/www/html!/var/www/html!g' /etc/apache2/sites-available/*.conf

# Render fournit la variable d'env PORT (par défaut 10000). Apache écoute dessus.
ENV PORT=10000
RUN sed -ri 's!Listen 80!Listen ${PORT}!g' /etc/apache2/ports.conf \
    && sed -ri 's!<VirtualHost \*:80>!<VirtualHost *:${PORT}>!g' /etc/apache2/sites-available/000-default.conf

WORKDIR /var/www/html

# Installer les dépendances Composer en premier (cache Docker)
COPY api/composer.json api/composer.lock ./
RUN composer install --no-dev --no-interaction --no-progress --optimize-autoloader

# Copier ensuite le code applicatif
COPY api/ ./

# Permissions raisonnables
RUN chown -R www-data:www-data /var/www/html

EXPOSE ${PORT}
CMD ["apache2-foreground"]
