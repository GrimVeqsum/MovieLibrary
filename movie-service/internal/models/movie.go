package models

import "gorm.io/gorm"

type Movie struct {
	ID       uint   `gorm:"primaryKey" json:"id"`
	Title    string `json:"title"`
	Director string `json:"director"`
	Year     int    `json:"year"`
	VideoURL string `json:"video_url"`
}

func Migrate(db *gorm.DB) error {
	return db.AutoMigrate(&Movie{})
}