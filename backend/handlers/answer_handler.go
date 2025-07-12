// handlers/answer_handler.go
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

type AnswerHandler struct {
	AnswerService   *services.AnswerService
	QuestionService *services.QuestionService // To check question ownership
	Validator       *validator.Validate
}

func NewAnswerHandler(db *gorm.DB) *AnswerHandler {
	return &AnswerHandler{
		AnswerService:   services.NewAnswerService(db),
		QuestionService: services.NewQuestionService(db),
		Validator:       validator.New(),
	}
}

func (h *AnswerHandler) CreateAnswer(c echo.Context) error {
	userID := c.Get("userID").(uint)
	userRole := c.Get("userRole").(string)

	if userRole == "guest" {
		return echo.NewHTTPError(http.StatusForbidden, "Guest users cannot post answers.")
	}

	var answerCreate schemas.AnswerCreate
	if err := c.Bind(&answerCreate); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid request body")
	}
	if err := h.Validator.Struct(answerCreate); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	answer, err := h.AnswerService.CreateAnswer(&answerCreate, userID)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to create answer: "+err.Error())
	}

	return c.JSON(http.StatusCreated, schemas.AnswerResponse{
		ID:         answer.ID,
		Content:    answer.Content,
		QuestionID: answer.QuestionID,
		OwnerID:    answer.OwnerID,
		IsAccepted: answer.IsAccepted,
		CreatedAt:  answer.CreatedAt,
		UpdatedAt:  &answer.UpdatedAt,
	})
}

func (h *AnswerHandler) GetAnswersByQuestionID(c echo.Context) error {
	questionID, err := strconv.Atoi(c.Param("questionID"))
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid question ID")
	}

	answers, err := h.AnswerService.GetAnswersByQuestionID(uint(questionID))
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to fetch answers")
	}

	answerResponses := []schemas.AnswerResponse{}
	for _, ans := range answers {
		answerResponses = append(answerResponses, schemas.AnswerResponse{
			ID:         ans.ID,
			Content:    ans.Content,
			QuestionID: ans.QuestionID,
			OwnerID:    ans.OwnerID,
			IsAccepted: ans.IsAccepted,
			CreatedAt:  ans.CreatedAt,
			UpdatedAt:  &ans.UpdatedAt,
		})
	}
	return c.JSON(http.StatusOK, answerResponses)
}

func (h *AnswerHandler) AcceptAnswer(c echo.Context) error {
	answerID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid answer ID")
	}

	currentUserID := c.Get("userID").(uint)

	answer, err := h.AnswerService.GetAnswerByID(uint(answerID))
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to retrieve answer")
	}
	if answer == nil {
		return echo.NewHTTPError(http.StatusNotFound, "Answer not found")
	}

	questionOwnerID, err := h.AnswerService.GetQuestionOwnerID(answer.QuestionID)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to retrieve question owner")
	}
	if questionOwnerID != currentUserID {
		return echo.NewHTTPError(http.StatusForbidden, "Only the question owner can accept an answer.")
	}

	updatedAnswer, err := h.AnswerService.UpdateAnswerAcceptedStatus(uint(answerID), true)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to accept answer: "+err.Error())
	}

	return c.JSON(http.StatusOK, schemas.AnswerResponse{
		ID:         updatedAnswer.ID,
		Content:    updatedAnswer.Content,
		QuestionID: updatedAnswer.QuestionID,
		OwnerID:    updatedAnswer.OwnerID,
		IsAccepted: updatedAnswer.IsAccepted,
		CreatedAt:  updatedAnswer.CreatedAt,
		UpdatedAt:  &updatedAnswer.UpdatedAt,
	})
}

func (h *AnswerHandler) VoteAnswer(c echo.Context) error {
	answerID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid answer ID")
	}

	userID := c.Get("userID").(uint)

	var voteCreate schemas.VoteCreate
	if err := c.Bind(&voteCreate); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid request body")
	}
	if err := h.Validator.Struct(voteCreate); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	if err := h.AnswerService.CreateOrUpdateVote(userID, uint(answerID), voteCreate.Type); err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to process vote: "+err.Error())
	}

	return c.JSON(http.StatusOK, map[string]string{"message": "Vote processed successfully"})
}
