# Team Chiguirongos Project for the subject Software Engineering I

Members:
- Pedro Rodríguez
- Gabriela Panqueva
- Simón Puyosa
- Kenny Rojas

This project is a web application developed with Java Spring Boot as backend, PostgreSQL as database and React as front end. Which provides a React-based user interface to interact with the Spring Boot backend, which uses a PostgreSQL database to store data.

## Requirements

Before running the application, make sure you have the following requirements installed:

- Docker
- Docker Compose

## Instructions:

1. First, it is necessary to delete any containers and images related to the backend of the project, this is because the Spring Boot project must be recompiled.
    1. If the docker project has been built previously, run `./run-nuke.sh`. This option rebuilds the backend image and the frontend image, so it may take some time.
    2. If the project has not been raised previously, you can execute `docker compose up`.
    3. If the project has been built previously, but you only want to rebuild the backend image since the frontend packages have not been changed, run `./run-reset-back.sh`.

This will create the Docker containers for the backend, frontend, and database.

2. Access the application:

Once the containers have been built and are running, you can access the application in your web browser with:

- http://localhost:3000

The React-based UI will be displayed and you can start using the app.

You can also access the backend from:

- http://localhost:8080

## Project structure

The project follows the following structure:

├── backend/ &nbsp;&nbsp;&nbsp;_#Back-end source code (Java Spring Boot)_<br>
├── frontend/ &nbsp;&nbsp;&nbsp;_#Front-end source code (React)_<br>
├── docker-compose.yaml &nbsp;&nbsp;&nbsp;_#Docker Compose configuration file_<br>
├── Volunteer_Work_Manager_Design.pdf 
└── README.md &nbsp;&nbsp;&nbsp;_#Project documentation_ (this file)
