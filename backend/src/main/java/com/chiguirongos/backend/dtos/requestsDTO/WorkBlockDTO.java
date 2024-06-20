package com.chiguirongos.backend.dtos.requestsDTO;

import java.time.LocalDate;
import java.time.LocalTime;

public class WorkBlockDTO {

    private LocalDate blockDate;
    private LocalTime blockTime;
    private Long workId;

    public WorkBlockDTO(LocalDate blockDate, LocalTime blockTime, Long workId) {
        this.blockDate = blockDate;
        this.blockTime = blockTime;
        this.workId = workId;
    }

    public WorkBlockDTO() {
    }

    public LocalDate getBlockDate() {
        return blockDate;
    }

    public void setBlockDate(LocalDate blockDate) {
        this.blockDate = blockDate;
    }

    public LocalTime getBlockTime() {
        return blockTime;
    }

    public void setBlockTime(LocalTime blockTime) {
        this.blockTime = blockTime;
    }

    public Long getWorkId() {
        return workId;
    }

    public void setWorkId(Long workId) {
        this.workId = workId;
    }
}
