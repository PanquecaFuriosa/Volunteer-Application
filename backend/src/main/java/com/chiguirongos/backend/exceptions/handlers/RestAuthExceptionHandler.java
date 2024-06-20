package com.chiguirongos.backend.exceptions.handlers;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

import com.chiguirongos.backend.exceptions.runtime.NonExistentUserException;
import com.chiguirongos.backend.exceptions.runtime.SuspendedUserException;
import com.chiguirongos.backend.exceptions.runtime.UnauthorizedRoleException;
import com.chiguirongos.backend.exceptions.runtime.UnauthorizedUserAccessException;
import com.chiguirongos.backend.exceptions.runtime.UsernameTakenException;

@ControllerAdvice
public class RestAuthExceptionHandler extends ResponseEntityExceptionHandler {

    private Logger logger = LogManager.getLogger();

    @ExceptionHandler(value = { SuspendedUserException.class })
    protected ResponseEntity<String> handleSuspendedUser(RuntimeException ex) {
        logger.error(ex);
        return new ResponseEntity<String>("User is suspended", HttpStatus.UNAUTHORIZED);
    }

    @ExceptionHandler(value = { NonExistentUserException.class })
    protected ResponseEntity<String> handleNonExistentUser(RuntimeException ex) {
        logger.error(ex);
        return new ResponseEntity<String>("Non existent user", HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(value = { UnauthorizedRoleException.class })
    protected ResponseEntity<String> handleUnauthorizedRole(RuntimeException ex) {
        logger.error(ex);
        return new ResponseEntity<String>("Unathorized role", HttpStatus.UNAUTHORIZED);
    }

    @ExceptionHandler(value = { UnauthorizedUserAccessException.class })
    protected ResponseEntity<String> handleUnauthorizedUserAccess(RuntimeException ex) {
        logger.error(ex);
        return new ResponseEntity<String>("Unathorized user access", HttpStatus.UNAUTHORIZED);
    }

    @ExceptionHandler(value = { UsernameTakenException.class })
    protected ResponseEntity<String> handleUsernameTaken(RuntimeException ex) {
        logger.error(ex);
        return new ResponseEntity<String>("Username already taken", HttpStatus.BAD_REQUEST);
    }
}
