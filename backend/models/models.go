package models

import (
	"gorm.io/gorm"
)

type User struct {
	gorm.Model
	Username       string         `gorm:"uniqueIndex;not null"`
	Email          string         `gorm:"uniqueIndex;not null"`
	HashedPassword string         `gorm:"not null"`
	Role           string         `gorm:"default:'user'"` // "guest", "user", "admin"
	IsActive       bool           `gorm:"default:true"`
	Questions      []Question     `gorm:"foreignKey:OwnerID"`
	Answers        []Answer       `gorm:"foreignKey:OwnerID"`
	Votes          []Vote         `gorm:"foreignKey:UserID"`
	Notifications  []Notification `gorm:"foreignKey:UserID"`
}

type Question struct {
	gorm.Model
	Title       string `gorm:"index;not null"`
	Description string `gorm:"type:text;not null"` // Rich text content
	OwnerID     uint
	Owner       User
	Answers     []Answer      `gorm:"foreignKey:QuestionID"`
	Tags        []QuestionTag `gorm:"foreignKey:QuestionID"`
}

type Answer struct {
	gorm.Model
	Content    string `gorm:"type:text;not null"` // Rich text content
	QuestionID uint
	Question   Question
	OwnerID    uint
	Owner      User
	IsAccepted bool   `gorm:"default:false"`
	Votes      []Vote `gorm:"foreignKey:AnswerID"`
}

type Tag struct {
	gorm.Model
	Name      string        `gorm:"uniqueIndex;not null"`
	Questions []QuestionTag `gorm:"foreignKey:TagID"`
}

type QuestionTag struct {
	QuestionID uint `gorm:"primaryKey"`
	TagID      uint `gorm:"primaryKey"`
	Question   Question
	Tag        Tag
}

type Vote struct {
	UserID   uint `gorm:"primaryKey"`
	AnswerID uint `gorm:"primaryKey"`
	Type     int  `gorm:"not null"` // 1 for upvote, -1 for downvote
	User     User
	Answer   Answer
}

type Notification struct {
	gorm.Model
	UserID  uint
	User    User
	Message string `gorm:"not null"`
	IsRead  bool   `gorm:"default:false"`
}
