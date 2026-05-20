FROM node:22-alpine AS build
WORKDIR /app

COPY package*.json ./
COPY apps/api/package.json apps/api/package.json
COPY packages/shared/package.json packages/shared/package.json
RUN npm install

COPY apps/api apps/api
COPY packages/shared packages/shared
RUN npm run build -w @faazhi/shared
RUN npm run build -w @faazhi/api

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
COPY apps/api/package.json apps/api/package.json
COPY packages/shared/package.json packages/shared/package.json
RUN npm install --omit=dev

COPY --from=build /app/apps/api/dist apps/api/dist
COPY --from=build /app/packages/shared/dist packages/shared/dist

EXPOSE 4000
CMD ["npm", "run", "start", "-w", "@faazhi/api"]
