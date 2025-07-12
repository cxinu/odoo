package middlewares

import (
	"net/http"

	"stackit/config"
	"stackit/utils"

	"github.com/labstack/echo/v4"
)

// JWTAuthMiddleware validates the JWT token from the Authorization header.
func JWTAuthMiddleware(cfg *config.Config) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			authHeader := c.Request().Header.Get("Authorization")
			if authHeader == "" {
				return echo.NewHTTPError(http.StatusUnauthorized, "Missing Authorization header")
			}

			tokenString := authHeader
			if len(authHeader) > 7 && authHeader[:7] == "Bearer " {
				tokenString = authHeader[7:]
			} else {
				return echo.NewHTTPError(http.StatusUnauthorized, "Invalid Authorization header format")
			}

			claims, err := utils.ParseJWT(tokenString, cfg.SecretKey)
			if err != nil {
				return echo.NewHTTPError(http.StatusUnauthorized, "Invalid or expired token")
			}

			// Store user ID and role in context for later use in handlers
			c.Set("userID", claims.UserID)
			c.Set("username", claims.Username)
			c.Set("userRole", claims.Role)
			return next(c)
		}
	}
}

// AdminAuthMiddleware checks if the authenticated user has an 'admin' role.
func AdminAuthMiddleware() echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			userRole, ok := c.Get("userRole").(string)
			if !ok || userRole != "admin" {
				return echo.NewHTTPError(http.StatusForbidden, "Admin access required")
			}
			return next(c)
		}
	}
}
