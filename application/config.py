from celery.schedules import crontab

class Config():
    debug = False
    SQLALCHEMY_TRACK_MODIFICATIONS = True

class LocalDevelopmentConfig(Config):
    debug = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///vpav2.sqlite3'
    SECRET_KEY = 'secret_key_for_flask_security'
    SECURITY_TOKEN_AUTHENTICATION_HEADER = 'Authentication-Token'
    CELERY = dict(
        broker_url = "redis://localhost:6379/0",
        result_backend = "redis://localhost:6379/1",
        Timezone = "Asia/kolkata",
        broker_connection_retry_on_startup = True
    )
    CACHE_TYPE = 'RedisCache'
    CACHE_REDIS_HOST = 'localhost'
    CACHE_REDIS_PORT = 6379
    CACHE_REDIS_DB = 2
    CACHE_DEFAULT_TIMEOUT = 300
