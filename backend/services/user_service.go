package services

import (
	"errors"

	"stackit/models"

	"gorm.io/gorm"
)

type UserService struct {
	DB *gorm.DB
}

func NewUserService(db *gorm.DB) *UserService {
	return &UserService{DB: db}
}

func (s *UserService) GetUserByUsername(username string) (*models.User, error) {
	var user models.User
	if err := s.DB.Where("username = ?", username).First(&user).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil // User not found
		}
		return nil, err
	}
	return &user, nil
}

func (s *UserService) GetUserByID(id uint) (*models.User, error) {
	var user models.User
	if err := s.DB.First(&user, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil // User not found
		}
		return nil, err
	}
	return &user, nil
}

func (s *UserService) GetUnreadNotifications(userID uint) ([]models.Notification, error) {
	var notifications []models.Notification
	if err := s.DB.Where("user_id = ? AND is_read = ?", userID, false).Find(&notifications).Error; err != nil {
		return nil, err
	}
	return notifications, nil
}

func (s *UserService) MarkNotificationAsRead(notificationID uint, userID uint) (*models.Notification, error) {
	var notification models.Notification
	if err := s.DB.First(&notification, notificationID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("notification not found")
		}
		return nil, err
	}

	if notification.UserID != userID {
		return nil, errors.New("not authorized to mark this notification as read")
	}

	notification.IsRead = true
	if err := s.DB.Save(&notification).Error; err != nil {
		return nil, err
	}
	return &notification, nil
}

func (s *UserService) GetAllUsers(offset, limit int) ([]models.User, error) {
	var users []models.User
	if err := s.DB.Offset(offset).Limit(limit).Find(&users).Error; err != nil {
		return nil, err
	}
	return users, nil
}

func (s *UserService) CreateNotification(userID uint, message string) error {
	notification := models.Notification{
		UserID:  userID,
		Message: message,
		IsRead:  false,
	}
	return s.DB.Create(&notification).Error
}
