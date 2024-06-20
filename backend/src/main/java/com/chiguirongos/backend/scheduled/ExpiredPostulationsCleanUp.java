package com.chiguirongos.backend.scheduled;

import java.util.Set;
import java.util.concurrent.TimeUnit;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.transaction.annotation.Transactional;

import com.chiguirongos.backend.models.postulations.PostulationEntity;
import com.chiguirongos.backend.models.users.UserEntity;
import com.chiguirongos.backend.repositories.PostulationRepository;
import com.chiguirongos.backend.services.supplier.SupplierPostulationService;

/**
 * Cleanup task scheduled every 24 hours. Automatically rejects all the pending postulations
 * with past end dates.
 */
@Configuration
@EnableScheduling
public class ExpiredPostulationsCleanUp {

    @Autowired
    private PostulationRepository postulations;
    @Autowired 
    private SupplierPostulationService supplierPostulationService;

    @Transactional
    @Scheduled(fixedDelay = 1, timeUnit = TimeUnit.DAYS)
    public void cleanExpiredPendingPostulations() {
        Set<PostulationEntity> expiredPostulations = postulations.findExpiredPendingPostulations();
        
        for (PostulationEntity expired : expiredPostulations) {
            UserEntity supplier = expired.getWork().getSupplierId();
            supplierPostulationService.rejectUserPostulation(supplier, expired.getPostulationId());
        }
    }
}
