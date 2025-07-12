package database

import (
	"fmt"
	"log"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"

	"stackit/config"
	"stackit/models"
)

var DB *gorm.DB

func InitDB(cfg *config.Config) (*gorm.DB, error) {
	var err error
	DB, err = gorm.Open(postgres.Open(cfg.DatabaseURL), &gorm.Config{})
	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %w", err)
	}

	log.Println("Database connection established.")
	return DB, nil
}

func MigrateModels(db *gorm.DB) {
	// Auto-migrate all models
	err := db.AutoMigrate(
		&models.User{},
		&models.Question{},
		&models.Answer{},
		&models.Tag{},
		&models.QuestionTag{},
		&models.Vote{},
		&models.Notification{},
	)
	if err != nil {
		log.Fatalf("Failed to auto-migrate database: %v", err)
	}
	log.Println("Database migration completed.")
}
