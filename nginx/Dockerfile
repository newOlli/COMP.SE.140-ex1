FROM nginx:latest

COPY index.html /usr/share/nginx/html

COPY nginx.conf /etc/nginx/nginx.conf

COPY .htpasswd /etc/nginx/.htpasswd

RUN chmod -R 755 /usr/share/nginx/html && chown -R nginx:nginx /usr/share/nginx/html

RUN chmod -R 755 /etc/nginx/.htpasswd && chown -R nginx:nginx /etc/nginx/.htpasswd

EXPOSE 8198

CMD ["nginx", "-g", "daemon off;"]
