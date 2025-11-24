# Используем базовый образ Python
FROM python:3.11-slim

# Устанавливаем рабочую директорию
WORKDIR /app

# Скопировать файлы зависимостей
COPY requirements.txt .

# Установить зависимости
RUN pip install --no-cache-dir -r requirements.txt


COPY . .
# Проброс порта FastAPI
EXPOSE 8000

# Команда запуска
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
