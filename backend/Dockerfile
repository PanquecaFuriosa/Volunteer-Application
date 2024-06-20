FROM openjdk:17-jdk-alpine3.13

COPY ./backend /backend
WORKDIR /backend

RUN chmod +x ./mvnw
RUN ./mvnw install -DskipTests

#ENV ARTIFACT_NAME=backend-0.0.1-SNAPSHOT.jar
EXPOSE 8080

ENTRYPOINT ["java","-jar","./target/backend-0.0.1-SNAPSHOT.jar"]
