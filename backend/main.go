package main

import (
	"log"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"

	// Renamed from just 'middleware' to avoid conflict
	"stackit/config"
	"stackit/database"
	"stackit/handlers"
	"stackit/middlewares"
)

func main() {
	// Load configuration
	cfg, err := config.LoadConfig()
	if err != nil {
		log.Fatalf("Error loading configuration: %v", err)
	}

	// Initialize database
	db, err := database.InitDB(cfg)
	if err != nil {
		log.Fatalf("Error initializing database: %v", err)
	}

	// Auto-migrate models (create tables if they don't exist)
	database.MigrateModels(db)

	e := echo.New()

	// Middleware
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())
	e.Use(middleware.CORS()) // Enable CORS for frontend integration

	// Handlers initialization (pass the database instance)
	authHandler := handlers.NewAuthHandler(db, cfg)
	questionHandler := handlers.NewQuestionHandler(db)
	answerHandler := handlers.NewAnswerHandler(db)
	userHandler := handlers.NewUserHandler(db)

	// Routes
	v1 := e.Group("/api/v1")

	// Auth routes
	v1.POST("/auth/register", authHandler.Register)
	v1.POST("/auth/token", authHandler.Login)

	// Protected routes (requires authentication)
	protected := v1.Group("")
	protected.Use(middlewares.JWTAuthMiddleware(cfg)) // Apply JWT authentication middleware

	protected.POST("/questions", questionHandler.CreateQuestion)
	protected.GET("/questions", questionHandler.GetQuestions)
	protected.GET("/questions/:id", questionHandler.GetQuestionByID)

	protected.POST("/answers", answerHandler.CreateAnswer)
	protected.GET("/answers/question/:questionID", answerHandler.GetAnswersByQuestionID)
	protected.PATCH("/answers/:id/accept", answerHandler.AcceptAnswer)
	protected.POST("/answers/:id/vote", answerHandler.VoteAnswer)

	protected.GET("/users/me", userHandler.GetCurrentUser)
	protected.GET("/users/:username", userHandler.GetUserByUsername)
	protected.GET("/users/me/notifications", userHandler.GetUnreadNotifications)
	protected.PATCH("/users/notifications/:id/read", userHandler.MarkNotificationAsRead)

	// Admin-only routes (example)
	adminProtected := v1.Group("/admin")
	adminProtected.Use(middlewares.JWTAuthMiddleware(cfg), middlewares.AdminAuthMiddleware())
	adminProtected.GET("/users", userHandler.GetAllUsersAdmin) // Placeholder for admin user management

	// Start server
	log.Printf("Server starting on :%s", cfg.Port)
	e.Logger.Fatal(e.Start(":" + cfg.Port))
}
