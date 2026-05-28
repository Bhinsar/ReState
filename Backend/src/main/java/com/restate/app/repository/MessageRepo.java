package com.restate.app.repository;

import com.restate.app.entity.Message;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface MessageRepo extends JpaRepository<Message, String> {
    @Modifying
    @Query("UPDATE Message m SET m.isRead = true WHERE m.conversation.conversationId = :conversationId AND m.sender.id != :senderId AND m.isRead = false")
    int markAsRead(@Param("conversationId") String conversationId, @Param("senderId") String senderId);

    long countByConversationConversationIdAndSenderIdNotAndIsReadFalse(String conversationId, String senderId);

    Optional<Message> findFirstByConversationConversationIdOrderBySentAtDesc(String conversationId);

    Page<Message> findByConversationConversationIdOrderBySentAtDesc(String conversationId, Pageable pageable);
}


