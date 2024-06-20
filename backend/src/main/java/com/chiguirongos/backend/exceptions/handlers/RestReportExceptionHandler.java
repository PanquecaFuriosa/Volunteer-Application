package com.chiguirongos.backend.exceptions.handlers;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import com.chiguirongos.backend.exceptions.runtime.InvalidReportTypeException;
import com.chiguirongos.backend.exceptions.runtime.UnsupportedFileTypeException;

@ControllerAdvice
public class RestReportExceptionHandler {
    private Logger logger = LogManager.getLogger();

    @ExceptionHandler(value = {InvalidReportTypeException.class})
    protected ResponseEntity<String> handleInvalidReportTypeException(RuntimeException ex){
        logger.error(ex);
        return new ResponseEntity<String>("The report type is invalid", HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(value = {UnsupportedFileTypeException.class})
    protected ResponseEntity<String> handleUnsupportedFileTypeException(RuntimeException ex){
        logger.error(ex);
        return new ResponseEntity<String>("File type is not supported", HttpStatus.BAD_REQUEST);
    }
}
