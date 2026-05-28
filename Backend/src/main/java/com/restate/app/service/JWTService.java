package com.restate.app.service;

import com.restate.app.entity.User;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;

@Service
public class JWTService {
    @Value("${jwt.secret_key}")
    private String SECRET;

    public String generate(User user, long time) {
        return Jwts.builder()
                .subject(user.getEmail())
                .claim("id", user.getId())
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + time))
                .signWith(getSigningKey())
                .compact();
    }

    public String extractUsername(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getSubject();
    }
//
//    public boolean isTokenValid(String token, User user) {
//        return extractUsername(token).equals(user.getEmail()) && !isTokenExpired(token);
//    }

    public boolean isTokenExpired(String token) {
        return getExpiration(token).before(new Date());
    }

    /**
     * Returns the remaining time-to-live of the token in milliseconds.
     * A negative value means the token is already expired.
     */
    public long getExpirationMs(String token) {
        return getExpiration(token).getTime() - System.currentTimeMillis();
    }

    private Date getExpiration(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getExpiration();
    }

    private SecretKey getSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(SECRET);
        return Keys.hmacShaKeyFor(keyBytes);
    }

}
