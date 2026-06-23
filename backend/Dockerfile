FROM php:8.3-cli-alpine

# Runtime + build dependencies and PHP extensions
RUN set -eux; \
    apk add --no-cache sqlite-libs; \
    apk add --no-cache --virtual .build-deps $PHPIZE_DEPS sqlite-dev; \
    docker-php-ext-install -j"$(nproc)" pdo_sqlite opcache; \
    apk del .build-deps

# Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
ENV COMPOSER_ALLOW_SUPERUSER=1

WORKDIR /app

# Install PHP dependencies first (better layer caching)
COPY composer.json ./
RUN composer install --no-scripts --no-interaction --prefer-dist --no-progress

# Application source
COPY . .

RUN composer dump-autoload --optimize --no-interaction \
    && mkdir -p var \
    && chmod -R 0777 var

# PHP + entrypoint
COPY docker/php.ini /usr/local/etc/php/conf.d/zz-app.ini
COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

ENV PORT=8081
EXPOSE 8081

ENTRYPOINT ["entrypoint.sh"]
CMD ["sh", "-c", "php -S 0.0.0.0:${PORT} -t public public/index.php"]
