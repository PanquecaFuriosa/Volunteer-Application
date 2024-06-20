package com.chiguirongos.backend.configuration.data;

import java.io.IOException;
import java.time.LocalDate;
import java.util.Base64;
import java.util.HashSet;
import java.util.Scanner;
import java.util.Set;
import java.util.Base64.Encoder;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ResourceLoader;
import org.springframework.stereotype.Component;

import com.chiguirongos.backend.dtos.requestsDTO.RegisterDTO;
import com.chiguirongos.backend.models.users.UserEntity;
import com.chiguirongos.backend.repositories.UserRepository;
import com.chiguirongos.backend.services.AuthorizationService;
import com.chiguirongos.backend.services.supplier.SupplierWorkService;
import java.io.InputStream;

import jakarta.annotation.PostConstruct;

@Component
public class InitialDataCreator {

    private Logger logger = LogManager.getLogger();

    @Autowired
    private ResourceLoader resourceLoader;

    @Autowired
    private AuthorizationService auth;
    @Autowired
    private SupplierWorkService workService;
    @Autowired
    private UserRepository usersRepo;

    @PostConstruct
    public void init() {
        Encoder b64Enconder = Base64.getEncoder();
        String password = b64Enconder.encodeToString("123".getBytes());

        logger.info("Loading initial data");
        if (usersRepo.existsByUserName("caromar"))
            return;

        Set<UserEntity> users = new HashSet<>();
        try {
            logger.info("Loading users data");
            InputStream usersStream = resourceLoader.getResource("classpath:users.txt").getInputStream();
            Scanner scanner = new Scanner(usersStream);
            while (scanner.hasNextLine()) {
                String[] userInfo = scanner.nextLine().split(",");
                users.add(auth.registerUser(new RegisterDTO(
                        userInfo[0],
                        password,
                        userInfo[1],
                        LocalDate.parse(userInfo[2]),
                        userInfo[3],
                        userInfo[4])));
            }
            scanner.close();

            logger.info("Loading woks data");
            InputStream worksStream = resourceLoader.getResource("classpath:works.txt").getInputStream();
            scanner = new Scanner(worksStream);
            while (scanner.hasNextLine()) {
                String[] workInfo = scanner.nextLine().split(",");
                workService.createSupplierWork(null, null);
                System.out.println(workInfo);
            }
            scanner.close();
        } catch (IOException e) {
            logger.error(e.getMessage());
            logger.error("Error opening files with initial data creation.");
            return;
        }

        logger.info("Successfully created initial data");
    }
}
