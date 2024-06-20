package com.chiguirongos.backend.exceptions.handlers;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import com.chiguirongos.backend.exceptions.runtime.NonExistentWorkSessionException;
import com.chiguirongos.backend.exceptions.runtime.SessionNotInPastException;

@ControllerAdvice
public class RestWorkSessionsExceptionHandler {

    private Logger logger = LogManager.getLogger();

    @ExceptionHandler(value = { NonExistentWorkSessionException.class })
    protected ResponseEntity<String> handleNonExistentSession(RuntimeException ex) {
        logger.error(ex);
        return new ResponseEntity<String>("Work session not found", HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(value = { SessionNotInPastException.class })
    protected ResponseEntity<String> handleSessionNotInPast(RuntimeException ex) {
        logger.error(ex);
        return new ResponseEntity<String>("Session not in past.", HttpStatus.BAD_REQUEST);
    }
}
