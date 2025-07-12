package config

import (
	"fmt"
	"log"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	Port                     string
	DatabaseURL              string
	SecretKey                string
	AccessTokenExpireMinutes int
	// Add other configurations as needed
}

func LoadConfig() (*Config, error) {
	// Load .env file
	err := godotenv.Load()
	if err != nil {
		log.Println("No .env file found, relying on environment variables.")
	}

	return &Config{
		Port:                     getEnv("PORT", "8080"),
		DatabaseURL:              getEnv("DATABASE_URL", "postgresql://user:password@localhost:5432/dbname"),
		SecretKey:                getEnv("SECRET_KEY", "your-super-secret-key"),
		AccessTokenExpireMinutes: getIntEnv("ACCESS_TOKEN_EXPIRE_MINUTES", 30),
	}, nil
}

func getEnv(key, defaultValue string) string {
	value := os.Getenv(key)
	if value == "" {
		return defaultValue
	}
	return value
}

func getIntEnv(key string, defaultValue int) int {
	valueStr := os.Getenv(key)
	if valueStr == "" {
		return defaultValue
	}
	var val int
	_, err := fmt.Sscanf(valueStr, "%d", &val)
	if err != nil {
		log.Printf("Warning: Could not parse integer for %s, using default %d. Error: %v", key, defaultValue, err)
		return defaultValue
	}
	return val
}
