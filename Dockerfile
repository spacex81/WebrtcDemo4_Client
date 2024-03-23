# FROM node:alpine as build 
# WORKDIR /app
# COPY client/package*.json ./
# RUN npm ci
# COPY client/ .
# RUN npm run build 

# FROM nginx:alpine 
# COPY --from=build /app/build /usr/share/nginx/html
# EXPOSE 80
# CMD ["nginx", "-g", "daemon off;"]

# Stage 1: Build the React application
FROM node:alpine as build

# Ensure yarn is available and up to date
RUN apk add --no-cache yarn

WORKDIR /app

# Copy package.json and yarn.lock files
COPY client/package.json client/yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy the rest of the client application
COPY client/ .

# Build the app
RUN yarn build

# Stage 2: Serve the app with Nginx
FROM nginx:alpine

# Copy the build output to replace the default nginx contents.
COPY --from=build /app/build /usr/share/nginx/html

# Expose port 80 to the outside once the container has launched
EXPOSE 80

# Start Nginx and keep it running in the foreground
CMD ["nginx", "-g", "daemon off;"]
