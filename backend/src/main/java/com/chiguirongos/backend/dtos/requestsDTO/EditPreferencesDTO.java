package com.chiguirongos.backend.dtos.requestsDTO;

import java.util.List;

import com.chiguirongos.backend.dtos.responsesDTO.UserHourBlockDTO;

public class EditPreferencesDTO {

    private List<String> userTags;

    private List<UserHourBlockDTO> hourBlocks;

    public EditPreferencesDTO(List<String> userTags, List<UserHourBlockDTO> hourBlocks) {
        this.userTags = userTags;
        this.hourBlocks = hourBlocks;
    }

    public List<String> getUserTags() {
        return userTags;
    }

    public void setUserTags(List<String> userTags) {
        this.userTags = userTags;
    }

    public List<UserHourBlockDTO> getHourBlocks() {
        return hourBlocks;
    }

    public void setHourBlocks(List<UserHourBlockDTO> hourBlocks) {
        this.hourBlocks = hourBlocks;
    }
}
