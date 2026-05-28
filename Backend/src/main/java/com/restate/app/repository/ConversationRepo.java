package com.restate.app.repository;

import com.restate.app.entity.Conversation;
import com.restate.app.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface ConversationRepo extends JpaRepository<Conversation, String> {
    @Query("SELECT c FROM Conversation c WHERE ((c.userOne = :user1 AND c.userTwo = :user2) OR (c.userOne = :user2 AND c.userTwo = :user1)) AND c.status = 'ACTIVE'")
    Optional<Conversation> findActiveConversationBetween(@Param("user1") User user1, @Param("user2") User user2);

    @Query("""
        SELECT c FROM Conversation c
        WHERE (c.userOne = :user OR c.userTwo = :user)
        AND (:search IS NULL OR :search = '' OR
             (c.userOne = :user AND (LOWER(c.userTwo.firstName) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(c.userTwo.lastName) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(c.userTwo.email) LIKE LOWER(CONCAT('%', :search, '%')))) OR
             (c.userTwo = :user AND (LOWER(c.userOne.firstName) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(c.userOne.lastName) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(c.userOne.email) LIKE LOWER(CONCAT('%', :search, '%'))))
            )
        ORDER BY c.updatedAt DESC
    """)
    Page<Conversation> findConversationsForUser(
            @Param("user") User user,
            @Param("search") String search,
            Pageable pageable);
}

