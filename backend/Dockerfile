FROM tiangolo/uvicorn-gunicorn-fastapi:python3.9

COPY requirements.txt requirements.txt
RUN pip3 install -r requirements.txt

COPY ./app /app

CMD ["uvicorn", "app:app","--reload", "--host", "0.0.0.0", "--port", "80"]