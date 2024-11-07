FROM python:3.12
WORKDIR /app
COPY shutdown-service.py .
RUN pip install flask docker
EXPOSE 6969
CMD ["python", "shutdown-service.py"]
