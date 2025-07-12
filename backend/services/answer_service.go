// services/answer_service.go
package services

import (
	"errors"
	"stackit/models"
	"stackit/schemas"

	"gorm.io/gorm"
)

type AnswerService struct {
	DB *gorm.DB
}

func NewAnswerService(db *gorm.DB) *AnswerService {
	return &AnswerService{DB: db}
}

func (s *AnswerService) CreateAnswer(answerCreate *schemas.AnswerCreate, ownerID uint) (*models.Answer, error) {
	answer := models.Answer{
		Content:    answerCreate.Content,
		QuestionID: answerCreate.QuestionID,
		OwnerID:    ownerID,
	}
	if err := s.DB.Create(&answer).Error; err != nil {
		return nil, err
	}
	return &answer, nil
}

func (s *AnswerService) GetAnswersByQuestionID(questionID uint) ([]models.Answer, error) {
	var answers []models.Answer
	if err := s.DB.Where("question_id = ?", questionID).Find(&answers).Error; err != nil {
		return nil, err
	}
	return answers, nil
}

func (s *AnswerService) UpdateAnswerAcceptedStatus(answerID uint, isAccepted bool) (*models.Answer, error) {
	var answer models.Answer
	if err := s.DB.First(&answer, answerID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("answer not found")
		}
		return nil, err
	}
	answer.IsAccepted = isAccepted
	if err := s.DB.Save(&answer).Error; err != nil {
		return nil, err
	}
	return &answer, nil
}

func (s *AnswerService) GetAnswerByID(answerID uint) (*models.Answer, error) {
	var answer models.Answer
	if err := s.DB.First(&answer, answerID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil // Or return an error if you prefer
		}
		return nil, err
	}
	return &answer, nil
}

func (s *AnswerService) GetQuestionOwnerID(questionID uint) (uint, error) {
	var question models.Question
	if err := s.DB.Select("owner_id").First(&question, questionID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return 0, errors.New("question not found")
		}
		return 0, err
	}
	return question.OwnerID, nil
}

func (s *AnswerService) CreateOrUpdateVote(userID, answerID uint, voteType int) error {
	var vote models.Vote
	if err := s.DB.Where("user_id = ? AND answer_id = ?", userID, answerID).First(&vote).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			// Create new vote
			newVote := models.Vote{
				UserID:   userID,
				AnswerID: answerID,
				Type:     voteType,
			}
			return s.DB.Create(&newVote).Error
		}
		return err
	}

	// Vote exists, check if type is same
	if vote.Type == voteType {
		// Same vote type, delete it (unvote)
		return s.DB.Delete(&vote).Error
	} else {
		// Different vote type, update it
		vote.Type = voteType
		return s.DB.Save(&vote).Error
	}
}
