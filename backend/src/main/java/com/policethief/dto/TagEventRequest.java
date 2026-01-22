package com.policethief.dto;

public class TagEventRequest {
    private Long taggerId;
    private Long targetId;
    private String qrCode;

    public Long getTaggerId() {
        return taggerId;
    }

    public void setTaggerId(Long taggerId) {
        this.taggerId = taggerId;
    }

    public Long getTargetId() {
        return targetId;
    }

    public void setTargetId(Long targetId) {
        this.targetId = targetId;
    }

    public String getQrCode() {
        return qrCode;
    }

    public void setQrCode(String qrCode) {
        this.qrCode = qrCode;
    }
}
