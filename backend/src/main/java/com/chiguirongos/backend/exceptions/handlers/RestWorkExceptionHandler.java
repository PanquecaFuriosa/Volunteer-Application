package com.chiguirongos.backend.exceptions.handlers;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import com.chiguirongos.backend.exceptions.runtime.NonExistentWorkException;

@ControllerAdvice
public class RestWorkExceptionHandler {

    private Logger logger = LogManager.getLogger();

    @ExceptionHandler(value = { NonExistentWorkException.class })
    protected ResponseEntity<String> handleNonExistentWork(RuntimeException ex) {
        logger.error(ex);
        return new ResponseEntity<String>("Non existent work", HttpStatus.BAD_REQUEST);
    }
}
