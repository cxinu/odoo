// services/question_service.go
package services

import (
	"stackit/models"
	"stackit/schemas"

	"gorm.io/gorm"
)

type QuestionService struct {
	DB *gorm.DB
}

func NewQuestionService(db *gorm.DB) *QuestionService {
	return &QuestionService{DB: db}
}

func (s *QuestionService) CreateQuestion(questionCreate *schemas.QuestionCreate, ownerID uint) (*models.Question, error) {
	question := models.Question{
		Title:       questionCreate.Title,
		Description: questionCreate.Description,
		OwnerID:     ownerID,
	}

	if err := s.DB.Create(&question).Error; err != nil {
		return nil, err
	}

	// Handle tags
	for _, tagName := range questionCreate.Tags {
		tag, err := s.GetOrCreateTag(tagName)
		if err != nil {
			return nil, err
		}
		questionTag := models.QuestionTag{
			QuestionID: question.ID,
			TagID:      tag.ID,
		}
		if err := s.DB.Create(&questionTag).Error; err != nil {
			return nil, err
		}
	}

	// Reload question to include associated tags
	return s.GetQuestionByID(question.ID)
}

func (s *QuestionService) GetQuestions(offset, limit int) ([]models.Question, error) {
	var questions []models.Question
	if err := s.DB.Preload("Tags.Tag").Offset(offset).Limit(limit).Find(&questions).Error; err != nil {
		return nil, err
	}
	return questions, nil
}

func (s *QuestionService) GetQuestionByID(id uint) (*models.Question, error) {
	var question models.Question
	if err := s.DB.Preload("Tags.Tag").First(&question, id).Error; err != nil {
		return nil, err
	}
	return &question, nil
}

func (s *QuestionService) GetOrCreateTag(tagName string) (*models.Tag, error) {
	var tag models.Tag
	if err := s.DB.Where("name = ?", tagName).First(&tag).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			tag = models.Tag{Name: tagName}
			if err := s.DB.Create(&tag).Error; err != nil {
				return nil, err
			}
		} else {
			return nil, err
		}
	}
	return &tag, nil
}
