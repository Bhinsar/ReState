# ─────────────────────────────────────────────
# Stage 1 – Build the JAR (Using a native Maven image)
# ─────────────────────────────────────────────
FROM maven:3.9.6-eclipse-temurin-17-alpine AS builder

WORKDIR /app

# Copy the pom.xml to download dependencies first (good for layer caching)
COPY pom.xml ./
RUN mvn dependency:go-offline -B

# Copy the actual source code and build the fat JAR
COPY src src
RUN mvn package -DskipTests -B

# ─────────────────────────────────────────────
# Stage 2 – Lean runtime image
# ─────────────────────────────────────────────
FROM eclipse-temurin:17-jre-alpine AS runtime

WORKDIR /app

# Non-root user for security
RUN addgroup -S spring && adduser -S spring -G spring

# Copy the built JAR from the builder stage
COPY --from=builder /app/target/*.jar app.jar

USER spring

EXPOSE 8080

# Writes the environment variable to a file right before running the JAR
ENTRYPOINT ["sh", "-c", "echo \"$FIREBASE_CONFIG_JSON\" > firebase-service-account.json && java -jar app.jar"]