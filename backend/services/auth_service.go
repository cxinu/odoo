// services/auth_service.go
package services

import (
	"errors"

	"stackit/models"
	"stackit/schemas"
	"stackit/utils"

	"gorm.io/gorm"
)

type AuthService struct {
	DB *gorm.DB
}

func NewAuthService(db *gorm.DB) *AuthService {
	return &AuthService{DB: db}
}

func (s *AuthService) RegisterUser(userCreate *schemas.UserCreate) (*models.User, error) {
	var existingUser models.User
	if err := s.DB.Where("username = ?", userCreate.Username).Or("email = ?", userCreate.Email).First(&existingUser).Error; err == nil {
		return nil, errors.New("username or email already registered")
	}

	hashedPassword, err := utils.HashPassword(userCreate.Password)
	if err != nil {
		return nil, err
	}

	user := models.User{
		Username:       userCreate.Username,
		Email:          userCreate.Email,
		HashedPassword: hashedPassword,
		Role:           "user",
	}

	if err := s.DB.Create(&user).Error; err != nil {
		return nil, err
	}
	return &user, nil
}

func (s *AuthService) AuthenticateUser(username, password string) (*models.User, error) {
	var user models.User
	if err := s.DB.Where("username = ?", username).First(&user).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("invalid username or password")
		}
		return nil, err
	}

	if !utils.CheckPasswordHash(password, user.HashedPassword) {
		return nil, errors.New("invalid username or password")
	}
	return &user, nil
}
