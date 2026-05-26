# ─────────────────────────────────────────────
# Stage 1 – Build the JAR
# ─────────────────────────────────────────────
FROM eclipse-temurin:17-jdk-alpine AS builder

WORKDIR /app

# Copy Maven wrapper + pom first (layer-cache friendly)
COPY mvnw mvnw.cmd ./
COPY .mvn .mvn
COPY pom.xml ./

# Download all dependencies (cached unless pom.xml changes)
RUN chmod +x mvnw && ./mvnw dependency:go-offline -B

# Copy source code and build the fat JAR, skipping tests
COPY src src
RUN ./mvnw package -DskipTests -B

# ─────────────────────────────────────────────
# Stage 2 – Lean runtime image
# ─────────────────────────────────────────────
FROM eclipse-temurin:17-jre-alpine AS runtime

WORKDIR /app

# Non-root user for security
RUN addgroup -S spring && adduser -S spring -G spring

# Copy the built JAR from builder stage
COPY --from=builder /app/target/*.jar app.jar

# Firebase service account key (if used at runtime)
COPY src/main/resources/firebase-service-account.json firebase-service-account.json

USER spring

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
