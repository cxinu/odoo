// handlers/auth_handler.go
package handlers

import (
	"net/http"
	"time"

	"stackit/config"
	"stackit/schemas"
	"stackit/services"
	"stackit/utils"

	"github.com/go-playground/validator/v10"
	"github.com/labstack/echo/v4"
	"gorm.io/gorm"
)

type AuthHandler struct {
	AuthService *services.AuthService
	Config      *config.Config
	Validator   *validator.Validate
}

func NewAuthHandler(db *gorm.DB, cfg *config.Config) *AuthHandler {
	return &AuthHandler{
		AuthService: services.NewAuthService(db),
		Config:      cfg,
		Validator:   validator.New(),
	}
}

func (h *AuthHandler) Register(c echo.Context) error {
	var userCreate schemas.UserCreate
	if err := c.Bind(&userCreate); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid request body")
	}
	if err := h.Validator.Struct(userCreate); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	user, err := h.AuthService.RegisterUser(&userCreate)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	userResp := schemas.UserResponse{
		ID:        user.ID,
		Username:  user.Username,
		Email:     user.Email,
		Role:      user.Role,
		IsActive:  user.IsActive,
		CreatedAt: user.CreatedAt,
	}
	return c.JSON(http.StatusCreated, userResp)
}

func (h *AuthHandler) Login(c echo.Context) error {
	var userLogin schemas.UserLogin
	if err := c.Bind(&userLogin); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid request body")
	}
	if err := h.Validator.Struct(userLogin); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	user, err := h.AuthService.AuthenticateUser(userLogin.Username, userLogin.Password)
	if err != nil {
		return echo.NewHTTPError(http.StatusUnauthorized, err.Error())
	}

	// Generate JWT token
	expirationTime := time.Now().Add(time.Duration(h.Config.AccessTokenExpireMinutes) * time.Minute)
	tokenString, err := utils.GenerateJWT(user.Username, user.Role, expirationTime, h.Config.SecretKey)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to generate token")
	}

	return c.JSON(http.StatusOK, schemas.Token{
		AccessToken: tokenString,
		TokenType:   "bearer",
	})
}
