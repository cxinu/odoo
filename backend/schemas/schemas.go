package schemas

import "time"

// User Schemas
type UserCreate struct {
	Username string `json:"username" validate:"required"`
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required,min=6"`
}

type UserLogin struct {
	Username string `json:"username" validate:"required"`
	Password string `json:"password" validate:"required"`
}

type UserResponse struct {
	ID        uint      `json:"id"`
	Username  string    `json:"username"`
	Email     string    `json:"email"`
	Role      string    `json:"role"`
	IsActive  bool      `json:"is_active"`
	CreatedAt time.Time `json:"created_at"`
}

type Token struct {
	AccessToken string `json:"access_token"`
	TokenType   string `json:"token_type"`
}

// Question Schemas
type QuestionCreate struct {
	Title       string   `json:"title" validate:"required"`
	Description string   `json:"description" validate:"required"`
	Tags        []string `json:"tags"`
}

type QuestionResponse struct {
	ID          uint          `json:"id"`
	Title       string        `json:"title"`
	Description string        `json:"description"`
	OwnerID     uint          `json:"owner_id"`
	Tags        []TagResponse `json:"tags"` // Include tags in the response
	CreatedAt   time.Time     `json:"created_at"`
	UpdatedAt   *time.Time    `json:"updated_at,omitempty"`
}

// Answer Schemas
type AnswerCreate struct {
	Content    string `json:"content" validate:"required"`
	QuestionID uint   `json:"question_id" validate:"required"`
}

type AnswerResponse struct {
	ID         uint       `json:"id"`
	Content    string     `json:"content"`
	QuestionID uint       `json:"question_id"`
	OwnerID    uint       `json:"owner_id"`
	IsAccepted bool       `json:"is_accepted"`
	CreatedAt  time.Time  `json:"created_at"`
	UpdatedAt  *time.Time `json:"updated_at,omitempty"`
}

// Tag Schemas
type TagResponse struct {
	ID   uint   `json:"id"`
	Name string `json:"name"`
}

// Vote Schemas
type VoteCreate struct {
	AnswerID uint `json:"answer_id" validate:"required"`
	Type     int  `json:"type" validate:"required,oneof=1 -1"` // 1 for upvote, -1 for downvote
}

// Notification Schemas
type NotificationResponse struct {
	ID        uint      `json:"id"`
	UserID    uint      `json:"user_id"`
	Message   string    `json:"message"`
	IsRead    bool      `json:"is_read"`
	CreatedAt time.Time `json:"created_at"`
}
