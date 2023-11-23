# API

Чтобы посмотреть на API сервера, зайдите в папку `docs` и запустите следующий код  

```shell
cd swagger
docker compose up -d
```

Это запустит Swagger UI на порту `8081` по умолчанию. 
Зайдите в браузере в `localhost:8081`, вы увидите API документацию

Чтобы завершить работу Swagger, в папке `docs/swagger` запустите следующий код
```shell
docker compose down
```