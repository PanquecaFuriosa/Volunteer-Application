package com.chiguirongos.backend.exceptions.handlers;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

import com.chiguirongos.backend.exceptions.runtime.NonExistentPostulationException;

@ControllerAdvice
public class RestPostulationExceptionHandler extends ResponseEntityExceptionHandler {

    private Logger logger = LogManager.getLogger();

    @ExceptionHandler(value = { NonExistentPostulationException.class })
    protected ResponseEntity<String> handleNonExistentPostulation(RuntimeException ex) {
        logger.error(ex);
        return new ResponseEntity<String>("Postulation doesn't exists", HttpStatus.BAD_REQUEST);
    }
}
