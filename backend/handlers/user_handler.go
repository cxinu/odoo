package handlers

import (
	"net/http"
	"strconv"

	"stackit/schemas"
	"stackit/services"

	"github.com/labstack/echo/v4"
	"gorm.io/gorm"
)

type UserHandler struct {
	UserService *services.UserService
}

func NewUserHandler(db *gorm.DB) *UserHandler {
	return &UserHandler{
		UserService: services.NewUserService(db),
	}
}

func (h *UserHandler) GetCurrentUser(c echo.Context) error {
	userID := c.Get("userID").(uint) // Get userID from JWT middleware

	user, err := h.UserService.GetUserByID(userID)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to fetch user data")
	}
	if user == nil {
		return echo.NewHTTPError(http.StatusNotFound, "User not found")
	}

	userResp := schemas.UserResponse{
		ID:        user.ID,
		Username:  user.Username,
		Email:     user.Email,
		Role:      user.Role,
		IsActive:  user.IsActive,
		CreatedAt: user.CreatedAt,
	}
	return c.JSON(http.StatusOK, userResp)
}

func (h *UserHandler) GetUserByUsername(c echo.Context) error {
	username := c.Param("username")

	user, err := h.UserService.GetUserByUsername(username)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to fetch user data")
	}
	if user == nil {
		return echo.NewHTTPError(http.StatusNotFound, "User not found")
	}

	userResp := schemas.UserResponse{
		ID:        user.ID,
		Username:  user.Username,
		Email:     user.Email,
		Role:      user.Role,
		IsActive:  user.IsActive,
		CreatedAt: user.CreatedAt,
	}
	return c.JSON(http.StatusOK, userResp)
}

func (h *UserHandler) GetUnreadNotifications(c echo.Context) error {
	userID := c.Get("userID").(uint)

	notifications, err := h.UserService.GetUnreadNotifications(userID)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to fetch notifications")
	}

	notificationResponses := []schemas.NotificationResponse{}
	for _, n := range notifications {
		notificationResponses = append(notificationResponses, schemas.NotificationResponse{
			ID:        n.ID,
			UserID:    n.UserID,
			Message:   n.Message,
			IsRead:    n.IsRead,
			CreatedAt: n.CreatedAt,
		})
	}
	return c.JSON(http.StatusOK, notificationResponses)
}

func (h *UserHandler) MarkNotificationAsRead(c echo.Context) error {
	notificationID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid notification ID")
	}

	userID := c.Get("userID").(uint)

	notification, err := h.UserService.MarkNotificationAsRead(uint(notificationID), userID)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to mark notification as read: "+err.Error())
	}
	if notification == nil {
		return echo.NewHTTPError(http.StatusNotFound, "Notification not found or not authorized")
	}

	return c.JSON(http.StatusOK, schemas.NotificationResponse{
		ID:        notification.ID,
		UserID:    notification.UserID,
		Message:   notification.Message,
		IsRead:    notification.IsRead,
		CreatedAt: notification.CreatedAt,
	})
}

// Admin-only handler (placeholder for now)
func (h *UserHandler) GetAllUsersAdmin(c echo.Context) error {
	// Example: Pagination parameters
	offset, _ := strconv.Atoi(c.QueryParam("offset"))
	limit, _ := strconv.Atoi(c.QueryParam("limit"))
	if limit == 0 {
		limit = 100
	}

	users, err := h.UserService.GetAllUsers(offset, limit)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to fetch users")
	}

	userResponses := []schemas.UserResponse{}
	for _, u := range users {
		userResponses = append(userResponses, schemas.UserResponse{
			ID:        u.ID,
			Username:  u.Username,
			Email:     u.Email,
			Role:      u.Role,
			IsActive:  u.IsActive,
			CreatedAt: u.CreatedAt,
		})
	}
	return c.JSON(http.StatusOK, userResponses)
}
