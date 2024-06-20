package com.chiguirongos.backend.exceptions.handlers;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

import io.jsonwebtoken.JwtException;

@ControllerAdvice
public class RestCommonExceptionHandler extends ResponseEntityExceptionHandler {

    private Logger logger = LogManager.getLogger();

    @ExceptionHandler(value = { JwtException.class })
    protected ResponseEntity<String> handleBadJWT(RuntimeException ex) {
        logger.error(ex);
        return new ResponseEntity<String>("Bad JWT", HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(value = { IllegalArgumentException.class })
    protected ResponseEntity<String> handleIllegalArgument(RuntimeException ex) {
        logger.error(ex);
        return new ResponseEntity<String>(ex.getMessage(), HttpStatus.BAD_REQUEST);
    }
}
