package com.restate.app.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.restate.app.dto.chat.ConversationSummaryDTO;
import com.restate.app.entity.Conversation;
import com.restate.app.entity.User;

public interface ConversationRepo extends JpaRepository<Conversation, String> {

    @Query("SELECT c FROM Conversation c JOIN FETCH c.userOne JOIN FETCH c.userTwo WHERE c.conversationId = :id")
    Optional<Conversation> findByIdWithParticipants(@Param("id") String id);

    @Query("SELECT c FROM Conversation c WHERE ((c.userOne = :user1 AND c.userTwo = :user2) OR (c.userOne = :user2 AND c.userTwo = :user1)) AND c.status = 'ACTIVE'")
    Optional<Conversation> findActiveConversationBetween(@Param("user1") User user1, @Param("user2") User user2);

    @Query("""
    SELECT new com.restate.app.dto.chat.ConversationSummaryDTO(
        c,
        (SELECT COUNT(m) FROM Message m WHERE m.conversation = c AND m.sender != :user AND m.isRead = false),
        latestMsg.content,
        latestMsg.sentAt
    )
    FROM Conversation c
    LEFT JOIN Message latestMsg ON latestMsg.conversation = c 
        AND latestMsg.sentAt = (SELECT MAX(m2.sentAt) FROM Message m2 WHERE m2.conversation = c)
    WHERE (c.userOne = :user OR c.userTwo = :user)
    AND (:search IS NULL OR :search = '' OR
         (c.userOne = :user AND (LOWER(c.userTwo.firstName) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(c.userTwo.lastName) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(c.userTwo.email) LIKE LOWER(CONCAT('%', :search, '%')))) OR
         (c.userTwo = :user AND (LOWER(c.userOne.firstName) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(c.userOne.lastName) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(c.userOne.email) LIKE LOWER(CONCAT('%', :search, '%'))))
        )
    ORDER BY c.updatedAt DESC
""")
    Optional<Page<ConversationSummaryDTO>> findConversationSummariesForUser(
            @Param("user") User user,
            @Param("search") String search,
            Pageable pageable);

    /**
     * Returns all users who share at least one conversation with the given user.
     * Uses a native query with UNION because JPQL does not reliably support CASE
     * expressions that return entity references.
     */
    @Query(value = """
        SELECT DISTINCT u.* FROM users u WHERE u.id IN (
            SELECT c.user_two_id FROM conversations c WHERE c.user_one_id = :userId
            UNION
            SELECT c.user_one_id FROM conversations c WHERE c.user_two_id = :userId
        )
        """, nativeQuery = true)
    List<User> findConversationPartnersOf(@Param("userId") String userId);
}
