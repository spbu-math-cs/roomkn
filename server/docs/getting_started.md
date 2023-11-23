# Начало работы

Этот гайд покажет как установить, настроить и использовать сервер Roomkn.

## Скачивание

[Скачайте последнюю версию](https://github.com/spbu-math-cs/roomkn/releases) 
Roomkn сервера и запустите

```shell
tar xvfz roomkn-server-*.tar.gz
cd server-*
```

Перед запуском надо настроить правильно среду

## Настройка окружения

Сервер настраивается с помощью переменных окружения.

Все они расписаны в [этом документе](configuration.md)

## Запуск

Чтобы запустить приложение после настройки окружения, 
если вы все еще находитесь в папке `server-*`, то запустите

```shell
./bin/server
```

## Работа с сервером

Чтобы узнать, как правильно обращаться к серверу, обратитесь к [этому документу](api.md)