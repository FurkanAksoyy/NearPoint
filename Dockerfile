# ---- Build stage ----
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app

# Cache dependencies first
COPY pom.xml .
COPY .mvn .mvn
COPY mvnw .
RUN mvn -q dependency:go-offline -B

# Build the application
COPY src src
RUN mvn -q clean package -DskipTests -B

# ---- Runtime stage ----
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Non-root user for safety
RUN addgroup -S app && adduser -S app -G app
COPY --from=build /app/target/*.jar app.jar
USER app

EXPOSE 8070
ENTRYPOINT ["java", "-jar", "app.jar"]
