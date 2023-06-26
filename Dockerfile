FROM php:8.2-apache

RUN apt-get update && \
  DEBIAN_FRONTEND=noninteractive apt-get install -y \
    libpq-dev \
    libmcrypt-dev \
    libcurl4-openssl-dev \
    libbz2-dev \
    zlib1g-dev \
    gnupg \
    unzip \
    iputils-ping \
    curl \
    libzip-dev \
    libonig-dev \
    && pecl channel-update pecl.php.net \
    && pecl install apcu

ENV PKG_CONFIG_PATH /usr/lib/x86_64-linux-gnu/pkgconfig

# PHP Extensions
RUN docker-php-ext-install -j$(nproc) zip bz2 mbstring pdo pcntl bcmath curl opcache

RUN docker-php-ext-enable opcache

# Memory Limit
RUN echo "memory_limit=2048M" > $PHP_INI_DIR/conf.d/memory-limit.ini
RUN echo "max_execution_time=900" >> $PHP_INI_DIR/conf.d/memory-limit.ini
RUN echo "extension=apcu.so" > $PHP_INI_DIR/conf.d/apcu.ini
RUN echo "post_max_size=20M" >> $PHP_INI_DIR/conf.d/memory-limit.ini
RUN echo "upload_max_filesize=20M" >> $PHP_INI_DIR/conf.d/memory-limit.ini

# Time Zone
RUN echo "date.timezone=${PHP_TIMEZONE:-UTC}" > $PHP_INI_DIR/conf.d/date_timezone.ini

# Display errors in stderr
RUN echo "display_errors=stderr" > $PHP_INI_DIR/conf.d/display-errors.ini

# Disable PathInfo
RUN echo "cgi.fix_pathinfo=0" > $PHP_INI_DIR/conf.d/path-info.ini

# Disable expose PHP
RUN echo "expose_php=0" > $PHP_INI_DIR/conf.d/path-info.ini

RUN a2enmod rewrite

ENV APACHE_DOCUMENT_ROOT /var/www/html

COPY docker/apache.conf /etc/apache2/sites-available/000-default.conf
RUN sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf

WORKDIR ${APACHE_DOCUMENT_ROOT}
COPY . .

RUN chown -R www-data:www-data ${APACHE_DOCUMENT_ROOT}



