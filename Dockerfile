FROM node:20-slim AS frontend-builder
WORKDIR /build/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build


FROM node:20-slim AS admin-builder
WORKDIR /build/admin
COPY admin/package*.json ./
RUN npm install
COPY admin/ ./
RUN npm run build

FROM python:3.11-slim
WORKDIR /portfolio
COPY backend/requirements.txt ./backend/
RUN pip install -r ./backend/requirements.txt
COPY backend/ ./backend/
COPY --from=frontend-builder /build/frontend/dist ./frontend/dist
COPY --from=admin-builder /build/admin/dist ./admin/dist
WORKDIR /portfolio/backend
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]