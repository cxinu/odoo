// handlers/question_handler.go
package handlers

import (
	"net/http"
	"strconv"

	"stackit/schemas"
	"stackit/services"

	"github.com/go-playground/validator/v10"
	"github.com/labstack/echo/v4"
	"gorm.io/gorm"
)

type QuestionHandler struct {
	QuestionService *services.QuestionService
	UserService     *services.UserService
	Validator       *validator.Validate
}

func NewQuestionHandler(db *gorm.DB) *QuestionHandler {
	return &QuestionHandler{
		QuestionService: services.NewQuestionService(db),
		UserService:     services.NewUserService(db), // Need to access user for role checks
		Validator:       validator.New(),
	}
}

func (h *QuestionHandler) CreateQuestion(c echo.Context) error {
	userID := c.Get("userID").(uint)       // Get userID from JWT middleware
	userRole := c.Get("userRole").(string) // Get userRole from JWT middleware

	if userRole == "guest" {
		return echo.NewHTTPError(http.StatusForbidden, "Guest users cannot ask questions.")
	}

	var questionCreate schemas.QuestionCreate
	if err := c.Bind(&questionCreate); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid request body")
	}
	if err := h.Validator.Struct(questionCreate); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	question, err := h.QuestionService.CreateQuestion(&questionCreate, userID)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	// Map models.Tag to schemas.TagResponse
	tagResponses := []schemas.TagResponse{}
	for _, qt := range question.Tags {
		tagResponses = append(tagResponses, schemas.TagResponse{
			ID:   qt.Tag.ID,
			Name: qt.Tag.Name,
		})
	}

	return c.JSON(http.StatusCreated, schemas.QuestionResponse{
		ID:          question.ID,
		Title:       question.Title,
		Description: question.Description,
		OwnerID:     question.OwnerID,
		Tags:        tagResponses,
		CreatedAt:   question.CreatedAt,
		UpdatedAt:   &question.UpdatedAt,
	})
}

func (h *QuestionHandler) GetQuestions(c echo.Context) error {
	offset, _ := strconv.Atoi(c.QueryParam("offset"))
	limit, _ := strconv.Atoi(c.QueryParam("limit"))
	if limit == 0 {
		limit = 100
	}

	questions, err := h.QuestionService.GetQuestions(offset, limit)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to fetch questions")
	}

	questionResponses := []schemas.QuestionResponse{}
	for _, q := range questions {
		tagResponses := []schemas.TagResponse{}
		for _, qt := range q.Tags {
			tagResponses = append(tagResponses, schemas.TagResponse{
				ID:   qt.Tag.ID,
				Name: qt.Tag.Name,
			})
		}
		questionResponses = append(questionResponses, schemas.QuestionResponse{
			ID:          q.ID,
			Title:       q.Title,
			Description: q.Description,
			OwnerID:     q.OwnerID,
			Tags:        tagResponses,
			CreatedAt:   q.CreatedAt,
			UpdatedAt:   &q.UpdatedAt,
		})
	}
	return c.JSON(http.StatusOK, questionResponses)
}

func (h *QuestionHandler) GetQuestionByID(c echo.Context) error {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid question ID")
	}

	question, err := h.QuestionService.GetQuestionByID(uint(id))
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return echo.NewHTTPError(http.StatusNotFound, "Question not found")
		}
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to fetch question")
	}

	tagResponses := []schemas.TagResponse{}
	for _, qt := range question.Tags {
		tagResponses = append(tagResponses, schemas.TagResponse{
			ID:   qt.Tag.ID,
			Name: qt.Tag.Name,
		})
	}

	return c.JSON(http.StatusOK, schemas.QuestionResponse{
		ID:          question.ID,
		Title:       question.Title,
		Description: question.Description,
		OwnerID:     question.OwnerID,
		Tags:        tagResponses,
		CreatedAt:   question.CreatedAt,
		UpdatedAt:   &question.UpdatedAt,
	})
}
